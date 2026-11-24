const pool = require("../config/db");

/**
 * Verifies the authenticated user has the 'admin' role.
 */
module.exports = async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT role FROM users WHERE id = $1", [req.userId]);
    if (!rows[0] || rows[0].role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
