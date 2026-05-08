import { useEffect, useMemo, useState } from "react";
import { FiMail, FiSend } from "react-icons/fi";
import { fetchCourseTeachers, fetchEnrolledCourses } from "../api";
import { useStudentAuth } from "../StudentAuthContext";

const StudentMessagesPage = () => {
  const { user } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const courses = await fetchEnrolledCourses(user.id);

        const teacherRows = await Promise.all(
          courses.map((course) =>
            fetchCourseTeachers(course.courseId)
              .then((rows) =>
                rows.map((teacher) => ({
                  ...teacher,
                  courseName: course.name,
                }))
              )
              .catch(() => [])
          )
        );

        const merged = teacherRows.flat();

        const byId = merged.reduce((acc, row) => {
          const key = String(row.id);
          if (!acc[key]) {
            acc[key] = {
              ...row,
              courseNames: [row.courseName].filter(Boolean),
            };
          } else if (row.courseName && !acc[key].courseNames.includes(row.courseName)) {
            acc[key].courseNames.push(row.courseName);
          }

          return acc;
        }, {});

        const normalized = Object.values(byId);

        if (!active) return;
        setTeachers(normalized);
        if (normalized.length) {
          setSelectedId(String(normalized[0].id));
        }
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Багшийн мэдээлэл дуудах үед алдаа гарлаа");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return teachers;

    return teachers.filter((teacher) => {
      const bucket = `${teacher.displayName} ${teacher.email} ${teacher.courseNames.join(" ")}`.toLowerCase();
      return bucket.includes(term);
    });
  }, [teachers, search]);

  const selectedTeacher = useMemo(
    () => filtered.find((teacher) => String(teacher.id) === String(selectedId)) || filtered[0] || null,
    [filtered, selectedId]
  );

  if (loading) {
    return <div className="t5s-loading">Багшийн харилцах жагсаалт ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page">
      <div className="t5s-page-head">
        <div>
          <h2>Мессежүүд</h2>
          <p>Багш нартай холбоо барих</p>
        </div>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <div className="t5s-two-col">
        <article className="t5s-card">
          <label className="t5s-search-wide">
            <input
              type="text"
              placeholder="Мессеж хайх..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="t5s-list-stack">
            {filtered.map((teacher) => (
              <button
                type="button"
                key={teacher.id}
                className={`t5s-contact-item ${String(teacher.id) === String(selectedTeacher?.id) ? "active" : ""}`}
                onClick={() => setSelectedId(String(teacher.id))}
              >
                <div className="t5s-avatar mini">{teacher.displayName?.slice(0, 1) || "Б"}</div>
                <div>
                  <strong>{teacher.displayName}</strong>
                  <p>{teacher.courseNames.join(", ") || "Хичээлгүй"}</p>
                </div>
              </button>
            ))}

            {filtered.length === 0 && <div className="t5s-empty">Багш олдсонгүй.</div>}
          </div>
        </article>

        <article className="t5s-card">
          {selectedTeacher ? (
            <>
              <div className="t5s-inline-tags">
                <div className="t5s-avatar">{selectedTeacher.displayName?.slice(0, 1) || "Б"}</div>
                <div>
                  <strong>{selectedTeacher.displayName}</strong>
                  <p>{selectedTeacher.email || "Имэйл бүртгэгдээгүй"}</p>
                </div>
              </div>

              <div className="t5s-note">
                <p>
                  API-д тусдаа message endpoint байхгүй тул энэ хэсэгт багшийн API мэдээллийг
                  харуулж байна.
                </p>
                <p>Заадаг хичээл: {selectedTeacher.courseNames.join(", ") || "-"}</p>
              </div>

              <label>
                Хариу бичих
                <textarea rows={5} placeholder="Хариултаа энд бичнэ үү..." disabled />
              </label>

              <div className="t5s-row-actions">
                <button type="button" className="t5s-btn t5s-btn-primary" disabled>
                  <FiSend /> Илгээх endpoint одоогоор алга
                </button>
              </div>
            </>
          ) : (
            <div className="t5s-empty">Сонгогдсон багш алга.</div>
          )}
        </article>
      </div>

      <div className="t5s-stats-grid">
        <article className="t5s-stat blue">
          <h4>Шинэ мессеж</h4>
          <strong>0</strong>
        </article>
        <article className="t5s-stat purple">
          <h4>Нийт харилцах</h4>
          <strong>{teachers.length}</strong>
        </article>
        <article className="t5s-stat green">
          <h4>Багшаас</h4>
          <strong>{teachers.length}</strong>
        </article>
      </div>
    </section>
  );
};

export default StudentMessagesPage;
