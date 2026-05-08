import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const TeacherCourseEdit = () => {
  const navigate = useNavigate();
  const { course_id } = useParams();

  // Хичээлийн үндсэн мэдээллийн state
  const [courseData, setCourseData] = useState({
    title: "Веб систем ба технологи",
    teacher: "Золбоо Төмөрболд",
    startDate: "01.26",
    endDate: "05.30",
    description: "Веб системийн технологийн үндсэн ойлголт, веб програмчлалын хэлнүүд...",
    progress: 40,
  });

  // Модал нээх/хаах болон шинэ сэдвийн state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({
    week: "",
    type: "",
    name: ""
  });

  const handleSaveCourse = () => {
    alert("Хичээлийн мэдээлэл амжилттай хадгалагдлаа!");
    navigate(-1);
  };

  const handleAddTopic = () => {
    console.log("Шинэ сэдэв:", newTopic);
    setIsModalOpen(false);
    // Энд сэдвээ жагсаалт руу нэмэх эсвэл API руу илгээх код бичнэ
  };

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans">
      {/* Sidebar  */}
      <aside className="w-64 bg-[#1A1C4B] text-white flex flex-col shrink-0">
        <div className="p-10 flex flex-col items-center border-b border-gray-700">
          <img src="/team1/logo-must.png" alt="Logo" className="w-12 mb-2" />
          <p className="text-[10px] text-center opacity-80 uppercase">Шинжлэх Ухаан Технологийн Их Сургууль</p>
        </div>
        <nav className="p-4 space-y-2">
          <div className="p-3 bg-blue-600/30 border-l-4 border-blue-400 flex items-center gap-3 rounded-r-lg cursor-pointer font-bold">
            <span>🎓 Хичээл</span>
          </div>
          <div className="p-3 hover:bg-white/10 flex items-center gap-3 rounded-lg cursor-pointer opacity-70">
            <span>🏢 Ангилал</span>
          </div>
          <div className="p-3 hover:bg-white/10 flex items-center gap-3 rounded-lg cursor-pointer opacity-70">
            <span>🏛️ Сургууль</span>
          </div>
          <div className="p-3 hover:bg-white/10 flex items-center gap-3 rounded-lg cursor-pointer opacity-70">
            <span>👤 Профайл</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-[#1A1C4B] flex items-center justify-end px-10 text-white">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Золбоо Төмөрболд</span>
            <div className="w-8 h-8 bg-blue-400 rounded-full border border-white"></div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-extrabold text-[#1A1C4B]">Хичээлийн мэдээлэл засах</h1>
          </div>

          {/* Edit Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Хичээлийн нэр</label>
                <input 
                  type="text" 
                  value={courseData.title}
                  onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none font-semibold text-[#1A1C4B]" 
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Эхлэх огноо</label>
                  <input type="text" value={courseData.startDate} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Дуусах огноо</label>
                  <input type="text" value={courseData.endDate} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Хичээлийн товч агуулга</label>
              <textarea 
                rows="5"
                value={courseData.description}
                onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-sm text-gray-600 leading-relaxed"
              ></textarea>
            </div>

            {/* Topics Section */}
            <div className="mt-10 border-t pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#1A1C4B]">Сэдвүүд</h3>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#6366F1] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all"
                >
                  Сэдэв бүртгэх
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Жишээ сэдвүүд */}
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">{i}-р долоо хоног</span>
                    <button className="text-blue-500 text-xs font-bold">Засах</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-3">
              <button onClick={() => navigate(-1)} className="px-8 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">Цуцлах</button>
              <button onClick={handleSaveCourse} className="px-8 py-2.5 bg-[#003594] text-white rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-all">Хадгалах</button>
            </div>
          </div>

          <button onClick={() => navigate(-1)} className="mt-8 bg-[#003594] text-white px-8 py-3 rounded-xl font-bold shadow-md">Буцах</button>
        </div>
      </main>

      {/* Шинэ сэдэв нэмэх Модал */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-[#1A1C4B]">Шинэ сэдэв нэмэх</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1A1C4B] mb-2">Долоо хоног</label>
                <input 
                  type="text" 
                  placeholder="Долоо хоног"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                  onChange={(e) => setNewTopic({...newTopic, week: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1C4B] mb-2">Хичээлийн төрөл</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none appearance-none bg-no-repeat bg-[right_1rem_center]"
                  onChange={(e) => setNewTopic({...newTopic, type: e.target.value})}
                >
                  <option value="">Хичээлийн төрөл</option>
                  <option value="lecture">Лекц</option>
                  <option value="seminar">Семинар</option>
                  <option value="lab">Лаборатори</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1A1C4B] mb-2">Сэдвийн нэр</label>
                <input 
                  type="text" 
                  placeholder="Веб систем гэж юу вэ?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 outline-none"
                  onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Цуцлах
              </button>
              <button 
                onClick={handleAddTopic}
                className="flex-1 py-3 bg-[#003594] text-white rounded-xl font-bold hover:bg-blue-900 shadow-lg transition-all"
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCourseEdit;