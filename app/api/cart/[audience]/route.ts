import { NOT_FOUND, cartActions, json } from "@/lib/cart-routes";

type Context = { params: Promise<{ audience: string }> };

export async function GET(_request: Request, { params }: Context) {
  const actions = cartActions((await params).audience);
  if (!actions) return NOT_FOUND();
  return json(await actions.get());
}

export async function DELETE(_request: Request, { params }: Context) {
  const actions = cartActions((await params).audience);
  if (!actions) return NOT_FOUND();
  return json(await actions.clear());
}
