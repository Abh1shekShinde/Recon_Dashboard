import { reconcile } from "@/app/common/reconciliation";
import {
  parseFlexibleDate,
  toNumberOrNull,
} from "../../common/commonFunctions";
import { createClient } from "../../supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    //unauth user, throw 401
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    //im checking if both files are uploaded
    const formData = await request.formData();
    const ordersFile = formData?.get("orders") as File | null;
    const paymentsFile = formData?.get("payments") as File | null;

    if (!ordersFile || !paymentsFile) {
      return NextResponse.json(
        { error: "Both orders.csv and payments.csv are required" },
        { status: 400 },
      );
    }

    const ordersText = await ordersFile.text();
    const paymentsText = await paymentsFile.text();

    //parse both files
    const ordersParsed = Papa.parse(ordersText, {
      header: true,
      skipEmptyLines: true,
    });
    const paymentsParsed = Papa.parse(paymentsText, {
      header: true,
      skipEmptyLines: true,
    });

    if (
      ordersParsed?.errors?.length > 0 ||
      paymentsParsed?.errors?.length > 0
    ) {
      return NextResponse.json(
        {
          error: "CSV parse error",
          ordersErrors: ordersParsed?.errors,
          paymentsErrors: paymentsParsed?.errors,
        },
        { status: 400 },
      );
    }

    // Clear previous for this user, so that re-uploading doesn't duplicate data
    await supabase.from("orders").delete().eq("user_id", user.id);
    await supabase.from("payments").delete().eq("user_id", user.id);
    await supabase.from("discrepancies").delete().eq("user_id", user.id);
    await supabase.from("dashboard_summaries").delete().eq("user_id", user.id);

    //generate rows for orders
    const orderRows = (ordersParsed?.data as Record<string, string>[])?.map(
      (row) => ({
        user_id: user?.id,
        order_id: row?.order_id?.trim(),
        order_date: parseFlexibleDate(row?.order_date),
        customer_email: row?.customer_email?.trim() || null,
        currency: row?.currency?.trim(),
        gross_amount: toNumberOrNull(row?.gross_amount),
        discount: toNumberOrNull(row?.discount) ?? 0,
        net_amount: toNumberOrNull(row?.net_amount),
        status: row?.status?.trim(),
      }),
    );

    // generate rows for payments
    const paymentRows = (paymentsParsed?.data as Record<string, string>[])?.map(
      (row) => ({
        user_id: user?.id,
        transaction_ref: row?.transaction_ref?.trim(),
        processed_at: parseFlexibleDate(row?.processed_at),
        order_reference: row?.order_reference?.trim(),
        currency: row?.currency?.trim(),
        amount: toNumberOrNull(row?.amount),
        fee: toNumberOrNull(row?.fee) ?? 0,
        net_settled: toNumberOrNull(row?.net_settled),
        type: row?.type?.trim(),
        status: row?.status?.trim(),
      }),
    );

    //return final response error or success

    const { error: ordersError } = await supabase
      .from("orders")
      .insert(orderRows);

    if (ordersError) {
      return NextResponse.json(
        { error: `Orders insert failed: ${ordersError.message}` },
        { status: 500 },
      );
    }

    const { error: paymentsError } = await supabase
      .from("payments")
      .insert(paymentRows);

    if (paymentsError) {
      return NextResponse.json(
        { error: `Payments insert failed: ${paymentsError.message}` },
        { status: 500 },
      );
    }

    const finalOrders = orderRows.map((o) => ({
      order_id: o.order_id,
      currency: o.currency,
      net_amount: o.net_amount,
      status: o.status,
    }));
    const finalPayments = paymentRows.map((p) => ({
      transaction_ref: p.transaction_ref,
      order_reference: p.order_reference,
      currency: p.currency,
      amount: p.amount ?? 0,
      type: p.type,
      status: p.status,
    }));

    //call recon algo
    const { discrepancies } = reconcile(finalOrders, finalPayments);

    const discrepancyRows = discrepancies?.map((d) => ({
      user_id: user.id,
      ...d,
    }));

    if (discrepancyRows?.length > 0) {
      const { error: discrepancyError } = await supabase
        .from("discrepancies")
        .insert(discrepancyRows);
      if (discrepancyError) {
        return NextResponse.json(
          { error: `Discrepancy insert failed: ${discrepancyError.message}` },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      ordersInserted: orderRows.length,
      paymentsInserted: paymentRows.length,
      discrepanciesFound: discrepancyRows.length,
    });
  } catch (err) {
    console.error("INGEST ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 },
    );
  }
}
