"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitSetPassword, type SetPasswordState } from "@/actions/set-password";

export default function SetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<SetPasswordState, FormData>(
    submitSetPassword,
    null,
  );

  if (state?.ok) {
    return (
      <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm text-emerald-900">
          Mot de passe défini. Vous pouvez maintenant vous connecter.
        </p>
        <Link
          href="/pro/login"
          className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-md border px-3 py-2 text-sm"
          minLength={8}
        />
        <p className="text-xs text-muted-foreground mt-1">8 caractères minimum.</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-md border px-3 py-2 text-sm"
          minLength={8}
        />
      </div>

      {state && !state.ok && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Activation en cours..." : "Activer mon compte"}
      </button>
    </form>
  );
}
