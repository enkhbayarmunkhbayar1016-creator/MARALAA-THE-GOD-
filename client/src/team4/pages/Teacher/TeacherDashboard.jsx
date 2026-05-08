import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiUsers,
  FiBookOpen,
  FiTrendingUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { EmptyState, Skeleton } from "../../components/ui";
import { useAuth } from "../../utils/AuthContext";
import { apiGet, parseField } from "../../utils/api";
import useTeacherCoursesSummary from "./useTeacherCoursesSummary";

const DAY_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_MN = [
  "1-р сар",
  "2-р сар",
  "3-р сар",
  "4-р сар",
  "5-р сар",
  "6-р сар",
  "7-р сар",
  "8-р сар",
  "9-р сар",
  "10-р сар",
  "11-р сар",
  "12-р сар",
];

const SEMESTER_START = new Date("2026-01-26");
const MAX_WEEKS = 18;
const BREAK_AFTER_WEEK = 3;
const BREAK_WEEKS = 1;
const CALENDAR_MIN_WIDTH = 680;

function getCurrentSemesterWeek() {
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const rawWeek = Math.floor((now - SEMESTER_START) / msPerWeek) + 1;
  const adjustedWeek =
    rawWeek > BREAK_AFTER_WEEK ? rawWeek - BREAK_WEEKS : rawWeek;

  return Math.max(1, Math.min(MAX_WEEKS, adjustedWeek));
}

