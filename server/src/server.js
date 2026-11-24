require("dotenv").config();
const app = require("./app");
const pool = require("./config/db");
const ensureDatabaseReady = require("./config/initDb");

const PORT = process.env.PORT || 5000;

async function start() {
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await pool.query("SELECT 1");
      await ensureDatabaseReady();
      console.log("Database connected");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
      return;
    } catch (err) {
      if (attempt === 10) {
        console.error("DB connection failed:", err.message || err);
        process.exit(1);
      }
      console.log(`Waiting for database to be ready (attempt ${attempt}/10)...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

start();
