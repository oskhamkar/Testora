const Concept = require('../models/Concept');

const getConcepts = async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.query.topicId) query.topicId = req.query.topicId;

    const concepts = await Concept.find(query).populate('topicId', 'name').sort({ createdAt: 1 });
    res.json({ success: true, data: concepts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getConceptById = async (req, res) => {
  try {
    const concept = await Concept.findById(req.params.id).populate('topicId', 'name categoryId');
    if (!concept) return res.status(404).json({ success: false, message: 'Concept not found' });
    res.json({ success: true, data: concept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createConcept = async (req, res) => {
  try {
    const { topicId, title, content, formulas, examples, importantPoints } = req.body;
    const concept = await Concept.create({
      topicId,
      title,
      content,
      formulas,
      examples,
      importantPoints,
    });
    res.status(201).json({ success: true, message: 'Concept created', data: concept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateConcept = async (req, res) => {
  try {
    const { topicId, title, content, formulas, examples, importantPoints, isActive } = req.body;
    const concept = await Concept.findByIdAndUpdate(
      req.params.id,
      { topicId, title, content, formulas, examples, importantPoints, isActive },
      { new: true }
    );
    if (!concept) return res.status(404).json({ success: false, message: 'Concept not found' });
    res.json({ success: true, message: 'Concept updated', data: concept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteConcept = async (req, res) => {
  try {
    const concept = await Concept.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!concept) return res.status(404).json({ success: false, message: 'Concept not found' });
    res.json({ success: true, message: 'Concept deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getConcepts, getConceptById, createConcept, updateConcept, deleteConcept };
