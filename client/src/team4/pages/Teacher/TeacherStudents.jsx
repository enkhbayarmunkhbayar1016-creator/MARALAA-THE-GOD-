import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiUserPlus, FiX, FiUsers, FiBookOpen } from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import {
  apiDelete,
  apiGet,
  apiPost,
  parseField,
  withCurrentUser,
} from "../../utils/api";
import useTeacherCoursesSummary from "./useTeacherCoursesSummary";

const LIMIT = 10000;

function getId(obj) {
  return obj?.id ?? obj?.user_id ?? obj?.USER_ID ?? null;
}

function getFullName(user) {
  return (
    [user?.last_name, user?.first_name].filter(Boolean).join(" ") ||
    user?.name ||
    user?.username ||
    user?.email ||
    `Хэрэглэгч #${getId(user)}`
  );
}

function getUserFromCourseItem(item) {
  return parseField(item, "user") ?? item?.user ?? item;
}

function getRoleName(user, schoolId = null) {
  const directRole = parseField(user, "role") ?? user?.role ?? user?.role_name ?? user?.roleName;

  const directName = String(
    directRole?.name ||
      directRole?.role_name ||
      user?.role_name ||
      user?.roleName ||
      user?.role ||
      user?.type ||
      ""
  ).toLowerCase();

  if (directName) return directName;

  const schools =
    parseField(user, "schools") ??
    user?.schools ??
    user?.school_roles ??
    user?.roles ??
    [];

  if (!Array.isArray(schools)) return "";

  const matched =
    schools.find((s) => {
      const sid =
        s?.school_id ??
        s?.id ??
        s?.schoolId ??
        s?.school?.id ??
        s?.school?.school_id;

      return schoolId == null || String(sid) === String(schoolId);
    }) ?? schools[0];

  return String(
    matched?.role_name ||
      matched?.role?.name ||
      matched?.role?.role_name ||
      matched?.roles?.[0]?.name ||
      matched?.roles?.[0]?.role_name ||
      matched?.name ||
      ""
  ).toLowerCase();
}

function isTeacherUser(user, schoolId = null) {
  const roleName = getRoleName(user, schoolId);

  const roleId = Number(
    user?.role_id ||
      user?.roleId ||
      user?.ROLE_ID ||
      user?.roles?.[0]?.id ||
      user?.roles?.[0]?.role_id ||
      user?.school_roles?.[0]?.role_id ||
      user?.schools?.[0]?.role_id ||
      0
  );

  return (
    roleId === 2 ||
    roleId === 20 ||
    roleName.includes("teacher") ||
    roleName.includes("багш") ||
    roleName.includes("сургагч") ||
    roleName.includes("instructor") ||
    roleName.includes("lecturer")
  );
}

function isStudentUser(user, schoolId = null) {
  const roleName = getRoleName(user, schoolId);

  const roleId = Number(
    user?.role_id ||
      user?.roleId ||
      user?.ROLE_ID ||
      user?.roles?.[0]?.id ||
      user?.roles?.[0]?.role_id ||
      user?.school_roles?.[0]?.role_id ||
      user?.schools?.[0]?.role_id ||
      0
  );

  return (
    roleId === 3 ||
    roleId === 30 ||
    roleName.includes("student") ||
    roleName.includes("оюутан") ||
    roleName.includes("суралцагч") ||
    roleName.includes("сурагч")
  );
}

export default function TeacherAttendance() {
  const { user, school } = useAuth();

  const { courses, loading: coursesLoading } = useTeacherCoursesSummary({
    userId: user?.id,
    schoolId: school?.id,
  });

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [schoolUsers, setSchoolUsers] = useState([]);
  const [courseUsersMap, setCourseUsersMap] = useState({});
  const [query, setQuery] = useState("");
  const [addType, setAddType] = useState("student");
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    if (!coursesLoading && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(String(courses[0].courseId));
    }
  }, [coursesLoading, courses, selectedCourseId]);

async function loadAll() {
  if (!school?.id || coursesLoading) return;

  try {
    setLoading(true);

    const usersRes = await apiGet(`/schools/${school.id}/users?limit=${LIMIT}`).catch(() => ({
      items: [],
    }));

    const rawUsers = usersRes?.items ?? [];

    const membershipResults = await Promise.allSettled(
      rawUsers.map((u) => apiGet(`/users/${getId(u)}/schools`))
    );

    const enrichedUsers = rawUsers.map((u, index) => {
      const result = membershipResults[index];

      if (result.status !== "fulfilled") return u;

      const schools = result.value?.items ?? [];

      const currentSchool = schools.find((s) => {
        const sid =
          s?.school_id ??
          s?.id ??
          s?.school?.id ??
          s?.school?.school_id;

        return String(sid) === String(school.id);
      });

      return {
        ...u,
        role_name:
          currentSchool?.role_name ??
          currentSchool?.role?.name ??
          currentSchool?.roles?.[0]?.name ??
          currentSchool?.name ??
          u.role_name,
        role_id:
          currentSchool?.role_id ??
          currentSchool?.role?.id ??
          currentSchool?.roles?.[0]?.id ??
          u.role_id,
        schools,
      };
    });

    setSchoolUsers(enrichedUsers);

    const map = {};

    await Promise.all(
      courses.map(async (course) => {
        const courseId = course.courseId;

        try {
          const res = await apiGet(`/courses/${courseId}/users?limit=${LIMIT}`);
          map[String(courseId)] = res?.items ?? [];
        } catch {
          map[String(courseId)] = [];
        }
      })
    );

    setCourseUsersMap(map);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadAll();
  }, [school?.id, coursesLoading, courses.length]);

  const selectedCourseUsers = courseUsersMap[String(selectedCourseId)] ?? [];

  const enrolledIds = useMemo(() => {
    return new Set(
      selectedCourseUsers.map((item) => {
        const u = getUserFromCourseItem(item);
        return String(item?.user_id ?? getId(u));
      })
    );
  }, [selectedCourseUsers]);

