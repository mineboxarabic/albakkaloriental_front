/**
 * REST client for the AlimExpress admin back-end (/api/v1/*).
 * Reads the JWT (B2B or retail) from the catalog_session cookie and forwards
 * it as Authorization: Bearer <token> for authenticated calls.
 */
import { cookies } from "next/headers";

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

export const SESSION_COOKIE = "catalog_session";

async function readAuthCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
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
    const token = await readAuthCookie();
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
