import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { schoolAPI, extractItem } from "../../connections/api";

const StudentSchool = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchSchoolDetail = async () => {
    // Хэрэв ID байхгүй эсвэл "undefined" гэсэн текст байвал хүсэлт явуулахгүй
    if (!id || id === "undefined") {
      console.warn("ID олдоогүй тул хүсэлтийг цуцаллаа");
      return; 
    }

    try {
      setLoading(true);
      const res = await schoolAPI.getOne(id);
      setSchool(extractItem(res));
    } catch (err) {
      setError("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  fetchSchoolDetail();
}, [id]); // ID өөрчлөгдөх бүрт ажиллана
 

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#F3F4F6]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F172A]"></div>
    </div>
  );

  if (error || !school) return (
    <div className="p-20 text-center text-rose-500 font-bold">
      {error || "Сургууль олдсонгүй."}
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6", fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-2xl mb-6 flex items-center justify-center p-3 shadow-xl">
            <img src={school.picture || "/team1/logo-must.png"} alt="Logo" className="w-full object-contain" />
          </div>
          <p className="text-[10px] text-center uppercase tracking-[0.2em] opacity-60 font-black">
             {school.parent_id && Number(school.parent_id) !== 0 ? "Салбар сургууль" : "Их сургууль"}
          </p>
        </div>
        <nav className="flex-1 px-6 space-y-2">
           <SidebarItem icon="🎓" label="Хичээл" onClick={() => navigate("/team1/home")} />
           <SidebarItem icon="📑" label="Ангилал" />
           <SidebarItem icon="🏛️" label="Сургууль" active onClick={() => navigate("/team1/school-list")} />
           <SidebarItem icon="👤" label="Профайл" />
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        
        {/* --- HEADER --- */}
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
            
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Сургуулийн дэлгэрэнгүй</h1>
            </div>

            {/* Main Info Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 mb-8">
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                {/* School Image */}
                <div className="w-full md:w-80 h-56 rounded-3xl overflow-hidden shadow-lg shadow-indigo-100 bg-slate-50">
                  <img 
                    src={school.picture || "/team1/school.jpg"} 
                    alt={school.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = "/team1/school.jpg"} 
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-6 py-2">
                  <InfoRow label="Сургуулийн нэр :" value={school.name} />
                  <InfoRow label="Эрэмбэ (Priority):" value={school.priority || "1"} />
                  <InfoRow label="Нийт суралцагч:" value={school.student_count || "2,500+"} />
                  <div className="pt-4">
                    <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                      {Number(school.parent_id) > 0 ? "Салбар сургуулийн статус" : "Үндсэн сургуулийн статус"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 mb-10">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl">📖</span>
                <h3 className="text-xl font-bold text-slate-900">Товч танилцуулга</h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-line font-medium">
                {school.description || "Энэ сургуулийн дэлгэрэнгүй танилцуулга мэдээлэл одоогоор ороогүй байна."}
              </p>
            </div>

            {/* Back Button */}
            <button 
              onClick={() => navigate(-1)} 
              className="bg-[#0F172A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              ← Буцах
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};

// --- ТУСЛАХ КОМПОНЕНТУУД ---

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

const InfoRow = ({ label, value }) => (
  <div className="flex items-center gap-4 border-b border-slate-50 pb-3">
    <span className="text-sm text-slate-400 min-w-[140px] font-medium uppercase tracking-widest text-[10px]">{label}</span>
    <span className="text-sm text-slate-800 font-bold">{value}</span>
  </div>
);

export default StudentSchool;