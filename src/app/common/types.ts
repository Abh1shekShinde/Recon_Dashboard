export type OrderInput = {
  order_id: string;
  currency: string;
  net_amount: number | null;
  status: string;
};

export type PaymentInput = {
  transaction_ref: string;
  order_reference: string;
  currency: string;
  amount: number;
  type: string; // 'charge' | 'refund'
  status: string; // 'settled' | 'pending' | 'failed'
};

export type DiscrepancyType =
  | "missing_payment"
  | "orphan_payment"
  | "unsettled_payment"
  | "duplicate_charge"
  | "amount_mismatch"
  | "status_mismatch"
  | "currency_mismatch";

export type DiscrepancyResult = {
  order_id: string | null;
  transaction_ref: string | null;
  discrepancy_type: DiscrepancyType;
  amount_at_risk: number;
  details: Record<string, unknown>;
};

// types used in componentns to render

export type Order = {
  order_id: string;
  net_amount: number | null;
  status: string;
};
export type Discrepancy = {
  id: string;
  order_id: string | null;
  transaction_ref: string | null;
  discrepancy_type: string;
  amount_at_risk: number;
  details: Record<string, unknown>;
  created_at: string;
};

export const TYPE_LABELS: Record<string, string> = {
  missing_payment: "Missing payment",
  orphan_payment: "Orphan payment",
  unsettled_payment: "Unsettled payment",
  duplicate_charge: "Duplicate charge",
  amount_mismatch: "Amount mismatch",
  status_mismatch: "Status mismatch",
  currency_mismatch: "Currency mismatch",
};

//llm output on frontend

export type Summary = {
  summary: string;
  likely_cause: string;
  recommended_action: string;
  confidence: "low" | "medium" | "high";
};
