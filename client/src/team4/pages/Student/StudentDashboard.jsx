import { useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiClipboard,
  FiMapPin,
  FiUser,
  FiTrendingUp,
  FiCheckCircle,
  FiSearch,
} from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import { getStudentDashboardData } from "./api/studentDashboard";
import { useStudentData } from "./hooks";
import { fmt, fmtTime } from "./utils";

const DAYS = [
  { id: 1, label: "Дав", full: "Даваа" },
  { id: 2, label: "Мяг", full: "Мягмар" },
  { id: 3, label: "Лха", full: "Лхагва" },
  { id: 4, label: "Пүр", full: "Пүрэв" },
  { id: 5, label: "Баа", full: "Баасан" },
  { id: 6, label: "Бям", full: "Бямба" },
  { id: 7, label: "Ням", full: "Ням" },
];

function getTodayWeekday() {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

export default function StudentHome({ userId: userIdProp }) {
  const { user, school } = useAuth();

  const userId = userIdProp ?? user?.id;
  const schoolId = school?.id;

  const [selectedDay, setSelectedDay] = useState(getTodayWeekday());
  const [examSearch, setExamSearch] = useState("");

  const { data, loading, error } = useStudentData(
    () => getStudentDashboardData({ userId, schoolId }),
    [userId, schoolId]
  );

  const stats = data?.stats ?? {
    enrolledCourses: 0,
    openExams: 0,
    totalExams: 0,
    schoolCount: 0,
  };

  const courses = data?.courses ?? [];
  const exams = data?.exams ?? [];

  const scheduleCourses = useMemo(() => {
    return courses.slice(0, 20).map((item, index) => {
      const course = item.course ?? item;
      const courseId = course.id ?? item.course_id ?? index;

      return {
        id: courseId,
        name:
          course.name ??
          course.course_name ??
          course.title ??
          `Хичээл #${courseId}`,
        code: course.code ?? course.course_code ?? "Кодгүй",
        teacher:
          course.teacher_name ??
          course.teacherName ??
          course.teacher?.name ??
          "Багшийн мэдээлэлгүй",
        room: course.room ?? course.classroom ?? "Өрөө тодорхойгүй",
        time:
          course.time ??
          ["08:00 - 09:30", "09:40 - 11:10", "11:20 - 12:50"][index % 3],
        type: course.type ?? ["Лекц", "Лаборатори", "Семинар"][index % 3],
        dayId: course.weekday ?? course.day_id ?? ((index % 5) + 1),
      };
    });
  }, [courses]);

  const selectedDayInfo = DAYS.find((d) => d.id === selectedDay) ?? DAYS[0];

  const selectedDayCourses = scheduleCourses.filter(
    (course) => Number(course.dayId) === Number(selectedDay)
  );

  const allExams = exams
    .slice()
    .sort((a, b) => new Date(a?.open_on || 0) - new Date(b?.open_on || 0));

  const filteredExams = allExams.filter((exam) => {
    const q = examSearch.trim().toLowerCase();
    if (!q) return true;

    return (
      String(exam?.name ?? "").toLowerCase().includes(q) ||
      String(exam?.description ?? "").toLowerCase().includes(q) ||
      String(exam?.duration ?? "").toLowerCase().includes(q) ||
      String(exam?.open_on ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-7 bg-transparent p-0">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FiBookOpen}
          title="Нийт хичээл"
          value={loading ? "..." : stats.enrolledCourses}
          description="Бүртгэлтэй хичээл"
        />

        <StatCard
          icon={FiCheckCircle}
          title="Идэвхтэй шалгалт"
          value={loading ? "..." : stats.openExams}
          description="Өгөх боломжтой"
        />

        <StatCard
          icon={FiClipboard}
          title="Нийт шалгалт"
          value={loading ? "..." : stats.totalExams}
          description="Бүх шалгалтаар"
        />

        <StatCard
          icon={FiTrendingUp}
          title="Оюутны код"
          value={loading ? "..." : user?.username || "schoolstudent"}
          description={school?.name || "Сургуулийн мэдээлэл"}
          small
        />
      </div>

      <section className="rounded-[32px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Хичээлийн хуваарь
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Энэ 7 хоногийн хичээлийн хуваарь
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-600">
            {scheduleCourses.length} хуваарь
          </div>
        </div>

        <div className="mb-6 grid gap-3 rounded-[28px] bg-blue-50/70 p-3 sm:grid-cols-2 lg:grid-cols-7">
          {DAYS.map((day) => {
            const count = scheduleCourses.filter(
              (course) => Number(course.dayId) === Number(day.id)
            ).length;

            const active = selectedDay === day.id;

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedDay(day.id)}
                className={`rounded-2xl px-4 py-4 text-center transition duration-200 hover:-translate-y-1 hover:shadow-md ${
                  active
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-blue-950 hover:bg-blue-100"
                }`}
              >
                <p className="text-base font-black">{day.label}</p>
                <p
                  className={`mt-1 text-xs font-black ${
                    active ? "text-blue-50" : "text-blue-600"
                  }`}
                >
                  {count} хичээл
                </p>
              </button>
            );
          })}
        </div>

        <div className="rounded-[28px] border border-blue-100 bg-white p-6">
          <p className="text-sm font-black text-blue-500">
            2026 оны хичээлийн хуваарь
          </p>

          <h3 className="mt-2 text-3xl font-black text-slate-950">
            {selectedDayInfo.full}
          </h3>

          <div className="mt-6 space-y-4">
            {loading ? (
              <SkeletonRows count={3} />
            ) : selectedDayCourses.length === 0 ? (
              <EmptyBox text="Энэ өдөр хичээлийн хуваарь байхгүй байна." />
            ) : (
              selectedDayCourses.map((course) => (
                <ScheduleCard key={course.id} course={course} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Шалгалтын хуваарь
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Бүх шалгалтын жагсаалт болон хугацаа
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-600">
            {filteredExams.length} / {allExams.length} шалгалт
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
            <input
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
              placeholder="Шалгалтын нэр, огноо, хугацаагаар хайх..."
              className="h-14 w-full rounded-2xl border border-blue-100 bg-blue-50/60 pl-14 pr-5 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {loading ? (
          <SkeletonRows count={4} />
        ) : filteredExams.length === 0 ? (
          <EmptyBox text="Хайлтад тохирох шалгалт олдсонгүй." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, description, small = false }) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-100/70 transition group-hover:scale-125 group-hover:bg-blue-200/80" />

      <div className="relative">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>

        <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-500">
          {title}
        </p>

        <p
          className={`mt-3 font-black text-slate-950 ${
            small ? "text-xl" : "text-4xl"
          }`}
        >
          {value}
        </p>

        <p className="mt-2 text-sm font-bold text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function ScheduleCard({ course }) {
  const isLab = String(course.type).toLowerCase().includes("лаб");

  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
        isLab
          ? "border-blue-200 bg-blue-50"
          : "border-cyan-200 bg-cyan-50"
      }`}
    >
      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/60 transition group-hover:scale-125" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-black text-blue-700">
            Цаг: {course.time}
          </span>

          <h4 className="mt-5 text-2xl font-black text-slate-950">
            {course.name}
          </h4>

          <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
            <span className="inline-flex items-center gap-2">
              <FiMapPin className="h-4 w-4 text-blue-500" />
              Байрлал: {course.room}
            </span>

            <span className="inline-flex items-center gap-2">
              <FiUser className="h-4 w-4 text-blue-500" />
              {course.teacher}
            </span>
          </div>
        </div>

        <span className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700">
          {course.type}
        </span>
      </div>
    </div>
  );
}

function ExamCard({ exam }) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-100/70 transition group-hover:scale-125" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
            <FiClipboard className="h-6 w-6" />
          </div>

          <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
            Шалгалт
          </span>
        </div>

        <h3 className="mt-5 text-lg font-black text-slate-950">
          {exam.name || "Шалгалт"}
        </h3>

        <div className="mt-4 space-y-2 text-sm font-bold text-slate-600">
          <p className="inline-flex items-center gap-2">
            <FiCalendar className="h-4 w-4 text-blue-600" />
            {fmt(exam.open_on)}
          </p>

          <p className="flex items-center gap-2">
            <FiClock className="h-4 w-4 text-blue-600" />
            {fmtTime(exam.open_on)} · {exam.duration || "-"} мин
          </p>
        </div>
      </div>
    </div>
  );
}

function SkeletonRows({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-[24px] bg-blue-50"
        />
      ))}
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-[26px] border border-dashed border-blue-200 bg-blue-50/60 px-5 py-14 text-center text-sm font-bold text-blue-500">
      {text}
    </div>
  );
}