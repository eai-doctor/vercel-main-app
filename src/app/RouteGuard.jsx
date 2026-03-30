import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components";

function RouteGuard({
  children,
  requireAuth = true,
  roles = null,
  requireConsent = false,
}) {
  const { isAuthenticated, user, loading } = useAuth();

  // 1. Loading
  if (loading) return <LoadingScreen />;

  // 2. Auth check
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. Role check
  if (roles && !roles.includes(user?.role)) {
    if (user?.role === "patient") {
      return <Navigate to="/personal" replace />;
    }
    return <Navigate to="/clinics" replace />;
  }

  // 4. Consent check
  if (requireConsent && user?.consents?.privacy_policy?.accepted !== true) {
    return <Navigate to="/consent" replace />;
  }

  return children;
}

function PublicOnlyGuard({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={user.role === "clinician" ? "/clinics" : "/personal"} replace />
  }

  return children;
}

export {
  RouteGuard,
  PublicOnlyGuard
}