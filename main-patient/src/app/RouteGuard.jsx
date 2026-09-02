import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import { LOGIN_PATH, PORTAL_HOME } from "./portal";
export function RouteGuard({ children, roles = null }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to={LOGIN_PATH} replace />;
  if (roles && !roles.includes(user.role)) return <section role="alert" className="p-8">You do not have access to this page. <a href="/">Return home</a></section>;
  return children;
}
export function PublicOnlyGuard({children}) {
  const {user,loading}=useAuth();
  if(loading) return <LoadingScreen />;
  return user ? <Navigate to={PORTAL_HOME} replace /> : children;
}
export function PatientOnlyGuard({children}) { return <RouteGuard roles={["patient"]}>{children}</RouteGuard>; }
export function AdminOnlyGuard({children}) { return <RouteGuard roles={["admin"]}>{children}</RouteGuard>; }
