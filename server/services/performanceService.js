const { PERFORMANCE_THRESHOLDS, TOPIC_STATUS } = require('../config/constants');

/**
 * Classify a topic based on attempts and accuracy
 */
const classifyTopic = (attempts, accuracy) => {
  if (attempts < PERFORMANCE_THRESHOLDS.MIN_ATTEMPTS_FOR_CLASSIFICATION) {
    return TOPIC_STATUS.INSUFFICIENT_DATA;
  }
  if (accuracy < PERFORMANCE_THRESHOLDS.WEAK_TOPIC_ACCURACY) {
    return TOPIC_STATUS.WEAK;
  }
  if (accuracy <= PERFORMANCE_THRESHOLDS.NEEDS_PRACTICE_ACCURACY) {
    return TOPIC_STATUS.NEEDS_PRACTICE;
  }
  return TOPIC_STATUS.STRONG;
};

/**
 * Calculate topic performance from an array of answers
 */
const calculateTopicPerformance = (answers) => {
  const topicMap = {};

  answers.forEach((ans) => {
    const tid = ans.topicId ? ans.topicId.toString() : 'unknown';
    if (!topicMap[tid]) {
      topicMap[tid] = {
        topicId: ans.topicId,
        topicName: ans.topicName || '',
        categoryId: ans.categoryId,
        categoryName: ans.categoryName || '',
        attempted: 0,
        correct: 0,
      };
    }
    topicMap[tid].attempted++;
    if (ans.isCorrect) topicMap[tid].correct++;
  });

  return Object.values(topicMap).map((t) => ({
    ...t,
    accuracy: t.attempted > 0 ? Math.round((t.correct / t.attempted) * 100) : 0,
  }));
};

/**
 * Aggregate topic performance across multiple attempts
 */
const aggregateTopicPerformance = (attempts) => {
  const topicMap = {};

  attempts.forEach((attempt) => {
    (attempt.topicPerformance || []).forEach((tp) => {
      const tid = tp.topicId ? tp.topicId.toString() : 'unknown';
      if (!topicMap[tid]) {
        topicMap[tid] = {
          topicId: tp.topicId,
          topicName: tp.topicName,
          categoryId: tp.categoryId,
          categoryName: tp.categoryName,
          totalAttempted: 0,
          totalCorrect: 0,
        };
      }
      topicMap[tid].totalAttempted += tp.attempted || 0;
      topicMap[tid].totalCorrect += tp.correct || 0;
    });
  });

  return Object.values(topicMap).map((t) => {
    const accuracy =
      t.totalAttempted > 0 ? Math.round((t.totalCorrect / t.totalAttempted) * 100) : 0;
    return {
      topicId: t.topicId,
      topicName: t.topicName,
      categoryId: t.categoryId,
      categoryName: t.categoryName,
      attempted: t.totalAttempted,
      correct: t.totalCorrect,
      accuracy,
      status: classifyTopic(t.totalAttempted, accuracy),
    };
  });
};

module.exports = { classifyTopic, calculateTopicPerformance, aggregateTopicPerformance };
