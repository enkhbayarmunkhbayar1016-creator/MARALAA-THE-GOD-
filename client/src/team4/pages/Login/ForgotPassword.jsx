import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { apiPost } from "../../utils/api";
import { useToast } from "../../components/ui/Toast";
import { AuthLayout } from "./AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
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

    setLoading(true);
    try {
      await apiPost("/otp/email", { email });
      toast.success("Баталгаажуулах код илгээгдлээ.");
      navigate("/team4/reset-password", { state: { email } });
    } catch (err) {
      toast.error(err.message || "Код илгээж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>Нууц үг сэргээх</h1>
          <p className="text-sm" style={{ color: "#99f6e4" }}>
            Баталгаажуулах кодыг имэйлээр илгээнэ.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium " style={{ color: "#0f766e" }}>И-мэйл</label>
            <input
              type="text"
              placeholder="a@must.edu.mn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-teal-100 bg-white px-3 py-2 text-sm
                placeholder:text-teal-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm
              font-medium text-white transition-colors hover:bg-zinc-700
              disabled:pointer-events-none disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Код авах
          </button>
        </form>

        {/* Back to login */}
        <p className="text-center text-sm">
          <Link
            to="/team4/login"
            className="text-teal-300 hover:text-teal-900 underline-offset-4 hover:underline"
          >
            ← Нэвтрэх
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
