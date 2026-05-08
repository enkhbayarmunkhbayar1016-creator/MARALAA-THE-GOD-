import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSave, FiX } from "react-icons/fi";
import { createCourseExam, fetchExamById, fetchTeachingCourses, updateExam } from "../api";
import { useTeacherAuth } from "../TeacherAuthContext";
import { dateTimeToIso } from "../utils";

const initialForm = {
  name: "",
  courseId: "",
  description: "",
  duration: "60",
  totalPoint: "100",
  maxAttempt: "1",
  openDate: "",
  openTime: "09:00",
  closeDate: "",
  closeTime: "23:59",
};

const splitIsoToForm = (value, fallbackTime = "") => {
  if (!value) {
    return { date: "", time: fallbackTime };
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return {
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${min}`,
    };
  }

  return {
    date: "",
    time: fallbackTime,
  };
};

const TeacherCreateExamPage = () => {
  const { user } = useTeacherAuth();
  const navigate = useNavigate();
  const { examId } = useParams();
  const isEditMode = Boolean(examId);

  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const loadForm = async () => {
      setInitializing(true);
      setError("");

      try {
        const list = await fetchTeachingCourses(user.id);
        setCourses(list);

        if (isEditMode && examId) {
          const exam = await fetchExamById(examId);
          const open = splitIsoToForm(exam.openOn, "09:00");
          const close = splitIsoToForm(exam.closeOn, "23:59");

          setForm({
            name: exam.name || "",
            courseId: exam.courseId || list[0]?.id || "",
            description: exam.description || "",
            duration: String(exam.duration || "60"),
            totalPoint: String(exam.totalPoint || "100"),
            maxAttempt: String(exam.maxAttempt || "1"),
            openDate: open.date,
            openTime: open.time || "09:00",
            closeDate: close.date,
            closeTime: close.time || "23:59",
          });
        } else if (list.length) {
          setForm((prev) => ({ ...prev, courseId: prev.courseId || list[0].id }));
        }
      } catch (err) {
        setError(err?.message || "Шалгалтын мэдээлэл ачаалж чадсангүй.");
      } finally {
        setInitializing(false);
      }
    };

    loadForm();
  }, [user?.id, isEditMode, examId]);

  const canSubmit = useMemo(() => {
    return Boolean(
      form.name.trim() && form.courseId && form.openDate && form.closeDate && form.duration && form.totalPoint
    );
  }, [form]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      setError("Заавал талбаруудыг бөглөнө үү.");
      return;
    }

    setSubmitting(true);
    setError("");

    const openOn = dateTimeToIso(form.openDate, form.openTime);
    const closeOn = dateTimeToIso(form.closeDate, form.closeTime);

    try {
      const payload = {
        courseId: form.courseId,
        name: form.name.trim(),
        description: form.description.trim(),
        duration: form.duration,
        totalPoint: form.totalPoint,
        gradePoint: form.totalPoint,
        maxAttempt: form.maxAttempt,
        openOn,
        closeOn,
        endOn: closeOn,
      };

      if (isEditMode && examId) {
        await updateExam(examId, payload);
        navigate(`/team6/teacher/exams/${examId}`, { replace: true });
      } else {
        await createCourseExam(form.courseId, payload);
        navigate("/team6/teacher/exams", { replace: true });
      }
    } catch (err) {
      setError(err?.message || "Шалгалт хадгалах үед алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return <div className="team5-page-loading">Мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="team5-page">
      <header className="team5-page-header">
        <div>
          <h2>{isEditMode ? "Шалгалт засах" : "Шинэ шалгалт үүсгэх"}</h2>
          <p>
            {isEditMode
              ? "Шалгалтын мэдээллийг шинэчилнэ үү"
              : "Шалгалтын үндсэн мэдээллийг оруулна уу"}
          </p>
        </div>
      </header>

      <form className="team5-form-card" onSubmit={onSubmit}>
        <h3>Шалгалтын мэдээлэл</h3>

        {error ? <p className="team5-error-box">{error}</p> : null}

        <div className="team5-form-grid two">
          <label>
            Шалгалтын нэр <span>*</span>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Жишээ: Дундын шалгалт"
              required
            />
          </label>

          <label>
            Хичээл <span>*</span>
            <select name="courseId" value={form.courseId} onChange={onChange} required>
              {courses.length === 0 ? <option value="">Хичээл олдсонгүй</option> : null}
              {courses.length > 0 && !courses.some((course) => course.id === form.courseId) && form.courseId ? (
                <option value={form.courseId}>Одоогийн хичээл</option>
              ) : null}
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Тайлбар
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
            placeholder="Шалгалтын товч тайлбар..."
          />
        </label>

        <div className="team5-form-grid three">
          <label>
            Үргэлжлэх хугацаа (мин)
            <input name="duration" type="number" min="1" value={form.duration} onChange={onChange} required />
          </label>
          <label>
            Нийт оноо
            <input name="totalPoint" type="number" min="1" value={form.totalPoint} onChange={onChange} required />
          </label>
          <label>
            Оролдлогын тоо
            <select name="maxAttempt" value={form.maxAttempt} onChange={onChange}>
              <option value="1">1 удаа</option>
              <option value="2">2 удаа</option>
              <option value="3">3 удаа</option>
            </select>
          </label>
        </div>

        <div className="team5-form-grid two">
          <label>
            Эхлэх огноо <span>*</span>
            <input name="openDate" type="date" value={form.openDate} onChange={onChange} required />
          </label>
          <label>
            Дуусах огноо <span>*</span>
            <input name="closeDate" type="date" value={form.closeDate} onChange={onChange} required />
          </label>
        </div>

        <div className="team5-form-grid two">
          <label>
            Эхлэх цаг
            <input name="openTime" type="time" value={form.openTime} onChange={onChange} />
          </label>
          <label>
            Дуусах цаг
            <input name="closeTime" type="time" value={form.closeTime} onChange={onChange} />
          </label>
        </div>

        <div className="team5-form-actions">
          <button type="submit" className="team5-primary-btn" disabled={submitting || !canSubmit}>
            <FiSave />
            {submitting ? "Хадгалж байна..." : isEditMode ? "Шинэчлэх" : "Хадгалах"}
          </button>
          <button
            type="button"
            className="team5-ghost-btn"
            onClick={() =>
              navigate(isEditMode && examId ? `/team6/teacher/exams/${examId}` : "/team6/teacher/exams")
            }
          >
            <FiX />
            Цуцлах
          </button>
        </div>
      </form>
    </section>
  );
};

export default TeacherCreateExamPage;
