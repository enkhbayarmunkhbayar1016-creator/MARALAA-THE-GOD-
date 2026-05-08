import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiLayers,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { apiGet, parseField } from "../../utils/api";
import { useToast } from "../../components/ui";

const COURSE_USERS_LIMIT = 10000;

function getUserFullName(user) {
  return (
    [user?.last_name, user?.first_name].filter(Boolean).join(" ").trim() ||
    user?.name ||
    user?.username ||
    user?.email ||
    "Нэргүй хэрэглэгч"
  );
}

function getInitials(name) {
  return String(name)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CourseUserList() {
  const { course_id } = useParams();
  const toast = useToast();

  const [courseName, setCourseName] = useState("");
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!course_id) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [courseRes, courseUsersRes, groupsRes] = await Promise.all([
          apiGet(`/courses/${course_id}`).catch(() => ({})),
          apiGet(`/courses/${course_id}/users?limit=${COURSE_USERS_LIMIT}`),
          apiGet(`/courses/${course_id}/groups`).catch(() => ({ items: [] })),
        ]);

        setCourseName(courseRes?.name ?? courseRes?.title ?? `Хичээл #${course_id}`);
        setUsers(courseUsersRes?.items ?? []);
        setGroups(groupsRes?.items ?? []);
      } catch (err) {
        const msg = err.message || "Хэрэглэгчдийг ачааллахад алдаа гарлаа.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [course_id, toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((item) => {
      const user = parseField(item, "user") ?? item.user ?? item;
      const group = parseField(item, "group") ?? item.group ?? null;

      return [
        getUserFullName(user),
        user?.email,
        user?.username,
        group?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [users, search]);

  const groupedCount = users.filter((item) => {
    const group = parseField(item, "group") ?? item.group ?? null;
    return !!group?.name;
  }).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="overflow-hidden rounded-[34px] border border-emerald-100 bg-white shadow-sm">
        <div className="relative p-8">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-100/70" />
          <div className="absolute right-28 top-10 h-20 w-20 rounded-full bg-emerald-50" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h1 className="mt-2 text-4xl font-black text-slate-950">
                Хэрэглэгчид
              </h1>
              <p className="mt-2 text-base font-bold text-emerald-600">
                {courseName || `Хичээл #${course_id}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
  <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700">
    Нийт {users.length} хэрэглэгч
  </div>

  <div className="rounded-2xl bg-slate-50 px-5 py-3 text-sm font-black text-slate-700">
    {groups.length} бүлэг
  </div>

  <Link
    to={`/team4/courses/${course_id}/groups`}
    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
  >
    <FiLayers className="h-4 w-4" />
    Бүлэг удирдах
  </Link>
</div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-emerald-100 bg-emerald-50/40 p-6 md:grid-cols-3">
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Нийт хэрэглэгч
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">{users.length}</p>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Бүлэгтэй
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-600">{groupedCount}</p>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Нийт бүлэг
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">{groups.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="rounded-[34px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Хэрэглэгчийн жагсаалт
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Нийт {filtered.length} хэрэглэгч харагдаж байна
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Нэр, имэйл, username, бүлгээр хайх..."
                className="h-14 w-full rounded-2xl border border-emerald-100 bg-emerald-50/50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-[26px] bg-emerald-50"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-emerald-200 bg-emerald-50/60 p-12 text-center">
              <FiUsers className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="mt-3 text-sm font-black text-emerald-700">
                Хэрэглэгч олдсонгүй.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((item) => {
                const user = parseField(item, "user") ?? item.user ?? item;
                const group = parseField(item, "group") ?? item.group ?? null;
                const fullName = getUserFullName(user);
                const key = item.id ?? `${item.course_id}-${item.user_id}`;

                return (
                  <div
                    key={key}
                    className="group rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-black text-white shadow-md">
                          {getInitials(fullName)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-black text-slate-950">
                            {fullName}
                          </h3>
                          <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                            {user?.email || "И-мэйлгүй"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-black text-emerald-700 shadow-sm">
                        {group?.name || "Бүлэггүй"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 rounded-2xl bg-white/80 p-4 text-sm font-bold text-slate-500">
                      <div className="flex items-center justify-between gap-3">
                        <span>Username</span>
                        <span className="text-slate-950">{user?.username || "—"}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span>User ID</span>
                        <span className="text-slate-950">
                          {item.user_id ?? user?.id ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[34px] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">Бүлгүүд</h2>
              <FiLayers className="h-5 w-5 text-emerald-600" />
            </div>

            {groups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center text-sm font-bold text-emerald-600">
                Бүлэг байхгүй
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-4"
                  >
                    <div>
                      <p className="font-black text-slate-950">{group.name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        priority: {group.priority ?? "—"}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">
                      #{group.id}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link
              to={`/team4/courses/${course_id}/groups`}
              className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl"
            >
              <FiLayers className="h-4 w-4" />
              Бүлэг удирдах
            </Link>
          </div>

          <Link
            to="/team4/teacher"
            className="inline-flex h-13 w-full items-center justify-center rounded-2xl border border-emerald-100 bg-white px-5 py-4 text-sm font-black text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            Буцах
          </Link>
        </aside>
      </div>
    </div>
  );
}