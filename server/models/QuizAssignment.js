const mongoose = require('mongoose');

const quizAssignmentSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherQuiz', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['assigned', 'started', 'completed', 'expired'],
      default: 'assigned',
    },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Unique constraint: one assignment per quiz per student
quizAssignmentSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('QuizAssignment', quizAssignmentSchema);
