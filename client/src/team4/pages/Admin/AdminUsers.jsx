import { useEffect, useMemo, useState } from "react";
import {
  FiEye,
  FiEdit2,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiX,
  FiSave,
  FiAlertTriangle,
  FiClock,
  FiCheck,
  FiXCircle,
  FiSliders,
} from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import {
  apiGet,
  apiDelete,
  apiPut,
  apiPost,
  withCurrentUser,
} from "../../utils/api";
import { useToast } from "../../components/ui/Toast";
import { Pagination } from "../../components/ui/Pagination";

function unwrapItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.requests)) return data.requests;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getSchoolId(school) {
  return school?.id ?? school?.school_id ?? school?.SCHOOL_ID ?? school?.ID ?? null;
}

function getUserId(user) {
  return user?.id ?? user?.user_id ?? user?.USER_ID ?? user?.user?.id ?? null;
}

function belongsToSchool(user, schoolId) {
  const schools = user?.schools || user?.school_roles || user?.user_schools || [];
  if (!Array.isArray(schools)) return true;

  return schools.some((s) => {
    const sid = s?.id ?? s?.school_id ?? s?.SCHOOL_ID ?? s?.school?.id;
    return String(sid) === String(schoolId);
  });
}

function getRoleName(user, currentSchoolId) {
  const schools = user?.schools || user?.school_roles || user?.user_schools || [];

  const matchedSchool = Array.isArray(schools)
    ? schools.find((s) => {
        const sid = s?.id ?? s?.school_id ?? s?.SCHOOL_ID ?? s?.school?.id;
        return String(sid) === String(currentSchoolId);
      })
    : null;

  const role =
    matchedSchool?.roles?.[0] ||
    matchedSchool?.role ||
    matchedSchool?.roles ||
    user?.role ||
    user?.role_name ||
    user?.ROLE_NAME;

  return role?.name || role?.role_name || role?.ROLE_NAME || role || "-";
}

function normalizeRole(roleName) {
  const n = String(roleName || "").toLowerCase();
  if (n === "админ" || n === "admin") return "admin";
  if (n === "сургагч" || n === "teacher" || n === "багш") return "teacher";
  if (n === "суралцагч" || n === "student" || n === "оюутан") return "student";
  return n;
}

