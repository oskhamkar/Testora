const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
} = require('../controllers/categoryController');

router.get('/', protect, getCategories);
router.get('/:id', protect, getCategoryById);
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
