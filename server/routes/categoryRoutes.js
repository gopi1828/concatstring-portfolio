const express = require('express');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} = require('../controller/categoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All category routes require authentication
router.use(authenticateToken);

router.post('/', createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategoryById);
router.delete('/:id', deleteCategoryById);

module.exports = router;


