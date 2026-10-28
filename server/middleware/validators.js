const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidators = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('mobile')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile must be a 10-digit number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('college').trim().notEmpty().withMessage('College is required'),
];

const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const teacherCreateValidators = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('mobile')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile must be a 10-digit number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('specialization').optional({ checkFalsy: true }).trim(),
];

const teacherUpdateValidators = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('mobile')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile must be a 10-digit number'),
  body('specialization').optional({ checkFalsy: true }).trim(),
];

const categoryValidators = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];

const topicValidators = [
  body('categoryId').notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid category'),
  body('name').trim().notEmpty().withMessage('Topic name is required'),
];

const questionValidators = [
  body('categoryId').notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid category'),
  body('topicId').notEmpty().withMessage('Topic is required').isMongoId().withMessage('Invalid topic'),
  body('question').trim().notEmpty().withMessage('Question text is required'),
  body('options').isArray({ min: 4, max: 4 }).withMessage('Exactly 4 options are required'),
  body('options.*.label').notEmpty().withMessage('Each option must have a label'),
  body('options.*.text').trim().notEmpty().withMessage('Each option must have text'),
  body('correctAnswer').isIn(['A', 'B', 'C', 'D']).withMessage('Correct answer must be A, B, C, or D'),
];

const mockTestCreateValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('questionIds').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be a positive number of minutes'),
];

// Mock test updates are often partial (e.g. just toggling isPublished), so only
// validate fields that were actually sent.
const mockTestUpdateValidators = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('questionIds').optional().isArray({ min: 1 }).withMessage('At least one question is required'),
  body('durationMinutes').optional().isInt({ min: 1 }).withMessage('Duration must be a positive number of minutes'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be true or false'),
];

const quizValidators = [
  body('title').trim().notEmpty().withMessage('Quiz title is required'),
  body('categoryId').notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid category'),
  body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be a positive number of minutes'),
  body('marksPerQuestion')
    .optional()
    .isFloat({ min: 0.25 })
    .withMessage('Marks per question must be a positive number'),
  body('negativeMarksPerQuestion')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Negative marks must be zero or a positive number'),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.topicId')
    .notEmpty()
    .withMessage('Topic is required for every question')
    .isMongoId()
    .withMessage('Invalid topic in one of the questions'),
  body('questions.*.question').trim().notEmpty().withMessage('Question text is required for every question'),
  body('questions.*.options')
    .isArray({ min: 4, max: 4 })
    .withMessage('Exactly 4 options are required for every question'),
  body('questions.*.correctAnswer')
    .isIn(['A', 'B', 'C', 'D'])
    .withMessage('Correct answer must be A, B, C, or D for every question'),
];

module.exports = {
  validate,
  registerValidators,
  loginValidators,
  teacherCreateValidators,
  teacherUpdateValidators,
  categoryValidators,
  topicValidators,
  questionValidators,
  mockTestCreateValidators,
  mockTestUpdateValidators,
  quizValidators,
};