function getWeekDates(semWeek) {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const firstSunday = new Date(SEMESTER_START);
  firstSunday.setDate(SEMESTER_START.getDate() - 1);

  const actualWeek = semWeek > BREAK_AFTER_WEEK ? semWeek + BREAK_WEEKS : semWeek;
  const sunday = new Date(firstSunday.getTime() + (actualWeek - 1) * msPerWeek);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

function apiWeekdayToJsDay(weekday) {
  if (weekday == null) return null;
  return Number(weekday) === 7 ? 0 : Number(weekday);
}

function getEventTime(tt) {
  const period = parseField(tt, "period") ?? tt.period ?? null;
  const periodNo = Number(period?.no ?? tt.period_no ?? tt.no ?? 0);
  const startTime = period?.start_time ?? tt.start_time ?? null;

  const [hourPart = "0", minutePart = "0"] = String(startTime ?? "0:0").split(
    ":"
  );

  return {
    slot: periodNo || Number(tt.period_id ?? 0),
    hour24: Number(hourPart),
    minute: Number(minutePart),
    timeLabel: startTime ? String(startTime).slice(0, 5) : null,
  };
}

const EVENT_COLORS = [
  {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    bg: "bg-sky-100",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  {
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
];

function getEventColorByType(typeName) {
  const name = String(typeName ?? "").trim().toLowerCase();

  if (name.includes("лек")) return EVENT_COLORS[0];
  if (name.includes("лаб")) return EVENT_COLORS[1];
  if (name.includes("сем")) return EVENT_COLORS[2];

  return EVENT_COLORS[3];
}

function getCompactEventTypeLabel(typeName) {
  const name = String(typeName ?? "").trim().toLowerCase();

  if (name.includes("лаб")) return "Лаб";
  if (name.includes("лек")) return "Лекц";
  if (name.includes("сем")) return "Сем";

  return typeName ?? "";
}

function StatCard({ title, value, subtitle, icon: Icon, loading }) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100/80 transition-transform duration-300 group-hover:scale-125" />

      <div className="relative z-10">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Icon className="h-6 w-6" />
        </div>

        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
          {title}
        </p>

        {loading ? (
          <div className="mt-3 h-10 w-20 animate-pulse rounded-xl bg-emerald-50" />
        ) : (
          <p className="mt-3 text-4xl font-black text-slate-950">{value}</p>
        )}

        <p className="mt-2 text-sm font-bold text-emerald-900">{subtitle}</p>
      </div>
    </div>
  );
}

function CoursesTable({ courses, loading }) {
  const [search, setSearch] = useState("");

  const filteredCourses = courses.filter((course) => {
    const text = `${course.name || ""} ${course.courseId || ""}`.toLowerCase();
    return text.includes(search.toLowerCase().trim());
  });

  const maxStudents = Math.max(...filteredCourses.map((c) => c.userCount ?? 0), 1);

  return (
    <div className="rounded-[36px] border border-emerald-100 bg-white p-8 shadow-sm">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-950">Миний хичээлүүд</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Хичээлийн нэр, ID хайх..."
            className="h-14 w-full rounded-2xl border border-emerald-100 bg-emerald-50/50 px-5 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 sm:w-80"
          />

          <div className="rounded-[20px] bg-emerald-600 px-4 py-2.5 text-white shadow-md">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Нийт</p>
            <p className="text-l font-black">{filteredCourses.length} хичээл</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[28px]" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="Хичээл олдсонгүй"
          description="Хайлтын утгад тохирох хичээл байхгүй байна."
        />
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course, index) => {
            const userCount = course.userCount ?? 0;
            const percent = Math.min(100, Math.round((userCount / maxStudents) * 100));
            const isActive = userCount > 0;

            return (
              <Link
                key={course.courseId || index}
                to={`/team4/courses/${course.courseId}/users`}
                className="group relative block overflow-hidden rounded-[30px] border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/40 to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-100/80 transition group-hover:scale-125" />

                <div className="relative z-10 grid gap-5 lg:grid-cols-[72px_1fr_220px_140px] lg:items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-emerald-600 text-2xl font-black text-white shadow-lg">
                    {index + 1}
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isActive ? "Идэвхтэй" : "Хоосон"}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-400">
                        ID: {course.courseId}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black leading-8 text-slate-950">
                      {course.name || `Хичээл #${course.courseId}`}
                    </h3>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
                        Суралцагч
                      </p>
                      <p className="text-sm font-black text-slate-950">{userCount}</p>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-emerald-100">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-start lg:justify-end">
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-md transition group-hover:bg-emerald-600">
                      Удирдах
                      <FiChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HourGrid({ dates, timetable, today, periods }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const slots = periods?.length
    ? periods.map((period) => ({
        slot: Number(period.no ?? period.priority ?? period.id),
        label: period.name ?? `${period.no}-р пар`,
        timeLabel: [period.start_time, period.end_time].filter(Boolean).join(" - "),
      }))
    : Array.from(
        new Map(
          timetable
            .filter((event) => event.slot != null)
            .sort((a, b) => a.slot - b.slot)
            .map((event) => [event.slot, event])
        ).values()
      );

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: CALENDAR_MIN_WIDTH }}>
        <div
          className="grid border-b border-emerald-100 bg-emerald-50/40"
          style={{ gridTemplateColumns: `44px repeat(${dates.length}, 1fr) 44px` }}
        >
          <div />
          {dates.map((date, i) => {
            const isToday = date.toDateString() === today.toDateString();
            const isWknd = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={i}
                className={`py-3 text-center ${isWknd ? "bg-emerald-50/70" : ""}`}
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                  {DAY_SHORT[date.getDay()]}
                </p>

                <p
                  className={`mt-1 text-xl font-black leading-none ${
                    isToday ? "text-emerald-700" : "text-slate-800"
                  }`}
                >
                  {date.getDate()}
                </p>
              </div>
            );
          })}

          <div className="py-3 text-center">
            <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-400">
              Пар
            </p>
          </div>
        </div>

        {slots.map((slot) => (
          <div
            key={slot.slot}
            className="grid min-h-[58px] border-b border-emerald-50"
            style={{ gridTemplateColumns: `44px repeat(${dates.length}, 1fr) 44px` }}
          >
            <div className="flex flex-col items-center justify-center gap-0.5 px-1 text-center">
              <span className="text-[10px] font-black text-emerald-600">
                {slot.slot}
              </span>
              {slot.timeLabel && (
                <span className="text-[8px] text-slate-400">{slot.timeLabel}</span>
              )}
            </div>

            {dates.map((date, di) => {
              const isToday = date.toDateString() === today.toDateString();
              const isWknd = date.getDay() === 0 || date.getDay() === 6;

              const evs = timetable.filter(
                (event) => event.day === date.getDay() && event.slot === slot.slot
              );

              return (
                <div
                  key={di}
                  className={`min-w-0 overflow-hidden border-l border-emerald-50 px-1 py-1 ${
                    isWknd ? "bg-emerald-50/30" : ""
                  } ${isToday ? "bg-emerald-50/50" : ""}`}
                >
                  {evs.map((ev, ei) => {
                    const col = getEventColorByType(ev.type);
                    const typeLabel = getCompactEventTypeLabel(ev.type);
                    const timeStr =
                      ev.timeLabel ??
                      `${String(ev.hour24 ?? 0).padStart(2, "0")}:${String(
                        ev.minute ?? 0
                      ).padStart(2, "0")}`;

                    return (
                      <button
                        type="button"
                        key={ei}
                        onClick={() => setSelectedEvent({ ...ev, timeStr })}
                        className={`mb-1 block h-[46px] w-full min-w-0 overflow-hidden rounded-lg border px-2 py-1 text-left transition hover:brightness-95 ${col.bg} ${col.border}`}
                      >
                        <div
                          className={`flex min-w-0 items-center gap-2 text-[9px] font-bold ${col.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                          <span>{timeStr}</span>
                          <span className="ml-auto">{typeLabel}</span>
                        </div>

                        <p className={`truncate text-[10px] font-black ${col.text}`}>
                          {ev.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            <div className="flex flex-col items-center justify-center border-l border-emerald-50 px-1 text-center">
              <span className="text-[9px] font-bold text-emerald-300">
                {slot.slot}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

function MonthGrid({ year, month, timetable, today }) {
  const [expandedDateKey, setExpandedDateKey] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const days = getMonthDays(year, month);
  const weeks = [];

  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: CALENDAR_MIN_WIDTH }}>
        <div className="grid grid-cols-7 border-b border-emerald-100 bg-emerald-50/40">
          {DAY_SHORT.map((d) => (
            <div
              key={d}
              className="py-3 text-center text-[9px] font-black uppercase tracking-widest text-emerald-500"
            >
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-emerald-50">
            {week.map((date, di) => {
              if (!date) {
                return (
                  <div
                    key={di}
                    className="min-h-[86px] border-l border-emerald-50 bg-emerald-50/20"
                  />
                );
              }

              const isToday = date.toDateString() === today.toDateString();
              const isWknd = date.getDay() === 0 || date.getDay() === 6;
              const evs = timetable.filter((event) => event.day === date.getDay());
              const dateKey = date.toISOString().slice(0, 10);
              const isExpanded = expandedDateKey === dateKey;
              const visibleEvents = isExpanded ? evs : evs.slice(0, 2);

              return (
                <button
                  type="button"
                  key={di}
                  onClick={() => setExpandedDateKey(isExpanded ? null : dateKey)}
                  className={`min-h-[86px] border-l border-emerald-50 p-2 text-left transition hover:bg-emerald-50 ${
                    isWknd ? "bg-emerald-50/30" : ""
                  } ${isToday ? "bg-emerald-100/40" : ""}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-black ${
                        isToday ? "text-emerald-700" : "text-slate-800"
                      }`}
                    >
                      {date.getDate()}
                    </p>

                    {evs.length > 2 && (
                      <span className="text-[9px] font-bold text-emerald-500">
                        {isExpanded ? "Хураах" : `+${evs.length - 2}`}
                      </span>
                    )}
                  </div>

                  <div className={isExpanded ? "max-h-32 overflow-y-auto pr-1" : ""}>
                    {visibleEvents.map((ev, ei) => {
                      const col = getEventColorByType(ev.type);

                      return (
                        <button
                          type="button"
                          key={ei}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`mb-1 block w-full truncate rounded-lg px-2 py-1 text-left text-[9px] font-bold ${col.bg} ${col.text}`}
                        >
                          {ev.timeLabel ? `${ev.timeLabel} ` : ""}
                          {ev.name}
                        </button>
                      );
                    })}
                  </div>

                  {evs.length === 0 && (
                    <p className="text-[9px] font-semibold text-slate-300">
                      Хичээлгүй
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

function EventModal({ event, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black text-emerald-500">
              {event.timeStr ?? event.timeLabel ?? "Цаггүй"}
            </p>

            <h3 className="mt-1 text-lg font-black text-slate-950">
              {event.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700 hover:bg-emerald-100"
          >
            Хаах
          </button>
        </div>

        <div className="space-y-2 text-sm font-semibold text-slate-600">
          <p>
            <span className="font-black text-emerald-900">Төрөл:</span>{" "}
            {event.type}
          </p>
          <p>
            <span className="font-black text-emerald-900">Пар:</span>{" "}
            {event.slot}
          </p>
          {event.timeLabel && (
            <p>
              <span className="font-black text-emerald-900">Цаг:</span>{" "}
              {event.timeLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const { user, school } = useAuth();

  const [semWeek, setSemWeek] = useState(getCurrentSemesterWeek);
  const [timetable, setTimetable] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [view, setView] = useState("өдөр");
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [dayOffset, setDayOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const { courses, loading: coursesLoading } = useTeacherCoursesSummary({
    userId: user?.id,
    schoolId: school?.id,
  });

  const today = new Date();
  const dayDate = new Date(today);
  dayDate.setDate(today.getDate() + dayOffset);

  const weekDates = getWeekDates(semWeek);

  const monthDate = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1
  );
  const monthYear = monthDate.getFullYear();
  const monthMonth = monthDate.getMonth();

  const totalStudents = courses.reduce(
    (sum, course) => sum + (course.userCount ?? 0),
    0
  );

  const activeCourses = courses.filter((course) => (course.userCount ?? 0) > 0)
    .length;

  const averageStudents = courses.length
    ? Math.round(totalStudents / courses.length)
    : 0;

  const topCourse = useMemo(() => {
    return [...courses].sort((a, b) => (b.userCount ?? 0) - (a.userCount ?? 0))[0];
  }, [courses]);

  const canGoPrev =
    view === "өдөр" ? true : view === "сар" ? true : semWeek > 1;

  const canGoNext =
    view === "өдөр" ? true : view === "сар" ? true : semWeek < MAX_WEEKS;

  function handlePrev() {
    if (view === "өдөр") setDayOffset((offset) => offset - 1);
    else if (view === "сар") setMonthOffset((offset) => offset - 1);
    else if (canGoPrev) setSemWeek((week) => week - 1);
  }

  function handleNext() {
    if (view === "өдөр") setDayOffset((offset) => offset + 1);
    else if (view === "сар") setMonthOffset((offset) => offset + 1);
    else if (canGoNext) setSemWeek((week) => week + 1);
  }

  function handleToday() {
    setDayOffset(0);
    setMonthOffset(0);
    setSemWeek(getCurrentSemesterWeek());
  }

  const toolbarLabel = (() => {
    if (view === "сар") return `${monthYear} — ${MONTH_MN[monthMonth]}`;

    const opts = { month: "short", day: "numeric" };

    if (view === "өдөр") {
      return dayDate.toLocaleDateString("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    const start = weekDates[0];
    const end = weekDates[6];

    return `${semWeek}-р долоо хоног · ${start.toLocaleDateString(
      "en",
      opts
    )} – ${end.toLocaleDateString("en", opts)}`;
  })();

  useEffect(() => {
    if (!user?.id || !school?.id || coursesLoading) return;

    setTimetableLoading(true);

    Promise.all([
      apiGet(`/schools/${school.id}/periods`).catch(() => ({ items: [] })),
    ])
      .then(async ([periodsData]) => {
        const schoolPeriods = (periodsData?.items ?? [])
          .slice()
          .sort(
            (a, b) =>
              Number(a.no ?? a.priority ?? a.id) -
              Number(b.no ?? b.priority ?? b.id)
          );

        setPeriods(schoolPeriods);

        const allEvents = [];

        for (const course of courses) {
          const cId = course.courseId;
          const name = course.name ?? `Хичээл #${cId}`;

          try {
            const ttData = await apiGet(`/courses/${cId}/timetables`);

            (ttData?.items ?? []).forEach((tt, idx) => {
              const lessonType = parseField(tt, "lesson_type") ?? tt.lesson_type;
              const eventTime = getEventTime(tt);

              allEvents.push({
                name,
                day: apiWeekdayToJsDay(tt.weekday ?? idx % 7),
                slot: eventTime.slot,
                hour24: eventTime.hour24,
                minute: eventTime.minute,
                timeLabel: eventTime.timeLabel,
                type: lessonType?.name ?? "Лекц",
              });
            });
          } catch {}
        }

        setTimetable(allEvents);
      })
      .catch(() => {
        setTimetable([]);
        setPeriods([]);
      })
      .finally(() => setTimetableLoading(false));
  }, [user?.id, school?.id, courses, coursesLoading]);

  const displayDates = view === "өдөр" ? [dayDate] : weekDates;
  const loading = coursesLoading || timetableLoading;

  return (
    <div className="mx-auto max-w-7xl space-y-7 -mt-6">


      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

      </div>

    <CoursesTable courses={courses} loading={loading} />

    </div>
  );
}