import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import { fetchCourseLessons, fetchEnrolledCourses } from "../api";
import { useStudentAuth } from "../StudentAuthContext";
import { formatDate, formatTime } from "../utils";

const paletteByType = {
  lecture: "blue",
  lab: "purple",
  assignment: "orange",
  exam: "red",
};

const detectTypeColor = (typeName = "") => {
  const name = typeName.toLowerCase();
  if (name.includes("лекц") || name.includes("lecture")) return paletteByType.lecture;
  if (name.includes("лаб") || name.includes("lab")) return paletteByType.lab;
  if (name.includes("даал") || name.includes("assignment")) return paletteByType.assignment;
  if (name.includes("шалгалт") || name.includes("exam")) return paletteByType.exam;
  return "neutral";
};

const StudentSchedulePage = () => {
  const { user } = useStudentAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const courses = await fetchEnrolledCourses(user.id);

        const lessonRows = await Promise.all(
          courses.map((course) =>
            fetchCourseLessons(course.courseId)
              .then((lessons) => lessons.map((lesson) => ({ ...lesson, courseName: course.name })))
              .catch(() => [])
          )
        );

        const normalized = lessonRows
          .flat()
          .filter((lesson) => lesson.openOn || lesson.endOn || lesson.closeOn)
          .map((lesson) => ({
            id: lesson.id,
            title: lesson.name,
            courseName: lesson.courseName,
            typeName: lesson.typeName || "Хичээл",
            startOn: lesson.openOn || lesson.endOn || lesson.closeOn,
            endOn: lesson.endOn || lesson.closeOn || lesson.openOn,
            color: detectTypeColor(lesson.typeName || ""),
          }))
          .sort((a, b) => new Date(a.startOn).getTime() - new Date(b.startOn).getTime());

        if (!active) return;
        setEvents(normalized);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Хуваарийн мэдээлэл ачаалж чадсангүй");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const groupedByDate = useMemo(() => {
    return events.reduce((acc, item) => {
      const key = formatDate(item.startOn);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [events]);

  if (loading) {
    return <div className="t5s-loading">Хуваарь ачаалж байна...</div>;
  }

  return (
    <section className="t5s-page">
      <div className="t5s-page-head">
        <div>
          <h2>Хуваарь</h2>
          <p>Таны хичээл, лаборатори, даалгаврын хуваарь</p>
        </div>
      </div>

      {error && <div className="t5s-error">{error}</div>}

      <article className="t5s-card">
        {Object.keys(groupedByDate).length === 0 && (
          <div className="t5s-empty">Хуваарийн мэдээлэл олдсонгүй.</div>
        )}

        {Object.entries(groupedByDate).map(([date, rows]) => (
          <div key={date} className="t5s-schedule-day">
            <h3>
              <FiCalendar /> {date}
            </h3>

            <div className="t5s-list-stack">
              {rows.map((item) => (
                <article key={item.id} className={`t5s-schedule-item ${item.color}`}>
                  <div className="t5s-inline-tags">
                    <strong>{item.title}</strong>
                    <span className="t5s-pill">{item.typeName}</span>
                  </div>

                  <p>{item.courseName}</p>

                  <div className="t5s-list-meta">
                    <span>
                      <FiClock /> {formatTime(item.startOn)} - {formatTime(item.endOn)}
                    </span>
                    <span>
                      <FiMapPin /> Онлайн
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}

        <div className="t5s-legend">
          <span className="blue">Лекц</span>
          <span className="purple">Лаборатори</span>
          <span className="red">Шалгалт</span>
          <span className="orange">Даалгавар</span>
        </div>
      </article>
    </section>
  );
};

export default StudentSchedulePage;
