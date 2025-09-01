const express = require('express');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} = require('../controller/categoryController');

const router = express.Router();

router.post('/', createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategoryById);
router.delete('/:id', deleteCategoryById);

module.exports = router;


