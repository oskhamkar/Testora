const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMockTests,
  getMockTestById,
  createMockTest,
  updateMockTest,
  deleteMockTest,
  startMockTest,
  submitMockTest,
} = require('../controllers/mockTestController');

router.get('/', protect, getMockTests);
router.get('/:id', protect, getMockTestById);
router.post('/', protect, authorize('admin'), createMockTest);
router.put('/:id', protect, authorize('admin'), updateMockTest);
router.delete('/:id', protect, authorize('admin'), deleteMockTest);
router.post('/:id/start', protect, authorize('student'), startMockTest);
router.post('/:id/submit', protect, authorize('student'), submitMockTest);

module.exports = router;
