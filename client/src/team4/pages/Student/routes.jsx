import { Route } from "react-router-dom";
import { ProtectedRoute } from "../../utils/AuthContext";
import { ROLES } from "../../utils/constants";

import StudentCourses      from "./StudentCourses";
import StudentCourseDetail from "./StudentCourseDetail";
import StudentGroups       from "./StudentTeams";
import StudentProfile      from "./StudentProfile";

const studentRoutes = [
  <Route key="student-courses" path="student"
    element={<ProtectedRoute role={ROLES.STUDENT}><StudentCourses /></ProtectedRoute>} />,

  <Route key="student-course-detail" path="student/courses/:courseId"
    element={<ProtectedRoute role={ROLES.STUDENT}><StudentCourseDetail /></ProtectedRoute>} />,

  <Route key="student-groups" path="student/groups"
    element={<ProtectedRoute role={ROLES.STUDENT}><StudentGroups /></ProtectedRoute>} />,

  <Route key="student-profile" path="student/profile"
    element={<ProtectedRoute role={ROLES.STUDENT}><StudentProfile /></ProtectedRoute>} />,

];

export default studentRoutes;
