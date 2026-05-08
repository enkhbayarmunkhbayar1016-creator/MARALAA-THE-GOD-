import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const mockData = {
  school: "Шинжлэх Ухаан Технологийн Их Сургууль",
  year: "2025–2026",
  totalStudents: 1240,
  totalTeachers: 87,
  totalClasses: 42,
  attendance: 94.3,

  gradeDistribution: [
    { label: "A (90–100)", value: 28, color: "#4ADE80" },
    { label: "B (75–89)", value: 35, color: "#60A5FA" },
    { label: "C (60–74)", value: 22, color: "#FBBF24" },
    { label: "D (50–59)", value: 10, color: "#F97316" },
    { label: "F (<50)", value: 5, color: "#F87171" },
  ],

  genderRatio: [
    { label: "Эрэгтэй", value: 46, color: "#818CF8" },
    { label: "Эмэгтэй", value: 54, color: "#F472B6" },
  ],

  departmentStudents: [
    { label: "Мэдээллийн технологи", value: 31, color: "#34D399" },
    { label: "Компьютерийн ухаан", value: 24, color: "#60A5FA" },
    { label: "Кибер аюулгүй байдал", value: 20, color: "#FBBF24" },
    { label: "Өгөгдлийн ухаан", value: 13, color: "#F472B6" },
    { label: "Програм хангамж", value: 12, color: "#A78BFA" },
  ],

  attendanceMonthly: [
    { month: "9-р сар", rate: 96 },
    { month: "10-р сар", rate: 94 },
    { month: "11-р сар", rate: 91 },
    { month: "12-р сар", rate: 89 },
    { month: "1-р сар", rate: 93 },
    { month: "2-р сар", rate: 95 },
    { month: "3-р сар", rate: 97 },
    { month: "4-р сар", rate: 96 },
  ],
};

