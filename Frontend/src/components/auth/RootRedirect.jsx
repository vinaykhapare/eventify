import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../../hooks/useAuthContext";
import Landing from "../../screens/Landing";

function getDefaultRoute(role) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "STUDENT":
      return "/events";
    case "VOLUNTEER":
      return "/assigned-events";
    default:
      return "/login";
  }
}

export default function RootRedirect() {
  const { isAuthenticated, auth } = useAuthContext();

  if (!isAuthenticated || !auth?.user?.role) {
    return <Landing />;
  }

  return <Navigate to={getDefaultRoute(auth.user.role)} replace />;
}

