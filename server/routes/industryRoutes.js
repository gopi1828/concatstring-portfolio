const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { createIndustry, getIndustry, updateIndustry, deleteIndustry } = require("../controller/industryController");

const router = express.Router();

router.use(authenticateToken);

router.post("/", createIndustry);
router.get("/", getIndustry);
router.put("/:id", updateIndustry);
router.delete("/:id", deleteIndustry);

module.exports = router;
