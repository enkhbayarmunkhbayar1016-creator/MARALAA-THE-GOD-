import React, { useState, useEffect, useContext } from "react"; 
import { useNavigate, useParams } from "react-router-dom";
import { schoolAPI, extractItem } from "../../connections/api";

const SchoolInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// teacherSchoolInfo.jsx дотор
useEffect(() => {
  // Хэрэв багш өөр хүний сургуулийн ID руу хандах гэж оролдвол
  if (user.role === 'teacher' && String(user.school_id) !== String(id)) {
    setError("Та зөвхөн өөрийн сургуулийн мэдээллийг харах эрхтэй.");
    setLoading(false);
    return;
  }
  fetchSchoolDetails();
}, [id, user]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
        <p className="text-slate-400 font-medium animate-pulse">Мэдээллийг бэлтгэж байна...</p>
      </div>
    </div>
  );

  if (error || !school) return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-6">
      <div className="bg-rose-50 p-6 rounded-full">
        <span className="text-4xl">⚠️</span>
      </div>
      <p className="text-slate-600 font-semibold text-xl">{error || "Сургууль олдсонгүй."}</p>
      <button 
        onClick={() => navigate(-1)} 
        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
      >
        Буцах
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans">
      
      {/* Sidebar - Pro Side Nav */}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-3xl mb-6 flex items-center justify-center p-4 shadow-2xl transform -rotate-3 hover:rotate-0 transition-all duration-500">
            <img src={school.picture || "/team1/logo-must.png"} alt="Logo" className="w-full object-contain" />
          </div>
          <div className="text-center">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Мэргэжлийн Сургууль</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">ID: {school.id}</p>
          </div>
        </div>
        
        <nav className="flex-1 px-6 py-4 space-y-2">
          <NavItem icon="📚" label="Миний хичээлүүд" />
          <NavItem icon="📂" label="Ангилал" />
          <NavItem icon="🏛️" label="Сургууль" active />
          <NavItem icon="👤" label="Профайл" />
        </nav>

        <div className="p-8 mt-auto border-t border-slate-800">
          <button className="flex items-center gap-3 text-slate-400 hover:text-rose-400 font-bold transition-colors text-sm">
            <span>🚪</span> Системээс гарах
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        
        {/* Header - Transparent Backdrop */}
        <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all group"
            >
              <span className="text-slate-400 group-hover:text-indigo-600">← Буцах</span>
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
            <h1 className="text-slate-800 font-bold">Сургуулийн танилцуулга</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800">Золбоо Төмөрболд</p>
              <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest">Багш • ГУУС</p>
            </div>
            <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-xl overflow-hidden bg-indigo-100 ring-4 ring-slate-50">
              <img src="/team1/user.png" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Hero Profile Section */}
          <div className="relative mb-12">
            <div className="h-80 w-full rounded-[3.5rem] overflow-hidden shadow-2xl relative">
              <img 
                src="/team1/school.jpg" 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/40 to-transparent"></div>
              
              <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-indigo-200 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Олон улсын магадлан итгэмжлэл
                    </span>
                  </div>
                  <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-2">
                    {school.name}
                  </h1>
                </div>
                
                <div className="flex gap-4">
                   <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 px-8 rounded-3xl text-white text-center">
                      <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Эрэмбэ</p>
                      <p className="text-2xl font-black">{school.priority || "N/A"}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Description - Left Side */}
            <div className="lg:col-span-8 space-y-8">
              <section className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-indigo-50 rounded-2xl text-2xl">🏫</div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Сургуулийн түүх, зорилго</h3>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed text-lg text-justify whitespace-pre-line font-medium italic border-l-4 border-indigo-100 pl-8">
                    {school.description || "Энэхүү сургуулийн дэлгэрэнгүй танилцуулга одоогоор системд бүртгэгдээгүй байна."}
                  </p>
                </div>
              </section>
            </div>

            {/* Quick Stats & Info - Right Side */}
            <div className="lg:col-span-4 space-y-6">
              <StatsCard label="Нийт хичээл" value="24+" icon="📖" color="indigo" />
              <StatsCard label="Идэвхтэй багш нар" value="120+" icon="🎓" color="sky" />
              
              <div className="bg-[#1e235a] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                   <h4 className="text-lg font-black mb-4">Холбоо барих</h4>
                   <div className="space-y-4">
                     <ContactItem icon="📍" label="Байршил" value="Төв кампус, 1-р байр" />
                     <ContactItem icon="📞" label="Утас" value="+(976) 7013-1234" />
                     <ContactItem icon="🌐" label="Вэб" value="www.must.edu.mn" />
                   </div>
                 </div>
                 {/* Decorative background circle */}
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// Internal Components
const NavItem = ({ icon, label, active = false }) => (
  <div className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 text-sm font-bold transition-all duration-300 group ${
    active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
  }`}>
    <span className={`text-xl transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
    {label}
  </div>
);

const StatsCard = ({ label, value, icon, color }) => {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    sky: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600"
  };
  
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 ${colorMap[color] || colorMap.indigo} rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ icon, label, value }) => (
  <div className="flex gap-4 items-start">
    <span className="opacity-80">{icon}</span>
    <div>
      <p className="text-[9px] uppercase font-black opacity-50 tracking-widest">{label}</p>
      <p className="text-xs font-bold">{value}</p>
    </div>
  </div>
);

export default SchoolInfo;