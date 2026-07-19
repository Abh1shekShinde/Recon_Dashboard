"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ErrorBanner({
  initialError,
}: Readonly<{ initialError?: string }>) {
  const [error] = useState(initialError);
  const router = useRouter();

  useEffect(() => {
    if (initialError) {
      //removes error from url but stores in a state to show on the login comopnen
      router.replace("/login", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!error) return null;

  return <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>;
}
