import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/Overview";
import Students from "./pages/Students";
import Grades from "./pages/Grades";
import Absences from "./pages/Absences";
import Payments from "./pages/Payments";
import Planning from "./pages/Planning";
import Settings from "./pages/Settings";

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />; // Or 403 page
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="students" element={<Students />} />
            <Route path="grades" element={<Grades />} />
            <Route path="absences" element={<Absences />} />
            <Route path="payments" element={<Payments />} />
            <Route path="planning" element={<Planning />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
