import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiLock, FiMail, FiShield } from "react-icons/fi";
import { useAdminAuth } from "../AdminAuthContext";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/team6/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Имэйл болон нууц үг оруулна уу");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(email, password);
      navigate("/team6/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Нэвтрэх үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="t5a-login-page">
      <div className="t5a-login-logo">
        <FiShield />
      </div>

      <div className="t5a-login-card">
        <h1>Админ систем</h1>
        <p>Цахим шалгалтын удирдах систем</p>

        {error && <div className="t5a-error">{error}</div>}

        <form className="t5a-form" onSubmit={handleSubmit}>
          <label>
            <span>Имэйл</span>
            <div className="t5a-input-wrap">
              <FiMail />
              <input
                type="email"
                placeholder="admin@university.edu.mn"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </label>

          <label>
            <span>Нууц үг</span>
            <div className="t5a-input-wrap">
              <FiLock />
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </label>

          <button type="submit" className="t5a-btn t5a-btn-primary" disabled={loading}>
            <FiArrowRight /> {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>
      </div>

      <p className="t5a-login-demo">Demo: admin@university.edu.mn / password</p>
    </section>
  );
};

export default AdminLoginPage;
