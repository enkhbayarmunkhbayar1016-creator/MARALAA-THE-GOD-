import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, lessonAPI, extractItem, extractItems } from '../../api';

const StudentContent = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes] = await Promise.all([
        courseAPI.getOne(courseId),
        lessonAPI.getAll(courseId)
      ]);

      setCourse(extractItem(courseRes));
      setLessons(extractItems(lessonsRes));
    } catch (err) {
      console.error('Алдаа:', err);
      setError('Хичээлийн мэдээллийг татахад алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    } else {
      setError('Хичээлийн ID тодорхойгүй байна.');
      setLoading(false);
    }
  }, [courseId]);

  const courseCode = course?.code || `ICT-${course?.id || '301'}`;
  const teacherName = course?.teacher?.name || 'Багш';
  const courseStart = course?.start_on ? new Date(course.start_on).toLocaleDateString() : '01.26';
  const courseEnd = course?.end_on ? new Date(course.end_on).toLocaleDateString() : '05.30';
  const semester = course?.semester || '16 долоо хоног';

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 font-black text-indigo-600 animate-pulse">
        УНШИЖ БАЙНА...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-rose-500 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <aside className="w-64 bg-[#1e235a] text-white p-6 flex flex-col shrink-0 shadow-2xl z-20">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl mb-4 flex items-center justify-center p-2 shadow-lg">
            <img src="/team1/logo-must.png" alt="MUST" className="w-full object-contain" />
          </div>
          <p className="text-center text-[10px] font-bold uppercase tracking-widest leading-tight opacity-80">
            Шинжлэх Ухаан Технологийн Их Сургууль
          </p>
        </div>

        <nav className="flex-1 space-y-3">
          <div className="bg-blue-600/20 border-l-4 border-blue-400 p-4 rounded-r-xl flex justify-between items-center cursor-pointer text-sm font-bold">
            <span className="flex items-center gap-3 text-blue-50">📚 Хичээлийн агуулга</span>
          </div>
          {['🏢 Ангилал', '🏛️ Сургууль', '👤 Профайл'].map((item, idx) => (
            <div
              key={idx}
              className="p-4 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-sm text-blue-200/70 transition-all duration-300 hover:text-white"
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#1e235a] flex items-center justify-between px-10 shadow-md border-b border-white/10 z-10">
          <div className="flex items-center gap-8">
            <div className="relative cursor-pointer hover:scale-110 transition-transform">
              <img src="/team1/notification.png" alt="notification" className="w-5 h-5 brightness-0 invert opacity-100" />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <span className="font-medium text-sm text-white/90">Оюутан</span>
              <div className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden shadow-sm">
                <img src="/team1/user.png" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            Буцах
          </button>
        </header>

        <main className="flex-1 p-10 overflow-y-auto">
          <div className="mb-8 flex items-center gap-4 ">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
            <h1 className="text-2xl font-black text-[#1e235a] tracking-tight">Хичээлийн сэдэв, агуулга</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_320px] mb-10">
            <section className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200/60">
              <h2 className="text-3xl font-black text-[#1e235a] mb-4">{course?.name || 'Хичээлийн нэр'}</h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium mb-6">
                {course?.description || 'Энэ хичээл нь вэб систем, frontend болон backend-ийн холболт, API ашиглалт зэрэг сэдвийг хамарна.'}
              </p>

              <div className="grid gap-4">
                {lessons.length > 0 ? lessons.map((lesson, idx) => (
                  <div key={lesson.id ?? idx} className="rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <h3 className="font-black text-slate-900">{lesson.name || lesson.title || `Сэдэв ${idx + 1}`}</h3>
                      <span className="text-[11px] uppercase font-black tracking-widest text-slate-500">
                        {lesson.status || 'Бэлтгэл'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {lesson.description || lesson.summary || 'Энэ хэсэгт тухайн сэдвийн товч агуулга харуулна.'}
                    </p>
                  </div>
                )) : (
                  <div className="rounded-3xl border border-slate-200 p-6 shadow-sm text-slate-500">
                    Одоогоор энэ хичээлд сэдэв ороогүй байна.
                  </div>
                )}
              </div>
            </section>

            <aside className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200/60">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-3xl bg-blue-50 text-blue-600 grid place-items-center font-black text-xl">ICT</div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-600 font-black">Курс код</p>
                  <p className="text-base font-black text-slate-900">{courseCode}</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-slate-600 font-medium">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Багш</p>
                  <p className="text-slate-800 font-bold">{teacherName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Хугацаа</p>
                  <p className="text-slate-800 font-bold">{courseStart} - {courseEnd}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Семестер</p>
                  <p className="text-slate-800 font-bold">{semester}</p>
                </div>
              </div>
            </aside>
          </div>

          <section className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#1e235a]">Сэдвийн агуулга</h2>
                <p className="text-slate-500 text-sm mt-1">Сэдвүүдийн дэлгэрэнгүйг доорх жагсаалтаас үзнэ үү.</p>
              </div>
            </div>

            <div className="grid gap-5">
              {lessons.length > 0 ? lessons.map((lesson, idx) => (
                <div key={lesson.id ?? idx} className="rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-blue-400 transition-all">
                  <h3 className="font-black text-slate-900 mb-3">{lesson.name || lesson.title || `Сэдэв ${idx + 1}`}</h3>
                  <ul className="space-y-2 text-slate-600 text-sm list-disc list-inside">
                    {(lesson.topics && lesson.topics.length > 0) ? lesson.topics.slice(0, 3).map((topic, topicIdx) => (
                      <li key={topicIdx}>{topic}</li>
                    )) : (
                      <li>{lesson.description || 'Энэ сэдвийн гол агуулга товчлон харуулна.'}</li>
                    )}
                  </ul>
                </div>
              )) : (
                <div className="rounded-3xl border border-slate-200 p-6 shadow-sm text-slate-500">
                  Сэдвүүд алга байна.
                </div>
              )}
            </div>
          </section>

          <div className="mt-12 flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-white border border-slate-200 text-slate-500 px-10 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Буцах
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentContent;
