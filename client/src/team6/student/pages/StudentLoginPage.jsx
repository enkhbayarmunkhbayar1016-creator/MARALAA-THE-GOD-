import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { PiGraduationCapDuotone } from "react-icons/pi";
import { useStudentAuth } from "../StudentAuthContext";

const StudentLoginPage = () => {
  const { login, isAuthenticated, error: authError } = useStudentAuth();
  const [form, setForm] = useState({ identity: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/team6/student/dashboard" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form.identity, form.password);
    } catch (err) {
      setError(err?.message || "Нэвтрэх үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="t5s-login-screen">
      <div className="t5s-login-wrap">
        <div className="t5s-login-logo">
          <PiGraduationCapDuotone />
        </div>

        <h1>Цахим Сургалтын Систем</h1>
        <p>Оюутны нэвтрэх хэсэг</p>

        <form onSubmit={onSubmit} className="t5s-login-card">
          <label>
            Оюутны дугаар эсвэл имэйл
            <input
              type="text"
              value={form.identity}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, identity: event.target.value }))
              }
              placeholder="B231930057 эсвэл email"
              required
            />
          </label>

          <label>
            Нууц үг
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="••••••••"
              required
            />
          </label>

          {(error || authError) && <div className="t5s-error">{error || authError}</div>}

          <div className="t5s-login-links">
            <Link to="/team6/student/login">Намайг сана</Link>
            <Link to="/team6/student/login">Нууц үг мартсан?</Link>
          </div>

          <button type="submit" className="t5s-btn t5s-btn-primary" disabled={submitting}>
            <FiLogIn />
            {submitting ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>

        <small>© 2026 Их Сургууль. Бүх эрх хуулиар хамгаалагдсан.</small>
      </div>
    </div>
  );
};

export default StudentLoginPage;
