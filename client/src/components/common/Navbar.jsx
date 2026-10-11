import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import ChangePasswordModal from './ChangePasswordModal';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'SYSTEM_ADMIN') return '/admin/dashboard';
    if (user?.role === 'STORE_OWNER') return '/owner/dashboard';
    return '/stores';
  };

  return (
    <>
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span 
                className="text-xl font-bold cursor-pointer hover:text-gray-300"
                onClick={() => navigate(getDashboardPath())}
              >
                Store Rater Pro
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-300 text-right mr-2">
                <p className="font-medium text-white">{user?.name}</p>
                <p className="text-xs uppercase tracking-wider text-indigo-300">{user?.role?.replace('_', ' ')}</p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-md text-xs font-medium transition-colors"
                title="Change Password"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Navbar;