/**
 * REST client for the AlimExpress admin back-end (/api/v1/*).
 * Reads the JWT from the matching portal cookie (b2b_session / b2c_session) and forwards
 * it as Authorization: Bearer <token> for authenticated calls.
 */
import { cookies } from "next/headers";
import { RETAIL_COOKIE, PRO_COOKIE } from "@/lib/session";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

function getBackendUrl(): string {
  const url = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) {
    throw new Error("BACKEND_URL env is not configured");
  }
  return url.replace(/\/$/, "");
}

// Pick the portal cookie by endpoint: /api/v1/b2b/* uses the b2b session,
// everything else (retail) uses the b2c session. The token carries no portal
// field — the cookie it lives in is the portal.
function isProPath(path: string): boolean {
  return path.startsWith("/api/v1/b2b");
}

async function readAuthCookie(path: string): Promise<string | null> {
  const store = await cookies();
  const name = isProPath(path) ? PRO_COOKIE : RETAIL_COOKIE;
  return store.get(name)?.value ?? null;
}

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** When 'required', throws if no token in cookie. When 'optional', sends header if present. When 'none', no auth. */
  auth?: "required" | "optional" | "none";
  /** Override the bearer token (e.g. just-issued at login before cookie is set). */
  bearer?: string;
  /** Forward request headers (e.g. user-agent, x-forwarded-for for accept-quote). */
  forwardHeaders?: Record<string, string>;
};

export async function backendFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const url = `${getBackendUrl()}${path}`;
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...options.forwardHeaders,
  };

  if (options.bearer) {
    headers.Authorization = `Bearer ${options.bearer}`;
  } else if (options.auth === "required" || options.auth === "optional") {
    const token = await readAuthCookie(path);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (options.auth === "required") {
      throw new ApiClientError(401, "Authentication required");
    }
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      (parsed as { error?: string })?.error ??
      (parsed as { message?: string })?.message ??
      `Request failed: ${response.status}`;

    if (response.status === 401) {
      try {
        const { clearRetailSession, clearProSession } = await import("@/lib/session");
        if (isProPath(path)) await clearProSession();
        else await clearRetailSession();
      } catch {}
    }

    throw new ApiClientError(response.status, message, parsed);
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    "success" in parsed &&
    (parsed as ApiResponse<T>).success
  ) {
    return (parsed as ApiSuccess<T>).data;
  }

  return parsed as T;
}

export async function handleActionError(
  error: unknown,
): Promise<{ ok: false; error: string; isUnauthorized?: boolean }> {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      // The failing portal cookie was already cleared in backendFetch.
      return {
        ok: false,
        error: "Votre session a expiré. Veuillez vous reconnecter.",
        isUnauthorized: true,
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: false, error: "Opération impossible pour le moment." };
}
