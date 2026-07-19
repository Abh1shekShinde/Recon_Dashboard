"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  formAction: (formData: FormData) => void;
  label: string;
  pendingLabel: string;
  variant?: "primary" | "secondary";
  onClick: () => void;
  isPendingAction: boolean;
};

export function AuthSubmitButton({
  formAction,
  label,
  pendingLabel,
  variant = "primary",
  onClick,
  isPendingAction,
}: Readonly<AuthSubmitButtonProps>) {
  const { pending } = useFormStatus();

  const baseClass =
    variant === "primary"
      ? "flex-1 rounded bg-black py-2 text-sm text-white disabled:opacity-50"
      : "flex-1 rounded border py-2 text-sm disabled:opacity-50";

  return (
    <button
      formAction={formAction}
      onClick={onClick}
      disabled={pending}
      className={baseClass}
    >
      {pending && isPendingAction ? pendingLabel : label}
    </button>
  );
}
