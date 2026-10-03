const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getConcepts, getConceptById, createConcept, updateConcept, deleteConcept } = require('../controllers/conceptController');

router.get('/', protect, getConcepts);
router.get('/:id', protect, getConceptById);
router.post('/', protect, authorize('admin'), createConcept);
router.put('/:id', protect, authorize('admin'), updateConcept);
router.delete('/:id', protect, authorize('admin'), deleteConcept);

module.exports = router;
