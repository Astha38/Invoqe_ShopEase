const router = require("express").Router();
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const { list, getOne, create, update, remove } = require("../controllers/productController");

router.get("/", list);
router.get("/:id", getOne);
router.post("/", auth, requireAdmin, create);
router.put("/:id", auth, requireAdmin, update);
router.delete("/:id", auth, requireAdmin, remove);

module.exports = router;
