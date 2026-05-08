import { useNavigate } from 'react-router-dom';

const TeacherContent = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <aside className="w-64 bg-[#1e235a] text-white p-6 flex flex-col shrink-0 shadow-2xl z-20">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl mb-4 flex items-center justify-center p-2 shadow-lg">
            <img src="/team1/logo-must.png" alt="MUST" className="w-full object-contain" />
          </div>
          <p className="text-center text-[10px] font-bold uppercase tracking-widest leading-tight opacity-80">
            Шинжлэх Ухаан Технологийн Их Сургууль
          </p>
        </div>

        <nav className="flex-1 space-y-3">
          <div className="bg-blue-600/20 border-l-4 border-blue-400 p-4 rounded-r-xl flex justify-between items-center cursor-pointer text-sm font-bold">
            <span className="flex items-center gap-3 text-blue-50">📚 Хичээлийн агуулга</span>
          </div>
          {['🏢 Ангилал', '🏛️ Сургууль', '👤 Профайл'].map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-sm text-blue-200/70 transition-all duration-300 hover:text-white">
              {item}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#1e235a] flex items-center justify-between px-10 shadow-md border-b border-white/10 z-10">
          <div className="flex items-center gap-8">
            <div className="relative cursor-pointer hover:scale-110 transition-transform">
              <img src="/team1/notification.png" alt="notification" className="w-5 h-5 brightness-0 invert opacity-100" />
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <span className="font-medium text-sm text-white/90">Золбоо Төмөрболд</span>
              <div className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden shadow-sm">
                <img src="/team1/user.png" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            Буцах
          </button>
        </header>

        <main className="flex-1 p-10 overflow-y-auto">
          <div className="mb-8 flex items-center gap-4 ">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
            <h1 className="text-2xl font-black text-[#1e235a] tracking-tight">Хичээлийн сэдэв, агуулга</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_320px] mb-10">
            <section className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200/60">
              <h2 className="text-3xl font-black text-[#1e235a] mb-4">Веб систем ба технологи</h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium mb-6">
                Энэ хичээл нь веб програмчлалын архитектур, frontend, backend, API болон өгөгдлийн сангийн хэрэглээг хамардаг. Багш курсийг удирдан явуулж, сэдвүүдийн агуулгыг заан чиглүүлнэ.
              </p>

              <div className="grid gap-4">
                {[
                  { title: 'Нэгдүгээр долоо хоног - Веб архитектур', description: 'Веб системийн үндсэн архитектур, клиент-сервер холбоо, HTTP протокол.', status: 'Бэлтгэл' },
                  { title: 'Хоёрдугаар долоо хоног - HTML/CSS', description: 'Вэб хуудасны бүтэц, загварчлах, уян хатан дизайн.', status: 'Боловсруулж байна' },
                  { title: 'Гуравдугаар долоо хоног - JavaScript', description: 'Вэб интерактив хөгжүүлэлт, DOM удирдлага, үйлдлийн гинжин.', status: 'Төгсгөсөн' },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <h3 className="font-black text-slate-900">{item.title}</h3>
                      <span className="text-[11px] uppercase font-black tracking-widest text-slate-500">{item.status}</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200/60">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-3xl bg-blue-50 text-blue-600 grid place-items-center font-black text-xl">ICT</div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-600 font-black">Курс код</p>
                  <p className="text-base font-black text-slate-900">ICT-301</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-slate-600 font-medium">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Багш</p>
                  <p className="text-slate-800 font-bold">Золбоо Төмөрболд</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Хугацаа</p>
                  <p className="text-slate-800 font-bold">01.26 - 05.30</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Семестер</p>
                  <p className="text-slate-800 font-bold">16 долоо хоног</p>
                </div>
              </div>
            </aside>
          </div>

          <section className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#1e235a]">Сэдвийн агуулга</h2>
                <p className="text-slate-500 text-sm mt-1">Сэдвүүдийн дэлгэрэнгүй агуулгыг шалгана уу.</p>
              </div>
              <button
                onClick={() => navigate('/team1/teacher/courses/1/edit')}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-sm hover:bg-blue-700 transition"
              >
                Агуулгыг засах
              </button>
            </div>

            <div className="grid gap-5">
              {[
                { title: 'HTML & CSS үндэс', items: ['HTML элементүүд', 'CSS селекторууд', 'Бүтэц, загварчлал'] },
                { title: 'JavaScript Dynamics', items: ['Тогтмол болон хувьсагч', 'Функц, арга', 'DOM удирдлага'] },
                { title: 'API & Backend', items: ['REST API', 'Өгөгдлийн сан', 'Node.js танилцуулга'] },
              ].map((content, idx) => (
                <div key={idx} className="rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-blue-400 transition-all">
                  <h3 className="font-black text-slate-900 mb-3">{content.title}</h3>
                  <ul className="space-y-2 text-slate-600 text-sm list-disc list-inside">
                    {content.items.map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TeacherContent;
