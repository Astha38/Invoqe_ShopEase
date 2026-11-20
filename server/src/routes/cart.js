const router = require("express").Router();
const auth = require("../middleware/auth");
const { getCart, addItem, updateItem, removeItem } = require("../controllers/cartController");

router.use(auth);
router.get("/", getCart);
router.post("/items", addItem);
router.patch("/items/:id", updateItem);
router.delete("/items/:id", removeItem);

module.exports = router;
