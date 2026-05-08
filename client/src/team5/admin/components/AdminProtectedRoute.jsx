import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../AdminAuthContext";

const AdminProtectedRoute = ({ children }) => {
  const { ready, isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!ready) {
    return <div className="t5a-loading-screen">Түр хүлээнэ үү...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/team6/login?role=admin"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default AdminProtectedRoute;
