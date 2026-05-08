import { useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiShield, FiUser, FiUsers } from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import { apiGet, parseField } from "../../utils/api";
import { ROLES } from "../../utils/constants";

function getSchoolId(school) {
  return school?.id ?? school?.school_id ?? school?.SCHOOL_ID ?? school?.ID ?? null;
}

function getRoleIdsFromUser(user, schoolId) {
  const schools = user?.schools ?? user?.school_roles ?? [];
  if (!Array.isArray(schools)) return [];

  const matched = schools.find((s) => String(getSchoolId(s)) === String(schoolId));
  if (!matched) return [];

  const roles =
    matched?.roles ??
    parseField(matched, "roles") ??
    matched?.role ??
    parseField(matched, "role") ??
    [];

  if (Array.isArray(roles)) {
    return roles.map((r) => Number(r?.id ?? r?.role_id ?? r)).filter(Boolean);
  }

  const roleId = Number(roles?.id ?? roles?.role_id ?? roles);
  return roleId ? [roleId] : [];
}

function StatCard({ title, value, desc }) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 transition-all group-hover:bg-blue-100" />

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-widest text-blue-500">
          {title}
        </p>

        <h3 className="mt-4 text-4xl font-black text-slate-950">
          {value}
        </h3>

        <p className="mt-2 text-xs font-semibold leading-5 text-blue-600">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { school } = useAuth();

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const schoolId = getSchoolId(school);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      apiGet(`/schools/${schoolId}/users?limit=10000`).catch(() => ({ items: [] })),
      apiGet(`/schools/${schoolId}/courses?limit=10000`).catch(() => ({ items: [] })),
    ])
      .then(([usersRes, coursesRes]) => {
        setUsers(usersRes?.items ?? []);
        setCourses(coursesRes?.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [schoolId]);

  const stats = useMemo(() => {
    let totalAdmins = 0;
    let totalTeachers = 0;
    let totalStudents = 0;

    users.forEach((user) => {
      const roleIds = getRoleIdsFromUser(user, schoolId);
      if (roleIds.includes(Number(ROLES.ADMIN))) totalAdmins += 1;
      if (roleIds.includes(Number(ROLES.TEACHER))) totalTeachers += 1;
      if (roleIds.includes(Number(ROLES.STUDENT))) totalStudents += 1;
    });

    return {
      totalUsers: users.length,
      totalAdmins,
      totalTeachers,
      totalStudents,
      totalCourses: courses.length,
    };
  }, [users, courses, schoolId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-blue-100" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-[26px] bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Нийт хэрэглэгч" value={stats.totalUsers}  icon={FiUsers} />
        <StatCard title="Нийт админ" value={stats.totalAdmins}  icon={FiShield} />
        <StatCard title="Нийт багш" value={stats.totalTeachers} icon={FiUser} />
        <StatCard title="Нийт оюутан" value={stats.totalStudents}  icon={FiUser} />
        <StatCard title="Нийт хичээл" value={stats.totalCourses} icon={FiBookOpen} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[30px] border border-blue-100 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-black text-blue-950">
            Сүүлийн идэвхтэй хэрэглэгчид
          </h2>

          <div className="mt-5 space-y-3">
            {users.slice(0, 5).map((item) => (
              <div
                key={item.id || item.user_id || item.email}
                className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4"
              >
                <h3 className="text-sm font-extrabold text-blue-950">
                  {item.first_name || item.name || item.username || "Хэрэглэгч"}
                </h3>
                <p className="mt-1 text-xs font-semibold text-blue-500">
                  {item.role_name || "system-user"} • {item.email}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-blue-100 bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-black text-blue-950">
            Системийн админы боломжууд
          </h2>

          <div className="mt-5 space-y-3">
            {[
              "Сургуулийн админ хүсэлт батлах",
              "Бүх хэрэглэгч харах",
              "Сургуулиудын урсгал хянах",
              "Тайлан харах",
            ].map((text) => (
              <button
                key={text}
                className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left text-sm font-bold text-blue-950 transition hover:border-blue-300 hover:bg-blue-100"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}