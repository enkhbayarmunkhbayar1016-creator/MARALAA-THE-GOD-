import { useEffect, useMemo, useState } from "react";
import { FiLogIn } from "react-icons/fi";
import { PiGraduationCapDuotone } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "./admin/AdminAuthContext";
import { useStudentAuth } from "./student/StudentAuthContext";
import { useTeacherAuth } from "./teacher/TeacherAuthContext";

const ROLE_CONFIG = {
  student: {
    id: "student",
    tabLabel: "Оюутан",
    title: "Оюутны систем",
    subtitle: "Цахим шалгалтын систем",
    identityLabel: "Оюутны дугаар эсвэл имэйл",
    identityPlaceholder: "B231930057 эсвэл email",
    linkText: "Оюутны систем руу буцах",
    demo: "Demo: b231930057 / password",
    homePath: "/team6/student/dashboard",
    routePrefix: "/team6/student",
  },
  teacher: {
    id: "teacher",
    tabLabel: "Багш",
    title: "Багшийн систем",
    subtitle: "Цахим шалгалтын удирдах систем",
    identityLabel: "Имэйл хаяг",
    identityPlaceholder: "teacher@university.edu.mn",
    linkText: "Багшийн систем руу нэвтрэх",
    demo: "Demo: batjargal.d@university.edu.mn / password",
    homePath: "/team6/teacher/exams",
    routePrefix: "/team6/teacher",
  },
  admin: {
    id: "admin",
    tabLabel: "Админ",
    title: "Админ систем",
    subtitle: "Цахим шалгалтын удирдах систем",
    identityLabel: "Имэйл хаяг",
    identityPlaceholder: "admin@university.edu.mn",
    linkText: "Админ систем руу нэвтрэх",
    demo: "Demo: admin@university.edu.mn / password",
    homePath: "/team6/admin/dashboard",
    routePrefix: "/team6/admin",
  },
};

const ROLE_IDS = Object.keys(ROLE_CONFIG);

const normalizeRole = (rawRole) => {
  if (ROLE_IDS.includes(rawRole)) {
    return rawRole;
  }
  return "teacher";
};

const UnifiedLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const adminAuth = useAdminAuth();
  const studentAuth = useStudentAuth();
  const teacherAuth = useTeacherAuth();

  const ready = adminAuth.ready && studentAuth.ready && teacherAuth.ready;

  const queryRole = useMemo(() => {
    const roleFromQuery = new URLSearchParams(location.search).get("role");
    return normalizeRole(roleFromQuery);
  }, [location.search]);

  const [role, setRole] = useState(queryRole);
  const [form, setForm] = useState({ identity: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (queryRole !== role) {
      setRole(queryRole);
      setForm({ identity: "", password: "" });
      setError("");
    }
  }, [queryRole, role]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (adminAuth.isAuthenticated) {
      navigate(ROLE_CONFIG.admin.homePath, { replace: true });
      return;
    }

    if (teacherAuth.isAuthenticated) {
      navigate(ROLE_CONFIG.teacher.homePath, { replace: true });
      return;
    }

    if (studentAuth.isAuthenticated) {
      const fromPath = location.state?.from;
      if (typeof fromPath === "string" && fromPath.startsWith(ROLE_CONFIG.student.routePrefix)) {
        navigate(fromPath, { replace: true });
      } else {
        navigate(ROLE_CONFIG.student.homePath, { replace: true });
      }
    }
  }, [
    ready,
    adminAuth.isAuthenticated,
    teacherAuth.isAuthenticated,
    studentAuth.isAuthenticated,
    location.state,
    navigate,
  ]);

  const roleConfig = ROLE_CONFIG[role];
  const roleError =
    role === "admin" ? adminAuth.error : role === "student" ? studentAuth.error : teacherAuth.error;

  const switchRole = (nextRole) => {
    if (nextRole === role) {
      return;
    }
    navigate(`/team6/login?role=${nextRole}`, { replace: true });
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.identity || !form.password) {
      setError("Нэвтрэх мэдээллээ бүрэн оруулна уу");
      return;
    }

    const fromPath = location.state?.from;
    const canUseFromPath =
      typeof fromPath === "string" && fromPath.startsWith(roleConfig.routePrefix);
    const targetPath = canUseFromPath ? fromPath : roleConfig.homePath;

    try {
      setSubmitting(true);
      setError("");

      if (role === "admin") {
        await adminAuth.login(form.identity, form.password);
      } else if (role === "student") {
        await studentAuth.login(form.identity, form.password);
      } else {
        await teacherAuth.login(form.identity, form.password);
      }

      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err?.message || "Нэвтрэх үед алдаа гарлаа");
    } finally {
      setSubmitting(false);
    }
  };

  const quickLinks = ROLE_IDS.filter((id) => id !== role).map((id) => ROLE_CONFIG[id]);

  return (
    <section className="team5-unified-login-screen">
      <div className="team5-unified-login-wrap">
        <div className="team5-unified-login-logo">
          <PiGraduationCapDuotone />
        </div>

        <form className="team5-unified-login-card" onSubmit={onSubmit}>
          <h1>{roleConfig.title}</h1>
          <p>{roleConfig.subtitle}</p>

          <label>
            {roleConfig.identityLabel}
            <input
              type="text"
              value={form.identity}
              onChange={(event) => setForm((prev) => ({ ...prev, identity: event.target.value }))}
              placeholder={roleConfig.identityPlaceholder}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Нууц үг
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          {(error || roleError) && <div className="team5-error">{error || roleError}</div>}

          <button type="submit" className="team5-primary-btn" disabled={!ready || submitting}>
            <FiLogIn />
            {submitting ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>

          <div className="team5-unified-login-links">
            {quickLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                className="team5-login-link-btn"
                onClick={() => switchRole(item.id)}
              >
                {item.linkText}
              </button>
            ))}
          </div>
        </form>

        <p className="team5-unified-login-demo">{roleConfig.demo}</p>
      </div>
    </section>
  );
};

export default UnifiedLoginPage;
