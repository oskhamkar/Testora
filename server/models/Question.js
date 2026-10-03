const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    question: { type: String, required: true, trim: true },
    options: [
      {
        label: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    correctAnswer: { type: String, required: true }, // label: "A", "B", "C", "D"
    explanation: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
