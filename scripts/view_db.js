require("dotenv").config({ path: require("path").join(__dirname, "../server/.env") });
const { Pool } = require("../server/node_modules/pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function viewDatabase() {
  console.log("\n========================================================");
  console.log("             🛍️  SHOPEASE DATABASE VIEWER");
  console.log("========================================================");
  console.log(`Connected to: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@")}\n`);

  try {
    // 1. Categories
    const categories = await pool.query("SELECT id, name FROM categories ORDER BY name");
    console.log(`📁 CATEGORIES (${categories.rows.length}):`);
    console.table(categories.rows);

    // 2. Products
    const products = await pool.query(
      `SELECT p.id, p.name, c.name AS category, p.price, p.stock_quantity AS stock, p.is_active
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.name`
    );
    console.log(`\n📦 PRODUCTS (${products.rows.length}):`);
    console.table(products.rows);

    // 3. Users
    const users = await pool.query(
      "SELECT id, name, email, address, created_at FROM users ORDER BY created_at DESC"
    );
    console.log(`\n👤 REGISTERED USERS (${users.rows.length}):`);
    if (users.rows.length === 0) {
      console.log("   (No users registered yet)");
    } else {
      console.table(users.rows);
    }

    // 4. Orders
    const orders = await pool.query(
      `SELECT o.id, u.name AS customer, o.total_amount AS total, o.status,
              o.shipping_address, o.created_at, count(oi.id) AS item_count
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id, u.name
       ORDER BY o.created_at DESC`
    );
    console.log(`\n📑 ORDERS (${orders.rows.length}):`);
    if (orders.rows.length === 0) {
      console.log("   (No orders placed yet)");
    } else {
      console.table(orders.rows);
    }

    // 5. Active Cart Items
    const carts = await pool.query(
      `SELECT c.id AS cart_id, u.name AS user, p.name AS product, ci.quantity, (p.price * ci.quantity) AS total
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       JOIN users u ON u.id = c.user_id
       JOIN products p ON p.id = ci.product_id`
    );
    console.log(`\n🛒 ACTIVE CART ITEMS (${carts.rows.length}):`);
    if (carts.rows.length === 0) {
      console.log("   (All carts currently empty)");
    } else {
      console.table(carts.rows);
    }

    console.log("\n========================================================\n");
  } catch (err) {
    console.error("Database query failed:", err.message);
  } finally {
    await pool.end();
  }
}

viewDatabase();
