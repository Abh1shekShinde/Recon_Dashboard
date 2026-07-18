import { normalizeOrderKey } from "./commonFunctions";
import {
  DiscrepancyResult,
  OrderInput,
  PaymentInput,
  DiscrepancyType,
} from "./types";

const AMOUNT_TOLERANCE = 0.02;

export function reconcile(orders: OrderInput[], payments: PaymentInput[]) {
  const seenOrderIds = new Set<string>();
  //removing duplicate orders with same order_id, keeping the first one
  const deDepuedOrders = orders?.filter((ord) => {
    if (!ord?.order_id || seenOrderIds?.has(ord?.order_id)) {
      return false;
    }
    seenOrderIds?.add(ord?.order_id);
    return true;
  });
  //collected all uniq orders with id as key
  const orderById = new Map(
    deDepuedOrders?.map((ord) => [normalizeOrderKey(ord?.order_id), ord]),
  );

  // Group payments by the order they reference . one order with multiple payemnts 1:N
  const paymentsByOrderRef = new Map<string, PaymentInput[]>();
  for (const p of payments) {
    if (!p?.order_reference) continue;
    const key = normalizeOrderKey(p.order_reference);
    const existing = paymentsByOrderRef.get(key) ?? [];
    existing.push(p);
    paymentsByOrderRef.set(key, existing);
  }

  //   ------ populate discrepancies
  const discrepancies: DiscrepancyResult[] = [];

  for (const order of deDepuedOrders) {
    //cosnider only completed orders
    if (order?.status !== "completed" && order?.status !== "refunded") continue;

    const relatedPayments =
      paymentsByOrderRef.get(normalizeOrderKey(order?.order_id)) ?? [];

    if (relatedPayments?.length === 0) {
      if (order.status === "completed") {
        discrepancies.push({
          order_id: order.order_id,
          transaction_ref: null,
          discrepancy_type: "missing_payment",
          amount_at_risk: order.net_amount ?? 0,
          details: {
            reason:
              "Order marked completed but no payment record exists for it.",
          },
        });
      }
      continue;
    }

    const settledPayments = relatedPayments.filter(
      (p) => p?.status === "settled",
    );

    const unsettledPayments = relatedPayments.filter(
      (p) => p?.status !== "settled",
    );

    // Flag any pending/failed payments — they're not real money yet, but worth surfacing

    for (const p of unsettledPayments) {
      discrepancies.push({
        order_id: order.order_id,
        transaction_ref: p.transaction_ref,
        discrepancy_type: "unsettled_payment",
        amount_at_risk: 0, // not yet realized money, so not counted as "at risk" — it's pending
        details: { status: p.status, amount: p.amount },
      });
    }

    if (settledPayments.length === 0) {
      // every related payment was pending/failed — already flagged above individually
      continue;
    }

    // checking currency . cant do operations on diff curencies
    const currencyMismatch = settledPayments.find(
      (p) => p.currency !== order.currency,
    );
    if (currencyMismatch) {
      discrepancies.push({
        order_id: order.order_id,
        transaction_ref: currencyMismatch.transaction_ref,
        discrepancy_type: "currency_mismatch",
        amount_at_risk: 0, // flagged for manual review, not quantifiable without an FX rate
        details: {
          order_currency: order.currency,
          payment_currency: currencyMismatch.currency,
        },
      });
      continue;
    }

    // Duplicate charge detection: 2+ settled charges of the identical amount, no offsetting refund
    const charges = settledPayments?.filter((p) => p?.type === "charge");
    const refunds = settledPayments?.filter((p) => p?.type === "refund");
    const totalRefunded = refunds?.reduce((sum, r) => sum + r?.amount, 0);

    if (charges?.length > 1) {
      const amounts = charges?.map((c) => c?.amount);
      const allSameAmount = amounts.every(
        (a) => Math.abs(a - amounts[0]) <= AMOUNT_TOLERANCE,
      );
      const extraChargeValue = allSameAmount
        ? amounts[0] * (charges.length - 1) - totalRefunded
        : 0;

      if (allSameAmount && extraChargeValue > AMOUNT_TOLERANCE) {
        discrepancies.push({
          order_id: order.order_id,
          transaction_ref: charges.map((c) => c.transaction_ref).join(", "),
          discrepancy_type: "duplicate_charge",
          amount_at_risk: extraChargeValue,
          details: {
            chargeCount: charges?.length,
            amountEach: amounts?.[0],
            refundedBack: totalRefunded,
          },
        });
        continue;
      }
    }

    // Status mismatch: order says refunded/cancelled, but a settled charge exists uncovered by a refund
    if (order.status === "refunded") {
      const totalCharged = charges.reduce((sum, c) => sum + c.amount, 0);
      const uncoveredAmount = totalCharged - totalRefunded;
      if (uncoveredAmount > AMOUNT_TOLERANCE) {
        discrepancies.push({
          order_id: order.order_id,
          transaction_ref: null,
          discrepancy_type: "status_mismatch",
          amount_at_risk: uncoveredAmount,
          details: { orderStatus: order.status, totalCharged, totalRefunded },
        });
        continue;
      }
    }

    // Amount mismatch: net settled (charges - refunds) vs. what the order says it should be
    const netSettled =
      charges.reduce((sum, c) => sum + c.amount, 0) - totalRefunded;
    const diff = (order.net_amount ?? 0) - netSettled;

    if (Math.abs(diff) > AMOUNT_TOLERANCE) {
      discrepancies.push({
        order_id: order.order_id,
        transaction_ref: charges.map((c) => c.transaction_ref).join(", "),
        discrepancy_type: "amount_mismatch",
        amount_at_risk: diff,
        details: { orderNetAmount: order.net_amount, netSettled },
      });
    }
  }

  // --- Pass 2: orphan payments — payments referencing an order_id we don't have at all ---
  for (const [orderRef, relatedPayments] of paymentsByOrderRef) {
    if (!orderById.has(orderRef)) {
      const settled = relatedPayments.filter((p) => p.status === "settled");
      for (const p of settled) {
        discrepancies.push({
          order_id: orderRef,
          transaction_ref: p.transaction_ref,
          discrepancy_type: "orphan_payment",
          amount_at_risk: p.type === "charge" ? p.amount : 0,
          details: {
            reason: "Payment references an order_id not present in orders.csv.",
            type: p.type,
          },
        });
      }
    }
  }

  return { discrepancies };
}
