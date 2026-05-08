import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiEdit2, FiEye, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import {
  addCourseTeacher,
  addCourseStudent,
  createSchoolCourse,
  deleteCourse,
  fetchCourseTeachers,
  fetchCourseStudents,
  fetchSchoolCourses,
  fetchSchoolUsers,
  fetchSchools,
  fetchUsers,
  removeCourseTeacher,
  removeCourseStudent,
  searchSchoolUsersByEmail,
  updateCourse,
} from "../api";
import { formatDate } from "../utils";

const emptyForm = {
  schoolId: "",
  name: "",
  description: "",
  categoryId: "",
  clonedCourseId: "",
  startOn: "",
  endOn: "",
  picture: "",
  priority: 0,
};

const AdminCoursesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [courses, setCourses] = useState([]);
  const [schoolUsers, setSchoolUsers] = useState([]);
  const [courseTeachers, setCourseTeachers] = useState([]);
  const [teacherSelection, setTeacherSelection] = useState("");
  const [courseStudents, setCourseStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [studentSelection, setStudentSelection] = useState("");
  const [studentError, setStudentError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState("");

  const loadData = async (schoolId) => {
    if (!schoolId) {
      setCourses([]);
      return;
    }

    try {
      const rows = await fetchSchoolCourses(schoolId);
      setCourses(rows);
    } catch (err) {
      setError(err?.message || "Хичээлийн мэдээлэл дуудах үед алдаа гарлаа");
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setLoading(true);
      setError("");

      try {
        const schoolRows = await fetchSchools();
        if (!active) return;

        setSchools(schoolRows);

        const firstSchool = schoolRows[0]?.id || "";
        setSelectedSchoolId(firstSchool);
        setForm((prev) => ({ ...prev, schoolId: firstSchool }));
        if (firstSchool) {
          const courseRows = await fetchSchoolCourses(firstSchool);
          if (!active) return;
          setCourses(courseRows);
        }
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Сургууль болон хичээлийн мэдээлэл дуудах үед алдаа гарлаа");
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const totalPrice = useMemo(
    () => courses.reduce((sum, course) => sum + Number(course.price || 0), 0),
    [courses]
  );

  const inferRole = (user) => {
    const value = String(
      user?.raw?.role_name || user?.raw?.["{}roles"] || user?.raw?.role || user?.raw?.type || ""
    ).toLowerCase();

    if (!value) return "";
    if (value.includes("teacher") || value.includes("багш")) return "teacher";
    if (value.includes("admin") || value.includes("админ")) return "admin";
    if (value.includes("student") || value.includes("оюутан")) return "student";
    return "";
  };

  const teacherCandidates = useMemo(() => {
    const teachers = schoolUsers.filter((user) => inferRole(user) === "teacher");
    return teachers.length > 0 ? teachers : schoolUsers;
  }, [schoolUsers]);

  const assignedTeacherIds = useMemo(
    () => new Set(courseTeachers.map((teacher) => String(teacher.id))),
    [courseTeachers]
  );

  const availableTeachers = useMemo(
    () => teacherCandidates.filter((user) => !assignedTeacherIds.has(String(user.id))),
    [teacherCandidates, assignedTeacherIds]
  );

  const assignedStudentIds = useMemo(
    () => new Set(courseStudents.map((student) => String(student.id))),
    [courseStudents]
  );

  const availableStudents = useMemo(() => {
    const filtered = studentResults.filter((user) => !assignedStudentIds.has(String(user.id)));
    return filtered.filter((user) => {
      const role = inferRole(user);
      return role === "student" || role === "";
    });
  }, [assignedStudentIds, studentResults]);

  const loadSchoolUsers = async (schoolId) => {
    if (!schoolId) {
      setSchoolUsers([]);
      return;
    }

    try {
      const users = await fetchSchoolUsers(schoolId);
      setSchoolUsers(users);
    } catch {
      try {
        const users = await fetchUsers();
        setSchoolUsers(users);
      } catch {
        setSchoolUsers([]);
      }
    }
  };

  const loadCourseTeacherRows = async (courseId) => {
    if (!courseId) {
      setCourseTeachers([]);
      return;
    }

    const teacherRows = await fetchCourseTeachers(courseId);
    setCourseTeachers(teacherRows);
  };

  const loadCourseStudentRows = async (courseId) => {
    if (!courseId) {
      setCourseStudents([]);
      return;
    }

    const rows = await fetchCourseStudents(courseId);
    setCourseStudents(rows);
  };

  const handleSchoolChange = async (event) => {
    const schoolId = event.target.value;
    setSelectedSchoolId(schoolId);
    setForm((prev) => ({ ...prev, schoolId }));
    await loadSchoolUsers(schoolId);
    await loadData(schoolId);
  };

  const closeModal = () => {
    setModalType("");
    setEditingId("");
    setSelectedCourse(null);
    setCourseTeachers([]);
    setTeacherSelection("");
    setCourseStudents([]);
    setStudentSearch("");
    setStudentResults([]);
    setStudentSelection("");
    setStudentError("");
    setForm({ ...emptyForm, schoolId: selectedSchoolId || schools[0]?.id || "" });
  };

  const openCreateModal = () => {
    setEditingId("");
    setSelectedCourse(null);
    setTeacherSelection("");
    setCourseStudents([]);
    setStudentSearch("");
    setStudentResults([]);
    setStudentSelection("");
    setStudentError("");
    setForm({ ...emptyForm, schoolId: selectedSchoolId || schools[0]?.id || "" });
    setModalType("form");
    loadSchoolUsers(selectedSchoolId || schools[0]?.id || "");
  };

  const openViewModal = async (course) => {
    setSelectedCourse(course);
    setTeacherSelection("");
    setModalType("view");

    try {
      await Promise.all([
        loadSchoolUsers(course.schoolId || selectedSchoolId),
        loadCourseTeacherRows(course.id),
        loadCourseStudentRows(course.id),
      ]);
    } catch (err) {
      setError(err?.message || "Хичээлийн багшийн мэдээлэл дуудах үед алдаа гарлаа");
    }
  };

  const openEditModal = async (course) => {
    setEditingId(course.id);
    setSelectedCourse(course);
    setTeacherSelection("");
    setForm({
      schoolId: course.schoolId || selectedSchoolId || "",
      name: course.name || "",
      description: course.description || "",
      categoryId: course.categoryId || "",
      clonedCourseId: course.clonedCourseId || "",
      startOn: course.startOn || "",
      endOn: course.endOn || "",
      picture: course.picture || "",
      priority: course.priority || 0,
    });
    setModalType("form");

    try {
      await Promise.all([
        loadSchoolUsers(course.schoolId || selectedSchoolId),
        loadCourseTeacherRows(course.id),
        loadCourseStudentRows(course.id),
      ]);
    } catch (err) {
      setError(err?.message || "Хичээлийн багшийн мэдээлэл дуудах үед алдаа гарлаа");
    }
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setModalType("delete");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const targetSchoolId = form.schoolId || selectedSchoolId;

    if (!targetSchoolId) {
      setError("Эхлээд сургууль сонгоно уу");
      return;
    }

    if (!form.name) {
      setError("Хичээлийн нэр оруулна уу");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (editingId) {
        await updateCourse(editingId, { ...form, schoolId: targetSchoolId });
      } else {
        await createSchoolCourse(targetSchoolId, form);
      }

      setSelectedSchoolId(targetSchoolId);
      await loadData(targetSchoolId);
      closeModal();
    } catch (err) {
      setError(err?.message || "Хичээл үүсгэх үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCourse?.id) return;

    try {
      setSubmitting(true);
      setError("");
      await deleteCourse(selectedCourse.id);
      await loadData(selectedSchoolId);
      closeModal();
    } catch (err) {
      setError(err?.message || "Хичээл устгах үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTeacher = async () => {
    const courseId = editingId || selectedCourse?.id;
    if (!courseId) return;
    if (!teacherSelection) {
      setError("Нэмэх багшаа сонгоно уу");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await addCourseTeacher(courseId, teacherSelection);
      await loadCourseTeacherRows(courseId);
      setTeacherSelection("");
    } catch (err) {
      const errorMsg = err?.message || "Багш нэмэх үед алдаа гарлаа";
      console.error("Teacher add error:", { courseId, teacherSelection, error: err });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    const courseId = editingId || selectedCourse?.id;
    if (!courseId || !teacherId) return;

    try {
      setSubmitting(true);
      setError("");
      await removeCourseTeacher(courseId, teacherId);
      await loadCourseTeacherRows(courseId);
    } catch (err) {
      const errorMsg = err?.message || "Багш хасах үед алдаа гарлаа";
      console.error("Teacher remove error:", { courseId, teacherId, error: err });
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudentSearch = async () => {
    const courseId = editingId || selectedCourse?.id;
    if (!courseId) return;

    if (!studentSearch.trim()) {
      setStudentError("Оюутны имэйл бичнэ үү");
      return;
    }

    try {
      setSubmitting(true);
      setStudentError("");
      const schoolId = selectedCourse?.schoolId || selectedSchoolId || form.schoolId;
      const results = await searchSchoolUsersByEmail(schoolId, studentSearch);
      setStudentResults(results);
      if (results.length === 0) {
        setStudentError("Илэрц олдсонгүй");
      }
    } catch (err) {
      setStudentError(err?.message || "Хайлт хийх үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStudent = async () => {
    const courseId = editingId || selectedCourse?.id;
    if (!courseId) return;
    if (!studentSelection) {
      setStudentError("Нэмэх оюутнаа сонгоно уу");
      return;
    }

    try {
      setSubmitting(true);
      setStudentError("");
      await addCourseStudent(courseId, studentSelection);
      await loadCourseStudentRows(courseId);
      setStudentSelection("");
    } catch (err) {
      setStudentError(err?.message || "Оюутан нэмэх үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    const courseId = editingId || selectedCourse?.id;
    if (!courseId || !studentId) return;

    try {
      setSubmitting(true);
      setStudentError("");
      await removeCourseStudent(courseId, studentId);
      await loadCourseStudentRows(courseId);
    } catch (err) {
      setStudentError(err?.message || "Оюутан хасах үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="t5a-loading">Хичээлийн мэдээлэл ачаалж байна...</div>;
  }

  return (
    <section className="t5a-page">
      <div className="t5a-page-title">
        <div>
          <h2>Хичээлийн жагсаалт</h2>
          <p>Бүх хичээлүүдийг удирдах</p>
        </div>
        <button type="button" className="t5a-btn t5a-btn-primary t5a-add-btn" onClick={openCreateModal}>
          <FiPlus /> Шинэ хичээл үүсгэх
        </button>
      </div>

      {error && <div className="t5a-error">{error}</div>}

      <div className="t5a-stats-grid compact">
        <article className="t5a-stat green">
          <h4>
            <FiBookOpen /> Хичээлүүд
          </h4>
          <strong>{courses.length}</strong>
        </article>
        <article className="t5a-stat amber">
          <h4>Нийт үнийн дүн</h4>
          <strong>{totalPrice.toLocaleString("mn-MN")} ₮</strong>
        </article>
      </div>

      <article className="t5a-card">
        <div className="t5a-toolbar-row">
          <span>Хичээлүүд ({courses.length})</span>
          <label className="t5a-filter-inline">
            <span>Сургууль:</span>
            <select value={selectedSchoolId} onChange={handleSchoolChange}>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="t5a-table-wrap">
          <table className="t5a-table">
            <thead>
              <tr>
                <th>Хичээлийн нэр</th>
                <th>Сургууль</th>
                <th>Ангилал</th>
                <th>Эхлэх огноо</th>
                <th>Дуусах огноо</th>
                <th>Оюутан</th>
                <th>Төлөв</th>
                <th>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="t5a-name-cell">
                      <strong>{course.name}</strong>
                      <span>{course.description || "Мэдээллийн технологи"}</span>
                    </div>
                  </td>
                  <td>{schools.find((school) => String(school.id) === String(course.schoolId))?.name || "-"}</td>
                  <td>
                    <span className="t5a-outline-chip">{course.categoryId || "Ерөнхий"}</span>
                  </td>
                  <td>{formatDate(course.startOn)}</td>
                  <td>{formatDate(course.endOn)}</td>
                  <td className="t5a-purple-text">{Math.max(12, Number(course.credits || 0) * 6 || 0)}</td>
                  <td>
                    <span className={`t5a-badge ${course.endOn ? "ok" : "warn"}`}>
                      {course.endOn ? "Идэвхтэй" : "Хүлээгдэж буй"}
                    </span>
                  </td>
                  <td className="t5a-actions">
                    <button type="button" title="Харах" onClick={() => openViewModal(course)}>
                      <FiEye />
                    </button>
                    <button type="button" title="Засах" onClick={() => openEditModal(course)}>
                      <FiEdit2 />
                    </button>
                    <button type="button" className="danger" title="Устгах" onClick={() => openDeleteModal(course)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}

              {courses.length === 0 && (
                <tr>
                  <td colSpan={8} className="t5a-empty-cell">
                    Хичээл олдсонгүй
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {modalType === "view" && selectedCourse && (
        <div className="t5a-modal-overlay" onClick={closeModal}>
          <div className="t5a-modal" onClick={(event) => event.stopPropagation()}>
            <div className="t5a-modal-head">
              <h3>Хичээлийн мэдээлэл</h3>
              <button type="button" className="t5a-modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <div className="t5a-modal-view">
              <div className="t5a-modal-view-item">
                <span>Нэр</span>
                <strong>{selectedCourse.name || "-"}</strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Сургууль</span>
                <strong>
                  {schools.find((school) => String(school.id) === String(selectedCourse.schoolId))?.name || "-"}
                </strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Тайлбар</span>
                <strong>{selectedCourse.description || "-"}</strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Ангилал</span>
                <strong>{selectedCourse.categoryId || "-"}</strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Эхлэх огноо</span>
                <strong>{formatDate(selectedCourse.startOn)}</strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Дуусах огноо</span>
                <strong>{formatDate(selectedCourse.endOn)}</strong>
              </div>
              <div className="t5a-modal-view-item">
                <span>Багш нар</span>
                <div className="t5a-chip-list">
                  {courseTeachers.length > 0 ? (
                    courseTeachers.map((teacher) => (
                      <span key={teacher.id} className="t5a-role-chip">
                        {teacher.displayName || teacher.email || teacher.id}
                      </span>
                    ))
                  ) : (
                    <strong>-</strong>
                  )}
                </div>
              </div>
              <div className="t5a-modal-view-item">
                <span>Оюутнууд</span>
                <div className="t5a-chip-list">
                  {courseStudents.length > 0 ? (
                    courseStudents.map((student) => (
                      <span key={student.id} className="t5a-role-chip">
                        {student.displayName || student.email || student.id}
                      </span>
                    ))
                  ) : (
                    <strong>-</strong>
                  )}
                </div>
              </div>
            </div>

            <div className="t5a-modal-actions">
              <button type="button" className="t5a-btn" onClick={closeModal}>
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}

      {modalType === "form" && (
        <div className="t5a-modal-overlay" onClick={closeModal}>
          <div className="t5a-modal" onClick={(event) => event.stopPropagation()}>
            <div className="t5a-modal-head">
              <h3>{editingId ? "Хичээл засах" : "Шинэ хичээл"}</h3>
              <button type="button" className="t5a-modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <form className="t5a-form" onSubmit={handleSubmit}>
              <div className="t5a-modal-grid">
                <select
                  value={form.schoolId}
                  onChange={(event) => setForm((prev) => ({ ...prev, schoolId: event.target.value }))}
                  required
                >
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Хичээлийн нэр"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Тайлбар"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Ангиллын ID"
                  value={form.categoryId}
                  onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                />
                <input
                  type="date"
                  value={form.startOn}
                  onChange={(event) => setForm((prev) => ({ ...prev, startOn: event.target.value }))}
                />
                <input
                  type="date"
                  value={form.endOn}
                  onChange={(event) => setForm((prev) => ({ ...prev, endOn: event.target.value }))}
                />
              </div>

              <div className="t5a-teacher-assign">
                <h4>Хичээлд багш оноох</h4>
                {!editingId && (
                  <span className="t5a-empty-chip">Эхлээд хичээлээ хадгалаад, дараа нь багш онооно.</span>
                )}
                <div className="t5a-inline-actions">
                  <select
                    value={teacherSelection}
                    onChange={(event) => setTeacherSelection(event.target.value)}
                    disabled={!editingId}
                  >
                    <option value="">Багш сонгох</option>
                    {availableTeachers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.displayName || user.email || user.id}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="t5a-btn"
                    onClick={handleAddTeacher}
                    disabled={submitting || !editingId}
                  >
                    <FiPlus /> Багш нэмэх
                  </button>
                </div>

                <div className="t5a-chip-list">
                  {courseTeachers.length > 0 ? (
                    courseTeachers.map((teacher) => (
                      <div key={teacher.id} className="t5a-teacher-chip">
                        <span>{teacher.displayName || teacher.email || teacher.id}</span>
                        <button
                          type="button"
                          className="t5a-btn t5a-btn-sm danger"
                          onClick={() => handleRemoveTeacher(teacher.id)}
                          disabled={submitting}
                          title="Багш хасах"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="t5a-empty-chip">Одоогоор багш оноогоогүй</span>
                  )}
                </div>
              </div>

              <div className="t5a-teacher-assign">
                <h4>Хичээлд оюутан нэмэх</h4>
                {!editingId && (
                  <span className="t5a-empty-chip">Эхлээд хичээлээ хадгалаад, дараа нь оюутан нэмнэ.</span>
                )}

                <div className="t5a-inline-actions">
                  <input
                    type="text"
                    placeholder="Оюутны имэйлээр хайх"
                    value={studentSearch}
                    onChange={(event) => {
                      const value = event.target.value;
                      setStudentSearch(value);
                      if (!value) {
                        setStudentResults([]);
                        setStudentSelection("");
                        setStudentError("");
                      }
                    }}
                    disabled={!editingId}
                  />
                  <button
                    type="button"
                    className="t5a-btn"
                    onClick={handleStudentSearch}
                    disabled={submitting || !editingId}
                  >
                    <FiSearch /> Хайх
                  </button>
                </div>

                {studentError ? <span className="t5a-empty-chip">{studentError}</span> : null}

                <div className="t5a-inline-actions">
                  <select
                    value={studentSelection}
                    onChange={(event) => setStudentSelection(event.target.value)}
                    disabled={!editingId || availableStudents.length === 0}
                  >
                    <option value="">Оюутан сонгох</option>
                    {availableStudents.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.displayName || user.email || user.id}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="t5a-btn"
                    onClick={handleAddStudent}
                    disabled={submitting || !editingId}
                  >
                    <FiPlus /> Оюутан нэмэх
                  </button>
                </div>

                <div className="t5a-chip-list">
                  {courseStudents.length > 0 ? (
                    courseStudents.map((student) => (
                      <div key={student.id} className="t5a-teacher-chip">
                        <span>{student.displayName || student.email || student.id}</span>
                        <button
                          type="button"
                          className="t5a-btn t5a-btn-sm danger"
                          onClick={() => handleRemoveStudent(student.id)}
                          disabled={submitting}
                          title="Оюутан хасах"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="t5a-empty-chip">Одоогоор оюутан нэмээгүй</span>
                  )}
                </div>
              </div>

              <div className="t5a-modal-actions">
                <button type="submit" className="t5a-btn t5a-btn-primary" disabled={submitting}>
                  {editingId ? <FiEdit2 /> : <FiPlus />} {editingId ? "Шинэчлэх" : "Нэмэх"}
                </button>
                <button type="button" className="t5a-btn" onClick={closeModal}>
                  Болих
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === "delete" && selectedCourse && (
        <div className="t5a-modal-overlay" onClick={closeModal}>
          <div className="t5a-modal small" onClick={(event) => event.stopPropagation()}>
            <div className="t5a-modal-head">
              <h3>Хичээл устгах</h3>
              <button type="button" className="t5a-modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <p className="t5a-modal-text">
              <strong>{selectedCourse.name}</strong> хичээлийг устгах уу?
            </p>

            <div className="t5a-modal-actions">
              <button type="button" className="t5a-btn danger" onClick={handleDelete} disabled={submitting}>
                <FiTrash2 /> {submitting ? "Устгаж байна..." : "Устгах"}
              </button>
              <button type="button" className="t5a-btn" onClick={closeModal}>
                Болих
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminCoursesPage;
