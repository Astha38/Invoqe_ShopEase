const bcrypt = require("bcryptjs");
const pool = require("./db");

/**
 * Ensures new schema columns, tables, default coupons, and a demo admin user
 * exist without breaking an already-initialized PostgreSQL database.
 */
async function ensureDatabaseReady() {
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'customer';
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'shipping')),
      discount_value DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
      min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP DEFAULT now()
    );
  `);

  await pool.query(`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NOT NULL DEFAULT 'cod',
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100),
      ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(50);
  `);

  await pool.query(`
    INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount)
    VALUES
      ('WELCOME10', '10% off your order', 'percent', 10.00, 0.00),
      ('FREESHIP', 'Free express shipping on any order', 'shipping', 0.00, 0.00),
      ('SAVE200', 'Flat Rs.200 off orders Rs.1499+', 'fixed', 200.00, 1499.00)
    ON CONFLICT (code) DO NOTHING;
  `);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@shopease.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const existingAdmin = await pool.query("SELECT id FROM users WHERE email = $1", [adminEmail]);

  if (!existingAdmin.rows[0]) {
    const hash = await bcrypt.hash(adminPassword, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, address, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id`,
      [adminEmail, hash, "ShopEase Admin", "ShopEase HQ, Bengaluru"]
    );
    await pool.query("INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT DO NOTHING", [rows[0].id]);
  } else {
    await pool.query("UPDATE users SET role = 'admin' WHERE id = $1 AND role != 'admin'", [
      existingAdmin.rows[0].id,
    ]);
  }
}

module.exports = ensureDatabaseReady;
