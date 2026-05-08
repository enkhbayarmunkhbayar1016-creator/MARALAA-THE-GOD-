import { useEffect, useMemo, useState } from "react";
import { FiUsers, FiBookOpen, FiUser, FiShield } from "react-icons/fi";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { useAuth } from "../../utils/AuthContext";
import { apiGet } from "../../utils/api";
import { useToast } from "../../components/ui/Toast";
import { StatCard } from "../../components/ui/StatCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";

function getSchoolId(school) {
  return (
    school?.id ?? school?.school_id ?? school?.SCHOOL_ID ?? school?.ID ?? null
  );
}

export default function AdminDashboard() {
  const { school, isAdmin } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseStudentData, setCourseStudentData] = useState([]);
  const [courseCount, setCourseCount] = useState(0);
  const [roleCounts, setRoleCounts] = useState({
    admins: 0,
    teachers: 0,
    students: 0,
  });
  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    const schoolId = getSchoolId(school);

    if (schoolId === null) {
      setLoading(false);
      setError("Сургуулийн id олдсонгүй.");
      toast.warning("Сургуулийн id олдсонгүй.");
      return;
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [schoolUsersRes, schoolCoursesRes] = await Promise.all([
          apiGet(`/schools/${schoolId}/users?limit=10000`),
          apiGet(`/schools/${schoolId}/courses?limit=10000`),
        ]);

        const schoolUsers = schoolUsersRes?.items ?? [];
        const schoolCourses = schoolCoursesRes?.items ?? [];

        setUsers(schoolUsers);
        setCourses(schoolCourses);
        setCourseCount(schoolCourses.length);

        let admins = 0;
        let teachers = 0;
        let students = 0;

        schoolUsers.forEach((u) => {
          const matchedSchool = (u?.schools || []).find(
            (s) => String(s?.id) === String(schoolId),
          );

          const roleId = matchedSchool?.roles?.[0]?.id;

          if (roleId === 10) admins += 1;
          else if (roleId === 20) teachers += 1;
          else if (roleId === 30) students += 1;
        });

        setRoleCounts({ admins, teachers, students });

        setGraphLoading(true);
        const originalCourses = schoolCourses.filter(
          (course) => !course.cloned_course_id,
        );
        const perCourse = await Promise.all(
          originalCourses.map(async (course) => {
            try {
              const res = await apiGet(
                `/courses/${course.id}/users?limit=10000`,
              );
              const studentCount = res?.count ?? res?.items?.length ?? 0;

              return {
                name: course?.name ?? `Хичээл #${course.id}`,
                students: studentCount,
              };
            } catch {
              return {
                name: course?.name ?? `Хичээл #${course.id}`,
                students: 0,
              };
            }
          }),
        );

        const sorted = perCourse
          .sort((a, b) => b.students - a.students)
          .slice(0, 10);

        setCourseStudentData(sorted);
      } catch (err) {
        console.error(err);
        const msg = err.message || "Сургуулийн мэдээлэл авахад алдаа гарлаа.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
        setGraphLoading(false);
      }
    }

    loadDashboard();
  }, [school, isAdmin, toast]);

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalTeachers: roleCounts.teachers,
      totalStudents: roleCounts.students,
      totalAdmins: roleCounts.admins,
    };
  }, [users, roleCounts]);

  const activeCount = useMemo(
    () => users.filter((u) => Number(u.is_active) === 1).length,
    [users],
  );

  const inactiveCount = useMemo(
    () => users.length - activeCount,
    [users, activeCount],
  );

  const pieData = useMemo(
    () => [
      { name: "Админ", value: stats.totalAdmins },
      { name: "Багш", value: stats.totalTeachers },
      { name: "Оюутан", value: stats.totalStudents },
    ],
    [stats],
  );

  const barData = useMemo(
    () => [
      { name: "Идэвхтэй", count: activeCount },
      { name: "Идэвхгүй", count: inactiveCount },
    ],
    [activeCount, inactiveCount],
  );

  const PIE_COLORS = ["#8b5cf6", "#3b82f6", "#10b981"];

  if (!isAdmin) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>Админ самбар</h1>
        <p className="text-sm">
          Энэ хэсгийг зөвхөн админ хэрэглэгч үзнэ.
        </p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>Админ самбар</h1>
        <p className="text-sm">Эхлээд сургууль сонгоно уу.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>Админ самбар</h1>
        <p className="mt-1 text-sm" style={{ color: "#99f6e4" }}>
          {school?.name
            ? `${school.name} сургуулийн хяналтын самбар`
            : "Сонгосон сургуулийн хяналтын самбар"}
        </p>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626" }}>
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Нийт хэрэглэгч"
          value={loading ? "..." : stats.totalUsers}
          icon={<FiUsers className="h-5 w-5" />}
          description="Сонгосон сургуулийн бүх хэрэглэгч"
        />
        <StatCard
          title="Нийт админ"
          value={loading ? "..." : stats.totalAdmins}
          icon={<FiShield className="h-5 w-5" />}
          description="Админ эрхтэй хэрэглэгч"
        />
        <StatCard
          title="Нийт багш"
          value={loading ? "..." : stats.totalTeachers}
          icon={<FiUser className="h-5 w-5" />}
          description="Багш эрхтэй хэрэглэгч"
        />
        <StatCard
          title="Нийт оюутан"
          value={loading ? "..." : stats.totalStudents}
          icon={<FiUser className="h-5 w-5" />}
          description="Оюутан эрхтэй хэрэглэгч"
        />
        <StatCard
          title="Нийт хичээл"
          value={loading ? "..." : courseCount}
          icon={<FiBookOpen className="h-5 w-5" />}
          description="Сонгосон сургуулийн бүх хичээл"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Эрхийн тархалт</CardTitle>
            <CardDescription>
              Сонгосон сургуулийн хэрэглэгчдийн эрхийн хуваарилалт
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Хэрэглэгчийн төлөв</CardTitle>
            <CardDescription>
              Идэвхтэй болон идэвхгүй хэрэглэгчдийн тоо
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name="Хэрэглэгчийн тоо"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Хичээлүүдийн суралцагчийн тоо</CardTitle>
          <CardDescription>
            Сонгосон сургуулийн хичээл тус бүрийн суралцагчийн тоог харьцуулсан
            график
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[420px]">
            {graphLoading ? (
              <div className="flex h-full items-center justify-center text-sm">
                График ачаалж байна...
              </div>
            ) : courseStudentData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm">
                Хичээлийн суралцагчийн мэдээлэл олдсонгүй.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseStudentData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={170}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="students"
                    name="Суралцагчийн тоо"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
