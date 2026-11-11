export interface RetailOrderRules {
  minOrderEur: number;
  freeDeliveryThresholdEur: number;
  deliveryFeeEur: number;
  minQtyPerProduct: number;
  maxQtyPerProduct: number;
}

export const DEFAULT_RETAIL_ORDER_RULES: RetailOrderRules = {
  minOrderEur: 30,
  freeDeliveryThresholdEur: 50,
  deliveryFeeEur: 3,
  minQtyPerProduct: 1,
  maxQtyPerProduct: 3,
};

export function roundRetailMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function deliveryFee(subtotal: number, rules: RetailOrderRules): number {
  return roundRetailMoney(subtotal) >= rules.freeDeliveryThresholdEur ? 0 : rules.deliveryFeeEur;
}
