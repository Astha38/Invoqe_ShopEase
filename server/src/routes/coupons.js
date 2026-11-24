const router = require("express").Router();
const { listActive, validateCoupon } = require("../controllers/couponController");

router.get("/active", listActive);
router.post("/validate", validateCoupon);

module.exports = router;
