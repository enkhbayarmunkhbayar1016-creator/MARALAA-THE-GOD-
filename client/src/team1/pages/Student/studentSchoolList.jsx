import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { schoolAPI, extractItems } from "../../connections/api";

const StudentSchoolList = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoading(true);
        const res = await schoolAPI.getAll();
        setSchools(extractItems(res));
      } catch (err) {
        console.error("Алдаа гарлаа:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSchools();
  }, []);

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#F3F4F6]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F172A]"></div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6", fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* --- SIDEBAR (Updated to match your style) --- */}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-2xl mb-6 flex items-center justify-center p-3 shadow-xl">
            <img src="/team1/logo-must.png" alt="Logo" className="w-full object-contain" />
          </div>
          <p className="text-[10px] text-center uppercase tracking-[0.2em] opacity-60 font-black">
             Шинжлэх Ухаан Технологийн Их Сургууль
          </p>
        </div>
        <nav className="flex-1 px-6 space-y-2">
           <SidebarItem icon="🎓" label="Хичээл" onClick={() => navigate("/team1/home")} />
           <SidebarItem icon="📑" label="Ангилал" />
           <SidebarItem icon="🏛️" label="Сургууль" active />
           <SidebarItem icon="👤" label="Профайл" />
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        
        {/* --- HEADER (Updated to match your style) --- */}
        <header className="h-20 bg-white flex items-center justify-end px-10 shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-4 text-slate-800">
             <span className="font-bold text-sm">Оюутны булан</span>
             <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-indigo-100">
                <img src="/team1/user.png" alt="User" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        {/* --- CONTENT AREA --- */}
        <div style={{ padding: "40px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            
            {/* Title & Search */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                  Сургуулийн жагсаалт
                </h1>
                <p className="text-slate-400 text-sm font-medium">Нийт бүртгэлтэй сургуулиуд</p>
              </div>
              <div className="w-full md:w-72">
                <input 
                  type="text" 
                  placeholder="Хайх..."
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-2.5 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-5">
              {/* 1. Үндсэн сургуулиуд */}
              {filteredSchools
                .filter(s => !s.parent_id || Number(s.parent_id) === 0)
                .map(mainSchool => (
                  <div key={mainSchool.id} className="space-y-5">
                    
                    <SchoolHorizontalCard 
                      school={mainSchool} 
                      onClick={() => navigate(`/team1/school/${mainSchool.id}`)}
                    />

                    {/* 2. Түүний доорх салбарууд */}
                    <div className="ml-12 space-y-3 border-l-2 border-slate-200 pl-6">
                      {filteredSchools
                        .filter(child => Number(child.parent_id) === mainSchool.id)
                        .map(branch => (
                          <SchoolHorizontalCard 
                            key={branch.id} 
                            school={branch} 
                            isBranch
                            onClick={() => navigate(`/team1/school/${branch.id}`)}
                          />
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- КОМПОНЕНТ: ХӨНДЛӨН КАРТ (Бага зэрэг жижигсгэсэн) ---
const SchoolHorizontalCard = ({ school, isBranch, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-[1.5rem] p-3 flex items-center gap-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group border border-slate-50 hover:border-indigo-100"
  >
    {/* Сургуулийн зураг (Хэмжээг w-48 -> w-40, h-32 -> h-28 болгож багасгасан) */}
    <div className="w-40 h-28 rounded-xl overflow-hidden shrink-0 shadow-inner bg-slate-50">
      <img 
        src={school.picture || "/team1/school.jpg"} 
        alt={school.name} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => e.target.src = "/team1/school.jpg"}
      />
    </div>

    {/* Сургуулийн нэр */}
    <div className="flex-1">
      <h3 className={`font-black text-slate-800 leading-tight ${isBranch ? 'text-md opacity-80' : 'text-xl'}`}>
        {school.name}
      </h3>
      <span className="inline-block mt-2 px-3 py-0.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
        {isBranch ? 'Салбар сургууль' : 'Үндсэн сургууль'}
      </span>
    </div>

    <div className="pr-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
      <span className="text-xl text-indigo-600">→</span>
    </div>
  </div>
);

// --- КОМПОНЕНТ: SIDEBAR ITEM ---
const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 text-sm font-bold transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    }`}
  >
    <span className="text-xl">{icon}</span> {label}
  </div>
);

export default StudentSchoolList;