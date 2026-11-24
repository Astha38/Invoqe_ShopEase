const pool = require("../config/db");

exports.getStats = async (req, res) => {
  try {
    const [productsCount, ordersCount, revenue, usersCount, recentOrders, lowStock] = await Promise.all([
      pool.query("SELECT COUNT(*) AS count FROM products WHERE is_active = true"),
      pool.query("SELECT COUNT(*) AS count FROM orders"),
      pool.query("SELECT COALESCE(SUM(total_amount), 0) AS sum FROM orders WHERE status != 'cancelled'"),
      pool.query("SELECT COUNT(*) AS count FROM users"),
      pool.query(`
        SELECT o.id, o.total_amount, o.status, o.payment_method, o.payment_status, o.created_at,
               u.name AS customer_name, u.email
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `),
      pool.query("SELECT id, name, stock_quantity, price FROM products WHERE is_active = true AND stock_quantity <= 15 ORDER BY stock_quantity ASC LIMIT 5"),
    ]);

    res.json({
      totalProducts: parseInt(productsCount.rows[0].count, 10),
      totalOrders: parseInt(ordersCount.rows[0].count, 10),
      totalRevenue: parseFloat(revenue.rows[0].sum).toFixed(2),
      totalUsers: parseInt(usersCount.rows[0].count, 10),
      recentOrders: recentOrders.rows,
      lowStockProducts: lowStock.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.id, o.subtotal_amount, o.discount_amount, o.shipping_fee, o.total_amount,
             o.coupon_code, o.payment_method, o.payment_status, o.payment_reference,
             o.tracking_number, o.status, o.shipping_address, o.created_at,
             u.id AS user_id, u.name AS customer_name, u.email AS customer_email,
             COALESCE(json_agg(json_build_object(
               'product_id', oi.product_id, 'name', p.name,
               'quantity', oi.quantity, 'price', oi.price_at_purchase,
               'image_url', p.image_url
             )) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      GROUP BY o.id, u.id
      ORDER BY o.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }
  try {
    const trackingCode =
      status === "shipped" || status === "delivered"
        ? `SHP-${req.params.id.slice(0, 6).toUpperCase()}`
        : null;

    const { rows } = await pool.query(
      `UPDATE orders
       SET status = $1,
           payment_status = CASE WHEN $1 IN ('paid', 'shipped', 'delivered') THEN 'paid' ELSE payment_status END,
           tracking_number = COALESCE(tracking_number, $3)
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id, trackingCode]
    );
    if (!rows[0]) return res.status(404).json({ message: "Order not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.address, u.created_at,
             COUNT(o.id) AS total_orders,
             COALESCE(SUM(o.total_amount), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.status != 'cancelled'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createCoupon = async (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  const description = String(req.body.description || "").trim();
  const discountType = req.body.discount_type;
  const discountValue = parseFloat(req.body.discount_value || 0);
  const minOrderAmount = parseFloat(req.body.min_order_amount || 0);

  if (!code || !["percent", "fixed", "shipping"].includes(discountType)) {
    return res.status(400).json({ message: "Valid coupon code and discount type are required" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [code, description, discountType, discountValue, minOrderAmount]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Coupon code already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM coupons WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
