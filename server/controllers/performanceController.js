const TestAttempt = require('../models/TestAttempt');
const { aggregateTopicPerformance } = require('../services/performanceService');
const { TOPIC_STATUS } = require('../config/constants');

// @desc    Get performance overview
// @route   GET /api/performance/overview
// @access  Student
const getOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const attempts = await TestAttempt.find({ userId, status: 'completed' });

    const testsAttempted = attempts.length;
    const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const totalCorrect = attempts.reduce((sum, a) => sum + a.correctAnswers, 0);
    const totalAttemptedQs = attempts.reduce((sum, a) => sum + a.correctAnswers + a.wrongAnswers, 0);
    const avgAccuracy = totalAttemptedQs > 0 ? Math.round((totalCorrect / totalAttemptedQs) * 100) : 0;

    res.json({
      success: true,
      data: {
        testsAttempted,
        questionsAttempted: totalAttemptedQs,
        correctAnswers: totalCorrect,
        averageAccuracy: avgAccuracy,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get topic-wise performance
// @route   GET /api/performance/topics
// @access  Student
const getTopicPerformance = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ userId: req.user._id, status: 'completed' });
    const topicPerformance = aggregateTopicPerformance(attempts);
    res.json({ success: true, data: topicPerformance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get test history
// @route   GET /api/performance/history
// @access  Student
const getHistory = async (req, res) => {
  try {
    const { testType, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id, status: 'completed' };
    if (testType) query.testType = testType;

    const history = await TestAttempt.find(query)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-answers -topicPerformance');

    const total = await TestAttempt.countDocuments(query);
    res.json({ success: true, data: history, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get weak topics
// @route   GET /api/performance/weak-topics
// @access  Student
const getWeakTopics = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ userId: req.user._id, status: 'completed' });
    const topicPerformance = aggregateTopicPerformance(attempts);
    const weakTopics = topicPerformance.filter(
      (t) => t.status === TOPIC_STATUS.WEAK || t.status === TOPIC_STATUS.NEEDS_PRACTICE
    );
    res.json({ success: true, data: weakTopics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific attempt result
// @route   GET /api/performance/attempts/:id
// @access  Student
const getAttemptResult = async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate({
      path: 'answers.questionId',
      select: 'question options explanation',
      populate: [
        { path: 'topicId', select: 'name' },
        { path: 'categoryId', select: 'name' },
      ],
    });

    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    res.json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student performance for teacher/admin
// @route   GET /api/performance/student/:studentId
// @access  Teacher, Admin
const getStudentPerformance = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({
      userId: req.params.studentId,
      status: 'completed',
    }).sort({ submittedAt: -1 });

    const topicPerformance = aggregateTopicPerformance(attempts);
    const totalQuestions = attempts.reduce((s, a) => s + a.correctAnswers + a.wrongAnswers, 0);
    const totalCorrect = attempts.reduce((s, a) => s + a.correctAnswers, 0);

    res.json({
      success: true,
      data: {
        attempts: attempts.map((a) => ({
          _id: a._id,
          testType: a.testType,
          testTitle: a.testTitle,
          score: a.score,
          totalQuestions: a.totalQuestions,
          accuracy: a.accuracy,
          submittedAt: a.submittedAt,
        })),
        topicPerformance,
        overview: {
          testsAttempted: attempts.length,
          questionsAttempted: totalQuestions,
          correctAnswers: totalCorrect,
          averageAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOverview,
  getTopicPerformance,
  getHistory,
  getWeakTopics,
  getAttemptResult,
  getStudentPerformance,
};