const teacherCount = useMemo(() => {
  return schoolUsers.filter((u) => isTeacherUser(u, school?.id)).length;
}, [schoolUsers, school?.id]);

const studentCount = useMemo(() => {
  return schoolUsers.filter((u) => isStudentUser(u, school?.id)).length;
}, [schoolUsers, school?.id]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return schoolUsers.filter((u) => {
      const id = String(getId(u));
      if (!id || enrolledIds.has(id)) return false;

if (addType === "teacher" && !isTeacherUser(u, school?.id)) return false;
if (addType === "student" && !isStudentUser(u, school?.id)) return false;

      const text = [getFullName(u), u?.username, u?.email, u?.phone, id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !q || text.includes(q);
    });
  }, [schoolUsers, query, enrolledIds, addType]);

  async function handleAddUser(selectedUser) {
    if (!selectedCourseId) return;

    const selectedUserId = getId(selectedUser);
    if (!selectedUserId) return;

    try {
      setSubmittingId(selectedUserId);

      await apiPost(
        `/courses/${selectedCourseId}/users`,
        withCurrentUser({
          user_id: String(selectedUserId),
          group_id: "",
        })
      );

      await loadAll();
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleRemoveUser(courseId, item) {
    const u = getUserFromCourseItem(item);
    const userId = item?.user_id ?? getId(u);

    if (!courseId || !userId) return;

    try {
      setSubmittingId(userId);

      await apiDelete(
        `/courses/${courseId}/users/${userId}`,
        withCurrentUser({
          COURSE_ID: String(courseId),
          USER_ID: String(userId),
        })
      );

      await loadAll();
    } finally {
      setSubmittingId(null);
    }
  }

  const typeLabel = addType === "teacher" ? "Багш" : "Оюутан";

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950">
              Хичээлд хэрэглэгч нэмэх
            </h1>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
              <FiUsers className="h-3.5 w-3.5" />
              Оюутан: {studentCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
              <FiBookOpen className="h-3.5 w-3.5" />
              Багш: {teacherCount}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-black text-slate-950">
              Хичээл сонгох
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="h-12 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">Сонгох</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-slate-950">
              Нэмэх төрөл
            </label>
            <select
              value={addType}
              onChange={(e) => {
                setAddType(e.target.value);
                setQuery("");
              }}
              className="h-12 w-full rounded-2xl border border-emerald-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="student">Оюутан</option>
              <option value="teacher">Багш</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-slate-950">
              Хайх
            </label>
            <div className="flex h-14 items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4">
              <FiSearch className="h-5 w-5 text-emerald-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`${typeLabel}ийн код, нэр, и-мэйл`}
                className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50/70 px-4 py-3 text-sm font-black text-emerald-700">
            Харагдаж байгаа {typeLabel}: {filteredUsers.length}
          </div>

          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {loading || coursesLoading ? (
              <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-bold text-emerald-700">
                Ачааллаж байна...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center text-sm font-bold text-emerald-600">
                Нэмэх {typeLabel.toLowerCase()} олдсонгүй.
              </div>
            ) : (
              filteredUsers.map((selectedUser) => {
                const id = getId(selectedUser);

                return (
                  <div
                    key={id}
                    className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="text-base font-black text-slate-950">
                      {getFullName(selectedUser)}
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {selectedUser.username || id} • {selectedUser.email || "И-мэйлгүй"}
                    </p>

                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      Сонгосон хичээлд бүртгэлгүй {typeLabel.toLowerCase()}
                    </p>

                    <button
                      type="button"
                      disabled={!selectedCourseId || submittingId === id}
                      onClick={() => handleAddUser(selectedUser)}
                      className="mt-3 inline-flex h-11 items-center gap-2 rounded-2xl bg-emerald-50 px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-600 hover:text-white disabled:opacity-60"
                    >
                      <FiUserPlus className="h-4 w-4" />
                      {submittingId === id ? "Нэмж байна..." : "Хичээлд нэмэх"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Хичээл тус бүрийн хэрэглэгч
            </h2>
            <p className="mt-1 text-sm font-bold text-emerald-500">
              Нийт {courses.length} хичээл
            </p>
          </div>
        </div>

        <div className="max-h-[720px] space-y-4 overflow-y-auto pr-1">
          {loading || coursesLoading ? (
            <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-bold text-emerald-700">
              Ачааллаж байна...
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center text-sm font-bold text-emerald-600">
              Хичээл олдсонгүй.
            </div>
          ) : (
            courses.map((course) => {
              const courseId = String(course.courseId);
              const users = courseUsersMap[courseId] ?? [];

              return (
                <div
                  key={courseId}
                  className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                >
                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      • {course.name}
                    </h3>
                    <p className="mt-1 text-xs font-bold text-emerald-600">
                      {users.length} хэрэглэгч бүртгэлтэй
                    </p>
                  </div>

                  {users.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-8 text-center text-sm font-semibold text-slate-500">
                      Энэ хичээлд хэрэглэгч бүртгэгдээгүй байна.
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {users.map((item) => {
                        const u = getUserFromCourseItem(item);
                        const uid = item?.user_id ?? getId(u);

                        return (
                          <button
                            key={`${courseId}-${uid}`}
                            type="button"
                            onClick={() => handleRemoveUser(courseId, item)}
                            disabled={submittingId === uid}
                            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                          >
                            {u?.username || getFullName(u)}
                            <FiX className="h-3 w-3" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}