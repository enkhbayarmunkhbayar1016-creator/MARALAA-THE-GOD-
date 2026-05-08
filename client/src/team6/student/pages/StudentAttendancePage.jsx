import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import {
  fetchAttendanceTypes,
  fetchCourseAttendances,
  fetchEnrolledCourses,
} from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { formatDate } from "../utils";

const detectAttendanceStatus = (typeName = "") => {
  const text = String(typeName).toLowerCase();

  if (text.includes("ирсэн") || text.includes("present")) return "present";
  if (text.includes("тасал") || text.includes("absent")) return "absent";
  if (text.includes("чөлөө") || text.includes("excused")) return "excused";
  if (text.includes("хоц") || text.includes("late")) return "late";

  return "present";
};

const StudentAttendancePage = () => {
  const { user } = useStudentAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseRows, setCourseRows] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [courses, attendanceTypes] = await Promise.all([
          fetchEnrolledCourses(user.id),
          fetchAttendanceTypes().catch(() => []),
        ]);

        const typeMap = attendanceTypes.reduce((acc, cur) => {
          acc[String(cur.id)] = cur.name;
          return acc;
        }, {});

        const attendancesByCourse = await Promise.all(
          courses.map((course) => fetchCourseAttendances(course.courseId).catch(() => []))
        );

        const aggregated = courses.map((course, index) => {
          const mine = (attendancesByCourse[index] || []).filter(
            (row) => String(row.userId) === String(user.id)
          );

          let present = 0;
          let absent = 0;
          let late = 0;
          let excused = 0;

          mine.forEach((row) => {
            const typeName = typeMap[String(row.typeId)] || "";
            const status = detectAttendanceStatus(typeName);

            if (status === "present") present += 1;
            if (status === "absent") absent += 1;
            if (status === "late") late += 1;
            if (status === "excused") excused += 1;
          });

          const total = mine.length;
          const percentage = total > 0 ? Math.round(((present + excused) / total) * 100) : 0;

          return {
            id: course.id,
            courseName: course.name,
            present,
            absent,
            late,
            excused,
            total,
            percentage,
            rows: mine,
          };
        });

        const recentRows = aggregated
          .flatMap((course) =>
            course.rows.map((row) => {
              const typeName = typeMap[String(row.typeId)] || "Төрөл";
              return {
                id: `${course.id}-${row.id}`,
                courseName: course.courseName,
                status: detectAttendanceStatus(typeName),
                typeName,
                createdOn: row.createdOn,
              };
            })
          )
          .sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())
          .slice(0, 8);

        if (!active) return;
        setCourseRows(aggregated);
        setRecent(recentRows);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Ирцийн мэдээлэл ачаалж чадсангүй");
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
    const totals = courseRows.reduce(
      (acc, cur) => ({
        present: acc.present + cur.present,
        absent: acc.absent + cur.absent,
        late: acc.late + cur.late,
        total: acc.total + cur.total,
      }),
      { present: 0, absent: 0, late: 0, total: 0 }
    );

    const attendanceRate = totals.total > 0 ? Math.round((totals.present / totals.total) * 100) : 0;

    return {
      ...totals,
      attendanceRate,
      excused: courseRows.reduce((acc, cur) => acc + cur.excused, 0),
    };
  }, [courseRows]);

  if (loading) {
    return <div className="t5s-loading">Ирцийн мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page">
      <div className="t5s-page-head">
        <div>
          <h2>Ирц</h2>
          <p>Хичээлийн ирцийн мэдээлэл</p>
        </div>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <div className="t5s-stats-grid">
        <article className="t5s-stat purple">
          <h4>Нийт ирц</h4>
          <strong>{summary.attendanceRate}%</strong>
        </article>
        <article className="t5s-stat green">
          <h4>Ирсэн</h4>
          <strong>{summary.present}</strong>
        </article>
        <article className="t5s-stat red">
          <h4>Тасалсан</h4>
          <strong>{summary.absent}</strong>
        </article>
        <article className="t5s-stat blue">
          <h4>Чөлөөтэй</h4>
          <strong>{summary.excused}</strong>
        </article>
      </div>

      <article className="t5s-card">
        <h3>Хичээл тус бүрийн ирц</h3>

        <div className="t5s-list-stack">
          {courseRows.map((row) => (
            <div key={row.id} className="t5s-attendance-row">
              <div className="t5s-inline-tags between">
                <strong>{row.courseName}</strong>
                <strong>{row.percentage}%</strong>
              </div>

              <div className="t5s-list-meta">
                <span>
                  <FiCheckCircle /> {row.present} ирсэн
                </span>
                <span>
                  <FiXCircle /> {row.absent} тасалсан
                </span>
                <span>
                  <FiClock /> {row.excused} чөлөөтэй
                </span>
              </div>

              <div className="t5s-progress-track">
                <span style={{ width: `${row.percentage}%` }} />
              </div>
            </div>
          ))}

          {courseRows.length === 0 && <div className="t5s-empty">Ирцийн мөр олдсонгүй.</div>}
        </div>
      </article>

      <article className="t5s-card">
        <h3>Сүүлийн үеийн ирц</h3>

        <div className="t5s-list-stack">
          {recent.map((item) => (
            <div key={item.id} className={`t5s-attendance-log ${item.status}`}>
              <div>
                <strong>{item.courseName}</strong>
                <p>{formatDate(item.createdOn)}</p>
              </div>
              <span>{item.typeName}</span>
            </div>
          ))}

          {recent.length === 0 && <div className="t5s-empty">Сүүлийн ирцийн мэдээлэл байхгүй.</div>}
        </div>
      </article>
    </section>
  );
};

export default StudentAttendancePage;
