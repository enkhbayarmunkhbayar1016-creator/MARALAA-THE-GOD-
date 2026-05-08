import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { useToast } from "../../components/ui/Toast";
import { AuthLayout } from "../Login/AuthLayout";

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    last_name: "",
    first_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/team4/" replace />;

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.first_name.trim()) {
      toast.error("Нэрээ оруулна уу.");
      return;
    }

    if (!form.last_name.trim()) {
      toast.error("Овогоо оруулна уу.");
      return;
    }

    if (!form.email.trim()) {
      toast.error("И-мэйл хаягаа оруулна уу.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Зөв и-мэйл хаяг оруулна уу.");
      return;
    }

    if (!form.password) {
      toast.error("Нууц үгээ оруулна уу.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Нууц үг хамгийн багадаа 8 тэмдэгттэй байх ёстой.");
      return;
    }

    if (!form.confirm_password) {
      toast.error("Нууц үг давтан оруулна уу.");
      return;
    }

    if (form.password !== form.confirm_password) {
      toast.error("Нууц үг таарахгүй байна.");
      return;
    }

    setLoading(true);

    try {
      const BASE_URL = "https://todu.mn/bs/lms/v1";

      const loginRes = await fetch(`${BASE_URL}/token/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@must.edu.mn",
          password: "123",
          push_token: "",
        }),
      });

      const loginData = await loginRes.json();
      const token = loginData.access_token;

      if (!token) throw new Error("Серверт холбогдож чадсангүй.");

      const res = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          username: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Бүртгүүлэлт амжилтгүй.");
      }

      toast.success("Бүртгэл амжилттай! Нэвтэрнэ үү.");
      navigate("/team4/login?registered=1");
    } catch (err) {
      toast.error(err.message || "Бүртгүүлэлт амжилтгүй.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    borderColor: "#bfdbfe",
    background: "#f8fbff",
  };

  const activeInputStyle = (e) => {
    e.target.style.borderColor = "#4f46e5";
  };

  const normalInputStyle = (e) => {
    e.target.style.borderColor = "#bfdbfe";
  };

  const labelStyle = {
    color: "#575757",
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-3xl">
        <div className="mb-7">
          <h1
            className="text-5xl font-extrabold leading-tight tracking-tight"
            style={{ color: "#111827" }}
          >
            Бүртгүүлэх
          </h1>

          <p className="mt-3 text-base" style={{ color: "#52668a" }}>
            Өөрийн мэдээллээ зөв бөглөөд бүртгүүлнэ үү.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[24px] bg-white p-8 shadow-md space-y-5"
          style={{ border: "1px solid #dbeafe" }}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-base font-extrabold uppercase"
                style={labelStyle}
              >
                Нэр
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={set("first_name")}
                className="h-14 w-full rounded-2xl border px-5 text-base outline-none transition-all"
                style={inputStyle}
                onFocus={activeInputStyle}
                onBlur={normalInputStyle}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-base font-extrabold uppercase"
                style={labelStyle}
              >
                Овог
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={set("last_name")}
                className="h-14 w-full rounded-2xl border px-5 text-base outline-none transition-all"
                style={inputStyle}
                onFocus={activeInputStyle}
                onBlur={normalInputStyle}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-base font-extrabold uppercase"
              style={labelStyle}
            >
              Gmail
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="admin@must.edu.mn"
              className="h-14 w-full rounded-2xl border px-5 text-base outline-none transition-all"
              style={{
                borderColor: "#bfdbfe",
                background: "#eaf2ff",
              }}
              onFocus={activeInputStyle}
              onBlur={normalInputStyle}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-base font-extrabold uppercase"
              style={labelStyle}
            >
              Нууц үг
            </label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="•••"
              className="h-14 w-full rounded-2xl border px-5 text-base outline-none transition-all"
              style={{
                borderColor: "#bfdbfe",
                background: "#eaf2ff",
              }}
              onFocus={activeInputStyle}
              onBlur={normalInputStyle}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-base font-extrabold uppercase"
              style={labelStyle}
            >
              Нууц үг давтах
            </label>
            <input
              type="password"
              value={form.confirm_password}
              onChange={set("confirm_password")}
              placeholder="••••••••"
              className="h-14 w-full rounded-2xl border px-5 text-base outline-none transition-all"
              style={inputStyle}
              onFocus={activeInputStyle}
              onBlur={normalInputStyle}
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="h-14 rounded-2xl px-8 text-base font-semibold text-white shadow-lg transition-all disabled:opacity-60"
              style={{ background: "#4f46e5" }}
            >
              {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
            </button>

            <Link
              to="/team4/login"
              className="flex h-14 items-center justify-center rounded-2xl px-8 text-base font-bold transition-all"
              style={{
                background: "#eef2ff",
                color: "#111827",
                border: "1px solid #dbeafe",
              }}
            >
              Нэвтрэх
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}