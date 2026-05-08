import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { schoolAPI, userAPI, extractItem } from "../../connections/api";

const SysAdminSchoolView = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const [schoolEditModalOpen, setSchoolEditModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // СУРГУУЛИЙН МЭДЭЭЛЭЛ ТАТАХ 
  const fetchSchoolDetail = async () => {
    try {
      setLoading(true);
      const res = await schoolAPI.getOne(id);
      const myData = extractItem(res);
      
      if (myData && myData.items) {
        setSchool(myData.items[0]);
      } else if (Array.isArray(myData)) {
        setSchool(myData[0]); 
      } else {
        setSchool(myData);
      }
    } catch (err) {
      console.error("Сургууль мэдээлэл авахад алдаа гарлаа:", err);
      setError("Сургууль мэдээлэл авахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSchoolDetail();
  }, [id]);

  // ЗАСВАР 1: СУРГУУЛИЙН ТУСГАЙ API-ААС ХЭРЭГЛЭГЧИД ТАТАХ
  const fetchUsers = async () => {
    try {
      // Танай систем токеноо юу гэж хадгалдагийг шалгаарай (жишээ нь: "accessToken")
      const token = localStorage.getItem("token") || sessionStorage.getItem("token") || ""; 
      
      const response = await fetch(`https://todu.mn/bs/lms/v1/schools/${id}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      const resData = await response.json();
      const items = Array.isArray(resData) ? resData : (resData.items || resData.data || []);
      
      setUsers(items);
    } catch (err) {
      console.error("Хэрэглэгчдийг татахад алдаа:", err);
    }
  };

  const toggleUsers = () => {
    if (!showUsers) fetchUsers();
    setShowUsers(!showUsers);
  };

  // --- 3. СУРГУУЛЬ ЗАСАХ ---
  const handleSchoolSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let payload = Object.fromEntries(formData.entries());
    payload.priority = parseInt(payload.priority) || 1;

    try {
      await schoolAPI.update(id, payload);
      setSchoolEditModalOpen(false);
      fetchSchoolDetail();
      alert("Сургуулийн мэдээлэл амжилттай шинэчлэгдлээ.");
    } catch (err) {
      alert("Алдаа: " + err.message);
    }
  };

  // ЗАСВАР 2: ХЭРЭГЛЭГЧИЙГ 2 АЛХАМТАЙГААР БҮРТГЭЖ ХОЛБОХ
  const handleUserSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let payload = Object.fromEntries(formData.entries());
    
    payload.role_id = parseInt(payload.role_id);
    payload.username = payload.email.split('@')[0];

    if (!editingUser) {
      payload.password = "123"; 
    }

    try {
      if (editingUser) {
        // Засах үйлдэл
        await userAPI.update(editingUser.id, payload);
      } else {
        // АЛХАМ 1: Системд шинэ хэрэглэгч бүртгэх (Global POST /users)
        await userAPI.create(payload);

        // АЛХАМ 2: Бүртгэгдсэн хэрэглэгчийг СУРГУУЛЬД холбох (POST /schools/{id}/users)
        const token = localStorage.getItem("token") || sessionStorage.getItem("token") || ""; 
        const linkPayload = {
          current_user: "admin", 
          role_id: payload.role_id.toString(),
          username: payload.username
        };

        const linkResponse = await fetch(`https://todu.mn/bs/lms/v1/schools/${id}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(linkPayload)
        });

        if (!linkResponse.ok) {
           console.error("Сургуульд холбох үед алдаа гарлаа.");
        }
      }
      setUserModalOpen(false);
      setEditingUser(null);
      fetchUsers(); // Шинэчилсэн жагсаалтаа дахин татаж харуулах
    } catch (err) {
      alert("Алдаа: " + err.message);
    }
  };

  // ХЭРЭГЛЭГЧ УСТГАХ 
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?")) return;
    try {
      await userAPI.delete(userId);
      alert("Амжилттай устгагдлаа.");
      fetchUsers();
    } catch (err) {
      alert("Алдаа: " + err.message);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#F3F4F6]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e235a]"></div>
    </div>
  );

  if (error || !school) return (
    <div className="p-20 text-center text-rose-500 font-bold">
      {error || "Сургууль олдсонгүй."}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans">
      
      {/* --- ADMIN SIDEBAR --- */}
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
      onClick={() => navigate('/team1/teacher/courses')} 
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


      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col">
        
        {/* --- ADMIN HEADER --- */}
        <header className="h-16 bg-[#1e235a] flex items-center justify-end px-10 shadow-md border-b border-white/10 sticky top-0 z-20">
          <div className="flex items-center gap-1">
            <div className="relative cursor-pointer hover:scale-110 transition-transform">
              <img src="/team1/notification.png" alt="notification" className="w-5 h-5 brightness-0 invert" />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10 text-white">
              <span className="font-medium text-sm">Админ</span>
              <div className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden shadow-sm">
                <img src="/team1/user.png" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* --- CONTENT AREA --- */}
        <div className="p-10">
          <div className="max-w-[900px] mx-auto">
            
            {/* Title & Action Buttons */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tighter">Сургуулийн дэлгэрэнгүй</h1>
                <p className="text-slate-400 text-sm font-medium">Системийн админ</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setSchoolEditModalOpen(true)}
                  className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  Засах
                </button>
                <button 
                  onClick={toggleUsers}
                  className="bg-[#112a60] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 active:scale-95"
                >
                  {showUsers ? "Хэрэглэгч нуух" : "Хэрэглэгч харах"}
                </button>
                <button 
                  onClick={() => { setEditingUser(null); setUserModalOpen(true); }}
                  className="bg-[#112a60] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 active:scale-95"
                >
                  + Хэрэглэгч нэмэх
                </button>
              </div>
            </div>

            {/* Main Info Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-l shadow-slate-200/50 mb-10">
              <div className="flex flex-col md:flex-row gap-15 items-center md:items-start">
                <div className="w-full md:w-60 h-50 rounded-3xl overflow-hidden shadow-lg shadow-indigo-100 bg-slate-50 shrink-0">
                  <img 
                    src={school.picture || "/team1/school.jpg"} 
                    alt={school.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = "/team1/school.jpg"} 
                  />
                </div>

                <div className="flex-1 space-y-6 py-1 w-full">
                  <InfoRow label="Сургуулийн нэр :" value={school.name} />
                  <InfoRow label="Эрэмбэ :" value={school.priority || "1"} />
                  <InfoRow label="Нийт суралцагч:" value={school.student_count || "1893"} />
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 mb-10">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-3xl">📖</span>
                <h3 className="text-xl font-bold text-slate-900">Товч танилцуулга</h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-justify whitespace-pre-line font-medium">
                {school.description || "ШУТИС нь Монгол Улсын томоохон хэмжээний их сургууль юм. Олон улсад магадлан итгэмжлэгдэн, инженер технологийн салбарт түүчээлэгч сургууль юм."}
              </p>
            </div>

            {/* User List Table (Toggleable) */}
            {showUsers && (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-800">Бүртгэлтэй хэрэглэгчид</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                      <th className="px-8 py-5">Овог нэр</th>
                      <th className="px-8 py-5">Имэйл хаяг</th>
                      <th className="px-8 py-5">Үүрэг</th>
                      <th className="px-8 py-5 text-right">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.length === 0 ? (
                      <tr>
                         <td colSpan="4" className="px-8 py-10 text-center text-slate-400 font-medium">Хэрэглэгч олдсонгүй.</td>
                      </tr>
                    ) : (
                      users.map((item) => (
                        <tr key={item.id || item.username} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-4">
                            <span className="font-bold text-slate-700">{item.last_name || '-'} {item.first_name || item.username}</span>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-slate-500 font-medium">{item.email || '-'}</span>
                          </td>
                          <td className="px-8 py-4">
                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">
                              {item.role_id === 10 ? 'Сургуулийн Админ' : item.role_id === 20 ? 'Багш' : item.role_id === 30 ? 'Оюутан' : 'Тодорхойгүй'}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {/* Шаардлагатай бол засах, устгах үйлдлүүдийг идэвхжүүлж болно */}
                              {/* <button onClick={() => { setEditingUser(item); setUserModalOpen(true); }} className="px-2 py-1 border-1 border-indigo-50 text-indigo-600 rounded-lg font-bold text-xs hover:bg-indigo-500 hover:text-white hover:border-indigo-600 transition-all">Засах</button> */}
                              {/* <button onClick={() => handleDeleteUser(item.id)} className="px-2 py-1 border-1 border-rose-50 text-rose-600 rounded-lg font-bold text-xs hover:bg-rose-600 hover:text-white hover:border-rose-500 transition-all">Устгах</button> */}
                            </div> 
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Back Button */}
            <button 
              onClick={() => navigate(-1)} 
              className="bg-[#112a60] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 active:scale-95"
            >
              ← Буцах
            </button>

          </div>
        </div>
      </main>

      {/* --- SCHOOL EDIT MODAL --- */}
      {schoolEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-3xl font-black mb-8 tracking-tighter text-[#0F172A]">
              Сургуулийн мэдээлэл засах
            </h2>
            <form onSubmit={handleSchoolSave} className="space-y-5">
              <InputField label="Сургуулийн нэр" name="name" defaultValue={school.name} required />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Эрэмбэ" name="priority" type="number" defaultValue={school.priority || 1} required min="1" />
                <InputField label="Лого URL" name="picture" defaultValue={school.picture} placeholder="https://..." />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setSchoolEditModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all">Болих</button>
                <button type="submit" className="bg-[#112a60] text-white px-20 py-1 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 active:scale-95">ХАДГАЛАХ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- USER MODAL (ADD / EDIT) --- */}
      {userModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-3xl font-black mb-8 tracking-tighter text-[#0F172A]">
              {editingUser ? 'Хэрэглэгчийн мэдээлэл шинэчлэх' : 'Хэрэглэгч бүртгэх'}
            </h2>
            <form onSubmit={handleUserSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Овог" name="last_name" defaultValue={editingUser?.last_name} required />
                <InputField label="Нэр" name="first_name" defaultValue={editingUser?.first_name} required />
              </div>
              <InputField label="Имэйл" name="email" type="email" defaultValue={editingUser?.email} required />
              
              <div className="grid grid-cols-1 gap-4">
                <SelectField label="Үүрэг" name="role_id" defaultValue={editingUser?.role_id || 30}>
                  <option value="10">Сургуулийн Админ</option>
                  <option value="20">Багш</option>
                  <option value="30">Оюутан</option>
                </SelectField>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setUserModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all">Болих</button>
                <button type="submit" className="bg-indigo-600 text-white px-20 py-1 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">ХАДГАЛАХ</button>
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

const InfoRow = ({ label, value }) => (
  <div className="flex items-center gap-5 border-b border-slate-50 pb-3">
    <span className="text-[13px] text-slate-400 min-w-[140px] font-black uppercase tracking-widest">{label}</span>
    <span className="text-[16px] text-slate-800 font-bold">{value}</span>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all font-medium" />
  </div>
);

const SelectField = ({ label, children, ...props }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <select {...props} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 cursor-pointer">{children}</select>
  </div>
);

export default SysAdminSchoolView;