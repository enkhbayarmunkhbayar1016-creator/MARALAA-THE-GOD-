import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiEye, FiFileText, FiSearch } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { fetchCourseLessons, fetchEnrolledCourses } from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { formatDate, toNumber } from "../utils";

const looksLikeUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());

const StudentLibraryPage = () => {
  const { user } = useStudentAuth();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const enrolled = await fetchEnrolledCourses(user.id);
        const selectedCourse = searchParams.get("course");

        const targetCourses = selectedCourse
          ? enrolled.filter((course) => String(course.courseId) === String(selectedCourse))
          : enrolled;

        const lessonRows = await Promise.all(
          targetCourses.map((course) =>
            fetchCourseLessons(course.courseId)
              .then((lessons) =>
                lessons.map((lesson) => ({
                  ...lesson,
                  courseName: course.name,
                  groupName: course.groupName,
                }))
              )
              .catch(() => [])
          )
        );

        const flattened = lessonRows
          .flat()
          .filter((lesson) => !lesson.hasSubmission)
          .sort((a, b) => new Date(b.openOn || b.endOn || 0).getTime() - new Date(a.openOn || a.endOn || 0).getTime());

        if (!active) return;
        setMaterials(flattened);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Номын сангийн мэдээлэл авах үед алдаа гарлаа");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user?.id, searchParams]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return materials;

    return materials.filter((item) => {
      const bucket = `${item.name} ${item.courseName} ${item.typeName}`.toLowerCase();
      return bucket.includes(term);
    });
  }, [materials, search]);

  const newCount = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return materials.filter((item) => {
      const opened = item.openOn ? new Date(item.openOn).getTime() : 0;
      return opened >= weekAgo && opened <= now;
    }).length;
  }, [materials]);

  if (loading) {
    return <div className="t5s-loading">Номын сан ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page">
      <div className="t5s-page-head">
        <div>
          <h2>Номын сан</h2>
          <p>Хичээлийн материал, слайд, контент</p>
        </div>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <article className="t5s-card">
        <label className="t5s-search-wide">
          <FiSearch />
          <input
            type="text"
            placeholder="Хичээлийн материал хайх..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </article>

      <div className="t5s-stats-grid">
        <article className="t5s-stat blue">
          <h4>Нийт материал</h4>
          <strong>{materials.length}</strong>
        </article>
        <article className="t5s-stat purple">
          <h4>Нийт оноо</h4>
          <strong>{materials.reduce((acc, cur) => acc + toNumber(cur.point, 0), 0)}</strong>
        </article>
        <article className="t5s-stat green">
          <h4>Шинэ материал</h4>
          <strong>{newCount}</strong>
          <p>Энэ долоо хоногт</p>
        </article>
      </div>

      <div className="t5s-list-stack">
        {filtered.map((item) => {
          const isUrl = looksLikeUrl(item.content);

          return (
            <article key={item.id} className="t5s-material-row">
              <div>
                <div className="t5s-inline-tags">
                  <strong>
                    <FiFileText /> {item.name}
                  </strong>
                  <span className="t5s-pill">{item.typeName || "Материал"}</span>
                </div>
                <p>{item.courseName || "Курс"}</p>
                <div className="t5s-list-meta">
                  <span>Огноо: {formatDate(item.openOn || item.endOn)}</span>
                  <span>Оноо: {item.point || 0}</span>
                </div>
              </div>

              <div className="t5s-row-actions">
                {isUrl ? (
                  <a className="t5s-btn t5s-btn-outline" href={item.content} target="_blank" rel="noreferrer">
                    <FiEye /> Үзэх
                  </a>
                ) : (
                  <button type="button" className="t5s-btn t5s-btn-outline" disabled>
                    <FiEye /> Үзэх
                  </button>
                )}

                {isUrl ? (
                  <a className="t5s-btn t5s-btn-primary" href={item.content} target="_blank" rel="noreferrer">
                    <FiDownload /> Татах
                  </a>
                ) : (
                  <button type="button" className="t5s-btn t5s-btn-primary" disabled>
                    <FiDownload /> Татах
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && <div className="t5s-empty">Материал олдсонгүй.</div>}
      </div>
    </section>
  );
};

export default StudentLibraryPage;
