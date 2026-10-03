const mongoose = require('mongoose');

const conceptSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    formulas: [{ type: String }],
    examples: [{ type: String }],
    importantPoints: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Concept', conceptSchema);
