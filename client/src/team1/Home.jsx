import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login from '../layout/Login.jsx';
import { UserContext } from "../contexts/UserContext"; 

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user && user.id !== 0) {
      logout();
      localStorage.removeItem("access_token");
      // navigate-ээр шилжүүлэх нь window.location.reload-оос илүү цэвэрхэн
      navigate('/layout/login');
    } else {
      setIsLoginOpen(!isLoginOpen);
    }
  };
  {user?.role !== "student" && (
  <Link to="/team1/report">
    Тайлан
  </Link>
)}

  const getHeaderContent = () => {
    if (!user || user.id === 0) {
      return {
        title: "Цахим сургалтын систем",
        desc: "Системд нэвтэрч сургалтын мэдээллээ харна уу."
      };
    }
    const roles = {
      teacher: { title: "Багшийн удирдлагын хэсэг", desc: "Хичээл болон сургалтын материалуудаа эндээс удирдана уу." },
      student: { title: "Суралцагчийн талбар", desc: "Өөрийн суралцаж буй хичээлүүд болон сургуулийн мэдээллээ харна уу." },
      admin: { title: "Админы хянах самбар", desc: "Системийн хэрэглэгчид болон сургуулиудыг удирдах хэсэг." }
    };
    return roles[user.role] || { title: "Тавтай морил", desc: "Цахим сургалтын системд тавтай морил." };
  };

  const content = getHeaderContent();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* --- HEADER --- */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
             <img src="/team1/logo-must.png" alt="Logo" className="h-10 w-auto" />
             <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
             <span className="text-xs font-black text-[#1e235a] uppercase tracking-tighter italic hidden sm:block">ШУТИС</span>
          </div>
          
          <div className="flex items-center gap-6">
            {user && user.id !== 0 && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-slate-900">{user.name || user.email}</p>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                    <img src={user.picture || "/team1/user.png"} alt="user" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            
            <button 
              onClick={handleAuthAction}
              className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                user && user.id !== 0 
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                  : "bg-[#1e235a] text-white hover:bg-indigo-900 shadow-lg shadow-indigo-100"
              }`}
            >
              {user && user.id !== 0 ? "Гарах" : isLoginOpen ? "Хаах" : "Нэвтрэх"}
            </button>
          </div>
        </header>

        <div className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            
            {/* HERO BANNER */}
            <section className="relative bg-[#1e235a] rounded-[3rem] p-16 text-white overflow-hidden mb-12 shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tighter uppercase italic italic">
                  {content.title}
                </h1>
                <p className="text-indigo-100/70 text-lg font-medium leading-relaxed">
                  {content.desc}
                </p>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                 <img src="/team1/logo-must.png" className="w-full h-full object-contain scale-150 translate-x-1/4" alt="bg" />
              </div>
            </section>

            {/* CONTENT AREA */}
            {isLoginOpen && (!user || user.id === 0) ? (
              <div className="max-w-md mx-auto py-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-50 text-center">
                  <h3 className="text-2xl font-black text-[#1e235a] mb-8 uppercase italic tracking-tighter">Нэвтрэх</h3>
                  <Login onSuccess={() => setIsLoginOpen(false)} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {user && user.id !== 0 ? (
                   <>
                    {/* КАРТ: БАГШИЙН ЦЭС */}
                    {user.role === 'teacher' && (
                        <>
                            <MenuCard 
                                to="/team1/teacher/courses" 
                                title="Миний хичээлүүд" 
                                desc="Таны зааж буй хичээлүүд болон оюутны ирц, дүнгийн бүртгэл."
                                icon="🎓"
                            />
                            <MenuCard 
                                to="/team1/teacher/courses/create" 
                                title="Шинэ хичээл нэмэх" 
                                desc="Шинэ сургалтын хөтөлбөр, видео болон текст контент үүсгэх."
                                icon="➕"
                            />
                        </>
                    )}

                    {/* КАРТ 2 */}
                    {/* Анхаар: Замаа яг жагсаалт харуулдаг хуудасныхаа зам руу солиорой */}
                    <Link to="/team1/sysAdmin/schools/:id" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col h-full">
                       <div className="text-slate-400 group-hover:text-indigo-600 transition-colors mb-6">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                       </div>
                       <h3 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-indigo-600 transition-colors">Сургуулийн жагсаалт</h3>
                       <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">Бүртгэлтэй байгаа бүх сургуулийн жагсаалт, ерөнхий мэдээллийг харах.</p>
                    </Link> 
                    {/* КАРТ 3 — REPORT */}
<Link to="/team1/report" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col h-full">
  <div className="text-slate-400 group-hover:text-indigo-600 transition-colors mb-6">
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-6m4 6V7m4 10V11M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  </div>
  <h3 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-indigo-600 transition-colors">
    Тайлан
  </h3>
  <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">
    Тайлангийн хэсэг.
  </p>
</Link>

<Link to="/team1/course-report" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col h-full">
  <div className="text-slate-400 group-hover:text-indigo-600 transition-colors mb-6">
    📚
  </div>
  <h3 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-indigo-600 transition-colors">
    Хичээлийн тайлан
  </h3>
  <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">
    Хичээл тус бүрийн дүн, ирц, сурагчийн тоо болон төлөвийн тайлан.
  </p>
</Link>
                   </>  
                   
                 ) : (
                  
                   <div className="col-span-full text-center py-20 px-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Нэвтрэх шаардлагатай</h3>
                      <p className="text-slate-500 font-medium">Системийн цэсүүдийг үзэх болон үйлдэл хийхийн тулд нэвтэрч орно уу.</p>
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Дахин ашиглагдах Карт компонент
const MenuCard = ({ to, title, desc, icon }) => (
    <Link to={to} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="text-3xl mb-8 relative z-10">{icon}</div>
        <h3 className="font-black text-[#1e235a] text-xl tracking-tighter uppercase italic group-hover:text-indigo-600 transition-colors relative z-10">{title}</h3>
        <p className="text-slate-400 text-xs mt-4 leading-relaxed font-bold uppercase tracking-wide relative z-10">{desc}</p>
        <div className="mt-auto pt-8 flex items-center text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">
            Дэлгэрэнгүй →
        </div>
    </Link>
);