const router = require("express").Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const {
  getStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getAllCoupons,
  createCoupon,
  deleteCoupon,
} = require("../controllers/adminController");

router.use(auth, requireAdmin);
router.get("/stats", getStats);
router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/users", getAllUsers);
router.get("/coupons", getAllCoupons);
router.post("/coupons", createCoupon);
router.delete("/coupons/:id", deleteCoupon);

module.exports = router;
