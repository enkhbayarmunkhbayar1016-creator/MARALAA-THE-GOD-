import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { useAuth } from "./utils/AuthContext";
import { parseField } from "./utils/api";
import SideMenu from "./SideMenu";
import { Avatar } from "./components/ui/Avatar";

export default function Layout() {
  const { user, school, logout, isSystemAdmin, isSchoolAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/team4/login", { replace: true });
  }

  const roleLabel = parseField(school, "role")?.name ?? null;

  const theme = isTeacher
    ? {
        bg: "#ecfdf5",
        headerBg: "#ffffff",
        border: "#bbf7d0",
        soft: "bg-emerald-50",
        text: "text-emerald-600",
        hover: "hover:text-emerald-600",
        icon: "text-emerald-700",
        logout: "bg-emerald-600 text-white hover:bg-emerald-700",
      }
    : isStudent
      ? {
          bg: "#fffbeb",
          headerBg: "#ffffff",
          border: "#fde68a",
          soft: "bg-amber-50",
          text: "text-amber-600",
          hover: "hover:text-amber-600",
          icon: "text-amber-700",
          logout: "bg-amber-500 text-white hover:bg-amber-600",
        }
      : {
          bg: "#eef6ff",
          headerBg: "#ffffff",
          border: "#dbeafe",
          soft: "bg-blue-50",
          text: "text-blue-500",
          hover: "hover:text-blue-600",
          icon: "text-blue-700",
          logout: "bg-white text-blue-700 hover:bg-blue-100 hover:text-red-500",
        };

  const userName =
    [user?.last_name, user?.first_name].filter((v) => v && v !== "-").join(" ") ||
    user?.username ||
    user?.email ||
    "Хэрэглэгч";

  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  function avatarSrc(picture) {
    if (!picture || picture === "no-image.jpg") return undefined;
    if (/^(https?:)?\/\//i.test(picture)) return picture;
    if (picture.startsWith("data:image/")) return picture;
    return `https://todu.mn/bs/lms/v1/${picture}`;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 flex overflow-hidden"
      style={{ top: "4rem", background: theme.bg }}
    >
      {school && (
        <aside className="hidden w-64 shrink-0 md:flex md:flex-col">
          <SideMenu onClose={() => {}} />
        </aside>
      )}

      {school && sideOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSideOpen(false)}
          aria-hidden="true"
        />
      )}

      {school && (
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col shadow-xl
          transform transition-transform duration-200 ease-in-out md:hidden
          ${sideOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <SideMenu onClose={() => setSideOpen(false)} />
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 px-4 pt-4 sm:px-6">
          <div
            className="flex items-center justify-between rounded-3xl border px-6 py-4 shadow-md"
            style={{
              background: theme.headerBg,
              borderColor: theme.border,
            }}
          >
            <div className="flex items-center gap-4">
              {school && (
                <button
                  onClick={() => setSideOpen(true)}
                  className={`rounded-2xl p-2 transition-colors md:hidden ${theme.soft}`}
                  aria-label="Цэс нээх"
                >
                  <FiMenu className={`h-5 w-5 ${theme.icon}`} />
                </button>
              )}

              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.soft}`}>
                <span className="text-xl">🏫</span>
              </div>

              <div className="flex flex-col">
                {school?.name ? (
                  <Link
                    to="/team4/schools/current"
                    className={`text-lg font-bold text-slate-900 ${theme.hover}`}
                  >
                    {school.name}
                  </Link>
                ) : (
                  <Link
                    to="/team4/schools/current"
                    className={`text-lg font-bold text-slate-900 ${theme.hover}`}
                  >
                    Сургуулиа сонгоно уу
                  </Link>
                )}

                {roleLabel && (
                  <span className={`mt-0.5 text-sm font-medium ${theme.text}`}>
                    {roleLabel}
                  </span>
                )}
              </div>
            </div>

            <div className={`flex items-center gap-4 rounded-2xl px-4 py-2 ${theme.soft}`}>
              <Avatar
                src={avatarSrc(user?.picture)}
                fallback={initials}
                size="sm"
                className="rounded-xl"
              />

              <div className="hidden flex-col text-right sm:flex">
                <span className="text-sm font-bold text-slate-900">{userName}</span>

                {user?.email && (
                  <span className={`text-xs font-medium ${theme.text}`}>
                    {user.email}
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${theme.logout}`}
              >
                <FiLogOut className="h-4 w-4" />
                Гарах
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}