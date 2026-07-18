import { notFound } from "next/navigation";
import Link from "next/link";
import { TYPE_LABELS } from "@/app/common/types";
import { createClient } from "@/app/supabase/server";
import ExplainButton from "@/components/ExplainButton";

export default async function DiscrepancyDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: discrepancy } = await supabase
    .from("discrepancies")
    .select("*")
    .eq("id", id)
    .single();

  if (!discrepancy) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard" className="text-sm text-gray-500 underline">
        ← Back to dashboard
      </Link>

      <h1 className="mt-4 text-2xl font-bold">
        {TYPE_LABELS[discrepancy.discrepancy_type] ??
          discrepancy.discrepancy_type}
      </h1>

      <div className="mt-4 rounded-lg border bg-white p-4 text-sm">
        <Row label="Order" value={discrepancy.order_id ?? "—"} />
        <Row label="Transaction" value={discrepancy.transaction_ref ?? "—"} />
        <Row
          label="Amount at risk"
          value={Math.abs(discrepancy.amount_at_risk).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        />
        <Row
          label="Raw details"
          value={
            <pre className="whitespace-pre-wrap text-xs">
              {JSON.stringify(discrepancy.details, null, 2)}
            </pre>
          }
        />
      </div>

      <div className="mt-6">
        <ExplainButton
          discrepancyId={discrepancy.id}
          initialExplanation={discrepancy.llm_explanation}
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: Readonly<{ label: string; value: React.ReactNode }>) {
  return (
    <div className="border-b py-2 last:border-0">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
