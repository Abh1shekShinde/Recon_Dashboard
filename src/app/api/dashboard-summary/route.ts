import { createClient } from "@/app/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateStructuredExplanation } from "../../../../llm";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: discrepancies } = await supabase
    .from("discrepancies")
    .select("discrepancy_type, amount_at_risk");

  if (!discrepancies || discrepancies.length === 0) {
    return NextResponse.json(
      { error: "No discrepancies to summarize." },
      { status: 400 },
    );
  }

  // Aggregate first — send the LLM a compact summary, not 19+ raw rows.
  // Keeps the prompt small, cheap, and stops the model from re-deriving
  // numbers itself instead of using the ones we already computed.
  const byType = new Map<string, { count: number; totalAtRisk: number }>();
  for (const d of discrepancies) {
    const existing = byType.get(d.discrepancy_type) ?? {
      count: 0,
      totalAtRisk: 0,
    };
    existing.count += 1;
    existing.totalAtRisk += Math.abs(d.amount_at_risk);
    byType.set(d.discrepancy_type, existing);
  }

  const breakdown = Array.from(byType.entries())
    .map(
      ([type, v]) =>
        `${type}: ${v.count} case(s), $${v.totalAtRisk.toFixed(2)} at risk`,
    )
    .join("\n");

  const totalAtRisk = discrepancies.reduce(
    (sum, d) => sum + Math.abs(d.amount_at_risk),
    0,
  );

  const prompt = `Here is the breakdown of reconciliation discrepancies across ${discrepancies.length} total cases, $${totalAtRisk.toFixed(2)} at risk overall:

${breakdown}

Respond with: a one-sentence overall summary of the state of reconciliation, the most likely systemic cause across these categories, a recommended next action prioritized by what to look at first, and your confidence level.`;

  const summary = await generateStructuredExplanation(
    "You are a financial reconciliation assistant. You are given an aggregate breakdown of " +
      "discrepancies already deterministically classified by category — you did not classify them. " +
      "Summarize the overall state of reconciliation for someone responsible for revenue, in plain " +
      "language, and recommend what to prioritize. Do not invent specific order or transaction " +
      "numbers — you were not given any. Be concise.",
    prompt,
  );

  if (!summary) {
    return NextResponse.json(
      {
        error:
          "Could not generate a summary right now. The figures on the dashboard are still accurate.",
      },
      { status: 502 },
    );
  }

  await supabase.from("dashboard_summaries").upsert({
    user_id: user.id,
    summary,
    generated_at: new Date().toISOString(),
  });

  return NextResponse.json({ summary });
}
