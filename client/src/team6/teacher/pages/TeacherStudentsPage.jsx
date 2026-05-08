import { useCallback, useEffect, useMemo, useState } from "react";
import { FiEye, FiSearch } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchCourseStudents,
  fetchTeachingCourses,
} from "../api";
import { useTeacherAuth } from "../TeacherAuthContext";

const TeacherStudentsPage = () => {
  const { user } = useTeacherAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState("");

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [students, setStudents] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Load teaching courses — deduplicated by id
  const loadCourses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const raw = await fetchTeachingCourses(user.id);
      const seen = new Set();
      const unique = raw.filter((c) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
      setCourses(unique);
    } catch (err) {
      setError(err?.message || "Хичээлийн жагсаалт ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  // Once courses load, pick course from URL or default to first
  useEffect(() => {
    if (!courses.length) return;
    const fromQuery = searchParams.get("courseId");
    const valid = fromQuery && courses.some((c) => c.id === fromQuery);
    const target = valid ? fromQuery : courses[0].id;
    setSelectedCourseId(target);
    if (!valid) setSearchParams({ courseId: target }, { replace: true });
  }, [courses]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load students whenever selected course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    const load = async () => {
      setStudentsLoading(true);
      setError("");
      try {
        const data = await fetchCourseStudents(selectedCourseId);
        setStudents(data);
      } catch (err) {
        setError(err?.message || "Оюутны жагсаалт ачаалж чадсангүй.");
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };
    load();
  }, [selectedCourseId]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const rows = useMemo(() => {
    if (!searchText.trim()) return students;
    const value = searchText.toLowerCase();
    return students.filter(
      (s) =>
        s.displayName.toLowerCase().includes(value) ||
        s.email.toLowerCase().includes(value) ||
        s.id.toLowerCase().includes(value)
    );
  }, [searchText, students]);

  if (loading) {
    return <div className="team5-page-loading">Хичээлийн мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="team5-page">
      <header className="team5-page-header">
        <div>
          <h2>Оюутнууд</h2>
          <p>{selectedCourse?.name || "Хичээл сонгоно уу"}</p>
        </div>

        <select
          className="team5-select"
          value={selectedCourseId}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedCourseId(value);
            setSearchParams({ courseId: value }, { replace: true });
          }}
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </header>

      {error ? <p className="team5-error-box">{error}</p> : null}

      <div className="team5-stats-grid">
        <article className="team5-stat-card purple">
          <h3>Нийт оюутан</h3>
          <strong>{students.length}</strong>
        </article>
        <article className="team5-stat-card green">
          <h3>Идэвхтэй</h3>
          <strong>{students.length}</strong>
        </article>
        <article className="team5-stat-card blue">
          <h3>Дундаж оноо</h3>
          <strong>0.0%</strong>
        </article>
        <article className="team5-stat-card orange">
          <h3>Нийт шалгалт</h3>
          <strong>0</strong>
        </article>
      </div>

      <div className="team5-toolbar">
        <div className="team5-search-box grow">
          <FiSearch />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Нэр, код, имэйлээр хайх..."
          />
        </div>
      </div>

      <div className="team5-list-stack">
        {studentsLoading ? (
          <p className="team5-empty-state">Оюутны жагсаалт ачаалж байна...</p>
        ) : rows.length === 0 ? (
          <p className="team5-empty-state">Оюутан олдсонгүй</p>
        ) : (
          rows.map((row) => (
            <article key={row.id} className="team5-student-card">
              <div className="team5-student-main">
                <div>
                  <h4>{row.displayName}</h4>
                  <p>{row.email || row.id}</p>
                </div>

                <Link
                  to={`/team6/teacher/students/${row.id}?courseId=${selectedCourseId}`}
                  className="team5-action-btn"
                  title="Дэлгэрэнгүй"
                >
                  <FiEye />
                  Дэлгэрэнгүй
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default TeacherStudentsPage;
