const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate, questionValidators } = require('../middleware/validators');
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
  exportQuestions,
  importQuestionsJson,
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

// JSON import (admin) — documented format, all-or-nothing, duplicate-checked
router.post('/import-json', protect, authorize('admin'), importQuestionsJson);

// CSV export (admin) — full or filtered by categoryId/topicId/search
router.get('/export', protect, authorize('admin'), exportQuestions);

// CRUD — admin/teacher
router.get('/', protect, getQuestions);
router.get('/:id', protect, getQuestionById);
router.post('/', protect, authorize('admin', 'teacher'), questionValidators, validate, createQuestion);
router.put('/:id', protect, authorize('admin', 'teacher'), questionValidators, validate, updateQuestion);
router.delete('/:id', protect, authorize('admin'), deleteQuestion);

module.exports = router;
