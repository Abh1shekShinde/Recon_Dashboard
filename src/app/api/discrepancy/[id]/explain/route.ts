import { createClient } from "@/app/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateStructuredExplanation } from "../../../../../../llm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: discrepancy, error: fetchError } = await supabase
    .from("discrepancies")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !discrepancy) {
    return NextResponse.json(
      { error: "Discrepancy not found" },
      { status: 404 },
    );
  }

  // Return cached explanation if we already generated one
  if (discrepancy.llm_explanation) {
    return NextResponse.json({
      explanation: discrepancy.llm_explanation,
      cached: true,
    });
  }

  const prompt = `Explain this reconciliation discrepancy:

Type: ${discrepancy.discrepancy_type}
Order ID: ${discrepancy.order_id ?? "N/A"}
Transaction reference: ${discrepancy.transaction_ref ?? "N/A"}
Amount at risk: ${discrepancy.amount_at_risk}
Details: ${JSON.stringify(discrepancy.details)}

Respond with: a one-sentence summary of what happened, the likely cause, a recommended next action, and your confidence level.`;

  // Try once, retry once on failure (malformed JSON, schema mismatch, or API error)

  const explanation = await generateStructuredExplanation(
    "You are a financial reconciliation assistant. You explain already-detected " +
      "discrepancies between an order system and a payment processor, in plain language, " +
      "for someone responsible for revenue. You do not decide whether records match — " +
      "that has already been done deterministically. You only explain and recommend next steps. " +
      "Be concise: 1-2 sentences per field. Do not invent facts not present in the data given to you.",
    prompt,
  );

  if (!explanation) {
    // Deliberate fallback — the dashboard must never break because the LLM had a bad response.
    // The user still sees the raw, deterministic discrepancy data; they just don't get prose on top of it.
    return NextResponse.json(
      {
        error:
          "Could not generate an explanation right now. The discrepancy data above is still accurate.",
      },
      { status: 502 },
    );
  }

  const { error: updateError } = await supabase
    .from("discrepancies")
    .update({ llm_explanation: explanation })
    .eq("id", id);

  if (updateError) {
    console.error("Failed to cache explanation:", updateError);
    // Not fatal — we still have the explanation in memory, just return it even if caching failed
  }

  return NextResponse.json({ explanation, cached: false });
}
