const express = require('express');
const {
	createPortfolio,
	getPortfolios,
	getPortfolioById,
	updatePortfolioById,
	deletePortfolioById,
	getPortfoliosByCategory,
} = require('../controller/portfolioController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All portfolio routes require authentication
router.use(authenticateToken);

router.post('/', createPortfolio);
router.get('/', getPortfolios);
router.get('/category/:category', getPortfoliosByCategory);
router.get('/:id', getPortfolioById);
router.put('/:id', updatePortfolioById);
router.delete('/:id', deletePortfolioById);

module.exports = router;


