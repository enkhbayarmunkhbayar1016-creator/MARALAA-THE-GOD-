import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiBook,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { useAdminAuth } from "../AdminAuthContext";

const navItems = [
  { to: "/team6/admin/dashboard", label: "Dashboard", icon: <FiGrid /> },
  { to: "/team6/admin/users", label: "Хэрэглэгчид", icon: <FiUsers /> },
  { to: "/team6/admin/roles", label: "Эрхүүд", icon: <FiShield /> },
  { to: "/team6/admin/courses", label: "Хичээлүүд", icon: <FiBook /> },
  { to: "/team6/admin/reports", label: "Тайлан", icon: <FiFileText /> },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/team6/admin/login", { replace: true });
  };

  return (
    <div className="t5a-shell">
      <aside className="t5a-sidebar">
        <div className="t5a-brand">
          <div className="t5a-brand-icon">
            <MdOutlineAdminPanelSettings />
          </div>
        </div>

        <div className="t5a-profile-card">
          <strong>Админ систем</strong>
          <p>{user?.displayName || "Ц.Болорбаатар"}</p>
        </div>

        <nav className="t5a-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `t5a-nav-item ${isActive ? "active" : ""}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="t5a-bottom-nav">
          <NavLink
            to="/team6/admin/settings"
            className={({ isActive }) => `t5a-nav-item ${isActive ? "active" : ""}`}
          >
            <span>
              <FiSettings />
            </span>
            <span>Тохиргоо</span>
          </NavLink>

          <button type="button" className="t5a-logout" onClick={handleLogout}>
            <FiLogOut />
            Гарах
          </button>
        </div>
      </aside>

      <section className="t5a-content">
        <main className="t5a-main">
          <Outlet />
        </main>
      </section>
    </div>
  );
};

export default AdminLayout;
