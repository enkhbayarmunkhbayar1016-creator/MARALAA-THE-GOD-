import React from "react";
import { useNavigate } from "react-router-dom";

const courseReportData = {
  summary: {
    totalCourses: 32,
    activeCourses: 24,
    completedCourses: 8,
    totalStudents: 1240,
    averageGrade: 82.6,
    averageAttendance: 91.4,
  },

  courses: [
    {
      id: 1,
      name: "Web систем ба технологи",
      teacher: "Бат-Эрдэнэ",
      category: "Програмчлал",
      students: 120,
      avgGrade: 87,
      attendance: 94,
      status: "Идэвхтэй",
    },
    {
      id: 2,
      name: "Өгөгдлийн сан",
      teacher: "Саруул",
      category: "Database",
      students: 98,
      avgGrade: 81,
      attendance: 91,
      status: "Идэвхтэй",
    },
    {
      id: 3,
      name: "Компьютерийн сүлжээ",
      teacher: "Энхтүвшин",
      category: "Сүлжээ",
      students: 76,
      avgGrade: 78,
      attendance: 88,
      status: "Дууссан",
    },
    {
      id: 4,
      name: "UI/UX дизайн",
      teacher: "Номин",
      category: "Дизайн",
      students: 64,
      avgGrade: 84,
      attendance: 93,
      status: "Идэвхтэй",
    },
    {
      id: 5,
      name: "Кибер аюулгүй байдал",
      teacher: "Тэмүүлэн",
      category: "Security",
      students: 52,
      avgGrade: 69,
      attendance: 79,
      status: "Анхаарах",
    },
    {
      id: 6,
      name: "Програм хангамжийн инженерчлэл",
      teacher: "Ганзориг",
      category: "Software",
      students: 56,
      avgGrade: 69,
      attendance: 79,
      status: "Анхаарах",
    },
  ],
};

