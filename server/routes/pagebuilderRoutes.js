const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  createPageBuilder,
  getPageBuilders,
  updatePageBuilder,
  deletePageBuilder,
} = require("../controller/pagebuilderController");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createPageBuilder);
router.get("/", getPageBuilders);
router.put("/:id", updatePageBuilder);
router.delete("/:id", deletePageBuilder);

module.exports = router;
