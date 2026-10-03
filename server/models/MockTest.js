const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    durationMinutes: { type: Number, required: true, default: 30 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MockTest', mockTestSchema);
