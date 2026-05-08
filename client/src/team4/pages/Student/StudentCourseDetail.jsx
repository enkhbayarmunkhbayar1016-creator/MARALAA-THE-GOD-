import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiBookOpen,
  FiTag,
  FiInfo,
  FiUsers,
  FiClipboard,
  FiAward,
  FiFileText,
  FiClock,
  FiStar,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../../utils/AuthContext";
import {
  getCourseDetail,
  getAllCourseLessons,
  getCourseTeachers,
  getCourseExams,
  getGradebookExams,
  getGradebookSubmissions,
  getGradebookAttendances,
} from "./api/studentCourseApi";
import { useStudentData } from "./hooks";
import { useToast } from "../../components/ui/Toast";
import { fmt, fmtDateTime, courseStatus, avatarSrc } from "./utils";
import LessonRow from "./components/LessonRow";
import GradeTable from "./components/GradeTable";

const TABS = [
  { id: "info", label: "Хичээлийн мэдээлэл", icon: FiInfo },
  { id: "teachers", label: "Багшийн мэдээлэл", icon: FiUsers },
  { id: "lessons", label: "Сургалтын материал", icon: FiBookOpen },
  { id: "exams", label: "Шалгалтуудын мэдээлэл", icon: FiClipboard },
  { id: "grades", label: "Дүнгийн мэдээлэл", icon: FiAward },
];

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("info");

  const { data: course, loading, error } = useStudentData(
    () => getCourseDetail(courseId),
    [courseId]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-56 animate-pulse rounded-[34px] bg-blue-50" />
        <div className="h-20 animate-pulse rounded-[28px] bg-white" />
        <div className="h-64 animate-pulse rounded-[30px] bg-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-transparent">
      <Link
        to="/team4/student"
        className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
      >
        <FiArrowLeft className="h-4 w-4" />
        Хичээлүүд рүү буцах
      </Link>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {!loading && course && (
        <>
          <CourseHeader course={course} />

          <div className="rounded-[30px] border border-blue-100 bg-white p-3 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`group rounded-2xl px-4 py-4 text-left transition hover:-translate-y-1 hover:shadow-md ${
                      active
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          active ? "bg-white/20" : "bg-white"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="text-sm font-black">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "info" && <InfoTab course={course} />}
          {activeTab === "teachers" && (
            <TeachersTab courseId={courseId} toast={toast} />
          )}
          {activeTab === "lessons" && (
            <LessonsTab courseId={courseId} userId={user?.id} toast={toast} />
          )}
          {activeTab === "exams" && (
            <ExamsTab courseId={courseId} toast={toast} />
          )}
          {activeTab === "grades" && (
            <GradesTab courseId={courseId} toast={toast} />
          )}
        </>
      )}
    </div>
  );
}

