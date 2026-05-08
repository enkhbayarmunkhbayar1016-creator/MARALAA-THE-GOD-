import { useEffect, useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiMapPin,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui";
import { apiGet, parseField } from "../../utils/api";
import { useAuth } from "../../utils/AuthContext";
import useTeacherCoursesSummary from "./useTeacherCoursesSummary";

const GREEN = "#059669";
const GREEN_DARK = "#064e3b";
const GREEN_SOFT = "#ecfdf5";
const GREEN_BORDER = "#bbf7d0";

const WEEK_DAYS = [
  { id: 1, label: "Даваа", short: "Дав" },
  { id: 2, label: "Мягмар", short: "Мяг" },
  { id: 3, label: "Лхагва", short: "Лха" },
  { id: 4, label: "Пүрэв", short: "Пүр" },
  { id: 5, label: "Баасан", short: "Баа" },
  { id: 6, label: "Бямба", short: "Бям" },
  { id: 7, label: "Ням", short: "Ням" },
];

function StatCard({ title, value, desc, icon, loading }) {
  return (
    <div
      className="group relative overflow-hidden rounded-[28px] border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: GREEN_BORDER }}
    >
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full transition-all duration-300 group-hover:scale-125"
        style={{ background: "#d1fae5" }}
      />

      <div className="relative z-10">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: GREEN_SOFT, color: GREEN }}
        >
          {icon}
        </div>

        <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: GREEN }}>
          {title}
        </p>

        {loading ? (
          <div className="mt-4 h-10 w-20 animate-pulse rounded-xl" style={{ background: GREEN_SOFT }} />
        ) : (
          <p className="mt-3 text-4xl font-black text-slate-950">{value}</p>
        )}

        <p className="mt-2 text-sm font-bold" style={{ color: GREEN_DARK }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

function CourseMiniCard({ course, index }) {
  return (
    <Link
      to={`/team4/courses/${course.courseId}/users`}
      className="group rounded-[24px] border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ borderColor: GREEN_BORDER }}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white"
          style={{ background: GREEN }}
        >
          {index + 1}
        </div>

        <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: GREEN_SOFT, color: GREEN }}>
          {course.userCount ?? 0} суралцагч
        </span>
      </div>

      <h3 className="mt-5 line-clamp-2 text-lg font-black text-slate-950">
        {course.name}
      </h3>

      <p className="mt-3 text-sm font-semibold text-slate-500">
        Хичээлийн хэрэглэгч, ирц, багийг удирдах
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm font-black" style={{ color: GREEN }}>
        Нээх <FiChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function getTimeLabel(item) {
  const period = parseField(item, "period") ?? item.period ?? null;

  const start =
    period?.start_time ??
    item.start_time ??
    item.time_start ??
    item.begin_time ??
    "";

  const end =
    period?.end_time ??
    item.end_time ??
    item.time_end ??
    "";

  if (start && end) return `${String(start).slice(0, 5)} - ${String(end).slice(0, 5)}`;
  if (start) return String(start).slice(0, 5);

  const no = period?.no ?? item.period_no ?? item.no ?? item.period_id;
  return no ? `${no}-р цаг` : "Цаггүй";
}

function ScheduleBoard({ schedule }) {
  const [selectedDay, setSelectedDay] = useState(1);

  const grouped = WEEK_DAYS.map((day) => ({
    ...day,
    items: schedule.filter((item) => Number(item.weekday) === day.id),
  }));

  const selected = grouped.find((day) => day.id === selectedDay);
  const selectedItems = selected?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-emerald-50/70 p-4">
        <div className="grid grid-cols-7 gap-3">
          {grouped.map((day) => {
            const active = selectedDay === day.id;

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedDay(day.id)}
                className={`rounded-2xl px-3 py-4 text-center transition-all ${
                  active
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-white text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <p className="text-sm font-black">{day.short}</p>
                <p className="mt-1 text-xs font-bold">
                  {day.items.length} хичээл
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-bold text-slate-400">2026 оны хичээлийн хуваарь</p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">
            {selected?.label}
          </h3>
        </div>

        {selectedItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/60 p-10 text-center">
            <p className="text-sm font-black text-emerald-700">
              Энэ өдөр хичээлгүй байна.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {selectedItems.map((item, index) => (
              <ScheduleBlock
                key={`${item.courseId}-${item.id || index}`}
                item={item}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleBlock({ item }) {
  const type = String(item.type || "").toLowerCase();

  const style = type.includes("лек")
    ? {
        card: "border-amber-200 bg-amber-50",
        text: "text-amber-700",
        bubble: "bg-amber-300/30",
      }
    : type.includes("лаб")
      ? {
          card: "border-blue-200 bg-blue-50",
          text: "text-blue-700",
          bubble: "bg-blue-300/30",
        }
      : type.includes("сем")
        ? {
            card: "border-violet-200 bg-violet-50",
            text: "text-violet-700",
            bubble: "bg-violet-300/30",
          }
        : {
            card: "border-emerald-200 bg-emerald-50",
            text: "text-emerald-700",
            bubble: "bg-emerald-300/30",
          };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border ${style.card} p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className={`absolute -right-10 -bottom-10 h-32 w-32 rounded-full ${style.bubble}`} />
      <div className={`absolute right-8 top-6 h-16 w-16 rounded-full ${style.bubble}`} />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className={`rounded-2xl bg-white/80 px-4 py-2 text-sm font-black ${style.text}`}>
            Цаг: {getTimeLabel(item)}
          </div>

          <div className={`rounded-2xl bg-white/80 px-4 py-2 text-sm font-black ${style.text}`}>
            {item.type || "Хичээл"}
          </div>
        </div>

        <h3 className="text-lg font-black leading-7 text-slate-950">
          {item.courseName}
        </h3>

        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-500">
          <FiMapPin className={`h-4 w-4 ${style.text}`} />
          Байрлал: {item.room || item.classroom || item.room_name || "Өрөөгүй"}
        </div>
      </div>
    </div>
  );
}

export default function TeacherHomeSummary({ userId }) {
  const { school } = useAuth();

  const [schoolCount, setSchoolCount] = useState(0);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const { courses, loading: coursesLoading } = useTeacherCoursesSummary({
    userId,
    schoolId: school?.id,
  });

  useEffect(() => {
    if (!userId) {
      setSchoolCount(0);
      setSchoolsLoading(false);
      return;
    }

    setSchoolsLoading(true);

    apiGet(`/users/${userId}/schools`)
      .then((data) => setSchoolCount(data?.count ?? data?.items?.length ?? 0))
      .catch(() => setSchoolCount(0))
      .finally(() => setSchoolsLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!courses.length) {
      setSchedule([]);
      return;
    }

    async function loadSchedule() {
      try {
        setScheduleLoading(true);

        const results = await Promise.allSettled(
          courses.map((course) => apiGet(`/courses/${course.courseId}/timetables`))
        );

        const list = [];

        results.forEach((result, index) => {
          if (result.status !== "fulfilled") return;

          const course = courses[index];

          (result.value?.items ?? []).forEach((tt) => {
            const lessonType = parseField(tt, "lesson_type") ?? tt.lesson_type ?? null;
            const period = parseField(tt, "period") ?? tt.period ?? null;

            list.push({
              ...tt,
              courseId: course.courseId,
              courseName: course.name,
              weekday: tt.weekday ?? tt.day ?? tt.week_day,
              type: lessonType?.name ?? tt.type_name ?? "Хичээл",
              room: tt.room ?? tt.classroom ?? tt.room_name ?? "",
              period,
            });
          });
        });

        list.sort((a, b) => {
          const dayA = Number(a.weekday || 99);
          const dayB = Number(b.weekday || 99);

          if (dayA !== dayB) return dayA - dayB;

          const periodA = Number(a.period?.no ?? a.period_no ?? a.no ?? a.period_id ?? 99);
          const periodB = Number(b.period?.no ?? b.period_no ?? b.no ?? b.period_id ?? 99);

          return periodA - periodB;
        });

        setSchedule(list);
      } catch {
        setSchedule([]);
      } finally {
        setScheduleLoading(false);
      }
    }

    loadSchedule();
  }, [courses]);

  const loading = coursesLoading || schoolsLoading;

  const totalStudents = courses.reduce((sum, course) => sum + (course.userCount ?? 0), 0);
  const activeCourseCount = courses.filter((course) => (course.userCount ?? 0) > 0).length;
  const averageStudent = courses.length ? Math.round(totalStudents / courses.length) : 0;

  const topCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => (b.userCount ?? 0) - (a.userCount ?? 0))
      .slice(0, 4);
  }, [courses]);

  return (
    <div className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Нийт хичээл"
          value={courses.length}
          desc="Миний заадаг хичээл"
          icon={<FiBookOpen className="h-6 w-6" />}
          loading={loading}
        />

        <StatCard
          title="Идэвхтэй хичээл"
          value={activeCourseCount}
          desc="Суралцагчтай хичээл"
          icon={<FiCheckCircle className="h-6 w-6" />}
          loading={loading}
        />

        <StatCard
          title="Нийт суралцагч"
          value={totalStudents}
          desc="Бүх хичээлээр"
          icon={<FiUsers className="h-6 w-6" />}
          loading={loading}
        />

        <StatCard
          title="Дундаж"
          value={averageStudent}
          desc="Нэг хичээлийн ачаалал"
          icon={<FiTrendingUp className="h-6 w-6" />}
          loading={loading}
        />
      </div>

      <div className="rounded-[32px] border bg-white p-7 shadow-sm" style={{ borderColor: GREEN_BORDER }}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Хичээлийн удирдлага</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Суралцагч ихтэй хичээлүүдийг түрүүлж харуулж байна.
            </p>
          </div>

          <Link
            to="/team4/teacher"
            className="rounded-2xl px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: GREEN }}
          >
            Бүгдийг харах
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-[24px]" style={{ background: GREEN_SOFT }} />
            ))}
          </div>
        ) : topCourses.length === 0 ? (
          <EmptyState title="Хичээл алга" description="Танд одоогоор оноогдсон хичээл байхгүй байна." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topCourses.map((course, index) => (
              <CourseMiniCard key={course.courseId || index} course={course} index={index} />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[32px] border bg-white p-7 shadow-sm" style={{ borderColor: GREEN_BORDER }}>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Хичээлийн хуваарь</h2>
          </div>

          <span className="rounded-full px-4 py-2 text-sm font-black" style={{ background: GREEN_SOFT, color: GREEN }}>
            {schedule.length} хуваарь
          </span>
        </div>

        {scheduleLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-[24px]" style={{ background: GREEN_SOFT }} />
            ))}
          </div>
        ) : schedule.length === 0 ? (
          <div
            className="rounded-[24px] border border-dashed p-10 text-center"
            style={{ borderColor: GREEN_BORDER, background: GREEN_SOFT }}
          >
            <FiClock className="mx-auto h-8 w-8" style={{ color: GREEN }} />
            <p className="mt-3 text-sm font-black" style={{ color: GREEN_DARK }}>
              Хичээлийн хуваарь олдсонгүй.
            </p>
          </div>
        ) : (
          <ScheduleBoard schedule={schedule} />
        )}
      </div>
    </div>
  );
}