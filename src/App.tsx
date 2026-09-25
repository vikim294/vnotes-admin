import { Route, Routes } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import { lazy, Suspense, type ReactNode } from "react";
import { Spin } from "antd";

const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const ClientUserManagement = lazy(() => import("./pages/ClientUserManagement"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const PermissionManagement = lazy(() => import("./pages/PermissionManagement"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="route-loading">
          <Spin size="large" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<PageLoader><Login /></PageLoader>} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <PageLoader><Home /></PageLoader>
          </AuthGuard>
        }
      >
        <Route index element={<PageLoader><Dashboard /></PageLoader>} />
        <Route path="/unauthorized" element={<PageLoader><Unauthorized /></PageLoader>} />
        <Route
          path="/user-management"
          element={
            <AuthGuard permission="admin:user:read">
              <PageLoader><UserManagement /></PageLoader>
            </AuthGuard>
          }
        />
        <Route
          path="/client-user-management"
          element={
            <AuthGuard permission="client:user:read">
              <PageLoader><ClientUserManagement /></PageLoader>
            </AuthGuard>
          }
        />
        <Route
          path="/role-management"
          element={
            <AuthGuard permission="admin:role:read">
              <PageLoader><RoleManagement /></PageLoader>
            </AuthGuard>
          }
        />
        <Route
          path="/permission-management"
          element={
            <AuthGuard permission="admin:permission:read">
              <PageLoader><PermissionManagement /></PageLoader>
            </AuthGuard>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <AuthGuard permission="admin:audit:read">
              <PageLoader><AuditLogs /></PageLoader>
            </AuthGuard>
          }
        />
      </Route>
      <Route path="*" element={<PageLoader><NotFound /></PageLoader>} />
    </Routes>
  );
};

export default App;
