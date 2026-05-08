import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiGrid,
  FiLogOut,
  FiMail,
  FiSearch,
  FiSettings,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { PiGraduationCapDuotone } from "react-icons/pi";
import { useStudentAuth } from "../StudentAuthContext";
import { initials } from "../utils";

const menuItems = [
  { to: "/team6/student/dashboard", label: "Хяналтын самбар", icon: <FiGrid /> },
  { to: "/team6/student/schedule", label: "Хуваарь", icon: <FiCalendar /> },
  { to: "/team6/student/library", label: "Номын сан", icon: <FiBookOpen /> },
  { to: "/team6/student/exams", label: "Шалгалт", icon: <FiClipboard /> },
  { to: "/team6/student/reports", label: "Тайлан", icon: <FiBarChart2 /> },
  { to: "/team6/student/courses", label: "Курсууд", icon: <FiAward /> },
  { to: "/team6/student/assignments", label: "Даалгавар", icon: <FiClock /> },
  { to: "/team6/student/attendance", label: "Ирц", icon: <FiUsers /> },
  { to: "/team6/student/messages", label: "Мессежүүд", icon: <FiMail /> },
  { to: "/team6/student/requests", label: "Хүсэлт", icon: <FiUser /> },
];

const StudentLayout = () => {
  const { user, logout } = useStudentAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/team6/student/login", { replace: true });
  };

  return (
    <div className="t5s-shell">
      <aside className="t5s-sidebar">
        <div>
          <div className="t5s-logo-wrap">
            <div className="t5s-logo-icon">
              <PiGraduationCapDuotone />
            </div>
          </div>

          <nav className="t5s-nav">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `t5s-nav-item ${isActive ? "active" : ""}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="t5s-bottom-actions">
          <NavLink
            to="/team6/student/settings"
            className={({ isActive }) => `t5s-nav-item ${isActive ? "active" : ""}`}
          >
            <span>
              <FiSettings />
            </span>
            <span>Тохиргоо</span>
          </NavLink>

          <button type="button" className="t5s-logout" onClick={handleLogout}>
            <FiLogOut />
            Гарах
          </button>
        </div>
      </aside>

      <section className="t5s-content-area">
        <header className="t5s-topbar">
          <div className="t5s-search">
            <FiSearch />
            <input type="text" placeholder="Хайх" />
          </div>

          <div className="t5s-topbar-right">
            <button type="button" className="t5s-notify" aria-label="notifications">
              <HiOutlineBellAlert />
              <span>5</span>
            </button>

            <div className="t5s-user-pill">
              <div className="t5s-avatar">{initials(user?.displayName)}</div>
              <div>
                <strong>{user?.displayName || "Оюутан"}</strong>
                <p>{user?.username || user?.email || "-"}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="t5s-main">
          <Outlet />
        </main>
      </section>
    </div>
  );
};

export default StudentLayout;
