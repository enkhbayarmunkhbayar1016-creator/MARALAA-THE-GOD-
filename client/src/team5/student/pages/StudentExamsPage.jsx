import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiFileText, FiPlayCircle, FiTrendingUp } from "react-icons/fi";
import { fetchStudentExamCatalog } from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { formatDate, getExamStatus } from "../utils";

const statusLabel = {
  open: "Эхлэх",
  upcoming: "Хүлээгдэж байна",
  closed: "Хаагдсан",
};

const StudentExamsPage = () => {
  const { user } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exams, setExams] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const rows = await fetchStudentExamCatalog(user.id);
        if (active) setExams(rows);
      } catch (err) {
        if (active) setError(err?.message || "Шалгалтын мэдээлэл уншихад алдаа гарлаа");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const summary = useMemo(() => {
    const completed = exams.filter((item) => Number(item.gradePoint) > 0).length;
    const open = exams.filter((item) => getExamStatus(item) === "open").length;
    const totalPoint = exams.reduce((acc, cur) => acc + Number(cur.totalPoint || 0), 0);

    return {
      total: exams.length,
      completed,
      open,
      totalPoint,
    };
  }, [exams]);

  if (loading) {
    return <div className="t5s-loading">Шалгалтын жагсаалт ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page">
      <div className="t5s-page-head">
        <div>
          <h2>Шалгалт</h2>
          <p>Таны бэлэн болсон шалгалтуудын жагсаалт</p>
        </div>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <div className="t5s-stats-grid">
        <article className="t5s-stat purple">
          <h4>
            <FiFileText /> Нийт
          </h4>
          <strong>{summary.total}</strong>
          <p>Шалгалт</p>
        </article>

        <article className="t5s-stat green">
          <h4>
            <FiTrendingUp /> Дууссан
          </h4>
          <strong>{summary.completed}</strong>
          <p>Оролдлого дууссан</p>
        </article>

        <article className="t5s-stat blue">
          <h4>
            <FiPlayCircle /> Идэвхтэй
          </h4>
          <strong>{summary.open}</strong>
          <p>Эхлэх боломжтой</p>
        </article>

        <article className="t5s-stat orange">
          <h4>
            <FiClock /> Нийт оноо
          </h4>
          <strong>{summary.totalPoint}</strong>
          <p>Бүх шалгалт</p>
        </article>
      </div>

      <div className="t5s-list-stack">
        {exams.map((exam) => {
          const status = getExamStatus(exam);
          const hasResult = Number(exam.gradePoint) > 0;

          return (
            <article key={exam.id} className="t5s-exam-row">
              <div>
                <div className="t5s-inline-tags">
                  <strong>{exam.name}</strong>
                  <span className="t5s-pill">{exam.courseName || "Курс"}</span>
                </div>

                <p>{exam.description || "Шалгалтын тайлбар байхгүй."}</p>

                <div className="t5s-list-meta">
                  <span>
                    <FiFileText /> {exam.totalPoint} оноо
                  </span>
                  <span>
                    <FiClock /> {exam.duration} минут
                  </span>
                  <span>
                    <FiClock /> Дуусах: {formatDate(exam.closeOn || exam.endOn)}
                  </span>
                </div>
              </div>

              <div className="t5s-row-actions">
                <span className={`t5s-status ${status}`}>{statusLabel[status]}</span>

                <Link className="t5s-btn t5s-btn-outline" to={`/team6/student/exams/${exam.id}`}>
                  Дэлгэрэнгүй
                </Link>

                {hasResult ? (
                  <Link className="t5s-btn t5s-btn-primary" to={`/team6/student/exams/${exam.id}/result`}>
                    Үр дүн
                  </Link>
                ) : (
                  <Link className="t5s-btn t5s-btn-primary" to={`/team6/student/exams/${exam.id}`}>
                    Эхлэх
                  </Link>
                )}
              </div>
            </article>
          );
        })}

        {exams.length === 0 && (
          <div className="t5s-empty">
            Шалгалт олдсонгүй. Та курсдээ бүртгэлтэй эсэхээ шалгана уу, эсвэл багш шалгалт дээр таныг нэмнэ үү.
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentExamsPage;
