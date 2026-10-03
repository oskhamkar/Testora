const MockTest = require('../models/MockTest');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');

const getMockTests = async (req, res) => {
  try {
    // Students see only published tests
    const query =
      req.user.role === 'student' ? { isPublished: true } : {};
    const tests = await MockTest.find(query).populate('createdBy', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMockTestById = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role === 'student') query.isPublished = true;

    const test = await MockTest.findOne(query)
      .populate('questionIds')
      .populate('createdBy', 'firstName lastName');

    if (!test) return res.status(404).json({ success: false, message: 'Mock test not found' });

    // Strip correct answers for students
    if (req.user.role === 'student') {
      const sanitized = {
        ...test.toObject(),
        questionIds: test.questionIds.map((q) => {
          const obj = q.toObject ? q.toObject() : q;
          delete obj.correctAnswer;
          delete obj.explanation;
          return obj;
        }),
      };
      return res.json({ success: true, data: sanitized });
    }

    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMockTest = async (req, res) => {
  try {
    const { title, description, questionIds, durationMinutes } = req.body;
    const test = await MockTest.create({
      title,
      description,
      questionIds,
      durationMinutes,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Mock test created', data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMockTest = async (req, res) => {
  try {
    const { title, description, questionIds, durationMinutes, isPublished } = req.body;
    const test = await MockTest.findByIdAndUpdate(
      req.params.id,
      { title, description, questionIds, durationMinutes, isPublished },
      { new: true }
    );
    if (!test) return res.status(404).json({ success: false, message: 'Mock test not found' });
    res.json({ success: true, message: 'Mock test updated', data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMockTest = async (req, res) => {
  try {
    await MockTest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Mock test deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start mock test — creates an inProgress attempt
// @route   POST /api/mock-tests/:id/start
// @access  Student
const startMockTest = async (req, res) => {
  try {
    const test = await MockTest.findOne({ _id: req.params.id, isPublished: true });
    if (!test) return res.status(404).json({ success: false, message: 'Mock test not found or not published' });

    // Check for existing in-progress attempt
    const existing = await TestAttempt.findOne({
      userId: req.user._id,
      testId: test._id,
      testType: 'mockTest',
      status: 'inProgress',
    });
    if (existing) return res.json({ success: true, data: existing, message: 'Resuming existing attempt' });

    // One attempt rule
    const completed = await TestAttempt.findOne({
      userId: req.user._id,
      testId: test._id,
      testType: 'mockTest',
      status: 'completed',
    });
    if (completed) {
      return res.status(400).json({ success: false, message: 'You have already attempted this test' });
    }

    const attempt = await TestAttempt.create({
      userId: req.user._id,
      testType: 'mockTest',
      testId: test._id,
      testTitle: test.title,
      totalQuestions: test.questionIds.length,
      status: 'inProgress',
    });

    // Return questions without answers
    const questions = await Question.find({ _id: { $in: test.questionIds }, isActive: true })
      .select('-correctAnswer -explanation')
      .populate('categoryId', 'name')
      .populate('topicId', 'name');

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        test: { _id: test._id, title: test.title, durationMinutes: test.durationMinutes },
        questions,
        startedAt: attempt.startedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit mock test
// @route   POST /api/mock-tests/:id/submit
// @access  Student
const submitMockTest = async (req, res) => {
  try {
    const { attemptId, answers, timeTakenSeconds } = req.body;

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user._id,
      status: 'inProgress',
    });

    if (!attempt) {
      return res.status(400).json({ success: false, message: 'Invalid or already submitted attempt' });
    }

    const test = await MockTest.findById(attempt.testId).populate({
      path: 'questionIds',
      populate: [{ path: 'topicId', select: 'name' }, { path: 'categoryId', select: 'name' }],
    });

    // Server-side evaluation
    const questionMap = {};
    test.questionIds.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    const processedAnswers = [];
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    test.questionIds.forEach((q) => {
      const submitted = (answers || []).find((a) => a.questionId === q._id.toString());
      const selectedAnswer = submitted ? submitted.selectedAnswer : null;
      const isCorrect = selectedAnswer === q.correctAnswer;

      if (!selectedAnswer) skipped++;
      else if (isCorrect) correct++;
      else wrong++;

      processedAnswers.push({
        questionId: q._id,
        topicId: q.topicId?._id,
        categoryId: q.categoryId?._id,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect: selectedAnswer ? isCorrect : false,
      });
    });

    // Topic performance breakdown
    const topicMap = {};
    processedAnswers.forEach((ans) => {
      const tid = ans.topicId?.toString() || 'unknown';
      const q = questionMap[ans.questionId.toString()];
      if (!topicMap[tid]) {
        topicMap[tid] = {
          topicId: ans.topicId,
          topicName: q?.topicId?.name || '',
          categoryId: ans.categoryId,
          categoryName: q?.categoryId?.name || '',
          attempted: 0,
          correct: 0,
        };
      }
      if (ans.selectedAnswer) topicMap[tid].attempted++;
      if (ans.isCorrect) topicMap[tid].correct++;
    });

    const topicPerformance = Object.values(topicMap).map((t) => ({
      ...t,
      accuracy: t.attempted > 0 ? Math.round((t.correct / t.attempted) * 100) : 0,
    }));

    const totalAttempted = correct + wrong;
    const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;

    attempt.answers = processedAnswers;
    attempt.score = correct;
    attempt.correctAnswers = correct;
    attempt.wrongAnswers = wrong;
    attempt.skippedAnswers = skipped;
    attempt.accuracy = accuracy;
    attempt.timeTakenSeconds = timeTakenSeconds || 0;
    attempt.topicPerformance = topicPerformance;
    attempt.status = 'completed';
    attempt.submittedAt = new Date();
    await attempt.save();

    res.json({ success: true, message: 'Test submitted successfully', data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMockTests,
  getMockTestById,
  createMockTest,
  updateMockTest,
  deleteMockTest,
  startMockTest,
  submitMockTest,
};
