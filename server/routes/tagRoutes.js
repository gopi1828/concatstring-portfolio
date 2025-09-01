const express = require("express");
const {
  createTag,
  getTags,
  updateTag,
  deleteTag,
} = require("../controller/tagController");

const router = express.Router();

router.post("/", createTag);
router.get("/", getTags);
router.put("/:id", updateTag);
router.delete("/:id", deleteTag);

module.exports = router;
