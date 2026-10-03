import { useParams } from 'react-router-dom';
import { TestExam } from './MockTestExam';

const QuizExam = () => {
  const { id } = useParams();
  return <TestExam testId={id} testType="teacherQuiz" />;
};

export default QuizExam;
