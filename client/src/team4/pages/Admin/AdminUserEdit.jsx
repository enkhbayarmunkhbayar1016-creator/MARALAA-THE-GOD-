import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiLock } from "react-icons/fi";
import {
  apiGet,
  apiPut,
  apiPost,
  withCurrentUser,
  parseField,
} from "../../utils/api";
import { useAuth } from "../../utils/AuthContext";
import { ROLES } from "../../utils/constants";
import { useToast } from "../../components/ui/Toast";

export default function UserEdit() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { school } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    family_name: "",
    email: "",
    phone: "",
    picture: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [pwForm, setPwForm] = useState({
    new_password: "",
    confirm_password: "",
  });

  const [savingPw, setSavingPw] = useState(false);
  const [targetIsAdmin, setTargetIsAdmin] = useState(false);

  const isSystemAdmin = school?.id === 0;
  const canResetPassword = isSystemAdmin || !targetIsAdmin;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet(`/users/${user_id}`);

        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          family_name: data.family_name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          picture: data.picture ?? "",
        });

        const schools = data.schools ?? [];
        const hasAdmin = schools.some((s) => {
          const role = s.role ?? parseField(s, "role");
          return (s.id === school?.id || s.id === 0) && role?.id === ROLES.ADMIN;
        });

        setTargetIsAdmin(hasAdmin);
      } catch (err) {
        const msg = err.message || "Мэдээлэл ачааллахад алдаа гарлаа.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user_id, school?.id, toast]);

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.first_name.trim()) {
      setError("Нэр заавал бөглөнө үү.");
      return;
    }

    setSaving(true);

    try {
      await apiPut(
        `/users/${user_id}`,
        withCurrentUser({
          first_name: form.first_name,
          last_name: form.last_name,
          family_name: form.family_name,
          email: form.email,
          phone: form.phone,
          picture: form.picture,
        })
      );

      toast.success("Амжилттай хадгалагдлаа.");
      navigate("/team4/users");
    } catch (err) {
      const msg = err.message || "Хадгалахад алдаа гарлаа.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();

    if (!pwForm.new_password) {
      toast.error("Шинэ нууц үг оруулна уу.");
      return;
    }

    if (pwForm.new_password.length < 3) {
      toast.error("Нууц үг хамгийн багадаа 3 тэмдэгт байх ёстой.");
      return;
    }

    if (pwForm.new_password !== pwForm.confirm_password) {
      toast.error("Нууц үг таарахгүй байна.");
      return;
    }

    setSavingPw(true);

    try {
      await apiPost(
        `/users/${user_id}/password`,
        withCurrentUser({
          new_password: pwForm.new_password,
        })
      );

      toast.success("Нууц үг амжилттай солигдлоо.");
      setPwForm({ new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err.message || "Нууц үг солиход алдаа гарлаа.");
    } finally {
      setSavingPw(false);
    }
  }

  const inputClass =
    "h-13 w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-4 text-sm font-semibold text-blue-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

  const labelClass = "text-sm font-black uppercase tracking-wider text-blue-500";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/team4/users")}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm hover:bg-blue-50"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-3xl font-black text-blue-950">
            Хэрэглэгч засах
          </h1>
          <p className="mt-1 text-sm font-bold text-blue-500">ID: {user_id}</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-blue-100 bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-black text-blue-950">Мэдээлэл засах</h2>
        <p className="mt-1 text-sm font-bold text-blue-500">
          Шаардлагатай талбаруудыг өөрчилнө үү.
        </p>

        {loading ? (
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-blue-50" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass}>Овог</label>
                <input
                  value={form.last_name}
                  onChange={set("last_name")}
                  placeholder="Овог"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Нэр *</label>
                <input
                  value={form.first_name}
                  onChange={set("first_name")}
                  placeholder="Нэр"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Ургийн овог</label>
              <input
                value={form.family_name}
                onChange={set("family_name")}
                placeholder="Ургийн овог"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Имэйл</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="user@example.com"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Утас</label>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="99001122"
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <FiSave className="h-4 w-4" />
                Хадгалах
              </button>

              <button
                type="button"
                onClick={() => navigate("/team4/users")}
                className="h-13 rounded-2xl border border-blue-100 bg-white px-6 text-sm font-black text-blue-700 hover:bg-blue-50"
              >
                Цуцлах
              </button>
            </div>
          </form>
        )}
      </div>

      {!loading && !error && canResetPassword && (
        <div className="rounded-[32px] border border-blue-100 bg-white p-7 shadow-sm">
          <h2 className="flex items-center gap-2 text-2xl font-black text-blue-950">
            <FiLock className="h-5 w-5" />
            Нууц үг шинэчлэх
          </h2>

          <p className="mt-1 text-sm font-bold text-blue-500">
            Хэрэглэгчийн нууц үгийг шинээр тохируулна.
          </p>

          <form onSubmit={handlePasswordReset} className="mt-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass}>Шинэ нууц үг *</label>
                <input
                  type="password"
                  value={pwForm.new_password}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, new_password: e.target.value }))
                  }
                  placeholder="••••••"
                  required
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Нууц үг давтах *</label>
                <input
                  type="password"
                  value={pwForm.confirm_password}
                  onChange={(e) =>
                    setPwForm((f) => ({
                      ...f,
                      confirm_password: e.target.value,
                    }))
                  }
                  placeholder="••••••"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPw}
              className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {savingPw && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <FiLock className="h-4 w-4" />
              Нууц үг солих
            </button>
          </form>
        </div>
      )}
    </div>
  );
}