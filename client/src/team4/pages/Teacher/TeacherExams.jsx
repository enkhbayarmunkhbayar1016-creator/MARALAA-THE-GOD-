import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiEdit2,
  FiLayers,
  FiPlus,
  FiSave,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useToast } from "../../components/ui/Toast";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  parseField,
  withCurrentUser,
} from "../../utils/api";

const COURSE_USERS_LIMIT = 10000;

function getUser(item) {
  return parseField(item, "user") ?? item.user ?? item;
}

function getGroup(item) {
  return parseField(item, "group") ?? item.group ?? null;
}

function getUserId(item) {
  const user = getUser(item);
  return item.user_id ?? user?.id ?? item.id;
}

function getUserFullName(user) {
  return (
    [user?.last_name, user?.first_name].filter(Boolean).join(" ").trim() ||
    user?.name ||
    user?.username ||
    user?.email ||
    "Нэргүй хэрэглэгч"
  );
}

export default function GroupManagement() {
  const { course_id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [courseUsers, setCourseUsers] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", maxMembers: "" });
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const [memberGroup, setMemberGroup] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberSavingId, setMemberSavingId] = useState(null);

  const [confirmGroup, setConfirmGroup] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadGroups() {
    try {
      setLoading(true);
      setError("");

      const [courseData, groupData, userData] = await Promise.all([
        apiGet(`/courses/${course_id}`).catch(() => null),
        apiGet(`/courses/${course_id}/groups`),
        apiGet(`/courses/${course_id}/users?limit=${COURSE_USERS_LIMIT}`).catch(
          () => ({ items: [] })
        ),
      ]);

      setCourseName(courseData?.name ?? courseData?.title ?? "");
      setGroups(groupData?.items ?? (Array.isArray(groupData) ? groupData : []));
      setCourseUsers(userData?.items ?? []);
    } catch (err) {
      const msg = err.message || "Бүлгүүдийг ачааллахад алдаа гарлаа.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, [course_id]);

  function getGroupMax(group) {
    return Number(group?.max_members ?? group?.maxMembers ?? group?.priority ?? 0);
  }

  function getGroupMemberCount(group) {
    return courseUsers.filter((item) => {
      const g = getGroup(item);
      const groupId = item.group_id ?? g?.id;
      return String(groupId) === String(group.id);
    }).length;
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", maxMembers: "" });
    setSelectedUserIds([]);
    setFormOpen(true);
  }

  function openEdit(group) {
    setEditing(group);
    setForm({
      name: group.name ?? "",
      maxMembers: String(getGroupMax(group) || ""),
    });
    setSelectedUserIds([]);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm({ name: "", maxMembers: "" });
    setSelectedUserIds([]);
  }

  async function assignUserToGroup(userId, groupId) {
    await apiPut(
      `/courses/${course_id}/users/${userId}`,
      withCurrentUser({
        group_id: String(groupId),
      })
    );
  }

  async function removeUserFromGroup(userId) {
    await apiPut(
      `/courses/${course_id}/users/${userId}`,
      withCurrentUser({
        group_id: "",
      })
    );
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.warning("Бүлгийн нэр заавал бөглөнө үү.");
      return;
    }

    const maxMembers = Number(form.maxMembers || 0);

    if (!maxMembers || maxMembers < 1) {
      toast.warning("Гишүүний дээд тоо 1-ээс их байх ёстой.");
      return;
    }

    if (selectedUserIds.length > maxMembers) {
      toast.warning(`Энэ бүлэгт хамгийн ихдээ ${maxMembers} гишүүн нэмнэ.`);
      return;
    }

    setSaving(true);

    try {
      let savedGroupId = editing?.id;

      if (editing) {
        const currentCount = getGroupMemberCount(editing);

        if (currentCount > maxMembers) {
          toast.warning(
            `Одоо ${currentCount} гишүүнтэй байна. Дээд тоог ${currentCount}-аас бага болгож болохгүй.`
          );
          setSaving(false);
          return;
        }

        await apiPut(`/groups/${editing.id}`, {
          course_id,
          name: form.name,
          priority: maxMembers,
        });

        toast.success("Бүлэг амжилттай засагдлаа.");
      } else {
        const created = await apiPost(`/courses/${course_id}/groups`, {
          name: form.name,
          priority: maxMembers,
        });

        savedGroupId =
          created?.id ??
          created?.group_id ??
          created?.data?.id ??
          created?.items?.[0]?.id;

        if (savedGroupId && selectedUserIds.length) {
          await Promise.all(
            selectedUserIds.map((userId) => assignUserToGroup(userId, savedGroupId))
          );
        }

        toast.success("Бүлэг амжилттай нэмэгдлээ.");
      }

      closeForm();
      await loadGroups();
    } catch (err) {
      toast.error(err.message || "Хадгалахад алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddMember(group, item) {
    const maxMembers = getGroupMax(group);
    const currentCount = getGroupMemberCount(group);
    const userId = getUserId(item);

    if (maxMembers && currentCount >= maxMembers) {
      toast.warning(`"${group.name}" бүлэгт хамгийн ихдээ ${maxMembers} гишүүн нэмнэ.`);
      return;
    }

    try {
      setMemberSavingId(userId);
      await assignUserToGroup(userId, group.id);
      toast.success("Гишүүн нэмэгдлээ.");
      await loadGroups();
    } catch (err) {
      toast.error(err.message || "Гишүүн нэмэхэд алдаа гарлаа.");
    } finally {
      setMemberSavingId(null);
    }
  }

  async function handleRemoveMember(item) {
    const userId = getUserId(item);

    try {
      setMemberSavingId(userId);
      await removeUserFromGroup(userId);
      toast.success("Гишүүн бүлгээс хасагдлаа.");
      await loadGroups();
    } catch (err) {
      toast.error(err.message || "Гишүүн хасахад алдаа гарлаа.");
    } finally {
      setMemberSavingId(null);
    }
  }

  async function confirmDeleteGroup() {
    if (!confirmGroup) return;

    setDeleting(true);

    try {
      await apiDelete(`/groups/${confirmGroup.id}`, withCurrentUser());
      toast.success("Бүлэг амжилттай устгагдлаа.");
      setConfirmGroup(null);
      await loadGroups();
    } catch (err) {
      toast.error(err.message || "Устгахад алдаа гарлаа.");
    } finally {
      setDeleting(false);
    }
  }

  const memberUsers = useMemo(() => {
    if (!memberGroup) return [];

    const list = courseUsers.filter((item) => {
      const group = getGroup(item);
      const groupId = item.group_id ?? group?.id;
      return String(groupId) === String(memberGroup.id);
    });

    const q = memberSearch.trim().toLowerCase();
    if (!q) return list;

    return list.filter((item) => {
      const user = getUser(item);

      return [
        getUserFullName(user),
        user?.email,
        user?.username,
        item.user_id,
        user?.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [courseUsers, memberGroup, memberSearch]);

  const availableUsersForModal = useMemo(() => {
    if (!memberGroup) return [];

    return courseUsers.filter((item) => {
      const group = getGroup(item);
      const groupId = item.group_id ?? group?.id;
      return String(groupId || "") !== String(memberGroup.id);
    });
  }, [courseUsers, memberGroup]);

  const availableUsersForCreate = useMemo(() => {
    return courseUsers.filter((item) => {
      const group = getGroup(item);
      const groupId = item.group_id ?? group?.id;
      return !groupId;
    });
  }, [courseUsers]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      <div className="overflow-hidden rounded-[34px] border border-emerald-100 bg-white shadow-sm">
        <div className="relative p-8">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-100/70" />
          <div className="absolute right-28 top-12 h-20 w-20 rounded-full bg-emerald-50" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-lg">
                <FiLayers className="h-8 w-8" />
              </div>

              <div>
                <h1 className="text-4xl font-black text-slate-950">
                  Бүлэг удирдах
                </h1>
                <p className="mt-2 text-sm font-bold text-emerald-600">
                  {courseName || `Хичээл #${course_id}`}
                </p>
              </div>
            </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-6 text-sm font-black text-emerald-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-xl"
        >
          <FiArrowLeft className="h-5 w-5" />
          Буцах
        </button>
          </div>
        </div>

        <div className="grid gap-4 border-t border-emerald-100 bg-emerald-50/40 p-6 md:grid-cols-3">
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Нийт бүлэг
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {groups.length}
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Нийт хэрэглэгч
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {courseUsers.length}
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Удирдлага
            </p>
            <p className="mt-2 text-xl font-black text-slate-950">
              Нэмэх · Засах · Гишүүд
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[34px] border border-emerald-100 bg-white p-7 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Бүлгүүд</h2>
            <p className="mt-1 text-sm font-bold text-emerald-500">
              Нийт {groups.length} бүлэг
            </p>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            <FiPlus className="h-4 w-4" />
            Бүлэг нэмэх
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-[28px] bg-emerald-50"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
            {error}
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-emerald-200 bg-emerald-50/60 p-12 text-center">
            <FiLayers className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-3 text-sm font-black text-emerald-700">
              Бүлэг олдсонгүй.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((g, index) => {
              const count = getGroupMemberCount(g);
              const max = getGroupMax(g);

              return (
                <div
                  key={g.id}
                  className="group relative overflow-hidden rounded-[30px] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
                >
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100/80 transition group-hover:scale-125" />

                  <div className="relative z-10">
                    <div className="mb-5 flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-black text-white shadow-md">
                        {index + 1}
                      </div>

                      <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-emerald-700 shadow-sm">
                        {count}/{max || "∞"} гишүүн
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-950">
                      {g.name}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-slate-400">
                      Дээд тоо: {max || "заагаагүй"} · ID: {g.id}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMemberGroup(g);
                          setMemberSearch("");
                        }}
                      >
                        <FiUsers className="h-4 w-4" />
                        Гишүүд
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => openEdit(g)}>
                        <FiEdit2 className="h-4 w-4" />
                        Засах
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmGroup(g)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 className="h-4 w-4" />
                        Устгах
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-[34px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-emerald-100 bg-emerald-50/70 p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
                  {editing ? "Edit group" : "Create group"}
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  {editing ? "Бүлэг засах" : "Шинэ бүлэг нэмэх"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm hover:bg-red-50 hover:text-red-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Бүлгийн нэр *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Жишээ: 1-р бүлэг"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Гишүүний дээд тоо *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.maxMembers}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxMembers: e.target.value }))
                    }
                    placeholder="Жишээ: 5"
                    required
                  />
                </div>
              </div>

              {!editing && (
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-5">
                  <h3 className="text-lg font-black text-slate-950">
                    Бүлэгт гишүүн нэмэх
                  </h3>
                  <p className="mt-1 text-sm font-bold text-emerald-600">
                    Сонгосон тоо дээд гишүүний тооноос их байж болохгүй.
                  </p>

                  <div className="mt-4 grid max-h-56 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                    {availableUsersForCreate.map((item) => {
                      const user = getUser(item);
                      const userId = getUserId(item);
                      const checked = selectedUserIds.includes(String(userId));

                      return (
                        <label
                          key={item.id ?? userId}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${
                            checked
                              ? "border-emerald-300 bg-white"
                              : "border-emerald-100 bg-white/70"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const id = String(userId);
                              const max = Number(form.maxMembers || 0);

                              if (e.target.checked) {
                                if (max && selectedUserIds.length >= max) {
                                  toast.warning(`Хамгийн ихдээ ${max} гишүүн сонгоно.`);
                                  return;
                                }
                                setSelectedUserIds((prev) => [...prev, id]);
                              } else {
                                setSelectedUserIds((prev) =>
                                  prev.filter((x) => x !== id)
                                );
                              }
                            }}
                          />
                          <div>
                            <p className="font-black text-slate-950">
                              {getUserFullName(user)}
                            </p>
                            <p className="text-xs font-semibold text-slate-500">
                              {user?.email || "И-мэйлгүй"}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  <FiX className="h-4 w-4" />
                  Цуцлах
                </Button>

                <Button type="submit" disabled={saving}>
                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  <FiSave className="h-4 w-4" />
                  Хадгалах
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {memberGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-[34px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-emerald-100 bg-emerald-50/70 p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
                  Group members
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">
                  Бүлгийн гишүүд
                </h2>
                <p className="mt-1 text-sm font-bold text-emerald-600">
                  {memberGroup.name} · {memberUsers.length}/{getGroupMax(memberGroup)} гишүүн
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMemberGroup(null)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm hover:bg-red-50 hover:text-red-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-2">
              <div>
                <div className="relative mb-5">
                  <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500" />
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Нэр, имэйл, username хайх..."
                    className="h-14 w-full rounded-2xl border border-emerald-100 bg-emerald-50/50 pl-12 pr-4 text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <h3 className="mb-3 font-black text-slate-950">Одоогийн гишүүд</h3>

                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {memberUsers.length === 0 ? (
                    <div className="rounded-[26px] border border-dashed border-emerald-200 bg-emerald-50/60 p-10 text-center">
                      <FiUsers className="mx-auto h-10 w-10 text-emerald-500" />
                      <p className="mt-3 text-sm font-black text-emerald-700">
                        Энэ бүлэгт гишүүн олдсонгүй.
                      </p>
                    </div>
                  ) : (
                    memberUsers.map((item) => {
                      const user = getUser(item);
                      const userId = getUserId(item);

                      return (
                        <div
                          key={item.id ?? `${item.course_id}-${item.user_id}`}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-4"
                        >
                          <div>
                            <p className="font-black text-slate-950">
                              {getUserFullName(user)}
                            </p>
                            <p className="text-sm font-semibold text-slate-500">
                              {user?.email || "И-мэйлгүй"}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={memberSavingId === userId}
                            onClick={() => handleRemoveMember(item)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 className="h-4 w-4" />
                            Хасах
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-black text-slate-950">
                  Нэмэх боломжтой хэрэглэгчид
                </h3>

                <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
                  {availableUsersForModal.length === 0 ? (
                    <div className="rounded-[26px] border border-dashed border-emerald-200 bg-emerald-50/60 p-10 text-center">
                      <p className="text-sm font-black text-emerald-700">
                        Нэмэх хэрэглэгч алга.
                      </p>
                    </div>
                  ) : (
                    availableUsersForModal.map((item) => {
                      const user = getUser(item);
                      const userId = getUserId(item);
                      const max = getGroupMax(memberGroup);
                      const disabled = max && memberUsers.length >= max;

                      return (
                        <div
                          key={item.id ?? userId}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white p-4"
                        >
                          <div>
                            <p className="font-black text-slate-950">
                              {getUserFullName(user)}
                            </p>
                            <p className="text-sm font-semibold text-slate-500">
                              {user?.email || "И-мэйлгүй"}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            disabled={disabled || memberSavingId === userId}
                            onClick={() => handleAddMember(memberGroup, item)}
                          >
                            <FiPlus className="h-4 w-4" />
                            Нэмэх
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmGroup}
        title="Бүлэг устгах уу?"
        description={`"${confirmGroup?.name}" бүлгийг устгахдаа итгэлтэй байна уу?`}
        confirmText="Устгах"
        cancelText="Цуцлах"
        loading={deleting}
        onCancel={() => setConfirmGroup(null)}
        onConfirm={confirmDeleteGroup}
      />
    </div>
  );
}