import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAccessToken, getUserPermissions } from "../../common/auth";

interface AuthGuardProps {
  children: ReactNode;
  permission?: string;
}

function AuthGuard({ children, permission }: AuthGuardProps) {
  const location = useLocation();

  if (!getAccessToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (permission && !getUserPermissions().includes(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default AuthGuard;