export default function CourseReport() {
  const navigate = useNavigate();

  const riskCourses = courseReportData.courses.filter(
    (course) => course.avgGrade < 75 || course.attendance < 85
  );

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e235a] text-white p-6 flex flex-col shrink-0 shadow-2xl sticky top-0 h-screen">
        <div
          className="flex flex-col items-center mb-10 cursor-pointer transition-transform active:scale-95"
          onClick={() => navigate("/team1/home")}
        >
          <div className="w-14 h-14 bg-white rounded-2xl mb-3 flex items-center justify-center p-2 shadow-lg">
            <img src="/team1/logo-must.png" alt="MUST" className="w-full object-contain" />
          </div>
          <p className="text-center text-[9px] font-bold uppercase tracking-widest leading-tight opacity-70">
            Шинжлэх Ухаан Технологийн Их Сургууль
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <div
            onClick={() => navigate("/team1/home")}
            className="p-3.5 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-xs text-blue-200/60 font-bold transition-all hover:text-white"
          >
            🏠 Нүүр хуудас
          </div>

          <div
            onClick={() => navigate("/team1/report")}
            className="p-3.5 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-xs text-blue-200/60 font-bold transition-all hover:text-white"
          >
            📊 Ерөнхий тайлан
          </div>

          <div className="bg-blue-600/20 border-l-4 border-blue-400 p-3.5 rounded-r-xl flex items-center gap-3 cursor-pointer text-xs font-bold text-blue-50 transition-all">
            📚 Хичээлийн тайлан
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 text-blue-200/40 text-[10px] font-medium uppercase tracking-widest">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Систем хэвийн
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#1e235a] flex items-center justify-between px-10 shadow-md border-b border-white/10 sticky top-0 z-20">
          <div>
            <h2 className="text-white font-black text-lg tracking-tight">
              Хичээлийн тайлан
            </h2>
            <p className="text-blue-200/50 text-xs font-medium">
              Хичээлийн тайлан нь тус сургуулийн бүх хичээлийн гүйцэтгэлийн мэдээллийг агуулдаг. Та эндээс хичээл тус бүрийн сурагчдын тоо, дундаж дүн, ирц болон төлөвийн мэдээллийг харах боломжтой.
            </p>
          </div>

          <div className="flex items-center gap-3 text-white">
            <span className="font-medium text-sm">Админ</span>
            <div className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden shadow-sm">
              <img src="/team1/user.png" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-10">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
                  Хичээлийн гүйцэтгэлийн тайлан
                </h1>
                <p className="text-slate-400 text-sm font-medium">
                  Хичээл тус бүрийн сурагч, ирц, дундаж үнэлгээ болон төлөвийн мэдээлэл
                </p>
              </div>

              <button
                onClick={() => navigate("/team1/report")}
                className="bg-[#112a60] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                ← Ерөнхий тайлан руу буцах
              </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5 mb-8">
              <SummaryCard title="Нийт хичээл" value={courseReportData.summary.totalCourses} color="#2563eb" />
              <SummaryCard title="Идэвхтэй" value={courseReportData.summary.activeCourses} color="#16a34a" />
              <SummaryCard title="Дууссан" value={courseReportData.summary.completedCourses} color="#f59e0b" />
              <SummaryCard title="Сурагч" value={courseReportData.summary.totalStudents} color="#8b5cf6" />
              <SummaryCard title="Дундаж дүн" value={`${courseReportData.summary.averageGrade}%`} color="#06b6d4" />
              <SummaryCard title="Дундаж ирц" value={`${courseReportData.summary.averageAttendance}%`} color="#ec4899" />
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              <div className="xl:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-800">
                    📚 Хичээл тус бүрийн үзүүлэлт
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">
                    Дундаж дүн болон ирцийн үзүүлэлтээр харуулав
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                        <th className="px-8 py-5">Хичээл</th>
                        <th className="px-8 py-5">Багш</th>
                        <th className="px-8 py-5">Сурагч</th>
                        <th className="px-8 py-5">Дундаж дүн</th>
                        <th className="px-8 py-5">Ирц</th>
                        <th className="px-8 py-5">Төлөв</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                      {courseReportData.courses.map((course) => (
                        <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="font-black text-slate-800">{course.name}</div>
                            <div className="text-xs text-slate-400 font-bold">{course.category}</div>
                          </td>
                          <td className="px-8 py-5 text-slate-600 font-bold">{course.teacher}</td>
                          <td className="px-8 py-5 text-slate-600 font-bold">{course.students}</td>
                          <td className="px-8 py-5">
                            <Progress value={course.avgGrade} color="#2563eb" />
                          </td>
                          <td className="px-8 py-5">
                            <Progress value={course.attendance} color="#16a34a" />
                          </td>
                          <td className="px-8 py-5">
                            <StatusBadge status={course.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RISK COURSES */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
                <h3 className="text-xl font-black text-slate-800 mb-2">
                  ⚠️ Анхаарах хичээлүүд
                </h3>
                <p className="text-slate-400 text-sm font-medium mb-6">
                  Ирц эсвэл дүнгийн үзүүлэлт бага байгаа хичээлүүд
                </p>

                <div className="space-y-4">
                  {riskCourses.map((course) => (
                    <div key={course.id} className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                      <h4 className="font-black text-slate-800">{course.name}</h4>
                      <p className="text-xs text-slate-400 font-bold mb-4">{course.teacher}</p>

                      <div className="space-y-3">
                        <SmallMetric label="Дундаж дүн" value={`${course.avgGrade}%`} />
                        <SmallMetric label="Ирц" value={`${course.attendance}%`} />
                      </div>
                    </div>
                  ))}

                  {riskCourses.length === 0 && (
                    <div className="text-center text-slate-400 font-bold py-10">
                      Анхаарах хичээл алга.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CATEGORY DISTRIBUTION */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
              <h3 className="text-xl font-black text-slate-800 mb-6">
                🧩 Хичээлийн ангиллын тархалт
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {["Програмчлал", "Database", "Сүлжээ", "Дизайн", "Security"].map((category) => {
                  const count = courseReportData.courses.filter((c) => c.category === category).length;

                  return (
                    <div key={category} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                      <div className="text-slate-400 text-xs font-black uppercase tracking-widest">
                        {category}
                      </div>
                      <div className="text-3xl font-black text-[#112a60] mt-2">
                        {count}
                      </div>
                      <div className="text-xs text-slate-400 font-bold mt-1">
                        хичээл
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg shadow-slate-200/40">
      <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
        {title}
      </div>
      <div style={{ color }} className="text-3xl font-black mt-2">
        {value}
      </div>
    </div>
  );
}

function Progress({ value, color }) {
  return (
    <div className="min-w-[100px]">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-black text-slate-500">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Идэвхтэй: "bg-emerald-50 text-emerald-600",
    Дууссан: "bg-amber-50 text-amber-600",
    Анхаарах: "bg-rose-50 text-rose-600",
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-black ${styles[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <span className="text-sm font-black text-slate-700">{value}</span>
    </div>
  );
}