const pool = require("../config/db");

// makes sure the user has a cart and returns its id
async function getCartId(userId) {
  const { rows } = await pool.query(
    `INSERT INTO carts (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [userId]
  );
  return rows[0].id;
}

exports.getCart = async (req, res) => {
  try {
    const cartId = await getCartId(req.userId);
    const { rows } = await pool.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price,
              p.image_url, p.stock_quantity, (p.price * ci.quantity) AS line_total
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at`,
      [cartId]
    );
    const total = rows.reduce((sum, r) => sum + Number(r.line_total), 0);
    res.json({ items: rows, total: Math.round(total * 100) / 100 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addItem = async (req, res) => {
  const { productId } = req.body;
  const qty = parseInt(req.body.quantity ?? 1, 10);
  if (!productId || !(qty > 0)) {
    return res.status(400).json({ message: "productId and a quantity above 0 are required" });
  }
  try {
    const prod = await pool.query(
      "SELECT stock_quantity FROM products WHERE id = $1 AND is_active = true",
      [productId]
    );
    if (!prod.rows[0]) return res.status(404).json({ message: "Product not found" });

    const cartId = await getCartId(req.userId);
    const existing = await pool.query(
      "SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, productId]
    );
    const newQty = (existing.rows[0]?.quantity || 0) + qty;
    if (newQty > prod.rows[0].stock_quantity) {
      return res.status(400).json({ message: `Only ${prod.rows[0].stock_quantity} in stock` });
    }
    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = $3, updated_at = now()`,
      [cartId, productId, newQty]
    );
    res.status(201).json({ message: "Added to cart" });
  } catch (err) {
    if (err.code === "22P02") return res.status(400).json({ message: "Invalid id" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateItem = async (req, res) => {
  const qty = parseInt(req.body.quantity, 10);
  if (!(qty > 0)) return res.status(400).json({ message: "Quantity must be above 0" });
  try {
    const { rows } = await pool.query(
      `UPDATE cart_items ci SET quantity = $1, updated_at = now()
       FROM carts c, products p
       WHERE ci.id = $2 AND ci.cart_id = c.id AND c.user_id = $3
         AND p.id = ci.product_id AND $1 <= p.stock_quantity
       RETURNING ci.id`,
      [qty, req.params.id, req.userId]
    );
    if (!rows[0]) return res.status(400).json({ message: "Item not found or quantity exceeds stock" });
    res.json({ message: "Updated" });
  } catch (err) {
    if (err.code === "22P02") return res.status(400).json({ message: "Invalid id" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM cart_items
       WHERE id = $1 AND cart_id IN (SELECT id FROM carts WHERE user_id = $2)`,
      [req.params.id, req.userId]
    );
    if (!rowCount) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Removed" });
  } catch (err) {
    if (err.code === "22P02") return res.status(400).json({ message: "Invalid id" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
