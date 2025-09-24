const express = require("express");
const {
  getPortfolios,
  getPortfolioById,
} = require("../controller/portfolioController");
const { getCategories } = require("../controller/categoryController");
const { listTechnologies } = require("../controller/technologyController");
const { getPageBuilders } = require("../controller/pagebuilderController");
const { getIndustry } = require("../controller/industryController");

const router = express.Router();

router.get("/portfolios", getPortfolios);
router.get("/portfolios/:id", getPortfolioById);
router.get("/categories", getCategories);
router.get("/technologies", listTechnologies);
router.get("/pagebuilders", getPageBuilders);
router.get("/industry", getIndustry);

module.exports = router;
