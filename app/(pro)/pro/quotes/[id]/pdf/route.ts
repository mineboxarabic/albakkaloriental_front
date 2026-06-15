import { cookies } from "next/headers";

const SESSION_COOKIE = "b2b_session";

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

  const payload = (await upstream.json()) as
    | { success: true; data: { url: string } }
    | { url?: string };
  const url =
    (payload as { success?: boolean; data?: { url?: string } }).data?.url ??
    (payload as { url?: string }).url;

  if (!url) {
    return new Response("PDF du devis indisponible", { status: 502 });
  }

  // Redirect the browser straight to the S3-hosted PDF.
  return Response.redirect(url, 302);
}
