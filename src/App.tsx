import Login from "./pages/Login";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import UserManagement from "./pages/UserManagement";
import AuditLogs from "./pages/AuditLogs";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <Home></Home>
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
