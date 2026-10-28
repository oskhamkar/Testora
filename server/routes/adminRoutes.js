const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate, teacherCreateValidators, teacherUpdateValidators } = require('../middleware/validators');
const {
  getDashboard,
  getStudents,
  toggleStudent,
  getTeachers,
  createTeacher,
  updateTeacher,
  toggleTeacher,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/students', getStudents);
router.put('/students/:id/toggle', toggleStudent);
router.get('/teachers', getTeachers);
router.post('/teachers', teacherCreateValidators, validate, createTeacher);
router.put('/teachers/:id', teacherUpdateValidators, validate, updateTeacher);
router.put('/teachers/:id/toggle', toggleTeacher);

module.exports = router;
