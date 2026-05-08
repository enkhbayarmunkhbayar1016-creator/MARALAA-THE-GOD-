import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI, extractItems } from '../../connections/api'; 

const TeacherCourseList = () => {
  const navigate = useNavigate();

  // Төлөвүүд
  const [courses, setCourses] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  // API-аас хичээлийн жагсаалт татах функц
  const fetchCourses = async () => {
    
    try {
      setLoading(true);
      setError(null);
      
      // Сургуулийн ID 2 (МХТС) дээр Админ эрхтэй байгаа тул 2-оор татна
      const payload = await courseAPI.getBySchool(2); 
      const data = extractItems(payload); 
      
      console.log("API-аас ирсэн дата:", data);
      setCourses(data); // Датаг state-д хадгалах
    } catch (err) {
      console.error("Хичээл татахад алдаа гарлаа:", err);
      setError("Хичээлийн жагсаалтыг ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect ажиллаж эхэллээ");
    fetchCourses();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f1f3f8] font-sans text-slate-900">
      
      {/* Сонгогдсон SideBar */}
      <aside className="w-64 bg-[#1e235a] text-white p-6 flex flex-col shrink-0 shadow-2xl z-20 sticky top-0 h-screen">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl mb-3 flex items-center justify-center p-2 shadow-lg cursor-pointer" onClick={() => navigate('/team1/home')}>
             <img src="/team1/logo-must.png" alt="MUST" className="w-full object-contain" />
          </div>
          <p className="text-center text-[9px] font-bold uppercase tracking-widest leading-tight opacity-70">
            Шинжлэх Ухаан Технологийн Их Сургууль
          </p>
        </div>
        <nav className="flex-1 space-y-2">
          <div 
            onClick={() => navigate('/team1/courses')}
            className="bg-blue-600/20 border-l-4 border-blue-400 p-3.5 rounded-r-xl flex justify-between items-center cursor-pointer text-xs font-bold text-blue-50"
          >
            <span className="flex items-center gap-3">🎓 Миний хичээлүүд</span>
          </div>
          <div 
            onClick={() => navigate('/team1/category')}
            className="p-3.5 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-xs text-blue-200/60 transition-all duration-300 hover:text-white font-semibold"
          >
            🏢 Ангилал
          </div>
          <div className="p-3.5 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-xs text-blue-200/60 transition-all duration-300 hover:text-white font-semibold">🏛️ Сургууль</div>
          <div className="p-3.5 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-xs text-blue-200/60 transition-all duration-300 hover:text-white font-semibold">👤 Профайл</div>
        </nav>
      </aside>

      {/* Гол контент */}
      <div className="flex-1 min-w-0">
        <header className="h-14 bg-[#1e235a] flex items-center justify-end px-10 shadow-md border-b border-white/10 z-10 sticky top-0">
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer hover:scale-110 transition-transform">
              <img src="/team1/notification.png" alt="notification" className="w-5 h-5 brightness-0 invert opacity-100" />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <span className="font-semibold text-xs text-white/90">Золбоо Төмөрболд</span>
              <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-slate-400">
                <img src="/team1/user.png" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-10 md:p-14">
          {/* Гарчиг */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-black text-[#1e235a] tracking-tighter">
              Хичээлийн жагсаалт
            </h1>
            <button 
              onClick={() => navigate('/team1/teacher/courses/create')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            >
              + Хичээл нэмэх
            </button>
          </div>

          {/* Ачаалж буй болон Алдааны төлөв */}
          {loading ? (
            <div className="text-center py-20 text-slate-400 font-bold italic">Хичээлүүдийг ачаалж байна...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-500 font-bold">{error}</div>
          ) : courses.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
               <p className="text-slate-400 font-bold text-lg">Одоогоор бүртгэлтэй хичээл байхгүй байна.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  onClick={() => navigate(`/team1/teacher/courses/${course.id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center gap-8 p-6 cursor-pointer hover:shadow-xl hover:border-blue-100 transition-all active:scale-98 group"
                >
                  {/* Хичээлийн зураг */}
                  <div className="w-40 h-28 rounded-xl overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={course.picture || "/team1/bigdata-image.png"} 
                      alt={course.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = "/team1/bigdata-image.png" }}
                    />
                  </div>
                  
                  {/* Хичээлийн мэдээлэл */}
                  <div className="flex-1 flex justify-between items-start">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-black text-[#1e235a] tracking-tight group-hover:text-blue-700 transition-colors">
                        {course.name}
                      </h2>
                      
                      <div className="space-y-3 text-sm text-gray-500 font-medium opacity-90">
                        <div className="flex items-center gap-3">
                          <img src="/team1/calendar.png" alt="calendar" className="w-5 h-5" />
                          <span>
                            {course.start_on ? new Date(course.start_on).toLocaleDateString() : 'Тодорхойгүй'} - {course.end_on ? new Date(course.end_on).toLocaleDateString() : 'Тодорхойгүй'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <img src="/team1/location.png" alt="credits" className="w-5 h-5" />
                          <span>Кредит: {course.credits || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Улирлын мэдээлэл болон ID */}
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 opacity-80 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                        Хаврын улирал
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {course.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherCourseList;
