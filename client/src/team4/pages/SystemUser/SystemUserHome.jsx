import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";

import AdminHomeSummary from "../Admin/AdminHomeSummary";
import SchoolAdminDashboard from "../SchoolAdmin/SchoolAdminDashboard";
import TeacherHomeSummary from "../Teacher/TeacherHomeSummary";
import StudentDashboard from "../Student/StudentDashboard";

export default function SystemUserHome() {
  const {
    user,
    isSystemAdmin,
    isSchoolAdmin,
    isTeacher,
    isStudent,
  } = useAuth();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {isSystemAdmin && <AdminHomeSummary userId={user?.id} />}

      {isSchoolAdmin && <SchoolAdminDashboard userId={user?.id} />}

      {isTeacher && <TeacherHomeSummary userId={user?.id} />}

      {isStudent && <StudentDashboard userId={user?.id} />}

      {!isSystemAdmin && !isSchoolAdmin && !isTeacher && !isStudent && (
        <div className="rounded-xl border border-blue-100 bg-white p-8 text-center text-sm text-blue-500">
          Таны эрх тодорхойлогдоогүй байна.{" "}
          <Link to="/team4/schools/current" className="font-bold text-blue-700 underline">
            Сургуулиа дахин сонгоно уу
          </Link>
        </div>
      )}
    </div>
  );
}