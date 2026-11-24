const pool = require("../config/db");
const { calculateOrderPricing } = require("../utils/pricing");

exports.listActive = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, code, description, discount_type, discount_value, min_order_amount
       FROM coupons
       WHERE is_active = true
       ORDER BY created_at ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.validateCoupon = async (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  const subtotal = Number(req.body.subtotal || 0);

  if (!code) {
    return res.status(400).json({ message: "Please enter a coupon code" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true",
      [code]
    );
    const coupon = rows[0];
    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon code" });
    }

    const pricing = calculateOrderPricing(subtotal, coupon);
    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount,
      },
      ...pricing,
      message:
        coupon.discount_type === "shipping"
          ? `${coupon.code} applied — Free express shipping!`
          : `${coupon.code} applied — You save ₹${pricing.discount}!`,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
