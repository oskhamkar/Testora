const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getPracticeQuestions,
  submitPracticeAnswer,
  importQuestions,
} = require('../controllers/questionController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `csv-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Practice routes (student)
router.get('/practice/:topicId', protect, authorize('student'), getPracticeQuestions);
router.post('/practice/submit', protect, authorize('student'), submitPracticeAnswer);

// CSV import (admin)
router.post('/import', protect, authorize('admin'), upload.single('file'), importQuestions);

// CRUD — admin/teacher
router.get('/', protect, getQuestions);
router.get('/:id', protect, getQuestionById);
router.post('/', protect, authorize('admin', 'teacher'), createQuestion);
router.put('/:id', protect, authorize('admin', 'teacher'), updateQuestion);
router.delete('/:id', protect, authorize('admin'), deleteQuestion);

module.exports = router;
