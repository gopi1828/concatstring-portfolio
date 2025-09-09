const express = require("express");
const {
  createTag,
  getTags,
  updateTag,
  deleteTag,
} = require("../controller/tagController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createTag);
router.get("/", getTags);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);

module.exports = router;
