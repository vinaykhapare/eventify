import { Outlet, Navigate } from "react-router-dom";
import { useAuthContext } from "../../../hooks/useAuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, auth } = useAuthContext();

  if (!isAuthenticated || !auth?.user) return <Navigate to={"/login"} replace />;

  if (allowedRoles && (!auth?.user?.role || !allowedRoles.includes(auth.user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
