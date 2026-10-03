const Topic = require('../models/Topic');
const Question = require('../models/Question');
const Concept = require('../models/Concept');

const getTopics = async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.query.categoryId) query.categoryId = req.query.categoryId;

    const topics = await Topic.find(query)
      .populate('categoryId', 'name')
      .sort({ name: 1 });

    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('categoryId', 'name');
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });

    const concepts = await Concept.find({ topicId: topic._id, isActive: true });
    const questionCount = await Question.countDocuments({ topicId: topic._id, isActive: true });

    res.json({ success: true, data: { topic, concepts, questionCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTopic = async (req, res) => {
  try {
    const { categoryId, name, description } = req.body;
    const topic = await Topic.create({ categoryId, name, description });
    res.status(201).json({ success: true, message: 'Topic created', data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTopic = async (req, res) => {
  try {
    const { categoryId, name, description, isActive } = req.body;
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { categoryId, name, description, isActive },
      { new: true }
    );
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, message: 'Topic updated', data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, message: 'Topic deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTopics, getTopicById, createTopic, updateTopic, deleteTopic };
