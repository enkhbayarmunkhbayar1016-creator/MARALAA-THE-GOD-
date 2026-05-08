import { Link } from "react-router-dom";
import { FiBookOpen, FiMoreVertical, FiCalendar } from "react-icons/fi";
import { parseField } from "../api/studentCourseApi";

function fmt(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function courseStatus(startOn, endOn) {
  const now = Date.now();
  const start = startOn ? new Date(startOn).getTime() : null;
  const end   = endOn   ? new Date(endOn).getTime()   : null;
  if (end && now > end)   return { label: "Дууссан",    color: "bg-teal-50 text-teal-300" };
  if (start && now < start) return { label: "Эхлээгүй", color: "bg-yellow-100 text-yellow-700" };
  return { label: "Явагдаж байна", color: "bg-green-100 text-green-700" };
}

function ImagePlaceholder() {
  return (
    <div className="flex items-center justify-center h-32 bg-teal-50 rounded-b-xl">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-14 w-14 text-zinc-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

export default function CourseCard({ enrollment, schoolName }) {
  const course   = parseField(enrollment, "course") ?? {};
  const group    = parseField(enrollment, "group")  ?? {};

  const courseId   = course.id    ?? enrollment.course_id;
  const name       = course.name  ?? "—";
  const picture    = course.picture;
  const startOn    = course.start_on;
  const endOn      = course.end_on;

  const schoolAbbr = schoolName
    ? schoolName.split(/[\s,]+/).map((w) => w[0]).join("").toUpperCase().slice(0, 5)
    : "—";
  const groupLabel = group?.name ?? "—";
  const topLabel   = `${schoolAbbr} · ${groupLabel}`;

  const hasImage = picture && picture !== "no-image.jpg";
  const status   = courseStatus(startOn, endOn);

  return (
    <Link
      to={`/team4/student/courses/${courseId}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-teal-100 bg-white
        shadow-sm transition-all hover:shadow-md hover:border-zinc-300"
    >
      <div className="flex flex-col gap-2 p-4 flex-1">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <FiBookOpen className="h-3.5 w-3.5 shrink-0 text-teal-400" />
            <span className="truncate text-xs font-medium text-teal-300 uppercase tracking-wide">
              {topLabel}
            </span>
          </div>
          <button
            onClick={(e) => e.preventDefault()}
            className="shrink-0 rounded-md p-1 text-teal-400 hover:bg-teal-50 hover:text-teal-600" style={{ color: "#0f766e" }}
            aria-label="Дэлгэрэнгүй цэс"
          >
            <FiMoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Course name */}
        <h3 className="text-sm font-bold leading-snug text-teal-900 line-clamp-2 uppercase">
          {name}
        </h3>

        {/* Status badge */}
        <span className={`self-start rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
          {status.label}
        </span>

        {/* Date range */}
        <div className="flex items-center gap-1.5 text-xs text-teal-400 mt-auto">
          <FiCalendar className="h-3 w-3 shrink-0" />
          <span>{fmt(startOn)} – {fmt(endOn)}</span>
        </div>
      </div>

      {/* ── Image area ────────────────────────────────────── */}
      {hasImage ? (
        <img
          src={picture}
          alt={name}
          className="h-32 w-full object-cover"
        />
      ) : (
        <ImagePlaceholder />
      )}
    </Link>
  );
}
