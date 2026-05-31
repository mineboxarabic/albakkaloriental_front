export const MIN_ORDER_EUR = 30;
export const FREE_DELIVERY_THRESHOLD_EUR = 50;
export const DELIVERY_FEE_EUR = 3;
export const MAX_QTY_PER_PRODUCT = 3;

export function deliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD_EUR ? 0 : DELIVERY_FEE_EUR;
}
