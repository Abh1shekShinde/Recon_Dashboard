// Converts "13/04/2025 18:39" or "2025-04-13 00:00:00" to a valid ISO string.
// Orders.csv uses ISO already; payments uses DD/MM/YYYY. this handles both.

import { AuthError } from "@supabase/supabase-js";

export function parseFlexibleDate(
  value: string | undefined | null,
): string | null {
  if (!value?.trim()) return null;
  const trimmed = value?.trim();

  // DD/MM/YYYY HH:MM (payments format)
  const dmyMatch = new RegExp(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/,
  )?.exec(trimmed);

  if (dmyMatch) {
    const [, day, month, year, hour, minute] = dmyMatch;
    return new Date(
      Date.UTC(+year, +month - 1, +day, +hour, +minute),
    ).toISOString();
  }

  // Fallback: ISO format (orders format)
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed?.toISOString();
}

export function toNumberOrNull(
  value: string | undefined | null,
): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

//found one order in small case (ord 1801) this funcio will equate it
export function normalizeOrderKey(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

export function toFriendlyMessage(error: AuthError): string {
  const code = error?.code ?? "";

  if (code === "invalid_credentials") {
    return "Incorrect email or password.";
  }
  if (code === "user_already_exists") {
    return "An account with this email already exists. Try logging in instead.";
  }

  //Any other error like api key or db connection wrong . wont show to the user.
  return "Something went wrong. Please try again in a moment.";
}
