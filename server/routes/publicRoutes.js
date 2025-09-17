const express = require("express");
const {
  getPortfolios,
  getPortfolioById,
} = require("../controller/portfolioController");
const {
  getCategories,
} = require("../controller/categoryController");
const {
  listTechnologies,
} = require("../controller/technologyController");
const {
  getTags,
} = require("../controller/tagController");
const {
  getIndustry,
} = require("../controller/industryController");

const router = express.Router();

// Public routes - no authentication required
router.get("/portfolios", getPortfolios);
router.get("/portfolios/:id", getPortfolioById);
router.get("/categories", getCategories);
router.get("/technologies", listTechnologies);
router.get("/tags", getTags);
router.get("/industry", getIndustry);

module.exports = router;
