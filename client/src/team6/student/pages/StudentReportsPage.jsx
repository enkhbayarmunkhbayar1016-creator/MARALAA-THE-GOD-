import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiBarChart2, FiClock, FiFileText, FiPercent } from "react-icons/fi";
import { fetchMyExamAttempt, fetchStudentExamCatalog } from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { formatDate, scorePercent, toNumber } from "../utils";

const PIE_COLORS = ["#10b981", "#f97316", "#ef4444"];

const StudentReportsPage = () => {
  const { user } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const exams = await fetchStudentExamCatalog(user.id);

        const attempts = await Promise.all(
          exams.map((exam) => fetchMyExamAttempt(exam.id).catch(() => null))
        );

        const merged = exams.map((exam, index) => {
          const attempt = attempts[index];
          const grade = toNumber(attempt?.gradePoint ?? exam.gradePoint, 0);
          const total = toNumber(attempt?.totalPoint ?? exam.totalPoint, 0);
          const percent = scorePercent(grade, total);
          const completed = grade > 0;

          return {
            ...exam,
            attempt,
            grade,
            total,
            percent: Math.round(percent),
            completed,
          };
        });

        if (!active) return;
        setRows(merged);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Тайлангийн мэдээлэл дуудахад алдаа гарлаа");
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
    const completed = rows.filter((row) => row.completed);
    const avg = completed.length
      ? Math.round(completed.reduce((acc, cur) => acc + cur.percent, 0) / completed.length)
      : 0;

    const durationMinutes = rows.reduce((acc, cur) => acc + toNumber(cur.duration, 0), 0);

    return {
      total: rows.length,
      completed: completed.length,
      avg,
      durationMinutes,
    };
  }, [rows]);

  const barData = useMemo(
    () =>
      rows.slice(0, 8).map((row) => ({
        name: row.courseName?.slice(0, 14) || row.name.slice(0, 14),
        value: row.percent,
        total: row.total,
      })),
    [rows]
  );

  const pieData = useMemo(() => {
    const completed = rows.filter((row) => row.completed).length;
    const upcoming = rows.filter((row) => !row.completed && new Date(row.openOn).getTime() > Date.now()).length;
    const open = rows.length - completed - upcoming;

    return [
      { name: "Дууссан", value: completed },
      { name: "Хүлээгдэж буй", value: upcoming },
      { name: "Идэвхтэй", value: Math.max(0, open) },
    ];
  }, [rows]);

  const lineData = useMemo(() => {
    return rows
      .filter((row) => row.completed)
      .sort((a, b) => new Date(a.closeOn || a.endOn || 0).getTime() - new Date(b.closeOn || b.endOn || 0).getTime())
      .map((row, index) => ({
        index: index + 1,
        score: row.percent,
      }));
  }, [rows]);

  if (loading) {
    return <div className="t5s-loading">Тайлан ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page">
      <div className="t5s-page-head">
        <div>
          <h2>Шалгалтын тайлан ба статистик</h2>
          <p>
            {user?.displayName} - {user?.username || user?.email}
          </p>
        </div>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <div className="t5s-stats-grid">
        <article className="t5s-stat purple">
          <h4>
            <FiFileText /> Нийт шалгалт
          </h4>
          <strong>{summary.total}</strong>
        </article>

        <article className="t5s-stat green">
          <h4>
            <FiBarChart2 /> Дууссан шалгалт
          </h4>
          <strong>{summary.completed}</strong>
        </article>

        <article className="t5s-stat blue">
          <h4>
            <FiPercent /> Дундаж оноо
          </h4>
          <strong>{summary.avg}%</strong>
        </article>

        <article className="t5s-stat orange">
          <h4>
            <FiClock /> Нийт хугацаа
          </h4>
          <strong>{summary.durationMinutes}:00</strong>
        </article>
      </div>

      <div className="t5s-two-col">
        <article className="t5s-card chart-card">
          <h3>Хичээл бүрийн оноо</h3>
          <div className="t5s-chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="t5s-card chart-card">
          <h3>Гүйцэтгэлийн хуваарилалт</h3>
          <div className="t5s-chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={86} label>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <article className="t5s-card chart-card">
        <h3>Хугацааны явцад гарсан ахиц</h3>
        <div className="t5s-chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="index" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="t5s-card">
        <h3>Дэлгэрэнгүй жагсаалт</h3>
        <div className="t5s-table-wrap">
          <table className="t5s-table">
            <thead>
              <tr>
                <th>Хичээл</th>
                <th>Шалгалт</th>
                <th>Оноо</th>
                <th>Хувь</th>
                <th>Статус</th>
                <th>Огноо</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.courseName || "-"}</td>
                  <td>{row.name}</td>
                  <td>{row.grade > 0 ? `${row.grade}/${row.total}` : "-"}</td>
                  <td>{row.grade > 0 ? `${row.percent}%` : "-"}</td>
                  <td>
                    <span className={`t5s-status ${row.completed ? "done" : "open"}`}>
                      {row.completed ? "Дууссан" : "Хүлээгдэж буй"}
                    </span>
                  </td>
                  <td>{formatDate(row.closeOn || row.endOn)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && <div className="t5s-empty">Тайлангийн мөр олдсонгүй.</div>}
        </div>
      </article>
    </section>
  );
};

export default StudentReportsPage;
