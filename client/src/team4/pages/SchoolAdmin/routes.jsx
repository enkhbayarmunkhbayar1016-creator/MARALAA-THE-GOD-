import { Route } from "react-router-dom";
import { ProtectedRoute } from "../../utils/AuthContext";
import { ROLES } from "../../utils/constants";

import SchoolAdminDashboard from "./SchoolAdminDashboard";
import SchoolAdminUsers from "./SchoolAdminUsers";


const schoolAdminOnly = (children) => (
  <ProtectedRoute role={ROLES.ADMIN} adminType="school">
    {children}
  </ProtectedRoute>
);

const schoolAdminRoutes = [
  <Route
    key="school-admin-dashboard"
    path="school-admin"
    element={schoolAdminOnly(<SchoolAdminDashboard />)}
  />,

  <Route
    key="school-admin-users"
    path="school-admin/users"
    element={schoolAdminOnly(<SchoolAdminUsers />)}
  />,

];

export default schoolAdminRoutes;