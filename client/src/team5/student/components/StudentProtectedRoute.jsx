import { Navigate, useLocation } from "react-router-dom";
import { useStudentAuth } from "../StudentAuthContext";

const StudentProtectedRoute = ({ children }) => {
  const { ready, isAuthenticated } = useStudentAuth();
  const location = useLocation();

  if (!ready) {
    return <div className="t5s-loading">Түр хүлээнэ үү...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/team6/login?role=student"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default StudentProtectedRoute;
