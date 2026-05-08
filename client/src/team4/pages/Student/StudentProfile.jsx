import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiEdit2,
  FiLock,
  FiMail,
  FiPhone,
  FiSave,
  FiShield,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import { apiGet, apiPut, withCurrentUser } from "../../utils/api";
import {
  changeMyPassword,
  deleteMyAccount,
} from "./api/studentProfileApi";
import { useToast } from "../../components/ui/Toast";

function toDisplayName(profile) {
  const fullName = [profile?.last_name, profile?.first_name]
    .filter((name) => name && name !== "-")
    .join(" ")
    .trim();

  return fullName || profile?.username || profile?.email || "Оюутан";
}

function toAvatarSource(picture) {
  if (!picture || picture === "no-image.jpg") return "";
  if (/^(https?:)?\/\//i.test(picture)) return picture;
  if (picture.startsWith("data:image/")) return picture;
  return `https://todu.mn/bs/lms/v1/${picture}`;
}

function toInitials(profile) {
  const first = profile?.first_name?.[0] ?? "";
  const last = profile?.last_name?.[0] ?? "";
  return `${last}${first}`.trim().toUpperCase() || "ST";
}

function InputBlock({ label, value, onChange, type = "text", readOnly = false }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-blue-600">
        {label}
      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        readOnly={readOnly}
        className={`h-14 w-full rounded-2xl border px-4 text-sm font-semibold outline-none transition ${
          readOnly
            ? "border-blue-100 bg-blue-50/70 text-slate-900"
            : "border-blue-200 bg-white text-slate-950 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        }`}
      />
    </div>
  );
}

