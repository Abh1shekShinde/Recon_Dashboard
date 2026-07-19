"use client";

import { Summary } from "@/app/common/types";
import { useState } from "react";
import AIButton from "./AIButton";

type DashboardSummaryProps = { initialSummary: Summary | null };

export default function DashboardSummary({
  initialSummary,
}: Readonly<DashboardSummaryProps>) {
  const [summary, setSummary] = useState<Summary | null>(initialSummary);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/dashboard-summary", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        // setErrorMessage(
        //   data.error || "Something went wrong generating the summary.",
        // );
        setErrorMessage("Something went wrong while generating the summary.");
        return;
      }

      setSummary(data.summary);
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage("Network error — check your connection and try again.");
    }
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">At a Glance</h2>
        {summary && (
          <button
            onClick={handleGenerate}
            disabled={status === "loading"}
            className="text-xs underline"
          >
            {status === "loading" ? "Regenerating…" : "Regenerate"}
          </button>
        )}
      </div>

      {status === "error" && errorMessage && (
        <p className="mt-3 rounded bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {!summary ? (
        <AIButton onClick={handleGenerate} disabled={status === "loading"}>
          {status === "loading" ? "Generating summary…" : "Generate summary"}
        </AIButton>
      ) : (
        <div className="mt-3 space-y-3 text-sm">
          <p>{summary.summary}</p>
          <div>
            <p className="text-sm font-bold text-red-600">
              Likely systemic cause
            </p>
            <p className="mt-0.5">{summary.likely_cause}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-green-600">What to do first</p>
            <p className="mt-0.5">{summary.recommended_action}</p>
          </div>
        </div>
      )}
    </div>
  );
}
