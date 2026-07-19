"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function ExplainLink({ discrepancyId }: Readonly<{ discrepancyId: string }>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(() => {
      router.push(`/dashboard/discrepancy/${discrepancyId}`);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm underline disabled:cursor-wait disabled:opacity-50"
    >
      {isPending ? "Loading…" : "Explain →"}
    </button>
  );
}