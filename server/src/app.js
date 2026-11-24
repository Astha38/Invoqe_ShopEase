const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/admin", require("./routes/admin"));

// Serve static frontend files in production
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));

// Client SPA fallback: route any non-API GET request to index.html
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) {
    return res.status(404).json({ message: "Route not found" });
  }
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

module.exports = app;
