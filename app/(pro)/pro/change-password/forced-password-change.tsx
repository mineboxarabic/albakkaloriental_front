"use client";

import { useRouter } from "next/navigation";
import { ProChangePasswordForm } from "../account/pro-change-password-form";

/** First-login form: once the new password is saved, continue to the catalogue. */
export function ForcedPasswordChange() {
  const router = useRouter();
  return (
    <ProChangePasswordForm
      required
      onChanged={() => {
        router.replace("/pro/products");
        router.refresh();
      }}
    />
  );
}
