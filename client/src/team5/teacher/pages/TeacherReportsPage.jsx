import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSearchParams } from "react-router-dom";
import { fetchCourseExams, fetchCourseGradebookExamRows, fetchTeachingCourses } from "../api";
import { useTeacherAuth } from "../TeacherAuthContext";
import { average, scorePercent } from "../utils";

const PASS_THRESHOLD = 60;

const barColors = ["#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9"];

const buildHistogram = (scores) => {
  const bins = [
    { range: "0-20", min: 0, max: 20 },
    { range: "20-40", min: 20, max: 40 },
    { range: "40-60", min: 40, max: 60 },
    { range: "60-80", min: 60, max: 80 },
    { range: "80-100", min: 80, max: 101 },
  ];

  return bins.map((bin) => ({
    range: bin.range,
    count: scores.filter((score) => score >= bin.min && score < bin.max).length,
  }));
};

const TeacherReportsPage = () => {
  const { user } = useTeacherAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [scores, setScores] = useState([]);
  const [totalPoint, setTotalPoint] = useState(0);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.id === selectedExamId) || null,
    [exams, selectedExamId]
  );

  const loadScores = useCallback(async (exam) => {
    if (!exam?.courseId || !exam?.id) {
      setScores([]);
      return;
    }

    const gradeRows = await fetchCourseGradebookExamRows(exam.courseId);
    const filtered = gradeRows.filter((row) => row.examId === exam.id);
    setScores(filtered.map((row) => row.gradePoint));
    setTotalPoint(exam.totalPoint || 0);
  }, []);

  const loadMeta = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const courses = await fetchTeachingCourses(user.id);
      const examLists = await Promise.all(courses.map((course) => fetchCourseExams(course.id)));
      const allExams = examLists.flat();
      setExams(allExams);
    } catch (err) {
      setError(err?.message || "Тайлангийн өгөгдөл ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (!exams.length) return;

    const fromQuery = searchParams.get("examId");
    const available = fromQuery && exams.some((exam) => exam.id === fromQuery);
    const target = available ? fromQuery : exams[0].id;

    setSelectedExamId(target);
    if (!available) {
      setSearchParams({ examId: target }, { replace: true });
    }
  }, [exams, searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedExam) return;

    loadScores(selectedExam).catch((err) => {
      setError(err?.message || "Тайлан тооцоолох үед алдаа гарлаа.");
    });
  }, [selectedExam, loadScores]);

  const percentScores = useMemo(
    () => scores.map((score) => scorePercent(score, totalPoint)),
    [scores, totalPoint]
  );

  const stats = useMemo(() => {
    const avg = average(percentScores);
    const best = percentScores.length ? Math.max(...percentScores) : 0;
    const worst = percentScores.length ? Math.min(...percentScores) : 0;
    const pass = percentScores.filter((score) => score >= PASS_THRESHOLD).length;
    const fail = percentScores.length - pass;

    return {
      avg,
      best,
      worst,
      studentCount: percentScores.length,
      pass,
      fail,
      passRate: percentScores.length ? (pass / percentScores.length) * 100 : 0,
    };
  }, [percentScores]);

  const histogram = useMemo(() => buildHistogram(percentScores), [percentScores]);

  const pieData = useMemo(
    () => [
      { name: "Тэнцсэн", value: stats.pass, color: "#16a34a" },
      { name: "Унасан", value: stats.fail, color: "#dc2626" },
    ],
    [stats.fail, stats.pass]
  );

  if (loading) {
    return <div className="team5-page-loading">Тайлан ачаалж байна...</div>;
  }

  return (
    <section className="team5-page">
      <header className="team5-page-header">
        <div>
          <h2>Тайлан ба статистик</h2>
          <p>{selectedExam?.name || "Шалгалт сонгоно уу"}</p>
        </div>

        <select
          className="team5-select"
          value={selectedExamId}
          onChange={(event) => {
            const value = event.target.value;
            setSelectedExamId(value);
            setSearchParams({ examId: value }, { replace: true });
          }}
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name}
            </option>
          ))}
        </select>
      </header>

      {error ? <p className="team5-error-box">{error}</p> : null}

      <div className="team5-stats-grid">
        <article className="team5-stat-card blue">
          <h3>Дундаж оноо</h3>
          <strong>{stats.avg.toFixed(1)}%</strong>
        </article>
        <article className="team5-stat-card green">
          <h3>Хамгийн өндөр</h3>
          <strong>{stats.best.toFixed(1)}%</strong>
        </article>
        <article className="team5-stat-card red">
          <h3>Хамгийн бага</h3>
          <strong>{stats.worst.toFixed(1)}%</strong>
        </article>
        <article className="team5-stat-card purple">
          <h3>Оюутны тоо</h3>
          <strong>{stats.studentCount}</strong>
        </article>
      </div>

      <div className="team5-chart-grid">
        <article className="team5-chart-card">
          <h3>Оноо тархалт</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Оюутны тоо">
                {histogram.map((item, index) => (
                  <Cell key={item.range} fill={barColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="team5-chart-card">
          <h3>Тэнцсэн / Унасан</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </div>

      <article className="team5-form-card">
        <h3>Дэлгэрэнгүй статистик</h3>
        <div className="team5-mini-stats">
          <div>
            <span>Тэнцэх хувь</span>
            <strong className="green">{stats.passRate.toFixed(0)}%</strong>
          </div>
          <div>
            <span>Дундаж хувь</span>
            <strong className="blue">{stats.avg.toFixed(0)}%</strong>
          </div>
          <div>
            <span>Хамгийн өндөр хувь</span>
            <strong className="green">{stats.best.toFixed(0)}%</strong>
          </div>
          <div>
            <span>Хамгийн бага хувь</span>
            <strong className="red">{stats.worst.toFixed(0)}%</strong>
          </div>
        </div>
      </article>
    </section>
  );
};

export default TeacherReportsPage;
