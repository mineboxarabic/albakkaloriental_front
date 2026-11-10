import {
  INVALID,
  NOT_FOUND,
  addItemSchema,
  cartActions,
  json,
  readJson,
} from "@/lib/cart-routes";

type Context = { params: Promise<{ audience: string }> };

export async function POST(request: Request, { params }: Context) {
  const actions = cartActions((await params).audience);
  if (!actions) return NOT_FOUND();
  const parsed = addItemSchema.safeParse(await readJson(request));
  if (!parsed.success) return INVALID();
  return json(await actions.add(parsed.data));
}
