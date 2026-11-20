const router = require("express").Router();
const auth = require("../middleware/auth");
const { checkout, list, getOne } = require("../controllers/orderController");

router.use(auth);
router.post("/", checkout);
router.get("/", list);
router.get("/:id", getOne);

module.exports = router;
