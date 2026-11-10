import {
  INVALID,
  NOT_FOUND,
  cartActions,
  json,
  readJson,
  updateItemSchema,
} from "@/lib/cart-routes";

type Context = { params: Promise<{ audience: string; itemId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { audience, itemId } = await params;
  const actions = cartActions(audience);
  if (!actions) return NOT_FOUND();
  const parsed = updateItemSchema.safeParse(await readJson(request));
  if (!parsed.success) return INVALID();
  return json(await actions.update(itemId, parsed.data.quantity));
}

export async function DELETE(_request: Request, { params }: Context) {
  const { audience, itemId } = await params;
  const actions = cartActions(audience);
  if (!actions) return NOT_FOUND();
  return json(await actions.remove(itemId));
}
