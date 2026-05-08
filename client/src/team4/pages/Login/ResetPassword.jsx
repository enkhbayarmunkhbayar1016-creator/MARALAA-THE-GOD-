import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { apiPost, otpLogin } from "../../utils/api";
import { useToast } from "../../components/ui/Toast";
import { AuthLayout } from "./AuthLayout";

// ── 6-digit OTP input ─────────────────────────────────────────────────────────

function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  function handleChange(i, e) {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    onChange(next.join("").trimEnd());
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      if (!digits[i] && i > 0) {
        const next = [...digits];
        next[i - 1] = "";
        onChange(next.join("").trimEnd());
        inputs.current[i - 1]?.focus();
      } else if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        onChange(next.join("").trimEnd());
      }
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  }

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-12 rounded-lg border border-teal-100 bg-white text-center text-lg font-semibold
            focus:outline-none focus:ring-2 focus:ring-zinc-900 font-semibold"
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const toast = useToast();
  const emailFromState = location.state?.email ?? "";
  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  if (user) return <Navigate to="/team4/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (code.length < 6) {
      toast.error("6 оронтой кодыг бүрэн оруулна уу.");
      return;
    }
    setLoading(true);
    try {
      await otpLogin(email, code);
      toast.success("Баталгаажуулалт амжилттай!");
      window.location.href = "/team4/schools/current";
    } catch (err) {
      toast.error(err.message || "Баталгаажуулалт амжилтгүй.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setResending(true);
    try {
      await apiPost("/otp/email", { email });
      toast.success("Шинэ код илгээгдлээ.");
    } catch (err) {
      toast.error(err.message || "Дахин илгээж чадсангүй.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>Код баталгаажуулалт</h1>
          <p className="text-sm" style={{ color: "#99f6e4" }}>Имэйлээр 6 оронтой код илгээгдсэн.</p>
          {emailFromState && (
            <p className="text-sm font-medium " style={{ color: "#0f766e" }}>{emailFromState}</p>
          )}
        </div>

        {/* If no email passed via state, show email field */}
        {!emailFromState && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium " style={{ color: "#0f766e" }}>И-мэйл</label>
            <input
              type="email"
              placeholder="a@must.edu.mn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-10 w-full rounded-lg border border-teal-100 bg-white px-3 py-2 text-sm
                placeholder:text-teal-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP boxes */}
          <OtpInput value={code} onChange={setCode} />

          <p className="text-center text-xs text-teal-400">
            Имэйлд ирсэн кодыг оруулна уу.
          </p>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm
              font-medium text-white transition-colors hover:bg-zinc-700
              disabled:pointer-events-none disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Үргэлжлүүлэх
          </button>
        </form>

        {/* Resend */}
        <p className="text-center text-sm text-teal-300">
          Код ирээгүй юу?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-teal-900 hover:underline underline-offset-4 disabled:opacity-50"
          >
            {resending ? "Илгээж байна…" : "Дахин илгээх"}
          </button>
        </p>

        {/* Back */}
        <p className="text-center text-sm">
          <Link
            to="/team4/forgot-password"
            className="text-teal-400 hover:text-teal-900 underline-offset-4 hover:underline"
          >
            ← Нууц үг сэргээх
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