function getInitials(user) {
  return (
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map((s) => s[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "?"
  );
}

function getFullName(user) {
  return [user?.last_name, user?.first_name].filter(Boolean).join(" ") || user?.username || "-";
}

function pictureUrl(picture) {
  if (!picture || picture === "no-image.jpg") return null;
  if (/^(https?:)?\/\//i.test(picture)) return picture;
  return `https://todu.mn/bs/lms/v1/${picture}`;
}

function RoleBadge({ roleName }) {
  const role = normalizeRole(roleName);
  const styles = {
    admin: "bg-blue-600 text-white",
    teacher: "bg-blue-100 text-blue-700",
    student: "bg-sky-100 text-sky-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${styles[role] || "bg-slate-100 text-slate-600"}`}>
      {roleName || "-"}
    </span>
  );
}

function StatusBadge({ isActive }) {
  const active = Number(isActive ?? 1) === 1;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
      {active ? "Идэвхтэй" : "Идэвхгүй"}
    </span>
  );
}

function UserAvatar({ user, size = "md" }) {
  const src = pictureUrl(user?.picture);
  const [failed, setFailed] = useState(false);
  const sizeClass = size === "lg" ? "h-20 w-20 text-2xl" : "h-12 w-12 text-sm";

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        className={`${sizeClass} shrink-0 rounded-2xl object-cover`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-2xl bg-blue-50 font-black text-blue-600`}>
      {getInitials(user)}
    </div>
  );
}

function Modal({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-base font-black text-blue-950">{value || "-"}</p>
    </div>
  );
}

function InfoMini({ label, value }) {
  return (
    <div className="rounded-2xl bg-blue-50/70 p-4">
      <p className="text-xs font-bold text-blue-400">{label}</p>
      <p className="mt-1 break-all font-black text-blue-950">{value || "-"}</p>
    </div>
  );
}

function getCurrentUserValue(user) {
  return (
    user?.username ||
    user?.email ||
    localStorage.getItem("team4_username") ||
    localStorage.getItem("username") ||
    localStorage.getItem("current_user") ||
    "schooladmin"
  );
}

function ViewUserModal({ user, onClose, onEdit }) {
  return (
    <Modal>
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-400 px-7 py-7 text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-2xl bg-white/20 p-2 hover:bg-white/30"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-5 pr-12">
          <UserAvatar user={user} size="lg" />
          <div>
            <h2 className="text-3xl font-black">{getFullName(user)}</h2>
            <p className="mt-1 text-blue-100">@{user.username || "-"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <RoleBadge roleName={user.roleName} />
              <StatusBadge isActive={user.is_active} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoBox icon={FiUser} label="Овог" value={user.last_name} />
          <InfoBox icon={FiUser} label="Нэр" value={user.first_name} />
          <InfoBox icon={FiMail} label="Имэйл" value={user.email} />
          <InfoBox icon={FiUser} label="Username" value={user.username} />
          <InfoBox icon={FiPhone} label="Утас" value={user.phone} />
          <InfoBox icon={FiShield} label="Эрх" value={user.roleName} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-black text-blue-700 hover:bg-blue-50"
          >
            Хаах
          </button>

          <button
            type="button"
            onClick={() => onEdit(user)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
          >
            <FiEdit2 className="h-4 w-4" />
            Засах
          </button>
        </div>
      </div>
    </Modal>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    family_name: user?.family_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    picture: user?.picture || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.first_name.trim()) {
      setError("Нэр заавал бөглөнө үү.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await apiPut(
        `/users/${user.id}`,
        withCurrentUser({
          first_name: form.first_name,
          last_name: form.last_name,
          family_name: form.family_name,
          email: form.email,
          phone: form.phone,
          picture: form.picture,
        })
      );

      toast.success("Хэрэглэгчийн мэдээлэл шинэчлэгдлээ.");
      onSaved({ ...user, ...form });
    } catch (err) {
      const msg = err.message || "Хадгалахад алдаа гарлаа.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-14 w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-4 text-sm font-semibold text-blue-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";
  const labelClass = "text-xs font-black uppercase tracking-widest text-blue-500";

  return (
    <Modal>
      <div className="flex items-center justify-between border-b border-blue-100 px-7 py-5">
        <div>
          <h2 className="text-2xl font-black text-blue-950">Хэрэглэгч засах</h2>
          <p className="mt-1 text-sm font-bold text-blue-500">{getFullName(user)}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-blue-50 p-3 text-blue-600 hover:bg-blue-100"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-7">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass}>Овог</label>
            <input value={form.last_name} onChange={set("last_name")} className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Нэр *</label>
            <input value={form.first_name} onChange={set("first_name")} className={inputClass} required />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Ургийн овог</label>
          <input value={form.family_name} onChange={set("family_name")} className={inputClass} />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Имэйл</label>
          <input type="email" value={form.email} onChange={set("email")} className={inputClass} />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Утас</label>
          <input value={form.phone} onChange={set("phone")} className={inputClass} />
        </div>

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
            <FiSave className="h-4 w-4" />
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteUserModal({ user, loading, onClose, onConfirm }) {
  return (
    <Modal>
      <div className="p-7">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
          <FiAlertTriangle className="h-8 w-8" />
        </div>

        <h2 className="mt-5 text-center text-2xl font-black text-slate-950">
          Хэрэглэгч устгах уу?
        </h2>

        <p className="mx-auto mt-2 max-w-md text-center text-sm font-semibold leading-6 text-slate-500">
          <b>{getFullName(user)}</b> хэрэглэгчийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.
        </p>

        <div className="mt-7 flex justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            Цуцлах
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl bg-red-600 px-6 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Устгаж байна..." : "Устгах"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CreateUserModal({ school, onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    role_id: "3",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.first_name.trim()) return setError("Нэр оруулна уу.");
    if (!form.email.trim()) return setError("Имэйл оруулна уу.");
    if (!form.username.trim()) return setError("Username оруулна уу.");
    if (!form.password.trim()) return setError("Нууц үг оруулна уу.");

    setSaving(true);
    setError("");

    try {
      const created = await apiPost(
        "/users",
        withCurrentUser({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          username: form.username,
          phone: form.phone,
          password: form.password,
        })
      );

      const userId = created?.id || created?.user_id || created?.data?.id || created?.data?.user_id;
      const schoolId = getSchoolId(school);

      if (userId && schoolId) {
        await apiPost(
          `/schools/${schoolId}/users`,
          withCurrentUser({
            user_id: userId,
            role_id: Number(form.role_id),
          })
        ).catch(() => {});
      }

      toast.success("Хэрэглэгч амжилттай нэмэгдлээ.");

      onCreated({
        ...created,
        id: userId,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        username: form.username,
        phone: form.phone,
        is_active: 1,
        roleName:
          form.role_id === "1" ? "Админ" : form.role_id === "2" ? "Багш" : "Суралцагч",
      });
    } catch (err) {
      const msg = err.message || "Хэрэглэгч нэмэхэд алдаа гарлаа.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-14 w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-4 text-sm font-semibold text-blue-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";
  const labelClass = "text-xs font-black uppercase tracking-widest text-blue-500";

  return (
    <Modal>
      <div className="flex items-center justify-between border-b border-blue-100 px-7 py-5">
        <div>
          <h2 className="text-2xl font-black text-blue-950">Хэрэглэгч нэмэх</h2>
          <p className="mt-1 text-sm font-bold text-blue-500">
            Шинэ хэрэглэгчийн мэдээллийг бөглөнө үү.
          </p>
        </div>

        <button type="button" onClick={onClose} className="rounded-2xl bg-blue-50 p-3 text-blue-600 hover:bg-blue-100">
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-7">
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass}>Овог</label>
            <input value={form.last_name} onChange={set("last_name")} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Нэр *</label>
            <input value={form.first_name} onChange={set("first_name")} className={inputClass} required />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Имэйл *</label>
          <input type="email" value={form.email} onChange={set("email")} className={inputClass} required />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass}>Username *</label>
            <input value={form.username} onChange={set("username")} className={inputClass} required />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Утас</label>
            <input value={form.phone} onChange={set("phone")} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className={labelClass}>Нууц үг *</label>
            <input type="password" value={form.password} onChange={set("password")} className={inputClass} required />
          </div>
          <div className="space-y-2">
            <label className={labelClass}>Эрх</label>
            <select value={form.role_id} onChange={set("role_id")} className={inputClass}>
              <option value="1">Админ</option>
              <option value="2">Багш</option>
              <option value="3">Суралцагч</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-black text-blue-700 hover:bg-blue-50">
            Цуцлах
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60">
            <FiPlus className="h-4 w-4" />
            {saving ? "Нэмж байна..." : "Нэмэх"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RequestSection({ title, icon: Icon, emptyText, children }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;

  return (
    <div className="rounded-3xl border border-blue-100 bg-blue-50/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-black text-blue-950">{title}</h3>
      </div>

      {Array.isArray(items) && items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-white px-4 py-10 text-center text-sm font-bold text-blue-500">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-4">{items}</div>
      )}
    </div>
  );
}

function RoleRequestCard({ request, working, getRoleLabel, onApprove, onReject }) {
  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="text-lg font-black text-blue-950">
            {request.user_name || request.full_name || request.username || `Хэрэглэгч #${request.user_id || "-"}`}
          </h4>
          <p className="mt-1 text-sm font-semibold text-blue-500">
            Хүсэлт ID: {request.id} · user_id: {request.user_id || request.created_by || "-"}
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          Хүлээгдэж байна
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InfoMini label="Хүссэн эрх" value={getRoleLabel(request.role_id)} />
        <InfoMini label="Имэйл" value={request.email || request.user?.email || "-"} />
        <InfoMini label="Username" value={request.username || request.user?.username || "-"} />
        <InfoMini label="Утас" value={request.phone || request.user?.phone || "-"} />
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-blue-100 bg-white px-4 py-3">
        <p className="text-xs font-bold text-blue-400">Тайлбар</p>
        <p className="mt-1 text-sm font-semibold text-blue-950">
          {request.description || "Тайлбар оруулаагүй"}
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <button type="button" onClick={onApprove} disabled={working} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60">
          <FiCheck className="h-4 w-4" />
          {working ? "Илгээж байна..." : "Зөвшөөрөх"}
        </button>

        <button type="button" onClick={onReject} disabled={working} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-60">
          <FiXCircle className="h-4 w-4" />
          Татгалзах
        </button>
      </div>
    </div>
  );
}

function RoleManagementTopPanel({ school }) {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const { user: authUser } = useAuth();
  const [schoolRequests, setSchoolRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [approveRequest, setApproveRequest] = useState(null);
  const [userCode, setUserCode] = useState("");

  const schoolId = getSchoolId(school);

  function getRoleLabel(roleId) {
    if (Number(roleId) === 10 || Number(roleId) === 1) return "Админ";
    if (Number(roleId) === 20 || Number(roleId) === 2) return "Багш";
    if (Number(roleId) === 30 || Number(roleId) === 3) return "Суралцагч";
    return `Эрх #${roleId || "-"}`;
  }

  function normalizeRoleId(roleId) {
    if (Number(roleId) === 10) return 1;
    if (Number(roleId) === 20) return 2;
    if (Number(roleId) === 30) return 3;
    return Number(roleId);
  }

  function isTeacherRequest(request) {
    return normalizeRoleId(request?.role_id) === 2;
  }

  function isStudentRequest(request) {
    return normalizeRoleId(request?.role_id) === 3;
  }

  function needsCode(request) {
    return isTeacherRequest(request) || isStudentRequest(request);
  }

  function getCodeLabel(request) {
    if (isTeacherRequest(request)) return "Багшийн код";
    if (isStudentRequest(request)) return "Оюутны код";
    return "Код";
  }

  function getCodePlaceholder(request) {
    if (isTeacherRequest(request)) return "Жишээ: T240001";
    if (isStudentRequest(request)) return "Жишээ: B232270000";
    return "Код оруулна уу";
  }

async function loadSchoolRequests() {
  try {
    const res = await apiGet("/school-requests");
    return unwrapItems(res);
  } catch (err) {
    console.error("loadSchoolRequests error:", err);
    return [];
  }
}

  async function loadData() {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [requestRes, schoolReqs] = await Promise.all([
        apiGet(`/schools/${schoolId}/requests`).catch(() => ({ items: [] })),
        loadSchoolRequests(),
      ]);

      const requestItems = unwrapItems(requestRes);

      const enrichedRequests = await Promise.all(
        requestItems.map(async (request) => {
          const userId =
            request?.user_id ||
            request?.created_by ||
            request?.user?.id ||
            request?.user?.user_id;

          if (!userId) return request;

          try {
            const userData = await apiGet(`/users/${userId}`);

            return {
              ...request,
              user: userData,
              user_name:
                [userData?.last_name, userData?.first_name].filter(Boolean).join(" ") ||
                userData?.username ||
                `Хэрэглэгч #${userId}`,
              email: userData?.email,
              username: userData?.username,
              phone: userData?.phone,
            };
          } catch {
            return request;
          }
        })
      );

      setRequests(enrichedRequests);
      setSchoolRequests(Array.isArray(schoolReqs) ? schoolReqs : []);
    } catch (err) {
      toast.error(err.message || "Хүсэлтийн мэдээлэл авахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const pendingRequests = requests.filter(
    (r) => Number(r.status_id ?? r.status ?? 10) === 10
  );

  const pendingSchoolRequests = schoolRequests.filter((r) => {
    const status = Number(r.status_id ?? r.status ?? r.request_status_id ?? 10);
    return status === 10;
  });

  function openApproveModal(request) {
    setApproveRequest(request);

    if (needsCode(request)) {
      setUserCode(request.username || request.user?.username || "");
    } else {
      setUserCode("");
    }
  }

  async function approveRoleRequest() {
  if (!schoolId || !approveRequest?.id) return;

  const request = approveRequest;
  const requestId = request.id;

  const userId =
    request?.user_id ||
    request?.created_by ||
    request?.user?.id ||
    request?.user?.user_id;

  const roleId = normalizeRoleId(request.role_id);
  const code = userCode.trim();

  if (!userId) {
    toast.error("Хэрэглэгчийн ID олдсонгүй.");
    return;
  }

  if ((roleId === 2 || roleId === 3) && !code) {
    toast.error(roleId === 2 ? "Багшийн код оруулна уу." : "Оюутны код оруулна уу.");
    return;
  }

  try {
    setWorkingId(requestId);

    const payload = withCurrentUser({
      user_id: Number(userId),
      role_id: roleId,
      status_id: 20,

      // багш/оюутны код
      username: code || undefined,
      code: code || undefined,
      teacher_code: roleId === 2 ? code : undefined,
      student_code: roleId === 3 ? code : undefined,
    });

    await apiPost(`/schools/${schoolId}/requests/${requestId}`, payload);

    setRequests((prev) =>
      prev.map((item) =>
        item.id === requestId
          ? {
              ...item,
              status_id: 20,
              status: 20,
              username: code || item.username,
            }
          : item
      )
    );

    toast.success(
      roleId === 2
        ? "Багшийн код олгож хүсэлтийг зөвшөөрлөө."
        : roleId === 3
          ? "Оюутны код олгож хүсэлтийг зөвшөөрлөө."
          : "Хүсэлтийг зөвшөөрлөө."
    );

    setApproveRequest(null);
    setUserCode("");
  } catch (err) {
    toast.error(err.message || "Хүсэлтийг зөвшөөрөхөд алдаа гарлаа.");
  } finally {
    setWorkingId(null);
  }
}
  async function rejectRoleRequest(request) {
    if (!schoolId || !request?.id) return;

    try {
      setWorkingId(request.id);
      await apiDelete(`/schools/${schoolId}/requests/${request.id}`);

      setRequests((prev) =>
        prev.map((item) =>
          item.id === request.id ? { ...item, status_id: 30, status: 30 } : item
        )
      );

      toast.success("Хүсэлт татгалзагдлаа.");
    } catch (err) {
      toast.error(err.message || "Хүсэлтийг татгалзахад алдаа гарлаа.");
    } finally {
      setWorkingId(null);
    }
  }

 async function approveSchoolRequest(request) {
  const requestId = request?.id ?? request?.request_id;

  const currentUser =
    authUser?.id ||
    authUser?.user_id ||
    authUser?.USER_ID ||
    localStorage.getItem("team4_user_id") ||
    localStorage.getItem("user_id") ||
    localStorage.getItem("current_user");

  if (!requestId) {
    toast.error("Сургуулийн хүсэлтийн ID олдсонгүй.");
    return;
  }

  if (!currentUser) {
    toast.error("Нэвтэрсэн хэрэглэгчийн ID олдсонгүй.");
    return;
  }

  try {
    setWorkingId(`school-${requestId}`);

    await apiPost(`/school-requests/${requestId}/approve`, {
      current_user: String(currentUser),
    });

    setSchoolRequests((prev) =>
      prev.filter(
        (item) => String(item.id ?? item.request_id) !== String(requestId)
      )
    );

    toast.success("Сургууль нэмэх хүсэлт зөвшөөрөгдлөө.");
  } catch (err) {
    console.error("approveSchoolRequest error:", err);
    toast.error(err.message || "Сургууль зөвшөөрөхөд алдаа гарлаа.");
  } finally {
    setWorkingId(null);
  }
}


async function rejectSchoolRequest(request) {
  const requestId = request?.id ?? request?.request_id;

  if (!requestId) {
    toast.error("Сургуулийн хүсэлтийн ID олдсонгүй.");
    return;
  }

  try {
    setWorkingId(`school-${requestId}`);

await apiPost(`/school-requests/${requestId}/reject`, {
  current_user: String(getCurrentUserValue(user)),
  rejection_reason: "Админ татгалзсан",
});

    setSchoolRequests((prev) =>
      prev.filter(
        (item) => String(item.id ?? item.request_id) !== String(requestId)
      )
    );

    toast.success("Сургууль нэмэх хүсэлт татгалзагдлаа.");
  } catch (err) {
    console.error("rejectSchoolRequest error:", err);
    toast.error(err.message || "Сургууль нэмэх хүсэлтийг татгалзахад алдаа гарлаа.");
  } finally {
    setWorkingId(null);
  }
}

  return (
    <>
      <div className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-white">
              <FiSliders className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-blue-950">Эрхийн удирдлага</h2>
              <p className="mt-1 text-sm font-semibold text-blue-500">
                Эрхийн хүсэлт болон сургууль нэмэх хүсэлтийг удирдана.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50 px-5 py-3 text-sm font-black text-blue-700">
            {pendingRequests.length + pendingSchoolRequests.length} хүлээгдэж буй хүсэлт
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-3xl bg-blue-50" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5">
            <RequestSection
              title="Эрхийн хүсэлтүүд"
              icon={FiClock}
              emptyText="Хүлээгдэж буй эрхийн хүсэлт байхгүй байна."
            >
              {pendingRequests.map((request) => (
                <RoleRequestCard
                  key={request.id}
                  request={request}
                  working={workingId === request.id}
                  getRoleLabel={getRoleLabel}
                  onApprove={() => openApproveModal(request)}
                  onReject={() => rejectRoleRequest(request)}
                />
              ))}
            </RequestSection>

            <RequestSection
              title="Сургууль нэмэх хүсэлтүүд"
              icon={FiPlus}
              emptyText="Хүлээгдэж буй сургууль нэмэх хүсэлт байхгүй байна."
            >
              {pendingSchoolRequests.map((request) => {
                const requestId = request?.id ?? request?.request_id;
                const working = workingId === `school-${requestId}`;

                return (
                  <div
                    key={requestId}
                    className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-lg font-black text-blue-950">
                          {request.school_name || request.name || request.title || "Шинэ сургууль"}
                        </h4>
                        <p className="mt-1 text-sm font-semibold text-blue-500">
                          Хүсэлт ID: {requestId}
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                        Хүлээгдэж байна
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <InfoMini label="Сургуулийн нэр" value={request.school_name || request.name || "-"} />
                      <InfoMini label="Имэйл" value={request.email || request.admin_email || "-"} />
                      <InfoMini label="Username" value={request.username || request.admin_username || "-"} />
                      <InfoMini label="Утас" value={request.phone || request.admin_phone || "-"} />
                    </div>

                    <div className="mt-4 rounded-2xl border border-dashed border-blue-100 bg-white px-4 py-3">
                      <p className="text-xs font-bold text-blue-400">Тайлбар</p>
                      <p className="mt-1 text-sm font-semibold text-blue-950">
                        {request.description || "Тайлбар оруулаагүй"}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => approveSchoolRequest(request)}
                        disabled={working}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        <FiCheck className="h-4 w-4" />
                        {working ? "Илгээж байна..." : "Сургууль зөвшөөрөх"}
                      </button>

                      <button
                        type="button"
                        onClick={() => rejectSchoolRequest(request)}
                        disabled={working}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <FiXCircle className="h-4 w-4" />
                        Татгалзах
                      </button>
                    </div>
                  </div>
                );
              })}
            </RequestSection>
          </div>
        )}
      </div>

      {approveRequest && (
        <Modal>
          <div className="flex items-center justify-between border-b border-blue-100 px-7 py-5">
            <div>
              <h2 className="text-2xl font-black text-blue-950">Хүсэлт зөвшөөрөх</h2>
              <p className="mt-1 text-sm font-bold text-blue-500">
                {approveRequest.user_name || approveRequest.username || "Хэрэглэгч"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setApproveRequest(null);
                setUserCode("");
              }}
              className="rounded-2xl bg-blue-50 p-3 text-blue-600 hover:bg-blue-100"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5 p-7">
            <div className="rounded-2xl bg-blue-50/70 p-4">
              <p className="text-xs font-bold text-blue-400">Хүссэн эрх</p>
              <p className="mt-1 font-black text-blue-950">
                {getRoleLabel(approveRequest.role_id)}
              </p>
            </div>

            {needsCode(approveRequest) && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-blue-500">
                  {getCodeLabel(approveRequest)}
                </label>

                <input
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder={getCodePlaceholder(approveRequest)}
                  className="h-14 w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-4 text-sm font-semibold text-blue-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setApproveRequest(null);
                  setUserCode("");
                }}
                className="rounded-2xl border border-blue-100 bg-white px-5 py-3 text-sm font-black text-blue-700 hover:bg-blue-50"
              >
                Цуцлах
              </button>

              <button
                type="button"
                onClick={approveRoleRequest}
                disabled={workingId === approveRequest.id}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <FiCheck className="h-4 w-4" />
                {workingId === approveRequest.id ? "Зөвшөөрч байна..." : "Зөвшөөрөх"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default function UserList() {
  const { school, isAdmin, isTeacher } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [deletingId, setDeletingId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    const schoolId = getSchoolId(school);

    if (schoolId == null) {
      setLoading(false);
      setError("Сургууль сонгогдоогүй байна.");
      toast.warning("Сургууль сонгогдоогүй байна.");
      return;
    }

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        let schoolUsers = [];

        try {
          const schoolUsersRes = await apiGet(`/schools/${schoolId}/users?limit=10000`);
          schoolUsers = unwrapItems(schoolUsersRes);
        } catch {
          schoolUsers = [];
        }

        if (schoolUsers.length === 0) {
          const allUsersRes = await apiGet("/users?limit=10000").catch(() => ({ items: [] }));
          schoolUsers = unwrapItems(allUsersRes).filter((u) => belongsToSchool(u, schoolId));
        }

        const enrichedUsers = schoolUsers.map((user) => ({
          ...user,
          id: getUserId(user),
          roleName: getRoleName(user, schoolId),
        }));

        setUsers(enrichedUsers);
      } catch (err) {
        const msg = err.message || "Хэрэглэгчдийн мэдээлэл авахад алдаа гарлаа.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [school, toast]);

  async function confirmDeleteUser() {
    const schoolId = getSchoolId(school);

    if (schoolId == null || !deleteUser) {
      toast.error("Сургуулийн мэдээлэл олдсонгүй.");
      return;
    }

    try {
      setDeletingId(deleteUser.id);
      await apiDelete(`/schools/${schoolId}/users/${deleteUser.id}`);

      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      toast.success("Хэрэглэгч амжилттай устгагдлаа.");
      setDeleteUser(null);
    } catch (err) {
      toast.error(err.message || "Хэрэглэгч устгахад алдаа гарлаа.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleSaved(updatedUser) {
    setUsers((prev) =>
      prev.map((item) =>
        item.id === updatedUser.id ? { ...item, ...updatedUser, roleName: item.roleName } : item
      )
    );
    setEditUser(null);
  }

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.trim().toLowerCase();

      result = result.filter((u) => {
        const firstLast = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
        const lastFirst = `${u.last_name || ""} ${u.first_name || ""}`.toLowerCase();

        return (
          firstLast.includes(q) ||
          lastFirst.includes(q) ||
          String(u.email || "").toLowerCase().includes(q) ||
          String(u.username || "").toLowerCase().includes(q) ||
          String(u.phone || "").toLowerCase().includes(q)
        );
      });
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => normalizeRole(u.roleName) === roleFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((u) => {
        if (statusFilter === "active") return Number(u.is_active ?? 1) === 1;
        if (statusFilter === "inactive") return Number(u.is_active ?? 1) !== 1;
        return true;
      });
    }

    const roleOrder = { admin: 0, teacher: 1, student: 2 };

    result.sort((a, b) => {
      const ra = roleOrder[normalizeRole(a.roleName)] ?? 99;
      const rb = roleOrder[normalizeRole(b.roleName)] ?? 99;
      return ra - rb;
    });

    return result;
  }, [users, search, roleFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (!isAdmin && !isTeacher) {
    return (
      <div className="rounded-[28px] border border-blue-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black text-blue-950">Хэрэглэгчид</h1>
        <p className="mt-2 text-sm font-semibold text-blue-500">
          Энэ хэсгийг зөвхөн админ болон багш хэрэглэгч үзнэ.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <RoleManagementTopPanel school={school} />

        <div className="rounded-[30px] border border-blue-100 bg-white/90 p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Нэр, имэйл, username..."
                className="h-14 w-full rounded-2xl border border-blue-100 bg-blue-50/60 pl-12 pr-4 text-sm font-semibold text-blue-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-14 w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-4 text-sm font-semibold text-blue-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Бүх эрх</option>
              <option value="admin">Админ</option>
              <option value="teacher">Багш</option>
              <option value="student">Суралцагч</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-14 w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-4 text-sm font-semibold text-blue-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Бүх төлөв</option>
              <option value="active">Идэвхтэй</option>
              <option value="inactive">Идэвхгүй</option>
            </select>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg transition hover:bg-blue-700"
            >
              <FiPlus className="h-5 w-5" />
              Хэрэглэгч нэмэх
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-[32px] border border-blue-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-blue-950">Хэрэглэгч ба эрх</h1>
              <p className="mt-1 text-sm font-semibold text-blue-500">
                Нийт {filteredUsers.length} хэрэглэгч
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-600">
              Сургуулийн хэрэглэгчид
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-[28px] bg-blue-50" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-blue-200 bg-blue-50 px-4 py-14 text-center text-sm font-semibold text-blue-500">
              Хэрэглэгч олдсонгүй.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {pagedUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <UserAvatar user={user} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-blue-950">{getFullName(user)}</h3>
                        <RoleBadge roleName={user.roleName} />
                        <StatusBadge isActive={user.is_active} />
                      </div>

                      <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
                        <div className="flex items-center gap-2">
                          <FiMail className="h-4 w-4 text-blue-500" />
                          <span>{user.email || "-"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FiUser className="h-4 w-4 text-blue-500" />
                          <span>{user.username || "-"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FiPhone className="h-4 w-4 text-blue-500" />
                          <span>{user.phone || "-"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FiShield className="h-4 w-4 text-blue-500" />
                          <span>{user.roleName || "-"}</span>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setViewUser(user)}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          <FiEye className="h-4 w-4" />
                          Харах
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditUser(user)}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                        >
                          <FiEdit2 className="h-4 w-4" />
                          Засах
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteUser(user)}
                          disabled={deletingId === user.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          Устгах
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>

      {viewUser && (
        <ViewUserModal
          user={viewUser}
          onClose={() => setViewUser(null)}
          onEdit={(user) => {
            setViewUser(null);
            setEditUser(user);
          }}
        />
      )}

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteUser && (
        <DeleteUserModal
          user={deleteUser}
          loading={deletingId === deleteUser.id}
          onClose={() => setDeleteUser(null)}
          onConfirm={confirmDeleteUser}
        />
      )}

      {createOpen && (
        <CreateUserModal
          school={school}
          onClose={() => setCreateOpen(false)}
          onCreated={(newUser) => {
            setUsers((prev) => [newUser, ...prev]);
            setCreateOpen(false);
          }}
        />
      )}
    </>
  );
}