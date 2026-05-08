import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './StudentExamResult.css';

export default function StudentExamResult() {
  const { examId } = useParams();
  const { attempts, currentUser, studentExams } = useApp();
  const attempt = attempts.find((item) => item.examId === examId && item.studentId === currentUser.id);
  const exam = studentExams.find((item) => item.id === examId);
  if (!attempt || !exam) return <div className="empty-box">Үр дүн олдсонгүй.</div>;

  return (
    <section className="card result-card">
      <h2 className="card-title">{exam.title} — Үр дүн</h2>
      <div className="result-score-circle">{attempt.percent}%</div>
      <div className="result-summary-grid">
        <div><strong>{attempt.score}</strong><span>Зөв</span></div>
        <div><strong>{attempt.total - attempt.score}</strong><span>Буруу</span></div>
        <div><strong>{attempt.total}</strong><span>Нийт</span></div>
      </div>
    </section>
  );
}
