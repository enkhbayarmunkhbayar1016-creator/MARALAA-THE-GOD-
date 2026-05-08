import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react'; 
import { courseAPI, userAPI, schoolAPI, extractItems, extractItem } from '../../api'; 

const STATIC_CATEGORIES = [
  { id: 1, name: 'Мэдээллийн технологи' },
  { id: 2, name: 'Математик, байгалийн ухаан' },
  { id: 3, name: 'Бизнес удирдлага, маркетинг' },
  { id: 4, name: 'Гадаад хэл, соёл' },
  { id: 5, name: 'Инженерчлэл, техник' },
  { id: 6, name: 'Урлаг, дизайн' }
];

const getYouTubeID = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const TeacherCreate = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('video');
  const [textContent, setTextContent] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    start_on: '',
    end_on: '',
    category_id: '', 
    school_id: '', 
    priority: "1", 
    picture: '', 
    pptFile: null
  });

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1587620962725-abab7fe55159";

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const sRes = await schoolAPI.getAll();
        setSchools(extractItems(sRes));

        const uRes = await userAPI.getMe();
        const userData = extractItem(uRes);
        setUser(userData);
        
        if (userData?.schools?.length > 0) {
          const adminSchool = userData.schools.find(s => s.id === 2 || s.id === 762);
          setFormData(prev => ({ ...prev, school_id: String(adminSchool?.id || userData.schools[0].id) }));
        }
      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.school_id || !formData.category_id || !formData.name) {
      alert("Сургууль, Ангилал болон Нэрийг заавал бөглөнө үү.");
      return;
    }

    try {
      setLoading(true);
      const vId = getYouTubeID(youtubeUrl);
      const vHtml = vId ? `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${vId}" frameborder="0" allowfullscreen></iframe><br/>` : "";

      const payload = {
        category_id: Number(formData.category_id),
        cloned_course_id: null,
        description: vHtml + textContent,
        end_on: formData.end_on ? `${formData.end_on}T00:00:00Z` : null,
        name: formData.name,
        picture: formData.picture || DEFAULT_IMAGE,
        priority: String(formData.priority || "1"),
        start_on: formData.start_on ? `${formData.start_on}T00:00:00Z` : null
      };

      await courseAPI.create(formData.school_id, payload);
      setShowModal(true); 
    } catch (err) {
      alert("Алдаа гарлаа: " + (err.message || "Мэдээлэл хадгалж чадсангүй."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
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

      <main className="flex-1 flex flex-col min-w-0">
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
              </div>
              <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-slate-400 shadow-md">
                <img src={user?.picture || "/team1/user.png"} alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* --- CONTENT --- */}
        <div className="p-10 max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            <div className="mb-12">
                <h1 className="text-3xl font-black text-[#1e235a] tracking-tighter uppercase italic">Шинэ хичээл бүртгэх</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Хичээлийн үндсэн мэдээллийг бөглөнө үү</p>
            </div>

            {/* Зургийн URL хэсэг - Дээд хэсэгт илүү авсаархан */}
            <div className="grid grid-cols-12 gap-8 mb-10 items-center">
                <div className="col-span-7">
                    <div className="aspect-video rounded-[1.5rem] overflow-hidden border-2 border-slate-50 bg-slate-100 shadow-inner relative group">
                        <img 
                            src={formData.picture || DEFAULT_IMAGE} 
                            alt="Preview" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                        />
                    </div>
                </div>
                <div className="col-span-4">
                    <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 italic mb-2">Хичээлийн зураг (URL)</label>
                    <input 
                        name="picture"
                        value={formData.picture}
                        onChange={handleInputChange}
                        type="text" 
                        placeholder="https://example.com/image.jpg"
                        className="w-full border-2 border-slate-50 rounded-2xl p-5 outline-none focus:border-blue-200 bg-slate-50/50 font-medium text-xs transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Хичээлийн нэр болон Сургууль сонгох - Зэрэгцээ ба Урт */}
            <div className="grid grid-cols-2 gap-8 mb-8 items-end">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest ml-1">Хичээлийн нэр</label>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    type="text" 
                    placeholder="Хичээлийн нэрийг оруулна уу..." 
                    className="w-full border-2 border-slate-50 rounded-2xl p-5 outline-none focus:ring-4 ring-blue-50 bg-slate-50/50 font-bold text-slate-700 transition-all shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest ml-1">Сургууль</label>
                  <select 
                    name="school_id" 
                    value={formData.school_id} 
                    onChange={handleInputChange} 
                    className="w-full border-2 border-slate-50 rounded-2xl p-5 outline-none bg-white font-bold text-slate-700 cursor-pointer shadow-sm appearance-none"
                  >
                    <option value="">-- Сургууль сонгох --</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
            </div>

            {/* Ангилал болон Хугацаа */}
            <div className="grid grid-cols-2 gap-8 mb-12 items-end">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest ml-1">Ангилал сонгох</label>
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="w-full border-2 border-slate-50 rounded-2xl p-5 outline-none bg-white font-bold text-slate-700 shadow-sm cursor-pointer">
                    <option value="">-- Сонгох --</option>
                    {STATIC_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest ml-1">Эхлэх</label>
                    <input name="start_on" value={formData.start_on} type="date" onChange={handleInputChange} className="w-full border-2 border-slate-50 rounded-2xl p-5 outline-none font-bold text-xs bg-slate-50/50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest ml-1">Дуусах</label>
                    <input name="end_on" value={formData.end_on} type="date" onChange={handleInputChange} className="w-full border-2 border-slate-50 rounded-2xl p-5 outline-none font-bold text-xs bg-slate-50/50" />
                  </div>
                </div>
            </div>
            
            <div className="mt-12 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-50 shadow-inner">
              <div className="flex gap-4 mb-8">
                <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={<VideoIcon />} label="ВИДЕО" />
                <TabButton active={activeTab === 'text'} onClick={() => setActiveTab('text')} icon={<TextIcon />} label="ТЕКСТ" />
                <TabButton active={activeTab === 'ppt'} onClick={() => setActiveTab('ppt')} icon={<FileIcon />} label="ФАЙЛ" />
              </div>

              <div className="min-h-[300px]">
                {activeTab === 'text' ? (
                  <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
                    <Editor apiKey='no-api-key' init={{height: 400, menubar: false, plugins: 'lists link', toolbar: 'bold italic bullist numlist', branding: false}} onEditorChange={(c) => setTextContent(c)} />
                  </div>
                ) : activeTab === 'video' ? (
                  <div className="space-y-6">
                    <input type="text" placeholder="YouTube линк оруулна уу..." className="w-full p-5 border-2 border-white rounded-[1.5rem] outline-none focus:bg-white shadow-sm font-bold text-slate-600" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
                    {getYouTubeID(youtubeUrl) ? (
                        <div className="aspect-video shadow-2xl rounded-[2rem] overflow-hidden border-8 border-white bg-black">
                            <iframe width="100%" height="100%" title="youtube" src={`https://www.youtube.com/embed/${getYouTubeID(youtubeUrl)}`} frameBorder="0" allowFullScreen></iframe>
                        </div>
                    ) : (
                        <div className="aspect-video rounded-[2rem] border-4 border-dashed border-white flex flex-col items-center justify-center text-slate-300">
                            <VideoIcon size={48} />
                            <p className="mt-4 font-black text-[10px] tracking-[0.2em]">Видеоны урьдчилсан харагдац</p>
                        </div>
                    )}
                  </div>
                ) : (
                  <div className="p-24 border-4 border-dashed border-white rounded-[3rem] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/80 transition-all group shadow-sm">
                    <FileIcon size={64} className="text-slate-300 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-500" />
                    <h4 className="mt-6 text-xl font-black text-[#1e235a] tracking-tighter uppercase italic">{formData.pptFile ? formData.pptFile.name : 'Файл нэмэх'}</h4>
                    <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest">Зөвхөн PPT, PDF формат</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 flex justify-end gap-6 pt-10 border-t border-slate-50">
              <button onClick={() => navigate(-1)} className="px-10 py-5 text-slate-400 font-black hover:text-slate-800 uppercase text-[10px] tracking-widest transition-colors">Цуцлах</button>
              <button onClick={handleSave} disabled={loading} className="px-20 py-5 bg-[#3b18e3] text-white rounded-[1.5rem] font-black shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-widest">
                {loading ? "Уншиж байна..." : "Хичээлийг бүртгэх"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-[#1e235a]/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] p-12 text-center max-w-sm w-full shadow-2xl border border-white animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 text-white text-5xl mx-auto shadow-2xl shadow-green-100">✓</div>
            <h3 className="text-3xl font-black text-[#1e235a] mb-4 uppercase tracking-tighter italic">Амжилттай!</h3>
            <p className="text-slate-400 text-[10px] font-bold mb-12 uppercase tracking-widest leading-relaxed">Шинэ хичээлийн мэдээлэл <br /> системд бүртгэгдлээ.</p>
            <button onClick={() => { setShowModal(false); navigate('/team1/teacher/courses'); }} className="w-full py-5 bg-[#1e235a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-900 transition-all active:scale-95">Ойлголоо</button>
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

export default TeacherCreate;