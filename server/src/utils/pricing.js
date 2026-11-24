const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

const round2 = (n) => Math.round(Number(n) * 100) / 100;

/**
 * Computes subtotal, coupon discount, shipping fee, and final payable total.
 */
function calculateOrderPricing(rawSubtotal, coupon = null) {
  const subtotal = round2(rawSubtotal);
  let shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  let discount = 0;

  if (coupon) {
    const minOrder = Number(coupon.min_order_amount || 0);
    if (subtotal < minOrder) {
      const err = new Error(`Minimum order of ₹${minOrder} required for ${coupon.code}`);
      err.status = 400;
      throw err;
    }

    if (coupon.discount_type === "percent") {
      discount = round2((subtotal * Number(coupon.discount_value)) / 100);
    } else if (coupon.discount_type === "fixed") {
      discount = round2(Math.min(subtotal, Number(coupon.discount_value)));
    } else if (coupon.discount_type === "shipping") {
      shippingFee = 0;
    }
  }

  const finalTotal = round2(Math.max(0, subtotal - discount + shippingFee));

  return {
    subtotal,
    discount,
    shippingFee,
    finalTotal,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  };
}

module.exports = {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  calculateOrderPricing,
};
