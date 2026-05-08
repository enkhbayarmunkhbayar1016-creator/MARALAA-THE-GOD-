import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { schoolAPI, extractItems } from "../../connections/api";

const SystemAdminDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const navigate = useNavigate();

  // --- 1. ӨГӨГДӨЛ ТАТАХ ---
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await schoolAPI.getAll();
      const items = extractItems(res);
      setData(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- 2. УСТГАХ ҮЙЛДЭЛ ---
  const handleDelete = async (id) => {
    if (!window.confirm("Та итгэлтэй байна уу?")) return;
    try {
      await schoolAPI.delete(id);
      alert("Амжилттай устгагдлаа.");
      loadData();
    } catch (err) {
      alert("Алдаа: " + err.message);
    }
  };

  // --- 3. ХАДГАЛАХ (НЭМЭХ) ҮЙЛДЭЛ ---
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let payload = Object.fromEntries(formData.entries());

    try {
      payload.priority = parseInt(payload.priority) || 0;
      await schoolAPI.create(payload); // Зөвхөн шинээр нэмэх үйлдэл
      
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert("Алдаа: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans">
      
      {/* --- SIDEBAR --- */}
     <aside className="w-64 bg-[#1e235a] text-white p-6 flex flex-col shrink-0 shadow-2xl z-20 sticky top-0 h-screen">
  <div className="flex flex-col items-center mb-10 cursor-pointer transition-transform active:scale-95" onClick={() => navigate('/team1/home')}>
    <div className="w-14 h-14 bg-white rounded-2xl mb-3 flex items-center justify-center p-2 shadow-lg">
       <img src="/team1/logo-must.png" alt="MUST" className="w-full object-contain" />
    </div>
    <p className="text-center text-[9px] font-bold uppercase tracking-widest leading-tight opacity-70">
      Шинжлэх Ухаан Технологийн Их Сургууль
    </p>
  </div>

  <nav className="flex-1 space-y-2">
    <div 
      onClick={() => navigate('courses/:course_id')} 
       className="p-3.5 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-xs text-blue-200/60 font-bold transition-all hover:text-white group"
       >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.174L10.72 12.156a3.375 3.375 0 002.56 0l6.46-1.982m-16.5 0a22.5 22.5 0 0116.5 0m-16.5 0v3.447c0 1.25.717 2.38 1.84 2.871l6.932 3.037a3.375 3.375 0 002.56 0l6.932-3.037a3.375 3.375 0 001.84-2.871V10.174M6.75 6.75a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75z" />
      </svg>
      Миний хичээлүүд
    </div>

    {/* Ангилал */}
    <div 
      onClick={() => navigate('/team1/category')} 
      className="p-3.5 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-xs text-blue-200/60 font-bold transition-all hover:text-white group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:text-white transition-colors">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
      Ангилал
    </div>

    {/* Сургууль */}
    <div 
     onClick={() => navigate('/team1/sysAdmin')} 
      className="bg-blue-600/20 border-l-4 border-blue-400 p-3.5 rounded-r-xl flex items-center gap-3 cursor-pointer text-xs font-bold text-blue-50 transition-all hover:bg-blue-600/30"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:text-white transition-colors">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
      </svg>
      Сургууль
    </div>
  </nav>

  {/* Sidebar Footer (Optional) */}
  <div className="mt-auto pt-6 border-t border-white/5">
    <div className="flex items-center gap-3 p-3 text-blue-200/40 text-[10px] font-medium uppercase tracking-widest">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      Систем хэвийн
    </div>
  </div>
</aside>

      <main className="flex-1 flex flex-col">
        
        {/* --- HEADER --- */}
        <header className="h-16 bg-[#1e235a] flex items-center justify-end px-10 shadow-md border-b border-white/10 sticky top-0 z-20">
          <div className="flex items-center gap-8">
            <div className="relative cursor-pointer hover:scale-110 transition-transform">
              <img src="/team1/notification.png" alt="notification" className="w-5 h-5 brightness-0 invert" />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10 text-white">
              <span className="font-medium text-sm tracking-wide">Админ</span>
              <div className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden shadow-sm">
                <img src="/team1/user.png" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="p-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
              <div>
                <h1 className="text-3xl font-black text-[#1e235a] tracking-tighter">
                  Сургуулийн удирдлага
                </h1>
                <p className="text-slate-400 text-sm font-medium mt-1">Системийн сургуулиудын мэдээллийг хянах, засварлах</p>
              </div>

              <div className="flex items-center gap-6">
                 <button 
                   onClick={() => setModalOpen(true)}
                   className="bg-[#112a60] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 active:scale-95"
                 >
                   + Нэмэх
                 </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[1rem] border border-slate-100 shadow-l overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                    <th className="px-8 py-5">Зураг</th>
                    <th className="px-8 py-5">Сургуулийн нэр</th>
                    <th className="px-8 py-5">Эрэмбэ</th>
                    <th className="px-8 py-5 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                          <img src={item.picture || '/team1/school.jpg'} alt="logo" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-8 py-4">
                         <span className="font-bold text-slate-700">
                            {item.name}
                         </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">
                          #{item.priority}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => navigate(`/team1/sysAdmin/schools/${item.id}`)} className="px-2 py-1 border-1 border-indigo-50 text-[#112a60] rounded-lg font-bold text-xs hover:bg-[#112a60] hover:text-white transition-all">Дэлгэрэнгүй</button>
                          <button onClick={() => handleDelete(item.id)} className="px-2 py-1 border-1 border-rose-50 text-rose-600 rounded-lg font-bold text-xs hover:bg-[#b0162d] hover:text-white transition-all">Устгах</button>
                        </div> 
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-3xl font-black mb-8 tracking-tighter text-[#1e235a]">
              Сургууль бүртгэх
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <InputField label="Сургуулийн нэр" name="name" required />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Эрэмбэ" name="priority" type="number" defaultValue={1} required min="1" />
                <InputField label="Лого URL" name="picture" placeholder="https://..." />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all">Болих</button>
                <button type="submit" className="bg-[#112a60] text-white px-20 py-1 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 active:scale-95">ХАДГАЛАХ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ТУСЛАХ КОМПОНЕНТУУД ---

const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <div onClick={onClick} className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 text-sm font-bold transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
    <span className="text-xl">{icon}</span> {label}
  </div>
);

const InputField = ({ label, ...props }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all font-medium" />
  </div>
);

export default SystemAdminDashboard;