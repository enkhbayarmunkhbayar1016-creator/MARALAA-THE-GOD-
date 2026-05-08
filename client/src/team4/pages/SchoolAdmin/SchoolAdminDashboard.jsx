import { useEffect, useMemo, useState } from "react";
import {
  FiBookOpen,
  FiClipboard,
  FiSend,
  FiShield,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
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

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="group rounded-[24px] border border-blue-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-xl">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={25} />
      </div>

      <p className="text-sm font-black uppercase leading-snug text-slate-500">
        {title}
      </p>

      <h3 className="mt-7 text-5xl font-black leading-none text-slate-950">
        {value}
      </h3>
    </div>
  );
}

function FlowButton({ title, icon: Icon }) {
  return (
    <button
      type="button"
      className="group flex min-h-[78px] w-full items-center gap-5 rounded-[22px] border border-blue-100 bg-white p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-[0_14px_30px_rgba(37,99,235,0.13)]"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition duration-200 group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={23} />
      </div>

      <span className="text-base font-extrabold text-slate-900">
        {title}
      </span>
    </button>
  );
}

export default function SchoolAdminDashboard() {
  const { school } = useAuth();

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
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
      apiGet(`/schools/${schoolId}/requests?limit=10000`).catch(() => ({ items: [] })),
    ])
      .then(([usersRes, coursesRes, requestsRes]) => {
        setUsers(usersRes?.items ?? []);
        setCourses(coursesRes?.items ?? []);
        setRequests(requestsRes?.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [schoolId]);

  const stats = useMemo(() => {
    let totalTeachers = 0;
    let totalStudents = 0;

    users.forEach((user) => {
      const roleIds = getRoleIdsFromUser(user, schoolId);

      if (roleIds.includes(Number(ROLES.TEACHER))) totalTeachers += 1;
      if (roleIds.includes(Number(ROLES.STUDENT))) totalStudents += 1;
    });

    const pendingRequests = requests.filter((request) => {
      const status = String(
        request?.status ??
          request?.request_status ??
          request?.approval_status ??
          request?.state ??
          ""
      ).toLowerCase();

      return (
        status.includes("pending") ||
        status.includes("waiting") ||
        status.includes("хүлээгд") ||
        status === "0"
      );
    });

    return {
      pendingRequests: pendingRequests.length,
      totalTeachers,
      totalStudents,
      totalCourses: courses.length,
    };
  }, [users, courses, requests, schoolId]);

  const statCards = [
    {
      title: "Хүлээгдэж буй хүсэлт",
      value: stats.pendingRequests,
      icon: FiClipboard,
    },
    {
      title: "Багш",
      value: stats.totalTeachers,
      icon: FiUsers,
    },
    {
      title: "Оюутан",
      value: stats.totalStudents,
      icon: FiBookOpen,
    },
  ];

  const flows = [
    {
      title: "Оюутан хүсэлт илгээх",
      icon: FiSend,
    },
    {
      title: "Багш хүсэлт илгээх",
      icon: FiUserPlus,
    },
    {
      title: "Сургуулийн админ зөвшөөрөх",
      icon: FiShield,
    },
    {
      title: "Сургуулийн гишүүн эрх идэвхжих",
      icon: FiUsers,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-[#edf6ff] px-6 py-10 lg:px-12">
        <div className="mb-8">
          <div className="h-10 w-80 animate-pulse rounded-xl bg-blue-100" />
          <div className="mt-3 h-5 w-96 animate-pulse rounded-lg bg-blue-100" />
        </div>

        <div className="grid grid-cols-1 gap-7 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="h-[440px] animate-pulse rounded-[26px] bg-white" />
          <div className="h-[440px] animate-pulse rounded-[26px] bg-white" />
        </div>
      </div>
    );
  }

return (
 <div className="mx-auto min-h-[calc(100vh-120px)] w-full max-w-[calc(100vw-96px)] bg-[#edf6ff] px-0 pt-0 pb-10">
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <section className="rounded-[26px] border border-blue-100 bg-white p-10 shadow-[0_12px_35px_rgba(37,99,235,0.10)]">
        <div className="mb-8">
          <div className="mb-6 flex w-fit items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-600">
            <FiBookOpen size={18} />
            Сургуулийн мэдээлэл
          </div>

          <h2 className="max-w-2xl text-2xl font-black leading-snug tracking-tight text-slate-950 lg:text-[28px]">
            Мэдээлэл, Холбооны Технологийн
            <br />
            Сургуулийн мэдээлэл
          </h2>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {statCards.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              icon={item.icon}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[26px] border border-blue-100 bg-white p-10 shadow-[0_12px_35px_rgba(37,99,235,0.10)]">
        <div className="mb-7 flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full bg-blue-600" />

          <h2 className="text-3xl font-black tracking-tight text-slate-950">
            Үндсэн урсгал
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {flows.map((item) => (
            <FlowButton key={item.title} title={item.title} icon={item.icon} />
          ))}
        </div>
      </section>
    </div>
  </div>
);
}