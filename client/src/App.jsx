import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import UserDashboard from './pages/user/UserDashboard';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      {user && <Navbar />}
      
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            !user ? <Navigate to="/login" replace /> :
            user.role === 'SYSTEM_ADMIN' ? <Navigate to="/admin/dashboard" replace /> :
            user.role === 'STORE_OWNER' ? <Navigate to="/owner/dashboard" replace /> :
            <Navigate to="/stores" replace />
          } />

          <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['NORMAL_USER']} />}>
            <Route path="/stores" element={<UserDashboard />} />
          </Route>
          
          <Route path="*" element={<h1 className="text-2xl font-bold text-center mt-10">404 - Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;