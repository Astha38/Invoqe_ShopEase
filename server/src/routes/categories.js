const router = require("express").Router();
const { categories } = require("../controllers/productController");

router.get("/", categories);

module.exports = router;
