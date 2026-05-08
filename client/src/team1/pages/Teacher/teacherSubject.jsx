import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, lessonAPI, userAPI, extractItem, extractItems } from '../../api'; 

const TeacherPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    name: '',
    content: '',
    priority: '',
    type_id: 10,
    point: 10,
    has_submission: 0
  });

  const DEFAULT_BANNER = "/team1/bigdata-image.png";

  const fetchCourseData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [courseRes, lessonsRes, userRes] = await Promise.all([
        courseAPI.getOne(id),
        lessonAPI.getAll(id),
        userAPI.getMe()
      ]);
      
      const courseData = extractItem(courseRes);
      const userData = extractItem(userRes);
      let lessonsData = extractItems(lessonsRes);
      
      lessonsData.sort((a, b) => (Number(a.priority) || 0) - (Number(b.priority) || 0));

      setCourse(courseData);
      setLessons(lessonsData);
      setUser(userData);
      setLessonForm(prev => ({ ...prev, priority: lessonsData.length + 1 }));
    } catch (err) {
      console.error("Мэдээллийг ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleSaveLesson = async () => {
    if (!lessonForm.name || !lessonForm.priority) return alert("Нэр болон Дарааллыг оруулна уу!");
    try {
      const dataToSubmit = {
        name: String(lessonForm.name),
        content: String(lessonForm.content || ""),
        description: String(lessonForm.content || ""),
        priority: Number(lessonForm.priority),
        point: Number(lessonForm.point) || 10,
        has_submission: 0,
        type_id: 10,
        open_on: new Date().toISOString(),
        close_on: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        end_on: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        parent_id: null
      };

      await lessonAPI.create(id, dataToSubmit);
      alert("Шинэ агуулга амжилттай нэмэгдлээ!");
      setShowModal(false);
      fetchCourseData();
    } catch (err) {
      alert("Сервер дээр алдаа гарлаа.");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-slate-400 italic animate-pulse text-xs uppercase tracking-widest">Ачаалж байна...</div>;
  if (!course) return <div className="flex h-screen items-center justify-center font-bold italic">Хичээл олдсонгүй.</div>;

  const progressPercent = course?.progress || 0;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e235a] text-white p-6 flex flex-col shrink-0 shadow-2xl z-20 sticky top-0 h-screen">
        <div className="flex flex-col items-center mb-10 cursor-pointer transition-transform active:scale-95" onClick={() => navigate('/team1/home')}>
          <div className="w-14 h-14 bg-white rounded-2xl mb-3 flex items-center justify-center p-2 shadow-lg">
             <img src="/team1/logo-must.png" alt="MUST" className="w-full object-contain" />
          </div>
          <p className="text-center text-[9px] font-bold uppercase tracking-widest leading-tight opacity-70">Шинжлэх Ухаан Технологийн Их Сургууль</p>
        </div>
        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<CapIcon />} label="Миний хичээлүүд" active onClick={() => navigate('/team1/teacher/courses')} />
          <SidebarItem icon={<CategoryIcon />} label="Ангилал" onClick={() => navigate('/team1/category')} />
          <SidebarItem icon={<SchoolIcon />} label="Сургууль" />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-[#1e235a] flex items-center justify-end px-10 shadow-md border-b border-white/10 z-10 sticky top-0">
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer hover:scale-110 transition-transform p-1">
              <img src="/team1/notification.png" alt="notification" className="w-5 h-5 brightness-0 invert opacity-80 hover:opacity-100" />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <span className="font-bold text-xs text-white/90 italic">
                {user ? `${user.last_name} ${user.first_name}` : "Ачаалж байна..."}
              </span>
              <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-slate-400 shadow-md">
                <img src={user?.picture || "/team1/user.png"} alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Action Header */}
          <div className="mb-8 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-7 bg-blue-600 rounded-full"></div>
                <h1 className="text-xl font-black text-[#1e235a] tracking-tight uppercase italic">Хичээлийн удирдлага</h1>
             </div>
             <div className="flex gap-3">
                <button onClick={() => setShowModal(true)} className="bg-[#3b18e3] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase shadow-lg shadow-blue-200 hover:scale-105 transition-all active:scale-95 tracking-wider">+ Шинэ агуулга</button>
                <button onClick={() => navigate(`/team1/teacher/courses/${id}/edit`)} className="bg-white border border-slate-200 px-5 py-3 rounded-2xl text-xs font-bold text-slate-500 shadow-sm hover:bg-blue-50 transition-all uppercase tracking-wider flex items-center gap-2"><img src="/team1/edit.png" alt="edit" className="w-3.5 h-3.5" /> Засах</button>
             </div>
          </div>

          {/* COURSE BANNER CARD */}
          <div className="bg-white rounded-[2rem] shadow-lg flex overflow-hidden mb-8 border border-slate-100 relative">
            <div className="w-1/3 min-h-[220px] relative bg-[#1e235a] flex items-center overflow-hidden">
              <img 
                src={course.picture || DEFAULT_BANNER} 
                alt={course.name} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_BANNER; }} 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e235a]/50 to-transparent z-10"></div>
              <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] text-white uppercase font-bold tracking-widest z-20">ID: {course.id}</div>
            </div>

            <div className="w-2/3 p-10 flex flex-col justify-center bg-white relative">
              <h2 className="text-xl font-black text-[#1e235a] mb-3 tracking-tighter leading-tight uppercase">{course.name}</h2>
              <div className="flex gap-6 text-xs text-slate-500 mb-6 font-bold uppercase tracking-wide">
                <div className="flex items-center gap-2"><img src="/team1/calendar.png" alt="cal" className="w-3.5 h-3.5 opacity-40"/><span>{new Date(course.start_on).toLocaleDateString()} - {new Date(course.end_on).toLocaleDateString()}</span></div>
                <div className="flex items-center gap-2 text-blue-600"><img src="/team1/sunny-day.png" alt="time" className="w-3.5 h-3.5"/><span>Кредит: {course.credits || 3}</span></div>
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-end mb-2">
                   <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Сургалтын явц</span>
                   <span className="text-xs font-black text-slate-700">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-white rounded-full p-[1px] shadow-inner">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* ТОҮЧ АГУУЛГА */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
            <h3 className="text-xs font-black text-[#1e235a] mb-3 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Товч агуулга
            </h3>
            <div className="text-slate-600 leading-relaxed text-sm font-medium prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: course.description || "Агуулга байхгүй байна." }} />
          </section>

          {/* LESSONS LIST */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {lessons.map((lesson, index) => {
                const uniqueKey = lesson.id || `lesson-${index}`;
                const isExpanded = expandedId === uniqueKey;
                return (
                  <div key={uniqueKey} className={`group bg-white border transition-all duration-300 ${isExpanded ? 'rounded-3xl border-blue-200 shadow-lg' : 'rounded-3xl border-slate-100 shadow-sm hover:border-blue-100'}`}>
                    <div onClick={() => setExpandedId(isExpanded ? null : uniqueKey)} className="p-4 flex items-center gap-4 cursor-pointer relative">
                      <div className="shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#1e235a] text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                          <span className="text-lg font-black italic">{lesson.priority}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Долоо хоног</p>
                        <h4 className={`text-xs font-bold leading-tight transition-colors ${isExpanded ? 'text-[#1e235a]' : 'text-slate-600 group-hover:text-[#1e235a]'}`}>{lesson.name}</h4>
                      </div>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-50 text-blue-600 rotate-180' : 'bg-slate-50 text-slate-300'}`}><span className="text-[8px]">▼</span></div>
                    </div>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="px-5 pb-6">
                        <div className="h-px bg-slate-50 mb-4"></div>
                        <div className="grid grid-cols-2 gap-2">
                          <LessonActionBtn color="blue" label="Лекц" icon={<PlayIcon />} />
                          <LessonActionBtn color="purple" label="Семинар" icon={<ChatIcon />} />
                          <LessonActionBtn color="emerald" label="Лаб" icon={<LabIcon />} />
                          <LessonActionBtn color="rose" label="Даалгавар" icon={<TaskIcon />} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <button onClick={() => navigate(-1)} className="group flex items-center gap-3 bg-white border border-slate-200 px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-[#1e235a] shadow-sm hover:bg-slate-50 transition-all"><span className="group-hover:-translate-x-1 transition-transform">←</span> Буцах</button>
        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#1e235a]/40 backdrop-blur-md p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-400"></div>
            <h2 className="text-2xl font-black text-[#1e235a] mb-8 uppercase italic tracking-tighter text-center">Шинэ агуулга</h2>
            <div className="space-y-5">
              <ModalInput label="Хэддүгээр долоо хоног?" type="number" value={lessonForm.priority} onChange={(e) => setLessonForm({...lessonForm, priority: e.target.value})} />
              <ModalInput label="Сэдвийн нэр" placeholder="Жишээ: React Hooks" value={lessonForm.name} onChange={(e) => setLessonForm({...lessonForm, name: e.target.value})} />
              <ModalInput label="Товч агуулга" isTextArea placeholder="Үндсэн агуулга..." value={lessonForm.content} onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})} />
              <div className="flex gap-4 pt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all">Цуцлах</button>
                <button onClick={handleSaveLesson} className="flex-1 py-4 bg-[#3b18e3] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl shadow-blue-200 hover:scale-105 transition-all">Хадгалах</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- ТУСЛАХ КОМПОНЕНТУУД --- */

const LessonActionBtn = ({ color, label, icon }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 hover:border-blue-200",
        purple: "bg-purple-50 text-purple-600 hover:border-purple-200",
        emerald: "bg-emerald-50 text-emerald-600 hover:border-emerald-200",
        rose: "bg-rose-50 text-rose-600 hover:border-rose-200"
    };
    return (
        <button className={`flex items-center gap-2 p-3 rounded-xl transition-colors border border-transparent ${colors[color]}`}>
            {icon}
            <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
        </button>
    );
};

const ModalInput = ({ label, isTextArea, ...props }) => (
    <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block italic">{label}</label>
        {isTextArea ? (
            <textarea className="w-full bg-slate-50 p-4 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none font-medium text-sm h-28 shadow-inner resize-none transition-all" {...props} />
        ) : (
            <input className="w-full bg-slate-50 p-4 rounded-xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-sm shadow-inner transition-all" {...props} />
        )}
    </div>
);

const SidebarItem = ({ icon, label, active, onClick }) => (
    <div onClick={onClick} className={`p-3.5 rounded-xl cursor-pointer flex items-center gap-3 text-xs font-bold transition-all duration-300 group ${active ? 'bg-blue-600/20 border-l-4 border-blue-400 text-blue-50' : 'text-blue-200/60 hover:bg-white/10 hover:text-white'}`}>
        <span className={`${active ? 'text-blue-400' : 'text-blue-200/40 group-hover:text-white'}`}>{icon}</span>
        {label}
    </div>
);

/* --- ICON-УУД --- */
const CapIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
const CategoryIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const SchoolIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const PlayIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChatIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const LabIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.34a6 6 0 01-3.86.517l-2.387-.477a2 2 0 00-1.022.547l-1.162 1.162a1 1 0 00.707 1.707h15.056a1 1 0 00.707-1.707l-1.162-1.162zM12 7V4m0 0L9 7m3-3l3 7" /></svg>;
const TaskIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;

export default TeacherPage;