import { cookies } from "next/headers";

const SESSION_COOKIE = "catalog_session";

function getBackendUrl(): string {
  const url = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url) throw new Error("BACKEND_URL env is not configured");
  return url.replace(/\/$/, "");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const upstream = await fetch(`${getBackendUrl()}/api/v1/b2b/quotes/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response(`Upstream error ${upstream.status}`, {
      status: upstream.status,
    });
  }

  // Stream the PDF bytes through; the backend serves a private document, so we
  // never expose the underlying S3 URL to the browser.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition":
        upstream.headers.get("content-disposition") ?? "inline",
      "cache-control": "private, no-store",
    },
  });
}
