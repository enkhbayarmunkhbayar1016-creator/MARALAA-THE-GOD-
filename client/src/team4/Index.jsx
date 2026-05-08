import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import Layout from "./Layout";

import authRoutes from "./pages/Login/routes";
import sharedRoutes from "./pages/SystemUser/routes";
import adminRoutes from "./pages/Admin/routes";
import schoolAdminRoutes from "./pages/SchoolAdmin/routes";
import teacherRoutes from "./pages/Teacher/routes";
import studentRoutes from "./pages/Student/routes";

export default function Team4() {
  return (
    <AuthProvider>
      <ToastProvider>
        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(100%); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>

        <Routes>
          {authRoutes}

          <Route element={<Layout />}>
            {sharedRoutes}
            {adminRoutes}
            {schoolAdminRoutes}
            {teacherRoutes}
            {studentRoutes}
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}