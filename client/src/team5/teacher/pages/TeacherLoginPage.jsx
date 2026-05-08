import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { PiGraduationCapDuotone } from "react-icons/pi";
import { useTeacherAuth } from "../TeacherAuthContext";

const TeacherLoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, ready } = useTeacherAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) {
      navigate("/team6/teacher/exams", { replace: true });
    }
  }, [ready, isAuthenticated, navigate]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form.email, form.password);
      navigate("/team6/teacher/exams", { replace: true });
    } catch (err) {
      setError(err?.message || "Нэвтрэх үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="team5-auth-screen">
      <form className="team5-auth-card" onSubmit={onSubmit}>
        <div className="team5-auth-logo">
          <PiGraduationCapDuotone />
        </div>

        <h2>Багшийн систем</h2>
        <p>Цахим шалгалтын удирдлагын хэсэг</p>

        <label htmlFor="teacher-email">Имэйл хаяг</label>
        <input
          id="teacher-email"
          name="email"
          type="text"
          value={form.email}
          onChange={onChange}
          placeholder="teacher@university.edu.mn"
          autoComplete="username"
          required
        />

        <label htmlFor="teacher-password">Нууц үг</label>
        <input
          id="teacher-password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          autoComplete="current-password"
          required
        />

        {error ? <p className="team5-error">{error}</p> : null}

        <button type="submit" className="team5-primary-btn" disabled={submitting}>
          <FiArrowRight />
          {submitting ? "Нэвтэрч байна..." : "Нэвтрэх"}
        </button>
      </form>
    </div>
  );
};

export default TeacherLoginPage;
