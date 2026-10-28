const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate, categoryValidators } = require('../middleware/validators');
const {
  getCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
} = require('../controllers/categoryController');

router.get('/', protect, getCategories);
router.get('/:id', protect, getCategoryById);
router.post('/', protect, authorize('admin'), categoryValidators, validate, createCategory);
router.put('/:id', protect, authorize('admin'), categoryValidators, validate, updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
