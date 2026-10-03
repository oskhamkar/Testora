const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOverview,
  getTopicPerformance,
  getHistory,
  getWeakTopics,
  getAttemptResult,
  getStudentPerformance,
} = require('../controllers/performanceController');

router.get('/overview', protect, authorize('student'), getOverview);
router.get('/topics', protect, authorize('student'), getTopicPerformance);
router.get('/history', protect, authorize('student'), getHistory);
router.get('/weak-topics', protect, authorize('student'), getWeakTopics);
router.get('/attempts/:id', protect, getAttemptResult);
router.get('/student/:studentId', protect, authorize('teacher', 'admin'), getStudentPerformance);

module.exports = router;
