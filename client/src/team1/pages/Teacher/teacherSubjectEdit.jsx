import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { courseAPI, lessonAPI, userAPI, extractItem, extractItems } from '../../connections/api';

const TeacherSubjectEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // --- States ---
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [user, setUser] = useState(null); // Хэрэглэгчийн мэдээлэл

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_on: '',
    end_on: '',
    picture: '', 
    category_id: 1,
    school_id: 2,
    priority: 1,
    max_semester_point: 70
  });

  const DEFAULT_IMAGE = "/team1/bigdata-image.png";

  useEffect(() => {
    const fetchData = async () => {
      if (!id || id.startsWith(':')) return;
      try {
        setInitialLoading(true);
        // Хэрэглэгчийн мэдээллийг хамт татах
        const [courseRes, lessonsRes, userRes] = await Promise.all([
          courseAPI.getOne(id),
          lessonAPI.getAll(id),
          userAPI.getMe()
        ]);

        const courseData = extractItem(courseRes);
        const userData = extractItem(userRes);
        
        setUser(userData);

        if (courseData) {
          setFormData({
            name: courseData.name || '',
            description: courseData.description || '',
            start_on: courseData.start_on ? courseData.start_on.split('T')[0] : '',
            end_on: courseData.end_on ? courseData.end_on.split('T')[0] : '',
            picture: courseData.picture || '',
            category_id: Number(courseData.category_id) || 1,
            school_id: Number(courseData.school_id) || 2,
            priority: Number(courseData.priority) || 1,
            max_semester_point: Number(courseData.max_semester_point) || 70
          });
        }
        setLessons(extractItems(lessonsRes));
      } catch (err) {
        console.error("Дата татахад алдаа гарлаа:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        start_on: formData.start_on ? `${formData.start_on}T00:00:00Z` : null,
        end_on: formData.end_on ? `${formData.end_on}T00:00:00Z` : null,
        category_id: Number(formData.category_id),
        school_id: Number(formData.school_id),
        priority: Number(formData.priority),
        max_semester_point: Number(formData.max_semester_point),
      };

      await courseAPI.put(id, payload);
      setShowModal(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Серверт хадгалж чадсангүй";
      alert(`Алдаа: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      <aside className="w-64 bg-[#1e235a] text-white p-6 flex flex-col shrink-0 shadow-2xl z-20 sticky top-0 h-screen">
        <div className="flex flex-col items-center mb-10 transition-transform hover:scale-105 cursor-pointer" onClick={() => navigate('/team1/home')}>
          <div className="w-16 h-16 bg-white rounded-2xl mb-4 flex items-center justify-center p-2 shadow-xl">
             <img src="/team1/logo-must.png" alt="MUST" className="w-full object-contain" />
          </div>
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] leading-tight opacity-70">
            Шинжлэх Ухаан Технологийн Их Сургууль
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<CapIcon />} label="Миний хичээлүүд" active onClick={() => navigate('/team1/teacher/courses')} />
          <SidebarItem icon={<CategoryIcon />} label="Ангилал" onClick={() => navigate('/team1/category')} />
          <SidebarItem icon={<SchoolIcon />} label="Сургууль" onClick={() => navigate('/team1/school')}/>
        </nav>
      </aside>
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-[#1e235a] flex items-center justify-end px-10 shadow-md border-b border-white/10 z-10 sticky top-0">
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer hover:scale-110 transition-transform p-1">
              <img src="/team1/notification.png" alt="notification" className="w-5 h-5 brightness-0 invert opacity-80 hover:opacity-100" />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right text-white">
                <p className="font-bold text-xs">
                    {user ? `${user.last_name} ${user.first_name}` : "Ачаалж байна..."}
                </p>
                <p className="text-[10px] opacity-60">Багш</p>
              </div>
              <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-slate-400 shadow-md">
                <img src={user?.picture || "/team1/user.png"} alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 py-10 px-10 overflow-y-auto">
          <div className="w-full max-w-5xl mx-auto">
            <div className="mb-10 flex items-center gap-4">
              <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>
              <h1 className="text-2xl font-black text-[#1e235a] uppercase tracking-tight italic">Мэдээлэл засах</h1>
            </div>

            <div className="bg-white rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 mb-10 border border-slate-100/50">
              
              {/* IMAGE SECTION */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 mb-12 pb-12 border-b border-slate-50">
                <div className="relative group">
                  <div className="w-full sm:w-96 aspect-video rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
                    <img 
                      src={formData.picture || DEFAULT_IMAGE} 
                      className="w-full h-full object-cover" 
                      alt="Course" 
                      onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                    />
                  </div>
                </div>
                <div className="flex-1 pt-4 text-center lg:text-left w-full">
                  <h3 className="text-lg font-bold text-[#1e235a] mb-2 uppercase tracking-tighter">Хичээлийн зураг</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6 max-w-xs leading-relaxed">Шинэ зургийн URL хаягийг доорх талбарт оруулна уу.</p>
                  
                  <div className="space-y-3">
                    <label className="block font-black text-blue-600 text-[10px] uppercase tracking-widest opacity-70 ml-1 italic">Зургийн URL хаяг</label>
                    <input 
                      type="text" 
                      value={formData.picture}
                      onChange={(e) => setFormData({...formData, picture: e.target.value})}
                      className="w-full border-2 border-slate-50 bg-[#f8fafc] rounded-2xl px-6 py-4 outline-none focus:border-blue-500/30 focus:bg-white font-medium text-slate-600 text-sm shadow-sm transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-10">
                <div className="space-y-3">
                  <label className="block font-black text-[#1e235a] text-[11px] uppercase tracking-[0.2em] opacity-50 ml-1 italic">Хичээлийн нэр</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="w-full border-2 border-slate-50 bg-[#f8fafc] rounded-2xl px-8 py-5 outline-none focus:border-blue-500/30 focus:bg-white font-bold text-slate-700 transition-all shadow-sm" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="block font-black text-[#1e235a] text-[11px] uppercase tracking-[0.2em] opacity-50 ml-1 italic">Дэлгэрэнгүй тайлбар</label>
                  <div className="rounded-[2rem] overflow-hidden border-2 border-slate-50 shadow-sm">
                    <Editor
                      apiKey='no-api-key'
                      init={{ height: 400, menubar: false, branding: false, statusbar: false, plugins: 'lists link image', toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist' }}
                      value={formData.description}
                      onEditorChange={(content) => setFormData(p => ({...p, description: content}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="block font-black text-[#1e235a] text-[11px] uppercase tracking-[0.2em] opacity-50 ml-1 italic">Эхлэх огноо</label>
                    <input 
                      type="date" 
                      value={formData.start_on} 
                      onChange={(e) => setFormData({...formData, start_on: e.target.value})} 
                      className="w-full border-2 border-slate-50 bg-[#f8fafc] rounded-2xl px-8 py-5 font-bold text-slate-600 outline-none focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block font-black text-[#1e235a] text-[11px] uppercase tracking-[0.2em] opacity-50 ml-1 italic">Дуусах огноо</label>
                    <input 
                      type="date" 
                      value={formData.end_on} 
                      onChange={(e) => setFormData({...formData, end_on: e.target.value})} 
                      className="w-full border-2 border-slate-50 bg-[#f8fafc] rounded-2xl px-8 py-5 font-bold text-slate-600 outline-none focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-24 pt-10 border-t border-slate-200/60">
                <button 
                    type="button" 
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 bg-white text-[#1e235a] border border-slate-200 px-10 py-4 rounded-2xl font-black shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                    <span className="text-lg group-hover:-translate-x-1 transition-transform duration-300">←</span>
                    <span className="text-[11px] uppercase tracking-[0.2em]">Буцах</span>
                </button>
                <button 
                    type="button"
                    onClick={handleUpdate} 
                    disabled={loading}
                    className="bg-[#3b18e3] text-white px-16 py-5 rounded-[1.5rem] font-black text-xs shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest active:scale-95"
                >
                    {loading ? "Түр хүлээнэ үү..." : "Өөрчлөлтийг хадгалах"}
                </button>
            </div>
          </div>
        </main>
      </div>

      {/* SUCCESS MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1e235a]/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-12 text-center max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-8 text-white text-4xl mx-auto shadow-lg shadow-green-100">✓</div>
            <h3 className="text-2xl font-black text-[#1e235a] mb-3 uppercase tracking-tight">Амжилттай!</h3>
            <p className="text-slate-400 text-[10px] font-bold mb-10 uppercase tracking-widest leading-relaxed">Хичээлийн мэдээлэл <br /> амжилттай шинэчлэгдлээ.</p>
            <button 
              onClick={() => { setShowModal(false); navigate(`/team1/teacher/courses/${id}`); }} 
              className="w-full py-5 bg-[#1e235a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-900 transition-all active:scale-95"
            >Ойлголоо</button>
          </div>
        </div>
      )}
    </div>
  );
};
const SidebarItem = ({ icon, label, active, onClick }) => (
    <div onClick={onClick} className={`p-4 rounded-2xl cursor-pointer flex items-center gap-4 text-xs font-bold transition-all duration-300 group ${active ? 'bg-blue-600/20 border-l-4 border-blue-400 text-blue-50' : 'text-blue-200/60 hover:bg-white/10 hover:text-white'}`}>
        <span className={`${active ? 'text-blue-400' : 'text-blue-200/40 group-hover:text-white'} transition-colors`}>{icon}</span>
        {label}
    </div>
);
const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm ${active ? 'bg-[#3b18e3] text-white shadow-blue-200 scale-105' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const CapIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
const CategoryIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const SchoolIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const VideoIcon = ({size=20, className}) => <svg className={className} style={{width: size, height: size}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const TextIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>;
const FileIcon = ({size=20, className}) => <svg className={className} style={{width: size, height: size}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;

export default TeacherSubjectEdit;