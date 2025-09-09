const express = require("express");
const {
  listTechnologies,
  createTechnology,
  updateTechnology,
  deleteTechnology,
} = require("../controller/technologyController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listTechnologies);
router.post("/", createTechnology);
router.patch("/:id", updateTechnology);
router.delete("/:id", deleteTechnology);

module.exports = router;