function PieChart({ data, size = 220, animate = true }) {
  const [progress, setProgress] = useState(animate ? 0 : 1);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (!animate) return;

    let start = null;
    const duration = 900;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const p = Math.min((timestamp - start) / duration, 1);
      setProgress(p < 1 ? p * p * (3 - 2 * p) : 1);

      if (p < 1) requestAnimationFrame(step);
    };

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const innerR = size * 0.22;
  let cumulative = 0;

  const slices = data.map((d, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI * progress - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI * progress - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const xi1 = cx + innerR * Math.cos(startAngle);
    const yi1 = cy + innerR * Math.sin(startAngle);
    const xi2 = cx + innerR * Math.cos(endAngle);
    const yi2 = cy + innerR * Math.sin(endAngle);

    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    const scale = hovered === i ? 1.06 : 1;
    const midAngle = (startAngle + endAngle) / 2;
    const tx = cx + ((r + innerR) / 2) * Math.cos(midAngle) * (scale - 1) * 0.3;
    const ty = cy + ((r + innerR) / 2) * Math.sin(midAngle) * (scale - 1) * 0.3;

    return {
      path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${large} 0 ${xi1} ${yi1} Z`,
      color: d.color,
      label: d.label,
      value: d.value,
      transform: `translate(${tx}, ${ty}) scale(${scale})`,
      origin: `${cx} ${cy}`,
      i,
    };
  });

  return (
    <svg width={size} height={size} style={{ overflow: "visible", cursor: "default", maxWidth: "100%" }}>
      {slices.map((s) => (
        <path
          key={s.i}
          d={s.path}
          fill={s.color}
          opacity={hovered === null || hovered === s.i ? 1 : 0.55}
          style={{
            transition: "opacity 0.2s, transform 0.2s",
            transformOrigin: s.origin,
            transform: s.transform,
          }}
          onMouseEnter={() => setHovered(s.i)}
          onMouseLeave={() => setHovered(null)}
        />
      ))}

      {hovered !== null ? (
        <>
          <text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" fontSize={size * 0.1} fontWeight="700">
            {data[hovered].value}%
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={size * 0.065}>
            {data[hovered].label}
          </text>
        </>
      ) : (
        <text x={cx} y={cy + 6} textAnchor="middle" fill="#64748b" fontSize={size * 0.072}>
          Нийт
        </text>
      )}
    </svg>
  );
}

function Legend({ data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
          <span style={{ color: "#64748b", fontSize: 13, flex: 1 }}>{d.label}</span>
          <span style={{ color: "#1e235a", fontWeight: 800, fontSize: 13 }}>{d.value}%</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderLeft: `5px solid ${accent}`,
        borderRadius: 24,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 155,
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ color: "#64748b", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 800 }}>
        {label}
      </div>
      <div
        style={{
          color: "#0f172a",
          fontSize: 34,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.rate));

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150, width: "100%" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>{d.rate}%</span>
          <div
            style={{
              width: "100%",
              height: `${(d.rate / max) * 105}px`,
              background: "linear-gradient(to top, #1e235a, #4f46e5)",
              borderRadius: "5px 5px 0 0",
              transition: "height 0.5s",
            }}
          />
          <span style={{ color: "#94a3b8", fontSize: 10, textAlign: "center", fontWeight: 600 }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function Report() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Ерөнхий" },
    { id: "grades", label: "Дүн" },
    { id: "attendance", label: "Ирц" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans">
      {/* --- ADMIN SIDEBAR --- */}
      <aside className="w-64 bg-[#1e235a] text-white p-6 flex flex-col shrink-0 shadow-2xl z-20 sticky top-0 h-screen">
        <div
          className="flex flex-col items-center mb-10 cursor-pointer transition-transform active:scale-95"
          onClick={() => navigate("/team1/home")}
        >
          <div className="w-14 h-14 bg-white rounded-2xl mb-3 flex items-center justify-center p-2 shadow-lg">
            <img src="/team1/logo-must.png" alt="MUST" className="w-full object-contain" />
          </div>
          <p className="text-center text-[9px] font-bold uppercase tracking-widest leading-tight opacity-70">
            Шинжлэх Ухаан Технологийн Их Сургууль
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          <div
            onClick={() => navigate("/team1/home")}
            className="p-3.5 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-xs text-blue-200/60 font-bold transition-all hover:text-white group"
          >
            🏠 Нүүр хуудас
          </div>

          <div
            onClick={() => navigate("/team1/sysAdmin")}
            className="p-3.5 hover:bg-white/10 rounded-xl cursor-pointer flex items-center gap-3 text-xs text-blue-200/60 font-bold transition-all hover:text-white group"
          >
            🏫 Сургууль
          </div>

          <div className="bg-blue-600/20 border-l-4 border-blue-400 p-3.5 rounded-r-xl flex items-center gap-3 cursor-pointer text-xs font-bold text-blue-50 transition-all hover:bg-blue-600/30">
            📊 Тайлан
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 text-blue-200/40 text-[10px] font-medium uppercase tracking-widest">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Систем хэвийн
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* --- ADMIN HEADER --- */}
        <header className="h-16 bg-[#1e235a] flex items-center justify-between px-10 shadow-md border-b border-white/10 sticky top-0 z-20">
          <div>
            <h2 className="text-white font-black text-lg tracking-tight">Системийн тайлан</h2>
            <p className="text-blue-200/50 text-xs font-medium">Сургуулийн системийн тайлан</p>
          </div>

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

        {/* --- REPORT CONTENT --- */}
        <div className="p-10">
          <div className="max-w-[1400px] mx-auto">
            {/* PAGE TITLE */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
  <div>
    <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Тайлан</h1>
    <p className="text-slate-400 text-sm font-medium">
      {mockData.school} — {mockData.year} оны ерөнхий тайлан
    </p>
  </div>

  <div className="flex flex-wrap items-center gap-3">
    <button
      onClick={() => navigate("/team1/course-report")}
      className="bg-[#112a60] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 active:scale-95"
    >
      📚 Хичээлийн тайлан
    </button>

    <div className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold shadow-sm">
      📅 {new Date().toLocaleDateString("mn-MN")}
    </div>
  </div>
</div>

            {/* TABS */}
            <div className="mb-8 flex gap-2 bg-white border border-slate-200 rounded-2xl p-2 w-fit shadow-sm">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === t.id
                      ? "bg-[#112a60] text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                  <StatCard icon="👨‍🎓" label="Нийт суралцагч" value={mockData.totalStudents.toLocaleString()} sub="Идэвхтэй" accent="#60A5FA" />
                  <StatCard icon="👩‍🏫" label="Багш нар" value={mockData.totalTeachers} sub="Мэргэжлийн" accent="#4ADE80" />
                  <StatCard icon="🏫" label="Анги танхим" value={mockData.totalClasses} sub="Бүх түвшин" accent="#FBBF24" />
                  <StatCard icon="📊" label="Дундаж ирц" value={`${mockData.attendance}%`} sub="Энэ жил" accent="#F472B6" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div style={panelStyle}>
                    <h3 style={panelTitle}>⚥ Хүйсийн харьцаа</h3>
                    <div style={chartRowStyle}>
                      <PieChart data={mockData.genderRatio} size={230} />
                      <Legend data={mockData.genderRatio} />
                    </div>
                  </div>

                  <div style={panelStyle}>
                    <h3 style={panelTitle}>🏛️ Тэнхимийн хуваарилалт</h3>
                    <div style={chartRowStyle}>
                      <PieChart data={mockData.departmentStudents} size={230} />
                      <Legend data={mockData.departmentStudents} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* GRADES */}
            {activeTab === "grades" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div style={panelStyle}>
                  <h3 style={panelTitle}>🎯 Дүнгийн тархалт</h3>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                    <PieChart data={mockData.gradeDistribution} size={260} />
                  </div>
                  <Legend data={mockData.gradeDistribution} />
                </div>

                <div style={panelStyle}>
                  <h3 style={panelTitle}>📋 Дүнгийн задаргаа</h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {mockData.gradeDistribution.map((d, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ color: "#64748b", fontSize: 13, fontWeight: 700 }}>{d.label}</span>
                          <span style={{ color: d.color, fontWeight: 900, fontSize: 13 }}>{d.value}%</span>
                        </div>

                        <div style={{ background: "#e2e8f0", borderRadius: 999, height: 8, overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${d.value}%`,
                              background: d.color,
                              borderRadius: 999,
                              transition: "width 1s",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 28,
                      padding: "16px 20px",
                      background: "#f8fafc",
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ color: "#64748b", fontSize: 12, marginBottom: 4, fontWeight: 700 }}>
                      Тэнцсэн суралцагч
                    </div>
                    <div style={{ color: "#16a34a", fontSize: 30, fontWeight: 900 }}>
                      {mockData.gradeDistribution.slice(0, 3).reduce((s, d) => s + d.value, 0)}%
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>A, B, C авсан нийт</div>
                  </div>
                </div>
              </div>
            )}

            {/* ATTENDANCE */}
            {activeTab === "attendance" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div style={panelStyle}>
                  <h3 style={panelTitle}>📅 Сарын ирцийн хувь</h3>
                  <BarChart data={mockData.attendanceMonthly} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <MiniCard label="Хамгийн өндөр" value="97%" sub="3-р сар" color="#16a34a" />
                    <MiniCard label="Хамгийн бага" value="89%" sub="12-р сар" color="#f59e0b" />
                  </div>
                </div>

                <div style={panelStyle}>
                  <h3 style={panelTitle}>🎯 Ирцийн ангилал</h3>

                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                    <PieChart
                      data={[
                        { label: "Бүрэн ирсэн", value: 72, color: "#4ADE80" },
                        { label: "1–2 өдөр тасалсан", value: 19, color: "#FBBF24" },
                        { label: "3+ өдөр тасалсан", value: 9, color: "#F87171" },
                      ]}
                      size={250}
                    />
                  </div>

                  <Legend
                    data={[
                      { label: "Бүрэн ирсэн", value: 72, color: "#4ADE80" },
                      { label: "1–2 өдөр тасалсан", value: 19, color: "#FBBF24" },
                      { label: "3+ өдөр тасалсан", value: 9, color: "#F87171" },
                    ]}
                  />
                </div>
              </div>
            )}

            <div className="mt-10 pt-5 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-medium">
              <span>© 2024 {mockData.school}</span>
              <span>Сургалтын мэдээллийн системийн автомат тайлан</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MiniCard({ label, value, sub, color }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
      <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</div>
      <div style={{ color }} className="text-3xl font-black mt-1">
        {value}
      </div>
      <div className="text-slate-400 text-xs font-semibold">{sub}</div>
    </div>
  );
}

const panelStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 28,
  padding: 32,
  minWidth: 0,
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
};

const panelTitle = {
  margin: "0 0 24px",
  fontSize: 18,
  fontWeight: 900,
  color: "#0f172a",
};

const chartRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 32,
  flexWrap: "wrap",
};