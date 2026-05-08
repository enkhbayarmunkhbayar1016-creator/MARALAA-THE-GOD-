import { NavLink } from "react-router-dom";
import { useAuth } from "./utils/AuthContext";
import {
  FiShield,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiBookOpen,
  FiCalendar,
  FiLayers,
} from "react-icons/fi";

const systemAdminMenu = [
  { to: "/team4/", label: "Хяналтын самбар", icon: FiShield, end: true },
  { to: "/team4/users", label: "Хэрэглэгч ба эрх", icon: FiUsers },
  { to: "/team4/reports", label: "Тайлан", icon: FiBarChart2 },
  { to: "/team4/settings", label: "Тохиргоо", icon: FiSettings },
  { to: "/team4/profile", label: "Профайл", icon: FiUser },
];

const schoolAdminMenu = [
  { to: "/team4/", label: "Хяналтын самбар", icon: FiShield, end: true },
  { to: "/team4/school-admin/users", label: "Хэрэглэгч ба эрх", icon: FiUsers },
  { to: "/team4/profile", label: "Профайл", icon: FiUser },
];

const teacherMenu = [
  { to: "/team4/", label: "Хяналтын самбар", icon: FiShield, end: true },
  { to: "/team4/teacher/attendance", label: "Хэрэглэгч нэмэх", icon: FiUsers },
  { to: "/team4/teacher", label: "Миний хичээлүүд", icon: FiBookOpen, end: true },
  { to: "/team4/profile", label: "Профайл", icon: FiUser },
];

const studentMenu = [
  { to: "/team4/", label: "Хяналтын самбар", icon: FiShield, end: true },
  { to: "/team4/student", label: "Миний хичээлүүд", icon: FiBookOpen, end: true },
  { to: "/team4/student/groups", label: "Багууд", icon: FiLayers, end: true },
  { to: "/team4/student/profile", label: "Профайл", icon: FiUser, end: true },
];

export default function SideMenu({ onClose }) {
  const { isSystemAdmin, isSchoolAdmin, isTeacher, isStudent } = useAuth();

  let title = "Хэрэглэгч";
  let menuItems = [];
  let theme = "blue";

  if (isSystemAdmin) {
    title = "Систем админ";
    menuItems = systemAdminMenu;
    theme = "blue";
  } else if (isSchoolAdmin) {
    title = "Сургуулийн админ";
    menuItems = schoolAdminMenu;
    theme = "blue";
  } else if (isTeacher) {
    title = "Багш";
    menuItems = teacherMenu;
    theme = "emerald";
  } else if (isStudent) {
    title = "Оюутан";
    menuItems = studentMenu;
    theme = "amber";
  }

  const color =
    theme === "emerald"
      ? {
          border: "border-emerald-200",
          title: "text-emerald-950",
          active: "bg-emerald-50 text-emerald-700 shadow-sm",
          normal: "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700",
        }
      : theme === "amber"
        ? {
            border: "border-amber-200",
            title: "text-amber-950",
            active: "bg-amber-50 text-amber-700 shadow-sm",
            normal: "text-slate-500 hover:bg-amber-50 hover:text-amber-700",
          }
        : {
            border: "border-blue-100",
            title: "text-slate-950",
            active: "bg-blue-50 text-blue-700 shadow-sm",
            normal: "text-slate-500 hover:bg-blue-50 hover:text-blue-700",
          };

  return (
    <div
      className={`m-4 flex h-[calc(100%-2rem)] flex-col rounded-[28px] border bg-white/90 text-slate-700 shadow-lg backdrop-blur ${color.border}`}
    >
      <div className="px-6 py-7">
        <h2 className={`text-2xl font-black ${color.title}`}>{title}</h2>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                  isActive ? color.active : color.normal,
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}