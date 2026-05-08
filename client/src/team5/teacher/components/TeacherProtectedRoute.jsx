import { Navigate, useLocation } from "react-router-dom";
import { useTeacherAuth } from "../TeacherAuthContext";

const TeacherProtectedRoute = ({ children }) => {
  const { ready, isAuthenticated } = useTeacherAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="team5-auth-screen">
        <div className="team5-loading">Уншиж байна...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/team6/login?role=teacher"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default TeacherProtectedRoute;
