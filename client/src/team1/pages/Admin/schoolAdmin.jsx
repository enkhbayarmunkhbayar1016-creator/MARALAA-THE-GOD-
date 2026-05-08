import React, { useState, useEffect } from 'react';

const SchoolAdminDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [courseRequests, setCourseRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teachers');

  // Swagger дээрх үндсэн URL-аа энд зөв тохируулаарай
  const BASE_URL = 'https://todu.mn/bs/lms/api/v1'; 

  // Headers үүсгэх туслах функц
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}` // Token-оо энд дамжуулна
  });

  // Өгөгдөл татах
  const fetchData = async () => {
    try {
      setLoading(true);
      // Сургуулийн админ зөвхөн өөрийн сургуулийн мэдээллийг авна
      const [tRes, cRes] = await Promise.all([
        fetch(`${BASE_URL}/school/teachers`, { headers: getAuthHeaders() }),
        fetch(`${BASE_URL}/school/course-requests`, { headers: getAuthHeaders() })
      ]);

      if (tRes.ok && cRes.ok) {
        setTeachers(await tRes.json());
        setCourseRequests(await cRes.json());
      } else {
        console.error("Эрх хүрэлцэхгүй эсвэл алдаа гарлаа");
      }
    } catch (e) {
      console.error("Дата татахад алдаа гарлаа:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Хүсэлт батлах
  const handleApprove = async (id) => {
    if (!window.confirm("Энэхүү өөрчлөлтийг баталгаажуулах уу?")) return;
    try {
      const res = await fetch(`${BASE_URL}/school/approve-course/${id}`, { 
        method: 'POST',
        headers: getAuthHeaders() // Header заавал байх ёстой
      });
      if (res.ok) {
        setCourseRequests(prev => prev.filter(r => r.id !== id));
        alert("Амжилттай батлагдлаа.");
      }
    } catch (e) { alert("Алдаа гарлаа"); }
  };
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      
      {/* 1. SIDEBAR - Нүдэнд дулаахан, Компакт */}
      <aside className="w-72 bg-[#1e235a] text-white flex flex-col shrink-0 shadow-2xl relative z-30">
        <div className="p-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] mb-5 flex items-center justify-center p-3 shadow-inner">
             <img src="/team1/logo-must.png" alt="MUST" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-center leading-tight">
           Шинжлэх Ухаан Технологийн Их Сургууль <span className="text-indigo-400 block mt-1">LMS Admin</span>
          </h2>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          {[
            { id: 'teachers', label: 'Багш нарын жагсаалт', count: null },
            { id: 'course_requests', label: 'Хичээлийн хүсэлтүүд', count: courseRequests.length }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 translate-x-2' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-rose-500 text-white px-2.5 py-1 rounded-lg text-[10px] animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="bg-white/5 p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Системийн төлөв</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              <p className="text-xs font-bold text-green-400 uppercase">Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Modern Header */}
        <header className="h-24 bg-[#1e235a] border-b border-slate-100 flex items-center justify-between px-12 shrink-0 z-20">
          <div>
            <h1 className="text-2xl font-white text-slate-100 tracking-tight">
              {activeTab === 'teachers' ? 'Багш нарын нэгдсэн бүртгэл' : 'Багшаас ирсэн мэдэгдлүүд'}
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              {activeTab === 'teachers' ? 'Нийт батлагдсан багш нар' : 'Шинэ хичээл болон агуулгын өөрчлөлт'}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-slate-50 p-2 rounded-2xl flex gap-2 border border-slate-100">
               <button className="px-6 py-2 bg-white shadow-sm rounded-xl text-xs font-black text-indigo-600 border border-slate-100 italic">Admin</button>
               <button className="px-4 py-2 text-slate-400 text-xs font-bold">Logout</button>
            </div>
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          
          <div className="max-w-[1400px] mx-auto">
            {activeTab === 'teachers' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {teachers.map(t => (
                  <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                    <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center font-black text-indigo-600 text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {t.firstName?.charAt(0)}
                    </div>
                    <h3 className="font-black text-slate-800 text-lg leading-tight">{t.lastName} <br/> {t.firstName}</h3>
                    <p className="text-slate-400 text-xs mt-3 font-medium truncate italic">{t.email}</p>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                       <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Профайл харах</span>
                       <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">→</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-10 py-8">Багшийн мэдээлэл</th>
                      <th className="px-10 py-8">Хичээл & Төрөл</th>
                      <th className="px-10 py-8">Агуулгын тойм</th>
                      <th className="px-10 py-8 text-right">Удирдлага</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {courseRequests.length > 0 ? courseRequests.map(req => (
                      <tr key={req.id} className="hover:bg-indigo-50/30 transition-all group">
                        <td className="px-10 py-10">
                          <p className="font-black text-slate-800 text-base">{req.teacherName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Багш</p>
                        </td>
                        <td className="px-10 py-10">
                          <p className="font-black text-slate-700 text-sm mb-2">{req.courseTitle}</p>
                          <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${
                            req.type === 'NEW' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {req.type === 'NEW' ? 'Шинэ хичээл' : 'Засах хүсэлт'}
                          </span>
                        </td>
                        <td className="px-10 py-10">
                          <div className="max-w-xs bg-slate-50 p-4 rounded-2xl text-[12px] text-slate-500 font-medium leading-relaxed italic border border-slate-100">
                            "{req.description}"
                          </div>
                        </td>
                        <td className="px-10 py-10 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase hover:bg-rose-50 hover:text-rose-500 transition-all">Цуцлах</button>
                            <button 
                              onClick={() => handleApprove(req.id)}
                              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100 hover:bg-green-600 hover:shadow-green-100 transition-all"
                            >
                              Батлах
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="py-32 text-center">
                          <div className="flex flex-col items-center opacity-20">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="font-black uppercase tracking-[0.3em] text-slate-900">Мэдэгдэл байхгүй</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const handleUpdateSchool = async (schoolId, updatedData) => {
  try {
    const response = await schoolAPI.update(schoolId, updatedData);
    
    if (response.status === 200) {
      alert("Сургуулийн мэдээлэл амжилттай шинэчлэгдлээ!");
      // Сургуулийн жагсаалтыг дахин ачаалах эсвэл state-ээ шинэчлэх үйлдлүүд энд явна
    }
  } catch (error) {
    console.error("Алдаа гарлаа:", error);
    alert("Мэдээлэл шинэчлэхэд алдаа гарлаа.");
  }
};

export default SchoolAdminDashboard;