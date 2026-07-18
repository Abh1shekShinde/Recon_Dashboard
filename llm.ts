import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const ExplanationSchema = z.object({
  summary: z.string(),
  likely_cause: z.string(),
  recommended_action: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
});
export type Explanation = z.infer<typeof ExplanationSchema>;

const explanationJsonSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    likely_cause: { type: "string" },
    recommended_action: { type: "string" },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
  },
  required: ["summary", "likely_cause", "recommended_action", "confidence"],
  additionalProperties: false,
};

export async function generateStructuredExplanation(
  systemPrompt: string,
  userPrompt: string,
): Promise<Explanation | null> {
  async function attempt(): Promise<Explanation | null> {
    try {
      const completion = await openai.chat.completions.create({
        // model: "llama-3.3-70b-versatile",
        model: "openai/gpt-oss-20b",
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "explanation",
            strict: true,
            schema: explanationJsonSchema,
          },
        },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const raw = completion?.choices[0]?.message?.content;
      if (!raw) return null;

      const result = ExplanationSchema.safeParse(JSON.parse(raw));
      return result.success ? result.data : null;
    } catch (err) {
      console.error("LLM call failed:", err);
      return null;
    }
  }

  return (await attempt()) ?? (await attempt());
}
