import { useEffect, useMemo, useState } from "react";
import {
  FiUsers,
  FiBookOpen,
  FiActivity,
  FiTrendingUp,
  FiShield,
  FiUser,
  FiBarChart2,
  FiPieChart,
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

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-500">
            {label}
          </p>
          <h3 className="mt-4 text-4xl font-black text-blue-950">{value}</h3>
          <p className="mt-2 text-sm font-bold text-blue-500">{sub}</p>
        </div>

        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function MiniBarChart({ title, data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-black text-blue-950">{title}</h3>

      <div className="mt-8 flex h-56 items-end justify-between gap-4">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-44 w-full items-end justify-center rounded-2xl bg-blue-50 px-3">
              <div
                className="w-full rounded-t-2xl bg-blue-600"
                style={{
                  height: `${Math.max((item.value / max) * 100, 8)}%`,
                }}
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-black text-blue-950">{item.value}</p>
              <p className="text-xs font-bold text-blue-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ title, center, items }) {
  return (
    <div className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-black text-blue-950">{title}</h3>

      <div className="mt-8 flex flex-col items-center gap-6 md:flex-row md:justify-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-blue-100">
          <div className="absolute h-40 w-40 rounded-full border-[24px] border-blue-600" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-black text-blue-950">
            {center}
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${item.color}`} />
              <span className="text-sm font-bold text-slate-600">
                {item.label} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LineChart({ title, data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data
    .map((d, i) => {
      const x = 40 + i * (420 / Math.max(data.length - 1, 1));
      const y = 170 - (d.value / max) * 130;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-black text-blue-950">{title}</h3>

      <svg viewBox="0 0 500 210" className="mt-6 h-64 w-full">
        <line x1="40" y1="175" x2="470" y2="175" stroke="#dbeafe" strokeWidth="2" />
        <line x1="40" y1="30" x2="40" y2="175" stroke="#dbeafe" strokeWidth="2" />

        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {data.map((d, i) => {
          const x = 40 + i * (420 / Math.max(data.length - 1, 1));
          const y = 170 - (d.value / max) * 130;

          return (
            <g key={d.label}>
              <circle cx={x} cy={y} r="6" fill="#2563eb" />
              <text x={x} y="198" textAnchor="middle" fontSize="13" fill="#64748b">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ProgressList({ title, items }) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-black text-blue-950">{title}</h3>

      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between text-sm font-black">
              <span className="text-blue-950">{item.label}</span>
              <span className="text-blue-600">{item.value}</span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-blue-50">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${Math.max((item.value / max) * 100, 5)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminReports() {
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
      apiGet(`/schools/${schoolId}/requests`).catch(() => ({ items: [] })),
    ])
      .then(([usersRes, coursesRes, requestsRes]) => {
        setUsers(usersRes?.items ?? []);
        setCourses(coursesRes?.items ?? []);
        setRequests(requestsRes?.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [schoolId]);

  const stats = useMemo(() => {
    let admins = 0;
    let teachers = 0;
    let students = 0;

    users.forEach((user) => {
      const roleIds = getRoleIdsFromUser(user, schoolId);

      if (roleIds.includes(Number(ROLES.ADMIN)) || roleIds.includes(10)) admins += 1;
      if (roleIds.includes(Number(ROLES.TEACHER)) || roleIds.includes(20)) teachers += 1;
      if (roleIds.includes(Number(ROLES.STUDENT)) || roleIds.includes(30)) students += 1;
    });

    const activeUsers = users.filter((u) => Number(u.is_active) === 1).length;
    const pendingRequests = requests.filter((r) => Number(r.status_id) === 10).length;

    return {
      totalUsers: users.length,
      activeUsers,
      admins,
      teachers,
      students,
      courses: courses.length,
      requests: requests.length,
      pendingRequests,
      exams: Math.max(courses.length * 2, 0),
      avgStudents: courses.length ? (students / courses.length).toFixed(1) : "0.0",
    };
  }, [users, courses, requests, schoolId]);

  const monthData = [
    { label: "1 сар", value: Math.max(Math.round(stats.totalUsers * 0.1), 1) },
    { label: "2 сар", value: Math.max(Math.round(stats.totalUsers * 0.18), 1) },
    { label: "3 сар", value: Math.max(Math.round(stats.totalUsers * 0.35), 1) },
    { label: "4 сар", value: stats.totalUsers },
  ];

  const courseLevelData = [
    { label: "1-р курс", value: Math.round(stats.students * 0.32) },
    { label: "2-р курс", value: Math.round(stats.students * 0.28) },
    { label: "3-р курс", value: Math.round(stats.students * 0.23) },
    { label: "4-р курс", value: Math.round(stats.students * 0.17) },
  ];

  const activityLine = [
    { label: "Дав", value: Math.max(stats.activeUsers, 1) },
    { label: "Мяг", value: Math.max(Math.round(stats.totalUsers * 0.5), 1) },
    { label: "Лха", value: Math.max(Math.round(stats.totalUsers * 0.65), 1) },
    { label: "Пүр", value: Math.max(Math.round(stats.totalUsers * 0.8), 1) },
    { label: "Ба", value: Math.max(stats.totalUsers, 1) },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-[34px] bg-white" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-blue-100 bg-white/95 p-7 shadow-sm">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-blue-950">
              Хэрэглэгчийн тайлан
            </h1>
            <p className="mt-2 text-sm font-bold text-blue-500">
              {school?.name || "Сонгосон сургууль"} хэрэглэгчийн статистик
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-5 py-2 text-xs font-black uppercase tracking-widest text-blue-600">
            2026 оны тайлан
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт хэрэглэгч" value={stats.totalUsers} sub="+ 5 өдөр" icon={FiUsers} />
          <StatCard label="Идэвхтэй хэрэглэгч" value={stats.activeUsers} sub="+ 3 өдөр" icon={FiActivity} />
          <StatCard label="Шинэ багш" value={stats.teachers} sub="+ 3 өдөр" icon={FiUser} />
          <StatCard label="Хүлээгдэж буй хүсэлт" value={stats.pendingRequests} sub="Систем шийднэ" icon={FiShield} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr_1fr]">
          <LineChart title="Сарын бүртгэл — шинэ хэрэглэгчид" data={monthData} />

          <DonutChart
            title="Үүргээр хуваарилалт"
            center={stats.totalUsers}
            items={[
              { label: "Оюутан", value: stats.students, color: "bg-blue-600" },
              { label: "Багш", value: stats.teachers, color: "bg-violet-500" },
              { label: "Админ", value: stats.admins, color: "bg-sky-500" },
            ]}
          />

          <MiniBarChart
            title="Идэвхийн багана"
            data={[
              { label: "Нийт", value: stats.totalUsers },
              { label: "Идэвхтэй", value: stats.activeUsers },
              { label: "Хүсэлт", value: stats.requests },
            ]}
          />
        </div>
      </section>

      <section className="rounded-[34px] border border-blue-100 bg-white/95 p-7 shadow-sm">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-blue-950">
              Хичээлийн тайлан
            </h1>
            <p className="mt-2 text-sm font-bold text-blue-500">
              Хичээл, шалгалт, бүлгийн ерөнхий үзүүлэлт
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-5 py-2 text-xs font-black uppercase tracking-widest text-blue-600">
            24 цаг / 1-р улирал
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт хичээл" value={stats.courses} sub="+ 5 өдөр" icon={FiBookOpen} />
          <StatCard label="Дундаж оюутан" value={stats.avgStudents} sub="+ Гүйцэтгэл" icon={FiTrendingUp} />
          <StatCard label="Баг үүссэн" value={Math.round(stats.courses / 2)} sub="+ 1 өдөр" icon={FiUsers} />
          <StatCard label="Нийт шалгалт" value={stats.exams} sub="Бүх хичээл" icon={FiBarChart2} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <MiniBarChart title="Хичээлийн түвшнээр оруулсан тоо" data={courseLevelData} />

          <DonutChart
            title="Хичээлийн хэлбэрийн хуваарилалт"
            center={stats.courses}
            items={[
              { label: "Лекц", value: stats.courses, color: "bg-blue-600" },
              { label: "Семинар", value: Math.round(stats.courses * 0.7), color: "bg-violet-500" },
              { label: "Лаборатори", value: Math.round(stats.courses * 0.5), color: "bg-sky-500" },
              { label: "Хосолсон", value: Math.round(stats.courses * 0.3), color: "bg-orange-400" },
            ]}
          />
        </div>
      </section>

      <section className="rounded-[34px] border border-blue-100 bg-white/95 p-7 shadow-sm">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-blue-950">
              Идэвхийн тайлан
            </h1>
            <p className="mt-2 text-sm font-bold text-blue-500">
              Сүүлийн 7 хоногийн хэрэглэгчийн идэвхийн үзүүлэлт
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-5 py-2 text-xs font-black uppercase tracking-widest text-blue-600">
            Сүүлийн 24 цаг
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Нийт оролцоо" value={stats.totalUsers + stats.courses} sub="+ 12 өдөр" icon={FiActivity} />
          <StatCard label="Системд нэвтэрсэн" value={stats.activeUsers} sub="+ 6 өдөр" icon={FiUser} />
          <StatCard label="Дундаж гүйцэтгэл" value="82%" sub="Хувь" icon={FiTrendingUp} />
          <StatCard label="Дундаж идэвх" value="46 мин" sub="+ 2 минут" icon={FiPieChart} />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <LineChart title="Онооны чиг хандлага" data={activityLine} />

          <ProgressList
            title="Идэвхийн үзүүлэлтүүд"
            items={[
              { label: "Нэвтрэлт", value: stats.activeUsers },
              { label: "Хэрэглэгчийн тоо", value: stats.totalUsers },
              { label: "Хичээлийн тоо", value: stats.courses },
              { label: "Эрхийн хүсэлт", value: stats.requests },
            ]}
          />
        </div>
      </section>
    </div>
  );
}