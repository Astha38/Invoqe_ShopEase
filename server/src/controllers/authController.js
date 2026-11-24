const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const makeToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  const { name, email, password, address } = req.body;
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: "Name, email and a password of 6+ characters are required" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, address)
       VALUES ($1, $2, $3, $4) RETURNING id, email, name, address, role`,
      [email.toLowerCase(), hash, name, address || null]
    );
    const user = rows[0];
    await pool.query("INSERT INTO carts (user_id) VALUES ($1)", [user.id]);
    res.status(201).json({ user, token: makeToken(user) });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    const user = rows[0];
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });
    res.json({
      user: { id: user.id, email: user.email, name: user.name, address: user.address, role: user.role },
      token: makeToken(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, email, name, address, role FROM users WHERE id = $1",
    [req.userId]
  );
  res.json(rows[0]);
};
