import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, lessonAPI, extractItem, extractItems } from '../../api';

const CoursePage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes] = await Promise.all([
        courseAPI.getOne(id),
        lessonAPI.getAll(id)
      ]);

      setCourse(extractItem(courseRes));
      setLessons(extractItems(lessonsRes));
    } catch (err) {
      console.error("Дата татахад алдаа гарлаа:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== ":id" && id !== "undefined") {
      fetchCourseDetails();
    } else {
      console.error("Буруу ID ирлээ:", id);
      setError("Хичээлийн ID тодорхойгүй байна.");
      setLoading(false);
    }
  }, [id]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 font-black text-indigo-600 animate-pulse text-xs uppercase tracking-widest">
      УНШИЖ БАЙНА...
    </div>
  );

  if (error) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-rose-500 font-bold text-xs uppercase italic">
      {error}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e235a] text-white p-6 flex flex-col shrink-0 shadow-2xl z-20 sticky top-0 h-screen">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-white rounded-2xl mb-3 flex items-center justify-center p-2 shadow-lg">
             <img src="/team1/logo-must.png" alt="MUST" className="w-full object-contain" />
          </div>
          <p className="text-center text-[9px] font-bold uppercase tracking-widest leading-tight opacity-70">
            Шинжлэх Ухаан Технологийн Их Сургууль
          </p>
        </div>
        <nav className="flex-1 space-y-2">
          <SidebarItem label="🎓 Миний хичээлүүд" active onClick={() => navigate('/team1/home')} />
          <SidebarItem label="🏢 Ангилал" onClick={() => navigate('/team1/category')} />
          <SidebarItem label="🏛️ Сургууль" onClick={() => navigate('/team1/student/schools')} />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-[#1e235a] flex items-center justify-end px-10 shadow-md border-b border-white/10 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xs text-white/90 italic">Оюутан</span>
            <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-slate-400">
              <img src="/team1/user.png" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-8 flex items-center gap-3">
             <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
             <h1 className="text-xl font-black text-[#1e235a] tracking-tight uppercase italic">Хичээлийн мэдээлэл</h1>
          </div>

          {/* ХИЧЭЭЛИЙН БАННЕР */}
          <div className="bg-white rounded-[2rem] shadow-lg flex overflow-hidden mb-8 border border-slate-100 relative">
            <div className="w-1/3 min-h-[220px] relative bg-[#1e235a] flex items-center overflow-hidden">
              <img 
                src={course?.picture || "/team1/web system.png"} 
                alt={course?.name} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => { e.target.src = "/team1/web system.png"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e235a]/60 to-transparent"></div>
            </div>

            <div className="w-2/3 p-10 flex flex-col justify-center bg-white">
              <h2 className="text-2xl font-black text-[#1e235a] mb-4 tracking-tighter uppercase leading-tight">
                {course?.name || "Хичээлийн нэр"}
              </h2>
              
              <div className="flex gap-6 text-[11px] text-slate-500 mb-8 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2">📅 {course?.start_on ? new Date(course.start_on).toLocaleDateString() : "---"}</span>
                <span className="flex items-center gap-2 text-blue-600">ID: {course?.id}</span>
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-end mb-2">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Суралцах явц</span>
                   <span className="text-xs font-black text-slate-700">40%</span>
                </div>
                <div className="w-full h-1.5 bg-white rounded-full shadow-inner overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* ТОҮЧ АГУУЛГА */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
            <h3 className="text-xs font-black text-[#1e235a] mb-3 uppercase tracking-wider">📝 Товч агуулга</h3>
            <div className="text-slate-600 leading-relaxed text-sm font-medium prose prose-sm max-w-none" 
                 dangerouslySetInnerHTML={{ __html: course?.description || "Агуулга байхгүй байна." }} />
          </section>

          {/* СЭДВИЙН ЖАГСААЛТ */}
          <section>
            <h3 className="text-xs font-black text-[#1e235a] mb-5 uppercase tracking-widest flex items-center gap-2">
              Хичээлийн сэдвүүд ({lessons.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.length > 0 ? lessons.map((lesson, i) => (
                <div key={lesson.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex justify-between items-center shadow-sm cursor-pointer hover:border-blue-400 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-xl flex items-center justify-center text-xs font-black italic">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-700 group-hover:text-blue-900 transition-colors block truncate">{lesson.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Долоо хоног {lesson.priority}</span>
                    </div>
                  </div>
                  <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-all">→</span>
                </div>
              )) : (
                <p className="text-slate-400 italic text-xs uppercase">Энэ хичээлд одоогоор сэдэв ороогүй байна.</p>
              )}
            </div>
          </section>

          <button onClick={() => navigate(-1)} className="mt-12 px-10 py-3.5 bg-white border border-slate-200 text-slate-400 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:text-slate-800 transition-all shadow-sm">
             ← Буцах
          </button>
        </main>
      </div>
    </div>
  );
};

// Туслах SidebarItem компонент
const SidebarItem = ({ label, active, onClick }) => (
    <div onClick={onClick} className={`p-3.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${active ? 'bg-blue-600/20 border-l-4 border-blue-400 text-blue-50' : 'text-blue-200/60 hover:bg-white/10 hover:text-white'}`}>
        {label}
    </div>
);

export default CoursePage;