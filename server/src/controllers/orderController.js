const pool = require("../config/db");
const { calculateOrderPricing } = require("../utils/pricing");

const fail = (status, message) => {
  const e = new Error(message);
  e.status = status;
  return e;
};

const makePaymentReference = (method) => {
  if (method === "cod") return "COD";
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${method.toUpperCase()}-${rand}`;
};

exports.checkout = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // lock the product rows so two buyers can't take the last item
    const { rows: items } = await client.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock_quantity, p.is_active
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       JOIN products p ON p.id = ci.product_id
       WHERE c.user_id = $1
       ORDER BY p.id
       FOR UPDATE OF p`,
      [req.userId]
    );
    if (items.length === 0) throw fail(400, "Your cart is empty");

    let address = req.body.shippingAddress;
    if (!address) {
      const u = await client.query("SELECT address FROM users WHERE id = $1", [req.userId]);
      address = u.rows[0]?.address;
    }
    if (!address || !String(address).trim()) {
      throw fail(400, "A shipping address is required");
    }

    for (const it of items) {
      if (!it.is_active || it.quantity > it.stock_quantity) {
        throw fail(409, `Not enough stock for ${it.name}`);
      }
    }

    const rawSubtotal = items.reduce((s, it) => s + Number(it.price) * it.quantity, 0);

    let coupon = null;
    const rawCode = String(req.body.couponCode || "").trim().toUpperCase();
    if (rawCode) {
      const couponRes = await client.query(
        "SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true",
        [rawCode]
      );
      coupon = couponRes.rows[0];
      if (!coupon) throw fail(400, `Coupon "${rawCode}" is invalid or expired`);
    }

    const pricing = calculateOrderPricing(rawSubtotal, coupon);

    const paymentMethod = String(req.body.paymentMethod || "cod").toLowerCase();
    if (!["cod", "upi", "card"].includes(paymentMethod)) {
      throw fail(400, "Invalid payment method");
    }

    const paymentDetails = req.body.paymentDetails || {};
    if (paymentMethod === "upi" && !String(paymentDetails.upiId || "").includes("@")) {
      throw fail(400, "Please enter a valid UPI ID (e.g., name@upi)");
    }
    if (paymentMethod === "card") {
      const digits = String(paymentDetails.cardNumber || "").replace(/\s+/g, "");
      if (digits.length < 12) {
        throw fail(400, "Please enter a valid card number");
      }
    }

    const isOnlinePaid = paymentMethod === "upi" || paymentMethod === "card";
    const orderStatus = isOnlinePaid ? "paid" : "pending";
    const paymentStatus = isOnlinePaid ? "paid" : "pending";
    const paymentReference = makePaymentReference(paymentMethod);

    const { rows } = await client.query(
      `INSERT INTO orders (
         user_id, subtotal_amount, discount_amount, shipping_fee, total_amount,
         coupon_code, payment_method, payment_status, payment_reference,
         shipping_address, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, subtotal_amount, discount_amount, shipping_fee, total_amount,
                 coupon_code, payment_method, payment_status, payment_reference,
                 tracking_number, status, shipping_address, created_at`,
      [
        req.userId,
        pricing.subtotal,
        pricing.discount,
        pricing.shippingFee,
        pricing.finalTotal,
        coupon ? coupon.code : null,
        paymentMethod,
        paymentStatus,
        paymentReference,
        String(address).trim(),
        orderStatus,
      ]
    );
    const order = rows[0];

    for (const it of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [order.id, it.product_id, it.quantity, it.price]
      );
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = now()
         WHERE id = $2`,
        [it.quantity, it.product_id]
      );
    }
    await client.query(
      "DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)",
      [req.userId]
    );

    await client.query("COMMIT");
    res.status(201).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

const orderQuery = (byId) => `
  SELECT o.id, o.subtotal_amount, o.discount_amount, o.shipping_fee, o.total_amount,
         o.coupon_code, o.payment_method, o.payment_status, o.payment_reference,
         o.tracking_number, o.status, o.shipping_address, o.created_at,
         COALESCE(json_agg(json_build_object(
           'product_id', oi.product_id, 'name', p.name,
           'quantity', oi.quantity, 'price', oi.price_at_purchase
         )) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products p ON p.id = oi.product_id
  WHERE o.user_id = $1 ${byId ? "AND o.id = $2" : ""}
  GROUP BY o.id
  ORDER BY o.created_at DESC`;

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query(orderQuery(false), [req.userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { rows } = await pool.query(orderQuery(true), [req.userId, req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Order not found" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "22P02") return res.status(404).json({ message: "Order not found" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
