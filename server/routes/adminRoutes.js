const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
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
router.post('/teachers', createTeacher);
router.put('/teachers/:id', updateTeacher);
router.put('/teachers/:id/toggle', toggleTeacher);

module.exports = router;
