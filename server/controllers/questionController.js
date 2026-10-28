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

// @desc    Export questions to CSV (optionally filtered)
// @route   GET /api/questions/export
// @access  Admin
const exportQuestions = async (req, res) => {
  try {
    const { categoryId, topicId, search } = req.query;
    const query = { isActive: true };
    if (categoryId) query.categoryId = categoryId;
    if (topicId) query.topicId = topicId;
    if (search) query.question = { $regex: search, $options: 'i' };

    const questions = await Question.find(query)
      .populate('categoryId', 'name')
      .populate('topicId', 'name')
      .sort({ createdAt: -1 });

    const escapeCsv = (value) => {
      const str = String(value ?? '');
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const header = [
      'Category', 'Topic', 'Question', 'Option A', 'Option B', 'Option C', 'Option D',
      'Correct Answer', 'Explanation',
    ];

    const rows = questions.map((q) => {
      const optText = (label) => q.options.find((o) => o.label === label)?.text || '';
      return [
        q.categoryId?.name || '',
        q.topicId?.name || '',
        q.question,
        optText('A'), optText('B'), optText('C'), optText('D'),
        q.correctAnswer,
        q.explanation || '',
      ].map(escapeCsv).join(',');
    });

    const csv = [header.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="questions-export-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Import questions from a documented JSON format (all-or-nothing)
// @route   POST /api/questions/import-json
// @access  Admin
//
// Expected body shape:
// {
//   "questions": [
//     {
//       "category": "Quantitative Aptitude",
//       "topic": "Percentages",
//       "question": "What is 20% of 150?",
//       "options": { "A": "20", "B": "30", "C": "40", "D": "50" },
//       "correctAnswer": "B",
//       "explanation": "20% of 150 = 0.2 * 150 = 30"
//     }
//   ]
// }
const importQuestionsJson = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must contain a non-empty "questions" array',
      });
    }

    const categories = await Category.find({ isActive: true });
    const topics = await Topic.find({ isActive: true });

    const catMap = {};
    categories.forEach((c) => (catMap[c.name.toLowerCase()] = c._id));
    const topicMap = {};
    topics.forEach((t) => (topicMap[t.name.toLowerCase()] = { _id: t._id, categoryId: t.categoryId.toString() }));

    const letters = ['A', 'B', 'C', 'D'];
    const errors = [];
    const seenInPayload = new Set();
    const validDocs = [];

    questions.forEach((item, idx) => {
      const rowNum = idx + 1;
      const questionText = item?.question?.trim();

      if (!questionText) {
        errors.push({ index: rowNum, error: 'Missing question text' });
        return;
      }

      const options = item.options;
      if (!options || typeof options !== 'object') {
        errors.push({ index: rowNum, error: 'Missing options (expected an object with A, B, C, D)' });
        return;
      }
      const missingOption = letters.find((l) => !options[l] || !String(options[l]).trim());
      if (missingOption) {
        errors.push({ index: rowNum, error: `Missing option ${missingOption}` });
        return;
      }

      const correctAnswer = item.correctAnswer?.trim().toUpperCase();
      if (!letters.includes(correctAnswer)) {
        errors.push({ index: rowNum, error: 'correctAnswer must be one of A, B, C, D' });
        return;
      }

      const catName = item.category?.trim().toLowerCase();
      const topicName = item.topic?.trim().toLowerCase();
      const categoryId = catMap[catName];
      if (!categoryId) {
        errors.push({ index: rowNum, error: `Category '${item.category}' not found` });
        return;
      }
      const topic = topicMap[topicName];
      if (!topic) {
        errors.push({ index: rowNum, error: `Topic '${item.topic}' not found` });
        return;
      }
      if (topic.categoryId !== categoryId.toString()) {
        errors.push({ index: rowNum, error: `Topic '${item.topic}' does not belong to category '${item.category}'` });
        return;
      }

      const dupKey = `${categoryId}|${topic._id}|${questionText.toLowerCase()}`;
      if (seenInPayload.has(dupKey)) {
        errors.push({ index: rowNum, error: 'Duplicate question within the import file' });
        return;
      }
      seenInPayload.add(dupKey);

      validDocs.push({
        categoryId,
        topicId: topic._id,
        question: questionText,
        options: letters.map((l) => ({ label: l, text: String(options[l]).trim() })),
        correctAnswer,
        explanation: item.explanation?.trim() || '',
        createdBy: req.user._id,
        _dupKey: dupKey,
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Import rejected: ${errors.length} of ${questions.length} question(s) failed validation. No questions were imported.`,
        data: { errors },
      });
    }

    const existing = await Question.find({ isActive: true }, 'categoryId topicId question');
    const existingKeys = new Set(
      existing.map((q) => `${q.categoryId}|${q.topicId}|${q.question.trim().toLowerCase()}`)
    );
    const dbDuplicates = validDocs.filter((d) => existingKeys.has(d._dupKey));
    if (dbDuplicates.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Import rejected: ${dbDuplicates.length} question(s) already exist in the question bank. No questions were imported.`,
        data: { errors: dbDuplicates.map((d) => ({ error: `Duplicate: "${d.question}"` })) },
      });
    }

    const docsToInsert = validDocs.map(({ _dupKey, ...doc }) => doc);
    const inserted = await Question.insertMany(docsToInsert);

    res.status(201).json({
      success: true,
      message: `Imported ${inserted.length} questions successfully.`,
      data: { imported: inserted.length },
    });
  } catch (error) {
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
  exportQuestions,
  importQuestionsJson,
};
