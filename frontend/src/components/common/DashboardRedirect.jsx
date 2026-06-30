import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const roleRoutes = {
  admin: "/dashboard/admin",
  director: "/dashboard/director",
  profesor: "/dashboard/profesor",
  client: "/dashboard/cliente",
};

const DashboardRedirect = () => {
  const { rol } = useAuth();
  return <Navigate to={roleRoutes[rol] || "/login"} replace />;
};

export default DashboardRedirect;
