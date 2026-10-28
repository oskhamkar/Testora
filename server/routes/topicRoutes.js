const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate, topicValidators } = require('../middleware/validators');
const {
  getTopics, getTopicById, createTopic, updateTopic, deleteTopic,
} = require('../controllers/topicController');

router.get('/', protect, getTopics);
router.get('/:id', protect, getTopicById);
router.post('/', protect, authorize('admin'), topicValidators, validate, createTopic);
router.put('/:id', protect, authorize('admin'), topicValidators, validate, updateTopic);
router.delete('/:id', protect, authorize('admin'), deleteTopic);

module.exports = router;
