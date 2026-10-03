const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    selectedAnswer: { type: String, default: null }, // null = skipped
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const topicPerformanceSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    topicName: String,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    categoryName: String,
    attempted: Number,
    correct: Number,
    accuracy: Number,
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testType: { type: String, enum: ['mockTest', 'teacherQuiz'], required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, required: true },
    testTitle: { type: String },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    skippedAnswers: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    timeTakenSeconds: { type: Number, default: 0 },
    topicPerformance: [topicPerformanceSchema],
    status: { type: String, enum: ['inProgress', 'completed', 'expired'], default: 'inProgress' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
