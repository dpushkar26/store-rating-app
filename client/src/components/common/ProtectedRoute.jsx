import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in, but wrong role, redirect to their specific dashboard based on role
    if (user.role === 'SYSTEM_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />; // Normal user default route
  }

  // Authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;