function ChangePasswordModal({ onClose, onSuccess }) {
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
      setError("Шинэ нууц үг болон давтан нууц үг таарахгүй байна.");
      return;
    }

    setSaving(true);

    try {
      await changeMyPassword(form.currentPassword, form.newPassword);
      toast.success("Нууц үг амжилттай солигдлоо.");
      onSuccess?.("Нууц үг амжилттай солигдлоо.");
      onClose();
    } catch (err) {
      const msg = err?.message || "Нууц үг солих үед алдаа гарлаа.";
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
            <h2 className="text-2xl font-black text-slate-950">
              Нууц үг солих
            </h2>
            <p className="mt-1 text-sm font-bold text-blue-600">
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

function DeleteAccountModal({ onClose, onDelete, loading }) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-red-700">
              Бүртгэл устгах
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Устгасны дараа буцаах боломжгүй.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-red-50 p-3 text-red-600 hover:bg-red-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          <div className="flex gap-2">
            <FiAlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>
              Баталгаажуулахын тулд <b>DELETE</b> гэж бичнэ үү.
            </span>
          </div>
        </div>

        <div className="mt-5">
          <InputBlock
            label="Баталгаажуулах үг"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
          >
            Цуцлах
          </button>

          <button
            type="button"
            disabled={loading || confirmText.trim().toUpperCase() !== "DELETE"}
            onClick={() => onDelete(confirmText)}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50"
          >
            <FiTrash2 className="h-4 w-4" />
            {loading ? "Устгаж байна..." : "Устгах"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { logout, school, refreshUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    family_name: "",
    email: "",
    username: "",
    phone: "",
    picture: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await apiGet("/users/me");

        setProfile(data);

        setForm({
          first_name: data?.first_name ?? "",
          last_name: data?.last_name ?? "",
          family_name: data?.family_name ?? "",
          email: data?.email ?? "",
          username: data?.username ?? "",
          phone: data?.phone ?? "",
          picture: data?.picture ?? "",
        });
      } catch (error) {
        const msg =
          error?.message || "Профайл мэдээлэл ачааллахад алдаа гарлаа.";
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [toast]);

  const currentSchool =
    school || (profile?.schools?.length ? profile.schools[0] : null);

  const previewProfile = {
    ...profile,
    ...form,
  };

  const displayName = toDisplayName(previewProfile);
  const avatarSource = toAvatarSource(previewProfile?.picture);
  const initials = toInitials(previewProfile);

  const roleName = currentSchool?.role?.name || "Оюутан";

  const fullMeta = useMemo(() => {
    return [
      {
        icon: <FiMail className="h-6 w-6 text-blue-600" />,
        label: "И-мэйл",
        value: previewProfile?.email || "-",
      },
      {
        icon: <FiUser className="h-6 w-6 text-blue-600" />,
        label: "Username",
        value: previewProfile?.username || `ID-${previewProfile?.id || "-"}`,
      },
      {
        icon: <FiPhone className="h-6 w-6 text-blue-600" />,
        label: "Утас",
        value: previewProfile?.phone || "Бүртгэгдээгүй",
      },
    ];
  }, [previewProfile]);

  function set(key) {
    return (e) =>
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setSaving(true);

    try {
      await apiPut(
        "/users/me",
        withCurrentUser({
          first_name: form.first_name,
          last_name: form.last_name,
          family_name: form.family_name,
          phone: form.phone,
          picture: form.picture,
        })
      );

      setProfile((prev) => ({
        ...prev,
        ...form,
      }));

      if (typeof refreshUser === "function") {
        await refreshUser();
      }

      const msg = "Профайл амжилттай хадгалагдлаа.";
      setSuccessMessage(msg);
      toast.success(msg);
    } catch (error) {
      console.error("STUDENT PROFILE SAVE ERROR:", error);
      const msg = error?.message || "Профайл хадгалах үед алдаа гарлаа.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount(confirmText) {
    setErrorMessage("");
    setSuccessMessage("");

    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setErrorMessage("Бүртгэл устгахын тулд DELETE гэж бичнэ үү.");
      return;
    }

    setIsDeletingAccount(true);

    try {
      await deleteMyAccount();
      toast.success("Бүртгэл амжилттай устгагдлаа.");
      await logout();
    } catch (error) {
      const msg = error?.message || "Бүртгэл устгах үед алдаа гарлаа.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsDeletingAccount(false);
    }
  }

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
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-[34px] border border-blue-100 bg-white shadow-sm">
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 px-8 py-10 text-white">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15" />
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/15" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              {avatarSource ? (
                <img
                  src={avatarSource}
                  alt={displayName}
                  className="h-28 w-28 rounded-[32px] border-4 border-white/40 object-cover shadow-xl"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-[32px] border-4 border-white/40 bg-white/20 text-4xl font-black shadow-xl">
                  {initials}
                </div>
              )}

              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black">
                  <FiShield className="h-4 w-4" />
                  {roleName}
                </p>

                <h1 className="mt-3 text-4xl font-black">{displayName}</h1>

                <p className="mt-2 text-sm font-semibold text-blue-50">
                  @{previewProfile?.username || "username"} ·{" "}
                  {previewProfile?.email || "email"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/20 px-5 py-4 backdrop-blur">
                <p className="text-xs font-bold text-blue-50">Сургууль</p>
                <p className="mt-1 text-sm font-black">
                  {currentSchool?.name ||
                    "Мэдээлэл, Холбооны Технологийн Сургууль"}
                </p>
              </div>

              <div className="rounded-3xl bg-white/20 px-5 py-4 backdrop-blur">
                <p className="text-xs font-bold text-blue-50">Төлөв</p>
                <p className="mt-1 text-sm font-black">Идэвхтэй</p>
              </div>

              <div className="rounded-3xl bg-white/20 px-5 py-4 backdrop-blur">
                <p className="text-xs font-bold text-blue-50">ID</p>
                <p className="mt-1 text-sm font-black">
                  {previewProfile?.id || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-3">
          {fullMeta.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5"
            >
              {item.icon}
              <p className="mt-3 text-xs font-black uppercase tracking-widest text-blue-500">
                {item.label}
              </p>
              <p className="mt-1 break-all text-sm font-black text-slate-950">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-sm"
      >
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
              <FiEdit2 className="h-6 w-6 text-blue-600" />
              Профайл засах
            </h2>

            <p className="mt-1 text-sm font-bold text-blue-600">
              Овог, нэр, утас, зураг зэрэг мэдээллээ шинэчилнэ.
            </p>
          </div>

          <span className="hidden items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-600 sm:inline-flex">
            <FiCheckCircle className="h-4 w-4" />
            Баталгаажсан
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <InputBlock label="Овог" value={form.last_name} onChange={set("last_name")} />
          <InputBlock label="Нэр" value={form.first_name} onChange={set("first_name")} />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <InputBlock label="И-мэйл" value={form.email} readOnly />
          <InputBlock label="Хэрэглэгчийн нэр" value={form.username} readOnly />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <InputBlock label="Утас" value={form.phone} onChange={set("phone")} />
          <InputBlock
            label="Профайл зураг URL"
            value={form.picture}
            onChange={set("picture")}
          />
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
        <ChangePasswordModal
          onClose={() => setPasswordOpen(false)}
          onSuccess={setSuccessMessage}
        />
      )}

      {deleteOpen && (
        <DeleteAccountModal
          onClose={() => setDeleteOpen(false)}
          loading={isDeletingAccount}
          onDelete={handleDeleteAccount}
        />
      )}
    </div>
  );
}