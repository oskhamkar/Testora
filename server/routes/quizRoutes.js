const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  assignQuiz,
  getQuizResults,
  getStudentQuizzes,
  startQuiz,
  submitQuiz,
} = require('../controllers/quizController');

// Student routes
router.get('/my', protect, authorize('student'), getStudentQuizzes);
router.post('/:id/start', protect, authorize('student'), startQuiz);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);

// Teacher/Admin routes
router.get('/', protect, authorize('teacher', 'admin'), getMyQuizzes);
router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.get('/:id/results', protect, authorize('teacher', 'admin'), getQuizResults);
router.put('/:id', protect, authorize('teacher', 'admin'), updateQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);
router.post('/:id/assign', protect, authorize('teacher'), assignQuiz);

module.exports = router;
