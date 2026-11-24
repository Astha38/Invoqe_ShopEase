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

exports.create = async (req, res) => {
  const { name, description, price, image_url, stock_quantity, category_id } = req.body;
  if (!name || price === undefined || price === null) {
    return res.status(400).json({ message: "Name and price are required" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, image_url, stock_quantity, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        name,
        description || "",
        parseFloat(price),
        image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
        parseInt(stock_quantity || 0, 10),
        category_id || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.update = async (req, res) => {
  const { name, description, price, image_url, stock_quantity, category_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           image_url = COALESCE($4, image_url),
           stock_quantity = COALESCE($5, stock_quantity),
           category_id = COALESCE($6, category_id),
           updated_at = now()
       WHERE id = $7 AND is_active = true
       RETURNING *`,
      [
        name,
        description,
        price !== undefined && price !== "" ? parseFloat(price) : null,
        image_url,
        stock_quantity !== undefined && stock_quantity !== "" ? parseInt(stock_quantity, 10) : null,
        category_id || null,
        req.params.id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "UPDATE products SET is_active = false, updated_at = now() WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
