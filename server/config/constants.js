// Performance thresholds for weak topic detection
const PERFORMANCE_THRESHOLDS = {
  MIN_ATTEMPTS_FOR_CLASSIFICATION: 5,
  WEAK_TOPIC_ACCURACY: 60,
  NEEDS_PRACTICE_ACCURACY: 80,
};

const TOPIC_STATUS = {
  WEAK: 'weak',
  NEEDS_PRACTICE: 'needs_practice',
  STRONG: 'strong',
  INSUFFICIENT_DATA: 'insufficient_data',
};

const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

const TEST_TYPES = {
  MOCK_TEST: 'mockTest',
  TEACHER_QUIZ: 'teacherQuiz',
};

const ATTEMPT_STATUS = {
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
};

const QUIZ_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  EXPIRED: 'expired',
};

const ASSIGNMENT_STATUS = {
  ASSIGNED: 'assigned',
  STARTED: 'started',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
};

module.exports = {
  PERFORMANCE_THRESHOLDS,
  TOPIC_STATUS,
  ROLES,
  TEST_TYPES,
  ATTEMPT_STATUS,
  QUIZ_STATUS,
  ASSIGNMENT_STATUS,
};
