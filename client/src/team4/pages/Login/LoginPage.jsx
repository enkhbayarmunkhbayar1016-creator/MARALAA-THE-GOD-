import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { useToast } from "../../components/ui/Toast";
import { AuthLayout } from "./AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/team4/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("И-мэйл хаягаа оруулна уу.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Зөв и-мэйл хаяг оруулна уу.");
      return;
    }

    if (!password) {
      toast.error("Нууц үгээ оруулна уу.");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      toast.success("Амжилттай нэвтэрлээ!");
      navigate("/team4/schools/current", { replace: true });
    } catch (err) {
      toast.error(err.message || "И-мэйл эсвэл нууц үг буруу байна.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1
            className="text-5xl font-extrabold tracking-tight"
            style={{ color: "#042f2e" }}
          >
            Нэвтрэх
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow-md space-y-6"
        >
          <div className="space-y-2">
            <label
              className="text-sm font-bold tracking-widest uppercase"
              style={{ color: "#575757" }}
            >
              И-МЭЙЛ
            </label>

            <input
              type="text"
              placeholder="example@edu.mn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-14 w-full rounded-2xl border px-5 py-3 text-base outline-none transition-all"
              style={{
                borderColor: "#ccfbf1",
                background: "#eef4ff",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
              onBlur={(e) => (e.target.style.borderColor = "#ccfbf1")}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-bold tracking-widest uppercase"
              style={{ color: "#575757" }}
            >
              НУУЦ ҮГ
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-14 w-full rounded-2xl border px-5 py-3 text-base outline-none transition-all"
              style={{
                borderColor: "#ccfbf1",
                background: "#eef4ff",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
              onBlur={(e) => (e.target.style.borderColor = "#ccfbf1")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-white transition-all disabled:opacity-60"
            style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
          }}
          >
            {loading && (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Нэвтрэх
          </button>
        </form>

        <p className="text-base font-semibold" style={{ color: "#042f2e" }}>
          <Link to="/team4/register" className="hover:underline underline-offset-4">
            Эхлээд бүртгүүлнэ үү
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}