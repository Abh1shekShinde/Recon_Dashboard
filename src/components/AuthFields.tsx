"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { ErrorBanner } from "./ErrorBanner";

type AuthFieldsProps = {
  error?: string;
  login: (formData: FormData) => void;
  signup: (formData: FormData) => void;
};

export function AuthFields({
  error,
  login,
  signup,
}: Readonly<AuthFieldsProps>) {
  const { pending } = useFormStatus();
  const [clicked, setClicked] = useState<"login" | "signup" | null>(null);

  return (
    <fieldset disabled={pending} className="m-0 space-y-4 border-0 p-0">
      <ErrorBanner initialError={error} />

      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded border px-3 py-2 text-sm disabled:bg-gray-50"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1 w-full rounded border px-3 py-2 text-sm disabled:bg-gray-50"
        />
      </div>

      <div className="flex gap-2">
        <AuthSubmitButton
          formAction={login}
          label="Log in"
          pendingLabel="Logging in…"
          variant="primary"
          onClick={() => setClicked("login")}
          isPendingAction={clicked === "login"}
        />
        <AuthSubmitButton
          formAction={signup}
          label="Sign up"
          pendingLabel="Signing up…"
          variant="secondary"
          onClick={() => setClicked("signup")}
          isPendingAction={clicked === "signup"}
        />
      </div>
    </fieldset>
  );
}
