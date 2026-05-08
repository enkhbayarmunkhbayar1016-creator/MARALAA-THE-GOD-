import { Route } from "react-router-dom";
import { ProtectedRoute } from "../../utils/AuthContext";
import { ROLES } from "../../utils/constants";

import AdminDashboard from "./AdminDashboard";
import UserList from "./AdminUsers";
import UserCreate from "./AdminUserForm";
import UserDetail from "./AdminUserDetail";
import UserEdit from "./AdminUserEdit";
import AdminReports from "./AdminReports";
import AdminSettings from "./AdminSettings";

const systemAdminOnly = (children) => (
  <ProtectedRoute role={ROLES.ADMIN} adminType="system">
    {children}
  </ProtectedRoute>
);

const adminRoutes = [
  <Route
    key="admin-dashboard"
    path="admin"
    element={systemAdminOnly(<AdminDashboard />)}
  />,

  <Route
    key="users"
    path="users"
    element={systemAdminOnly(<UserList />)}
  />,

  <Route
    key="users-create"
    path="users/create"
    element={systemAdminOnly(<UserCreate />)}
  />,

  <Route
    key="users-edit"
    path="users/:user_id/edit"
    element={systemAdminOnly(<UserEdit />)}
  />,

  <Route
    key="users-id"
    path="users/:user_id"
    element={systemAdminOnly(<UserDetail />)}
  />,

  <Route
    key="reports"
    path="reports"
    element={systemAdminOnly(<AdminReports />)}
  />,

  <Route
    key="settings"
    path="settings"
    element={systemAdminOnly(<AdminSettings />)}
  />,
];

export default adminRoutes;