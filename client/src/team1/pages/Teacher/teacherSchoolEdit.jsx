import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const EditSchoolInfo = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Сургуулийн мэдээллийг State-д хадгалах (Анхны утгууд)
  const [school, setSchool] = useState({
    name: "Мэдээлэл холбоо технологийн сургууль",
    description: `Шинжлэх Ухаан Технологийн Их Сургууль-ийн харьяа Геологи, уул уурхайн сургууль нь Монгол Улсын уул уурхай, геологи, ашигт малтмалын салбарт мэргэжилтэн бэлтгэдэг тэргүүлэх сургуулиудын нэг юм.

Тус сургууль нь геологи, уул уурхайн ашиглалт, ашигт малтмалын баяжуулалт, газрын тос, геофизик, гидрогеологи зэрэг чиглэлээр бакалавр, магистр, докторын түвшний боловсрол олгодог. Оюутнууд онолын мэдлэгээс гадна талбайн судалгаа, лабораторийн шинжилгээ, үйлдвэрлэлийн дадлага хийж практик ур чадвар эзэмшдэг.`,
    image: "/team1/school.jpg"
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Зураг сонгох функц
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSchool({ ...school, image: imageUrl });
    }
  };

  // Хадгалах товч
  const handleSave = () => {
    // Энд сервер рүү хадгалах хүсэлт явуулж болно
    setShowSuccessModal(true);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6", fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1C4B] text-white flex flex-col shrink-0">
        <div className="p-6 flex flex-col items-center border-b border-gray-700">
          <div className="w-16 h-16 bg-white rounded-2xl mb-4 flex items-center justify-center p-2 shadow-lg">
            <img src="/team1/logo-must.png" alt="MUST" className="w-full object-contain" />
          </div>
          <p className="text-[10px] text-center uppercase tracking-wider opacity-80">
            Шинжлэх Ухаан Технологийн Их Сургууль
          </p>
        </div>
        <nav className="flex-1 space-y-3 p-4">
          <div className="p-4 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-sm text-blue-200/70 transition-all duration-300 hover:text-white">
            <span>🎓 Миний хичээлүүд</span>
          </div>
          <div className="p-4 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-sm text-blue-200/70 transition-all duration-300 hover:text-white">
            <span>🏢 Ангилал</span>
          </div>
          <div className="bg-blue-600/20 border-l-4 border-blue-400 p-4 rounded-r-xl flex justify-between items-center cursor-pointer text-sm font-bold">
            <span className="flex items-center gap-3 text-blue-50">🏛️ Сургууль</span>
          </div>
          <div className="p-4 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-sm text-blue-200/70 transition-all duration-300 hover:text-white">
            <span>👤 Профайл</span>
          </div>
        </nav>
      </aside>

      {/* Main Section */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        
        {/* Header  */}
        <header className="h-16 bg-[#1e235a] flex items-center justify-end px-10 shadow-md border-b border-white/10 sticky top-0 z-20">
          <div className="flex items-center gap-8">
            <div className="relative cursor-pointer hover:scale-110 transition-transform">
              <img src="/team1/notification.png" alt="notification" className="w-5 h-5 brightness-0 invert" />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10 text-white">
              <span className="font-medium text-sm">Золбоо Төмөрболд</span>
              <div className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden shadow-sm">
                <img src="/team1/user.png" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Edit Content */}
        <div style={{ padding: "40px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A1C4B", marginBottom: 24 }}>
              Сургуулийн мэдээлэл засах
            </h1>

            <div style={{ background: "white", borderRadius: 16, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 20 }}>
              
              <div style={{ display: "flex", gap: 28 }}>
                {/* Image Edit Section */}
                <div style={{ flexShrink: 0 }}>
                  <p className="text-sm font-bold text-slate-500 mb-3">Сургуулийн зураг</p>
                  <div style={{ width: 240, height: 180, borderRadius: 12, overflow: "hidden", marginBottom: 16, border: "1px solid #E2E8F0" }}>
                    <img src={school.image} alt="School" className="w-full h-full object-cover" />
                  </div>
                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
                  >
                    📷 Зураг өөрчлөх
                  </button>
                </div>

                {/* Text Fields Section */}
                <div style={{ flex: 1 }}>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-500 mb-2">Сургуулийн нэр</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-semibold text-[#1A1C4B]"
                      value={school.name}
                      onChange={(e) => setSchool({...school, name: e.target.value})}
                    />
                  </div>

                   <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                     <span style={{ fontSize: 24 }}>🏫</span>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A1C4B", margin: 0 }}>Сургуулийн товч танилцуулга</h3>
                    </div>
                    <textarea 
                      rows="8"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm leading-relaxed text-slate-600"
                      value={school.description}
                      onChange={(e) => setSchool({...school, description: e.target.value})}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => navigate(-1)}
                      className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all"
                    >
                      Цуцлах
                    </button>
                    <button 
                      onClick={handleSave}
                      className="px-8 py-2.5 bg-[#003594] hover:bg-blue-900 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                    >
                      Хадгалах
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Back Button */}
            <button 
              onClick={() => navigate(-1)}
              className="mt-10 flex items-center gap-2 bg-[#003594] text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg"
            >
              Буцах
            </button>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ✓
            </div>
            <h2 className="text-xl font-extrabold text-[#1A1C4B] mb-2">Амжилттай хадгаллаа</h2>
            <p className="text-sm text-slate-500 mb-8">Сургуулийн мэдээлэл шинэчлэгдлээ.</p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-[#003594] text-white rounded-2xl font-bold hover:bg-blue-900 transition-all"
            >
              Ойлголоо
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSchoolInfo;