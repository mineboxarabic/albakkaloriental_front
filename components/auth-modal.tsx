"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, Lock, X, ArrowRight, Sparkles } from "lucide-react";
import { loginRetail, type LoginState } from "@/actions/retail-auth";
import { COLORS, DISPLAY_FONT } from "@/lib/ui";

type AuthModalContextValue = {
  open: () => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue>({
  open: () => {},
  close: () => {},
});

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <AuthModalContext.Provider value={{ open, close }}>
      {children}
      {isOpen && <AuthModal onClose={close} redirectTo={pathname || "/"} />}
    </AuthModalContext.Provider>
  );
}

function AuthModal({
  onClose,
  redirectTo,
}: {
  onClose: () => void;
  redirectTo: string;
}) {
  return (
    <div
      aria-modal
      role="dialog"
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center px-4"
      style={{ background: "rgba(15, 20, 6, 0.55)", backdropFilter: "blur(2px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] rounded-2xl bg-white p-7 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#FAF8F2]"
          style={{ color: COLORS.muted }}
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div
          className="inline-flex items-center gap-1.5 rounded-full bg-[#F0EBDD] px-2.5 py-1 text-[11px] font-bold"
          style={{ color: COLORS.primary }}
        >
          <Sparkles className="h-3 w-3" strokeWidth={2.2} />
          CONNEXION REQUISE
        </div>
        <h2
          className="mt-3 text-[22px] font-extrabold leading-tight tracking-tight"
          style={{ color: COLORS.text, fontFamily: DISPLAY_FONT }}
        >
          Connectez-vous pour ajouter au panier
        </h2>
        <p className="mt-1 text-[12.5px]" style={{ color: COLORS.muted }}>
          Accédez aux prix et constituez votre panier en quelques clics.
        </p>

        <div className="mt-5">
          <AuthModalForm redirectTo={redirectTo} />
        </div>

        <div
          className="mt-4 rounded-xl bg-[#F0EBDD] px-4 py-3 text-center text-[12.5px]"
          style={{ color: COLORS.text }}
        >
          Pas encore membre ?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(redirectTo)}`}
            onClick={onClose}
            className="font-bold underline-offset-2 hover:underline"
            style={{ color: COLORS.primary }}
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}

const initial: LoginState = null;

function AuthModalForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginRetail,
    initial,
  );

  const emailVal = state && !state.ok ? (state.values?.email ?? "") : "";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <ModalField
        icon={<Mail className="h-3.5 w-3.5" strokeWidth={2} />}
        label="Adresse e-mail"
        name="email"
        type="email"
        required
        defaultValue={emailVal}
        autoComplete="email"
        placeholder="vous@exemple.com"
      />
      <ModalField
        icon={<Lock className="h-3.5 w-3.5" strokeWidth={2} />}
        label="Mot de passe"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />

      {state && !state.ok && (
        <div
          className="rounded-md border-l-4 px-3 py-2 text-[12px]"
          style={{
            background: "#FCE9E5",
            borderColor: COLORS.red,
            color: "#7A1709",
          }}
        >
          {state.error}
        </div>
      )}

      <ModalSubmit />
    </form>
  );
}

function ModalSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex h-11 items-center justify-center gap-2 rounded-full text-[13.5px] font-bold text-white shadow-md transition disabled:opacity-70"
      style={{
        background:
          "linear-gradient(135deg, #3F561F 0%, #5A7A2C 50%, #3F561F 100%)",
      }}
    >
      {pending ? "Connexion..." : "Se connecter"}
      {!pending && <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />}
    </button>
  );
}

function ModalField({
  icon,
  label,
  name,
  type = "text",
  required,
  defaultValue,
  autoComplete,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="flex items-center gap-1.5 text-[12px] font-bold"
        style={{ color: COLORS.text }}
      >
        <span style={{ color: COLORS.primary }}>{icon}</span>
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-11 rounded-lg border-2 px-3 text-[13.5px] outline-none transition focus:border-[#3F561F]"
        style={{
          borderColor: COLORS.border,
          color: COLORS.text,
        }}
      />
    </label>
  );
}
