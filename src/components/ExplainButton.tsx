"use client";

import { Summary } from "@/app/common/types";
import { useState } from "react";
import AIButton from "./AIButton";

type ExplainButtonProps = {
  discrepancyId: string;
  initialExplanation: Summary | null;
};
export default function ExplainButton(props: Readonly<ExplainButtonProps>) {
  const { discrepancyId, initialExplanation } = props;

  const [explanation, setExplanation] = useState<Summary | null>(
    initialExplanation,
  );
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleExplain() {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/discrepancy/${discrepancyId}/explain`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data.error || "Something went wrong generating the explanation.",
        );
        return;
      }

      setExplanation(data.explanation);
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMessage("Network error — check your connection and try again.");
    }
  }

  if (explanation) {
    return (
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            AI explanation
          </h2>
          <ConfidenceBadge level={explanation.confidence} />
        </div>
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <p className="text-xs font-medium text-gray-500">What happened</p>
            <p className="mt-0.5">{explanation.summary}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Likely cause</p>
            <p className="mt-0.5">{explanation.likely_cause}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Recommended action
            </p>
            <p className="mt-0.5">{explanation.recommended_action}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      {status === "error" && errorMessage && (
        <p className="mb-3 rounded bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
      <AIButton onClick={handleExplain} disabled={status === "loading"}>
        {status === "loading"
          ? "Generating explanation…"
          : "Explain this with AI"}
      </AIButton>
    </div>
  );
}

function ConfidenceBadge({
  level,
}: Readonly<{ level: "low" | "medium" | "high" }>) {
  const color =
    level === "high"
      ? "bg-green-100 text-green-700"
      : level === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-gray-100 text-gray-600";

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {level} confidence
    </span>
  );
}
