const TeacherQuiz = require('../models/TeacherQuiz');
const QuizAssignment = require('../models/QuizAssignment');
const TestAttempt = require('../models/TestAttempt');
const Question = require('../models/Question');
const User = require('../models/User');

// Teacher: Get my quizzes
const getMyQuizzes = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const quizzes = await TeacherQuiz.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Teacher: Create quiz
const createQuiz = async (req, res) => {
  try {
    const { title, description, questionIds, durationMinutes, startDate, endDate } = req.body;
    const quiz = await TeacherQuiz.create({
      title,
      description,
      questionIds,
      durationMinutes,
      startDate,
      endDate,
      createdBy: req.user._id,
      status: 'draft',
    });
    res.status(201).json({ success: true, message: 'Quiz created', data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Teacher: Update quiz
const updateQuiz = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const { title, description, questionIds, durationMinutes, startDate, endDate, status } = req.body;
    const quiz = await TeacherQuiz.findOneAndUpdate(
      query,
      { title, description, questionIds, durationMinutes, startDate, endDate, status },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, message: 'Quiz updated', data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Teacher: Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    await TeacherQuiz.findOneAndDelete(query);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Teacher: Assign quiz to students
const assignQuiz = async (req, res) => {
  try {
    const quiz = await TeacherQuiz.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const { studentIds, assignAll } = req.body;
    let targetStudentIds = studentIds;

    if (assignAll) {
      const students = await User.find({ role: 'student', isActive: true }, '_id');
      targetStudentIds = students.map((s) => s._id.toString());
    }

    // Update quiz status to published
    quiz.status = 'published';
    await quiz.save();

    const assignments = [];
    for (const sid of targetStudentIds) {
      try {
        const assignment = await QuizAssignment.findOneAndUpdate(
          { quizId: quiz._id, studentId: sid },
          { quizId: quiz._id, studentId: sid, assignedBy: req.user._id, status: 'assigned', assignedAt: new Date() },
          { upsert: true, new: true }
        );
        assignments.push(assignment);
      } catch (e) {
        // Skip duplicate
      }
    }

    res.json({ success: true, message: `Quiz assigned to ${assignments.length} students`, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Teacher: View quiz results
const getQuizResults = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const quiz = await TeacherQuiz.findOne(query);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const assignments = await QuizAssignment.find({ quizId: quiz._id })
      .populate('studentId', 'firstName lastName email');

    const results = [];
    for (const assignment of assignments) {
      const attempt = await TestAttempt.findOne({
        userId: assignment.studentId._id,
        testId: quiz._id,
        testType: 'teacherQuiz',
        status: 'completed',
      });

      results.push({
        student: assignment.studentId,
        assignmentStatus: assignment.status,
        attempt: attempt
          ? {
              score: attempt.score,
              totalQuestions: attempt.totalQuestions,
              accuracy: attempt.accuracy,
              correct: attempt.correctAnswers,
              wrong: attempt.wrongAnswers,
              skipped: attempt.skippedAnswers,
              submittedAt: attempt.submittedAt,
            }
          : null,
      });
    }

    res.json({ success: true, data: { quiz, results } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student: Get my assigned quizzes
const getStudentQuizzes = async (req, res) => {
  try {
    const assignments = await QuizAssignment.find({ studentId: req.user._id })
      .populate({ path: 'quizId', populate: { path: 'createdBy', select: 'firstName lastName' } });

    const now = new Date();
    const quizzes = assignments.map((a) => {
      const quiz = a.quizId;
      if (!quiz) return null;

      let availabilityStatus = 'upcoming';
      if (now >= new Date(quiz.startDate) && now <= new Date(quiz.endDate)) {
        availabilityStatus = 'available';
      } else if (now > new Date(quiz.endDate)) {
        availabilityStatus = 'expired';
      }

      if (a.status === 'completed') availabilityStatus = 'completed';

      return {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.questionIds.length,
        durationMinutes: quiz.durationMinutes,
        startDate: quiz.startDate,
        endDate: quiz.endDate,
        createdBy: quiz.createdBy,
        assignmentStatus: a.status,
        availabilityStatus,
      };
    }).filter(Boolean);

    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student: Start quiz
const startQuiz = async (req, res) => {
  try {
    const assignment = await QuizAssignment.findOne({
      quizId: req.params.id,
      studentId: req.user._id,
    });
    if (!assignment) return res.status(403).json({ success: false, message: 'Quiz not assigned to you' });
    if (assignment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'You have already completed this quiz' });
    }

    const quiz = await TeacherQuiz.findById(req.params.id);
    if (!quiz || quiz.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Quiz not available' });
    }

    const now = new Date();
    if (now < new Date(quiz.startDate)) {
      return res.status(400).json({ success: false, message: 'Quiz has not started yet' });
    }
    if (now > new Date(quiz.endDate)) {
      return res.status(400).json({ success: false, message: 'Quiz has expired' });
    }

    // Check for existing in-progress attempt
    let attempt = await TestAttempt.findOne({
      userId: req.user._id,
      testId: quiz._id,
      testType: 'teacherQuiz',
      status: 'inProgress',
    });

    if (!attempt) {
      attempt = await TestAttempt.create({
        userId: req.user._id,
        testType: 'teacherQuiz',
        testId: quiz._id,
        testTitle: quiz.title,
        totalQuestions: quiz.questionIds.length,
        status: 'inProgress',
      });

      assignment.status = 'started';
      await assignment.save();
    }

    const questions = await Question.find({ _id: { $in: quiz.questionIds }, isActive: true })
      .select('-correctAnswer -explanation')
      .populate('categoryId', 'name')
      .populate('topicId', 'name');

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        quiz: { _id: quiz._id, title: quiz.title, durationMinutes: quiz.durationMinutes, endDate: quiz.endDate },
        questions,
        startedAt: attempt.startedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student: Submit quiz
const submitQuiz = async (req, res) => {
  try {
    const { attemptId, answers, timeTakenSeconds } = req.body;

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: req.user._id,
      status: 'inProgress',
    });
    if (!attempt) return res.status(400).json({ success: false, message: 'Invalid or already submitted attempt' });

    const quiz = await TeacherQuiz.findById(attempt.testId).populate({
      path: 'questionIds',
      populate: [{ path: 'topicId', select: 'name' }, { path: 'categoryId', select: 'name' }],
    });

    const questionMap = {};
    quiz.questionIds.forEach((q) => (questionMap[q._id.toString()] = q));

    const processedAnswers = [];
    let correct = 0, wrong = 0, skipped = 0;

    quiz.questionIds.forEach((q) => {
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

    // Update assignment status
    await QuizAssignment.findOneAndUpdate(
      { quizId: quiz._id, studentId: req.user._id },
      { status: 'completed', completedAt: new Date() }
    );

    res.json({ success: true, message: 'Quiz submitted successfully', data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  assignQuiz,
  getQuizResults,
  getStudentQuizzes,
  startQuiz,
  submitQuiz,
};
