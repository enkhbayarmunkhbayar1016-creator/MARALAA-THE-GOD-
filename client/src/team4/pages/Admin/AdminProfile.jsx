import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiEdit3,
  FiLock,
  FiMail,
  FiPhone,
  FiSave,
  FiUser,
  FiX,
  FiBookOpen,
} from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
} from "../Student/api/studentProfileApi";
import { useToast } from "../../components/ui/Toast";

function avatarSrc(picture) {
  if (!picture || picture === "no-image.jpg") return undefined;
  if (/^(https?:)?\/\//i.test(picture)) return picture;
  if (picture.startsWith("data:image/")) return picture;
  return `https://todu.mn/bs/lms/v1/${picture}`;
}

function InputBlock({ label, value, onChange, type = "text", readOnly = false }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-blue-500">
        {label}
      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        readOnly={readOnly}
        className={`h-14 w-full rounded-2xl border px-4 text-sm font-semibold outline-none transition ${
          readOnly
            ? "border-blue-100 bg-blue-50/70 text-blue-400"
            : "border-blue-100 bg-blue-50/60 text-blue-950 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        }`}
      />
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const toast = useToast();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Бүх талбарыг бөглөнө үү.");
      return;
    }

    if (form.newPassword.length < 3) {
      setError("Шинэ нууц үг хамгийн багадаа 3 тэмдэгт байна.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Шинэ нууц үг таарахгүй байна.");
      return;
    }

    try {
      setSaving(true);

      await changeMyPassword(form.currentPassword, form.newPassword);

      toast.success("Нууц үг амжилттай солигдлоо.");
      onClose();
    } catch (err) {
      const msg = err?.message || "Нууц үг солиход алдаа гарлаа.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-blue-950">
              Нууц үг солих
            </h2>
            <p className="mt-1 text-sm font-bold text-blue-500">
              Одоогийн болон шинэ нууц үгээ оруулна уу.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-blue-50 p-3 text-blue-600 hover:bg-blue-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <InputBlock
            label="Одоогийн нууц үг"
            type="password"
            value={form.currentPassword}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, currentPassword: e.target.value }))
            }
          />

          <InputBlock
            label="Шинэ нууц үг"
            type="password"
            value={form.newPassword}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, newPassword: e.target.value }))
            }
          />

          <InputBlock
            label="Шинэ нууц үг давтах"
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
            }
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-black text-blue-700 hover:bg-blue-50"
            >
              Цуцлах
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <FiLock className="h-4 w-4" />
              {saving ? "Солиж байна..." : "Солих"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProfile() {
  const toast = useToast();
  const { school, refreshUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    family_name: "",
    phone: "",
    picture: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyProfile();

        setProfile(data);
        setForm({
          first_name: data?.first_name ?? "",
          last_name: data?.last_name ?? "",
          family_name: data?.family_name ?? "",
          phone: data?.phone ?? "",
          picture: data?.picture ?? "",
        });
      } catch (err) {
        const msg = err?.message || "Профайл ачааллахад алдаа гарлаа.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [toast]);

  function set(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await updateMyProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        family_name: form.family_name,
        phone: form.phone,
        picture: form.picture,
      });

      setProfile((prev) => ({
        ...prev,
        ...form,
      }));

      if (typeof refreshUser === "function") {
        await refreshUser();
      }

      toast.success("Профайл амжилттай хадгалагдлаа.");
    } catch (err) {
      const msg = err?.message || "Профайл хадгалахад алдаа гарлаа.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const fullName =
    [form.last_name, form.first_name].filter(Boolean).join(" ") ||
    profile?.username ||
    profile?.email ||
    "Оюутан";

  const initials = useMemo(() => {
    return (
      fullName
        .split(" ")
        .map((v) => v[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "ST"
    );
  }, [fullName]);

  const src = avatarSrc(form.picture);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 animate-pulse rounded-[34px] bg-white" />
        <div className="h-96 animate-pulse rounded-[34px] bg-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <div className="overflow-hidden rounded-[34px] border border-blue-100 bg-white shadow-sm">
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 px-8 py-10 text-white">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              {src ? (
                <img
                  src={src}
                  alt={fullName}
                  className="h-28 w-28 rounded-[32px] border-4 border-white/30 object-cover shadow-xl"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-[32px] border-4 border-white/30 bg-white/20 text-4xl font-black shadow-xl">
                  {initials}
                </div>
              )}

              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black">
                  <FiBookOpen className="h-4 w-4" />
                  {school?.role?.name || "Оюутан"}
                </p>

                <h1 className="mt-3 text-4xl font-black">{fullName}</h1>

                <p className="mt-2 text-sm font-semibold text-blue-100">
                  @{profile?.username || "username"} · {profile?.email || "email"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/15 px-5 py-4 backdrop-blur">
                <p className="text-xs font-bold text-blue-100">Сургууль</p>
                <p className="mt-1 text-sm font-black">
                  {school?.name || profile?.schools?.[0]?.name || "Сонгогдоогүй"}
                </p>
              </div>

              <div className="rounded-3xl bg-white/15 px-5 py-4 backdrop-blur">
                <p className="text-xs font-bold text-blue-100">Төлөв</p>
                <p className="mt-1 text-sm font-black">Идэвхтэй</p>
              </div>

              <div className="rounded-3xl bg-white/15 px-5 py-4 backdrop-blur">
                <p className="text-xs font-bold text-blue-100">ID</p>
                <p className="mt-1 text-sm font-black">{profile?.id || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-3">
          <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
            <FiMail className="h-6 w-6 text-blue-600" />
            <p className="mt-3 text-xs font-black uppercase tracking-widest text-blue-400">
              И-мэйл
            </p>
            <p className="mt-1 break-all text-sm font-black text-blue-950">
              {profile?.email || "-"}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
            <FiUser className="h-6 w-6 text-blue-600" />
            <p className="mt-3 text-xs font-black uppercase tracking-widest text-blue-400">
              Username
            </p>
            <p className="mt-1 text-sm font-black text-blue-950">
              {profile?.username || "-"}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
            <FiPhone className="h-6 w-6 text-blue-600" />
            <p className="mt-3 text-xs font-black uppercase tracking-widest text-blue-400">
              Утас
            </p>
            <p className="mt-1 text-sm font-black text-blue-950">
              {form.phone || "-"}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-sm"
      >
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-blue-950">
              <FiEdit3 className="h-6 w-6 text-blue-600" />
              Профайл засах
            </h2>
            <p className="mt-1 text-sm font-bold text-blue-500">
              Овог, нэр, утас, зураг зэрэг мэдээллээ шинэчилнэ.
            </p>
          </div>

          <span className="hidden items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-600 sm:inline-flex">
            <FiCheckCircle className="h-4 w-4" />
            Баталгаажсан
          </span>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <InputBlock label="Овог" value={form.last_name} onChange={set("last_name")} />
          <InputBlock label="Нэр" value={form.first_name} onChange={set("first_name")} />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <InputBlock label="И-мэйл" value={profile?.email} readOnly />
          <InputBlock label="Хэрэглэгчийн нэр" value={profile?.username} readOnly />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <InputBlock label="Утас" value={form.phone} onChange={set("phone")} />
          <InputBlock label="Профайл зураг URL" value={form.picture} onChange={set("picture")} />
        </div>

        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => setPasswordOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-7 py-3 text-sm font-black text-blue-700 hover:bg-blue-50"
          >
            <FiLock className="h-4 w-4" />
            Нууц үг солих
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3 text-sm font-black text-white shadow-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <FiSave className="h-4 w-4" />
            {saving ? "Хадгалж байна..." : "Профайл хадгалах"}
          </button>
        </div>
      </form>

      {passwordOpen && (
        <ChangePasswordModal onClose={() => setPasswordOpen(false)} />
      )}
    </div>
  );
}