import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiClipboard,
  FiLogOut,
  FiSettings,
  FiBarChart2,
  FiUsers,
} from "react-icons/fi";
import { PiGraduationCapDuotone } from "react-icons/pi";
import { useTeacherAuth } from "../TeacherAuthContext";

const menuItems = [
  { to: "/team6/teacher/exams", label: "Шалгалтууд", icon: <FiClipboard /> },
  { to: "/team6/teacher/questions", label: "Асуултын сан", icon: <FiBookOpen /> },
  { to: "/team6/teacher/students", label: "Оюутнууд", icon: <FiUsers /> },
  { to: "/team6/teacher/reports", label: "Тайлан", icon: <FiBarChart2 /> },
  { to: "/team6/teacher/settings", label: "Тохиргоо", icon: <FiSettings /> },
];

const TeacherLayout = () => {
  const { user, logout } = useTeacherAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/team6/teacher/login", { replace: true });
  };

  return (
    <div className="team5-teacher-app">
      <aside className="team5-sidebar">
        <div>
          <div className="team5-brand">
            <div className="team5-brand-icon">
              <PiGraduationCapDuotone />
            </div>
            <div>
              <h1>Багшийн систем</h1>
              <p>{user?.displayName || "Багш"}</p>
            </div>
          </div>

          <nav className="team5-menu">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `team5-menu-item ${isActive ? "active" : ""}`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <button type="button" className="team5-ghost-btn" onClick={handleLogout}>
          <FiLogOut />
          Гарах
        </button>
      </aside>

      <main className="team5-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
