const pool = require("../config/db");

exports.list = async (req, res) => {
  const search = req.query.search || null;
  const category = req.query.category || null; // category id
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.image_url, p.stock_quantity, p.category_id, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = true
         AND ($1::text IS NULL OR p.name ILIKE '%' || $1 || '%')
         AND ($2::uuid IS NULL OR p.category_id = $2)
       ORDER BY p.created_at DESC`,
      [search, category]
    );
    res.json(rows);
  } catch (err) {
    if (err.code === "22P02") return res.status(400).json({ message: "Invalid category id" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1 AND p.is_active = true`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "22P02") return res.status(404).json({ message: "Product not found" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.categories = async (req, res) => {
  const { rows } = await pool.query("SELECT id, name FROM categories ORDER BY name");
  res.json(rows);
};
