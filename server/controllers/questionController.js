const Question = require('../models/Question');
const Category = require('../models/Category');
const Topic = require('../models/Topic');
const fs = require('fs');
const csv = require('csv-parser');

const getQuestions = async (req, res) => {
  try {
    const { categoryId, topicId, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (categoryId) query.categoryId = categoryId;
    if (topicId) query.topicId = topicId;
    if (search) query.question = { $regex: search, $options: 'i' };

    const questions = await Question.find(query)
      .populate('categoryId', 'name')
      .populate('topicId', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(query);
    res.json({ success: true, data: questions, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('categoryId', 'name')
      .populate('topicId', 'name');
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { categoryId, topicId, question, options, correctAnswer, explanation } = req.body;
    const q = await Question.create({
      categoryId,
      topicId,
      question,
      options,
      correctAnswer,
      explanation,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Question created', data: q });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { categoryId, topicId, question, options, correctAnswer, explanation, isActive } =
      req.body;
    const q = await Question.findByIdAndUpdate(
      req.params.id,
      { categoryId, topicId, question, options, correctAnswer, explanation, isActive },
      { new: true }
    );
    if (!q) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, message: 'Question updated', data: q });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!q) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, message: 'Question deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get questions for practice (without correct answer)
// @route   GET /api/questions/practice/:topicId
// @access  Student
const getPracticeQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ topicId: req.params.topicId, isActive: true })
      .select('-correctAnswer -explanation')
      .populate('categoryId', 'name')
      .populate('topicId', 'name');
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a single practice answer
// @route   POST /api/questions/practice/submit
// @access  Student
const submitPracticeAnswer = async (req, res) => {
  try {
    const { questionId, selectedAnswer } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const isCorrect = selectedAnswer === question.correctAnswer;

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Import questions from CSV
// @route   POST /api/questions/import
// @access  Admin
const importQuestions = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
  }

  const results = [];
  const errors = [];

  try {
    const categories = await Category.find({ isActive: true });
    const topics = await Topic.find({ isActive: true });

    const catMap = {};
    categories.forEach((c) => (catMap[c.name.toLowerCase()] = c._id));
    const topicMap = {};
    topics.forEach((t) => (topicMap[t.name.toLowerCase()] = { _id: t._id, categoryId: t.categoryId }));

    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      if (!row.question || !row.question.trim()) {
        errors.push({ row: rowNum, error: 'Missing question text' });
        continue;
      }

      const validAnswers = ['A', 'B', 'C', 'D'];
      if (!validAnswers.includes(row.correctAnswer?.trim().toUpperCase())) {
        errors.push({ row: rowNum, error: 'Invalid correctAnswer (must be A, B, C, or D)' });
        continue;
      }

      const catName = row.category?.trim().toLowerCase();
      const topicName = row.topic?.trim().toLowerCase();

      if (!catMap[catName]) {
        errors.push({ row: rowNum, error: `Category '${row.category}' not found` });
        continue;
      }
      if (!topicMap[topicName]) {
        errors.push({ row: rowNum, error: `Topic '${row.topic}' not found` });
        continue;
      }

      results.push({
        question: row.question.trim(),
        options: [
          { label: 'A', text: row.optionA?.trim() || '' },
          { label: 'B', text: row.optionB?.trim() || '' },
          { label: 'C', text: row.optionC?.trim() || '' },
          { label: 'D', text: row.optionD?.trim() || '' },
        ],
        correctAnswer: row.correctAnswer.trim().toUpperCase(),
        explanation: row.explanation?.trim() || '',
        categoryId: catMap[catName],
        topicId: topicMap[topicName]._id,
        createdBy: req.user._id,
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (results.length > 0) {
      await Question.insertMany(results);
    }

    res.json({
      success: true,
      message: `Imported ${results.length} questions. ${errors.length} rows had errors.`,
      data: { imported: results.length, errors },
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getPracticeQuestions,
  submitPracticeAnswer,
  importQuestions,
};