function CourseHeader({ course }) {
  const status = courseStatus(course.start_on, course.end_on);

  return (
    <div className="group relative overflow-hidden rounded-[36px] border border-blue-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-100/80 transition group-hover:scale-125" />
      <div className="absolute -bottom-20 left-16 h-44 w-44 rounded-full bg-cyan-100/80 transition group-hover:scale-125" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-blue-600 text-white shadow-lg">
            <FiBookOpen className="h-10 w-10" />
          </div>

          <div>
            <p className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-600">
              Хичээлийн дэлгэрэнгүй
            </p>

            <h1 className="max-w-3xl text-3xl font-black leading-tight text-slate-950 lg:text-4xl">
              {course.name || course.course_name || "Хичээл"}
            </h1>

            <p className="mt-3 text-sm font-bold text-slate-500">
              ID: {course.id} · {course.credits ?? 0} кредит ·{" "}
              {course.price != null ? `${course.price}₮` : "Үнэгүй"}
            </p>
          </div>
        </div>

        <span className={`relative rounded-full px-5 py-3 text-sm font-black ${status.color}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}

function InfoTab({ course }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FiFileText className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-950">Тайлбар</h2>
            <p className="text-sm font-bold text-slate-500">
              Хичээлийн ерөнхий мэдээлэл
            </p>
          </div>
        </div>

        <div className="rounded-[24px] bg-blue-50/70 p-5 text-sm font-semibold leading-7 text-slate-700">
          {course.description || "Энэ хичээлд тайлбар оруулаагүй байна."}
        </div>
      </div>

      <div className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailCard icon={FiCalendar} label="Эхлэх огноо" value={fmt(course.start_on)} />
          <DetailCard icon={FiCalendar} label="Дуусах огноо" value={fmt(course.end_on)} />
          <DetailCard
            icon={FiBookOpen}
            label="Кредит"
            value={course.credits != null ? `${course.credits} кредит` : "-"}
          />
          <DetailCard
            icon={FiTag}
            label="Үнэ"
            value={course.price != null ? `${course.price}₮` : "Үнэгүй"}
          />
          <DetailCard icon={FiInfo} label="Хичээлийн ID" value={String(course.id)} />
          <DetailCard icon={FiCheckCircle} label="Төлөв" value={courseStatus(course.start_on, course.end_on).label} />
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-blue-100 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 transition group-hover:scale-125 group-hover:bg-blue-100" />

      <div className="relative">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>

        <p className="text-xs font-black uppercase tracking-widest text-blue-500">
          {label}
        </p>

        <p className="mt-2 text-lg font-black text-slate-950">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function TabPanel({ loading, empty, emptyText = "Мэдээлэл байхгүй.", children }) {
  if (loading) {
    return <div className="h-32 animate-pulse rounded-[30px] bg-blue-50" />;
  }

  if (empty) {
    return (
      <div className="rounded-[30px] border border-dashed border-blue-200 bg-white px-5 py-16 text-center text-sm font-bold text-blue-500">
        {emptyText}
      </div>
    );
  }

  return children;
}

function TeachersTab({ courseId }) {
  const { data, loading } = useStudentData(
    () => getCourseTeachers(courseId).catch(() => ({ items: [] })),
    [courseId]
  );

  const teachers = data?.items ?? [];

  return (
    <TabPanel loading={loading} empty={teachers.length === 0} emptyText="Багш бүртгэгдээгүй.">
      <div className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-slate-950">Хичээлийн багш нар</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">
            Энэ хичээлийг зааж буй багш нар
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {teachers.map((teacher) => {
            const name =
              [teacher.last_name, teacher.first_name]
                .filter((x) => x && x !== "-")
                .join(" ") ||
              teacher.email ||
              "Багш";
            const pic = avatarSrc(teacher.picture);

            return (
              <div
                key={teacher.id}
                className="rounded-[26px] border border-blue-100 bg-blue-50/60 p-5 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  {pic ? (
                    <img
                      src={pic}
                      alt={name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600">
                      <FiUsers className="h-7 w-7" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-slate-950">
                      {name}
                    </p>
                    <p className="truncate text-sm font-bold text-blue-500">
                      {teacher.email || "-"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TabPanel>
  );
}

function LessonsTab({ courseId, userId }) {
  const { data, loading } = useStudentData(
    () => getAllCourseLessons(courseId),
    [courseId]
  );

  const lessons = Array.isArray(data) ? data : [];

  return (
    <TabPanel
      loading={loading}
      empty={lessons.length === 0}
      emptyText="Сургалтын материал одоогоор нэмэгдээгүй байна."
    >
      <div className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-600">
              Learning resources
            </p>

            <h2 className="text-2xl font-black text-slate-950">
              Сургалтын материалууд
            </h2>

            <p className="mt-1 text-sm font-bold text-slate-500">
              Энэ хичээлтэй холбоотой унших материал, даалгавар, нэмэлт эх сурвалжууд
            </p>
          </div>

          <div className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg">
            {lessons.length} материал
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {lessons
            .slice()
            .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
            .map((lesson, index) => (
              <div
                key={lesson.id}
                className="group relative overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-100/70 transition group-hover:scale-125" />

                <div className="relative">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                      <FiFileText className="h-6 w-6" />
                    </div>

                    <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-blue-600 shadow-sm">
                      #{index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-950">
                    {lesson.name || lesson.title || `Материал #${lesson.id}`}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">
                    {lesson.description || "Энэ материалд тайлбар оруулаагүй байна."}
                  </p>

                  <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-3">
                    <LessonRow lesson={lesson} userId={userId} />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </TabPanel>
  );
}

function ExamsTab({ courseId }) {
  const { data, loading } = useStudentData(
    () => getCourseExams(courseId).catch(() => ({ items: [] })),
    [courseId]
  );

  const exams = data?.items ?? [];

  return (
    <TabPanel loading={loading} empty={exams.length === 0} emptyText="Шалгалт байхгүй.">
      <div className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-slate-950">Шалгалтууд</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">
            Нээлттэй болон хаалттай шалгалтын мэдээлэл
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {exams.map((exam) => {
            const now = Date.now();
            const open = exam.open_on ? new Date(exam.open_on).getTime() : null;
            const close = exam.close_on ? new Date(exam.close_on).getTime() : null;
            const isOpen = open && close && now >= open && now <= close;

            return (
              <div
                key={exam.id}
                className="group relative overflow-hidden rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 transition group-hover:scale-125" />

                <div className="relative">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <FiClipboard className="h-6 w-6" />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        isOpen
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isOpen ? "Нээлттэй" : "Хаалттай"}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-950">
                    {exam.name}
                  </h3>

                  <p className="mt-2 text-sm font-bold text-slate-500">
                    {fmtDateTime(exam.open_on)} — {fmtDateTime(exam.close_on)}
                  </p>

                  <p className="mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                    Нийт: {exam.total_point} оноо · {exam.duration} мин ·
                    Оролдлого: {exam.max_attempt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TabPanel>
  );
}

function GradesTab({ courseId }) {
  const { data, loading } = useStudentData(
    async () => {
      const [gE, gS, gA, examsRes, lessonsRes] = await Promise.all([
        getGradebookExams(courseId).catch(() => ({ items: [] })),
        getGradebookSubmissions(courseId).catch(() => ({ items: [] })),
        getGradebookAttendances(courseId).catch(() => ({ items: [] })),
        getCourseExams(courseId).catch(() => ({ items: [] })),
        getAllCourseLessons(courseId).catch(() => []),
      ]);

      return {
        gradeExams: gE?.items ?? [],
        gradeSubs: gS?.items ?? [],
        gradeAtts: gA?.items ?? [],
        exams: examsRes?.items ?? [],
        lessons: Array.isArray(lessonsRes) ? lessonsRes : [],
      };
    },
    [courseId]
  );

  const totals = (() => {
    if (!data) return { examTotal: 0, subTotal: 0, attTotal: 0, total: 0 };

    const sum = (arr) =>
      arr.reduce((total, row) => total + (Number(row.grade_point) || 0), 0);

    const examTotal = sum(data.gradeExams);
    const subTotal = sum(data.gradeSubs);
    const attTotal = sum(data.gradeAtts);

    return {
      examTotal,
      subTotal,
      attTotal,
      total: examTotal + subTotal + attTotal,
    };
  })();

  if (loading || !data) {
    return <div className="h-32 animate-pulse rounded-[30px] bg-blue-50" />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="mb-2 inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-600">
            Grade overview
          </p>

          <h2 className="text-2xl font-black text-slate-950">
            Үнэлгээний самбар
          </h2>

          <p className="mt-1 text-sm font-bold text-slate-500">
            Шалгалт, даалгавар, ирцийн оноог нэгтгэн харуулна.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <GradeStatNew
            label="Шалгалтын оноо"
            value={totals.examTotal}
            icon={FiClipboard}
            desc="Сорил, шалгалтуудаас"
          />

          <GradeStatNew
            label="Даалгаврын оноо"
            value={totals.subTotal}
            icon={FiFileText}
            desc="Материал, даалгавраас"
          />

          <GradeStatNew
            label="Ирцийн оноо"
            value={totals.attTotal}
            icon={FiCalendar}
            desc="Хичээл оролцолтоос"
          />

          <GradeStatNew
            label="Нийт оноо"
            value={totals.total}
            icon={FiStar}
            desc="Нэгтгэсэн дүн"
            highlight
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <GradeBlock
          title="Шалгалтын үнэлгээ"
          subtitle="Өгсөн шалгалтын оноонууд"
          icon={FiClipboard}
        >
          <GradeTable
            title="Шалгалтын дүн"
            rows={data.gradeExams}
            resolveName={(row) =>
              data.exams.find((exam) => exam.id === row.exam_id)?.name ||
              `Шалгалт #${row.exam_id}`
            }
          />
        </GradeBlock>

        <GradeBlock
          title="Даалгаврын үнэлгээ"
          subtitle="Илгээсэн ажлын оноонууд"
          icon={FiFileText}
        >
          <GradeTable
            title="Даалгаврын дүн"
            rows={data.gradeSubs}
            resolveName={(row) =>
              data.lessons.find((lesson) => lesson.id === row.lesson_id)?.name ||
              `Хичээл #${row.lesson_id}`
            }
          />
        </GradeBlock>

        <GradeBlock
          title="Ирцийн үнэлгээ"
          subtitle="Хичээлийн оролцооны оноо"
          icon={FiCalendar}
        >
          <GradeTable
            title="Ирцийн дүн"
            rows={data.gradeAtts}
            resolveName={(row) =>
              data.lessons.find((lesson) => lesson.id === row.lesson_id)?.name ||
              `Хичээл #${row.lesson_id}`
            }
          />
        </GradeBlock>
      </div>
    </div>
  );
}

function GradeStatNew({ label, value, icon: Icon, desc, highlight = false }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border p-6 transition hover:-translate-y-1 hover:shadow-lg ${
        highlight
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-blue-100 bg-white text-slate-950"
      }`}
    >
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full transition group-hover:scale-125 ${
          highlight ? "bg-white/20" : "bg-blue-100/70"
        }`}
      />

      <div className="relative">
        <div
          className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
            highlight ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <p
          className={`text-xs font-black uppercase tracking-widest ${
            highlight ? "text-blue-50" : "text-blue-500"
          }`}
        >
          {label}
        </p>

        <p className="mt-3 text-4xl font-black">{value}</p>

        <p
          className={`mt-2 text-sm font-bold ${
            highlight ? "text-blue-50" : "text-slate-500"
          }`}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function GradeBlock({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="rounded-[30px] border border-blue-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-xs font-bold text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/40 p-3">
        {children}
      </div>
    </div>
  );
}

function GradeStat({ label, value, icon: Icon, highlight }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[26px] border p-5 transition hover:-translate-y-1 hover:shadow-md ${
        highlight
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-blue-100 bg-white text-slate-950"
      }`}
    >
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full transition group-hover:scale-125 ${
          highlight ? "bg-white/20" : "bg-blue-50"
        }`}
      />

      <div className="relative">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
            highlight ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <p
          className={`text-xs font-black uppercase tracking-widest ${
            highlight ? "text-blue-50" : "text-blue-500"
          }`}
        >
          {label}
        </p>

        <p className="mt-2 text-3xl font-black">{value}</p>
      </div>
    </div>
  );
}