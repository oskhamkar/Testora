const User = require('../models/User');
const TestAttempt = require('../models/TestAttempt');
const Category = require('../models/Category');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const MockTest = require('../models/MockTest');

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboard = async (req, res) => {
  try {
    const [studentCount, teacherCount, questionCount, topicCount, mockTestCount, attemptCount] =
      await Promise.all([
        User.countDocuments({ role: 'student', isActive: true }),
        User.countDocuments({ role: 'teacher', isActive: true }),
        Question.countDocuments({ isActive: true }),
        Topic.countDocuments({ isActive: true }),
        MockTest.countDocuments(),
        TestAttempt.countDocuments({ status: 'completed' }),
      ]);

    const recentAttempts = await TestAttempt.find({ status: 'completed' })
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate('userId', 'firstName lastName email');

    res.json({
      success: true,
      data: {
        studentCount,
        teacherCount,
        questionCount,
        topicCount,
        mockTestCount,
        attemptCount,
        recentAttempts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Admin
const getStudents = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'student' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);
    res.json({ success: true, data: students, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle student active status
// @route   PUT /api/admin/students/:id/toggle
// @access  Admin
const toggleStudent = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!user) return res.status(404).json({ success: false, message: 'Student not found' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `Student ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all teachers
// @route   GET /api/admin/teachers
// @access  Admin
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).sort({ createdAt: -1 });
    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create teacher account
// @route   POST /api/admin/teachers
// @access  Admin
const createTeacher = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    const teacher = await User.create({
      firstName,
      lastName,
      email,
      mobile,
      passwordHash: password,
      role: 'teacher',
    });

    res.status(201).json({ success: true, message: 'Teacher created successfully', data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update teacher
// @route   PUT /api/admin/teachers/:id
// @access  Admin
const updateTeacher = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile } = req.body;
    const teacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'teacher' },
      { firstName, lastName, email, mobile },
      { new: true }
    );
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, message: 'Teacher updated', data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle teacher active status
// @route   PUT /api/admin/teachers/:id/toggle
// @access  Admin
const toggleTeacher = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'teacher' });
    if (!user) return res.status(404).json({ success: false, message: 'Teacher not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `Teacher ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard,
  getStudents,
  toggleStudent,
  getTeachers,
  createTeacher,
  updateTeacher,
  toggleTeacher,
};
