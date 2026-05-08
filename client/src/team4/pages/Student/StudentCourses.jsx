import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import { getStudentCourses } from "./api/studentCourseApi";
import { useStudentData } from "./hooks";

function getCourse(enrollment) {
  return enrollment?.course ?? enrollment ?? {};
}

function getCourseId(enrollment) {
  const course = getCourse(enrollment);
  return course?.id ?? enrollment?.course_id ?? enrollment?.id;
}

function getStatus(course) {
  const now = new Date();
  const start = course?.start_on ? new Date(course.start_on) : null;
  const end = course?.end_on ? new Date(course.end_on) : null;

  if (start && now < start) return { label: "Удахгүй эхэлнэ", color: "bg-blue-50 text-blue-700" };
  if (end && now > end) return { label: "Дууссан", color: "bg-slate-100 text-slate-600" };
  return { label: "Суралцаж байна", color: "bg-emerald-50 text-emerald-700" };
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return value;
  }
}

function SkeletonCard() {
  return (
    <div className="h-72 animate-pulse rounded-[30px] bg-white shadow-sm" />
  );
}

function CourseTile({ enrollment, index }) {
  const course = getCourse(enrollment);
  const courseId = getCourseId(enrollment);
  const status = getStatus(course);

  const name =
    course?.name ||
    course?.course_name ||
    course?.title ||
    `Хичээл #${courseId}`;

  const code =
    course?.code ||
    course?.course_code ||
    course?.subject_code ||
    "Кодгүй";

  const teacher =
    course?.teacher_name ||
    course?.teacherName ||
    course?.teacher?.name ||
    "Багшийн мэдээлэлгүй";

  const credit =
    course?.credits ??
    course?.credit ??
    enrollment?.credits ??
    0;

  const gradientList = [
    "from-blue-600 to-sky-400",
    "from-indigo-600 to-blue-400",
    "from-cyan-600 to-blue-500",
    "from-violet-600 to-indigo-400",
  ];

  const gradient = gradientList[index % gradientList.length];

  return (
    <Link
      to={`/team4/student/courses/${courseId}`}
      className="group block overflow-hidden rounded-[30px] border border-blue-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
    >
      <div className={`relative h-36 bg-gradient-to-br ${gradient} p-5 text-white`}>
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 transition duration-300 group-hover:scale-125" />
        <div className="absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-white/10 transition duration-300 group-hover:scale-125" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <FiBookOpen className="h-7 w-7" />
          </div>

          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black backdrop-blur">
            {credit} кредит
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-500">
              {code}
            </p>

            <h3 className="mt-2 line-clamp-2 text-xl font-black leading-snug text-slate-950">
              {name}
            </h3>
          </div>

          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-2 text-sm font-bold text-slate-500">
          <p className="flex items-center gap-2">
            <FiUser className="h-4 w-4 text-blue-500" />
            {teacher}
          </p>

          <p className="flex items-center gap-2">
            <FiCalendar className="h-4 w-4 text-blue-500" />
            {formatDate(course?.start_on || course?.start_date)} →{" "}
            {formatDate(course?.end_on || course?.end_date)}
          </p>

          <p className="flex items-center gap-2">
            <FiClock className="h-4 w-4 text-blue-500" />
            {course?.duration ? `${course.duration} мин` : "Хугацаа тодорхойгүй"}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
          Дэлгэрэнгүй харах
          <FiArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function StudentCourses() {
  const { user, school } = useAuth();

  const { data, loading, error } = useStudentData(
    () => (user?.id ? getStudentCourses(user.id) : null),
    [user?.id]
  );

  const enrollments = data?.items ?? [];

  return (
    <div className="space-y-7">
      <div className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-600">
              Миний сургалтын булан
            </p>

            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Бүртгэлтэй хичээлүүд
            </h1>

            <p className="mt-2 text-sm font-bold text-slate-500">
              {school?.name || "Сургуулийн мэдээлэл"} ·{" "}
              {loading ? "..." : `${enrollments.length} хичээл`}
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg">
            <FiBookOpen className="h-8 w-8" />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Хичээлийн жагсаалт
            </h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Өөрийн бүртгүүлсэн бүх хичээлийг эндээс харна.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
            <input
              placeholder="Хичээл хайх..."
              className="h-13 w-full rounded-2xl border border-blue-100 bg-blue-50/60 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && !error && enrollments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[30px] border border-dashed border-blue-200 bg-blue-50/60 px-5 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm">
              <FiBookOpen className="h-8 w-8" />
            </div>

            <p className="text-lg font-black text-slate-950">
              Хичээл олдсонгүй
            </p>

            <p className="mt-2 text-sm font-bold text-slate-500">
              Та одоогоор ямар нэг хичээлд бүртгэлгүй байна.
            </p>
          </div>
        )}

        {!loading && enrollments.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {enrollments.map((enrollment, index) => (
              <CourseTile
                key={enrollment.id ?? enrollment.course_id ?? index}
                enrollment={enrollment}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}