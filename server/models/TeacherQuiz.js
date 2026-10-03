const mongoose = require('mongoose');

const teacherQuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    durationMinutes: { type: Number, required: true, default: 20 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published', 'expired'], default: 'draft' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeacherQuiz', teacherQuizSchema);
