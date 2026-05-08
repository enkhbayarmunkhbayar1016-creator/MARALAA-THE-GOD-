// Shared routes
import { Route } from "react-router-dom";
import { ProtectedRoute } from "../../utils/AuthContext";

import Home           from "./SystemUserHome";
import Profile        from "./Profile";
import ChangePassword from "./ChangePassword";
import SchoolSelect   from "./SchoolSelect";

const sharedRoutes = [
  <Route key="home" index
    element={<ProtectedRoute><Home /></ProtectedRoute>} />,

  <Route key="profile" path="profile"
    element={<ProtectedRoute><Profile /></ProtectedRoute>} />,

  <Route key="change-password" path="profile/change-password"
    element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />,

  <Route key="schools-current" path="schools/current"
    element={<ProtectedRoute skipSchoolCheck><SchoolSelect /></ProtectedRoute>} />,
];

export default sharedRoutes;
