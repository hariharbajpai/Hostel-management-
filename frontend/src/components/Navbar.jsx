import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Menu, X, User, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearSession();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const navLinks = user?.role === 'admin' ? [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/applications', label: 'Applications' },
    { to: '/admin/swaps', label: 'Swaps' },
    { to: '/admin/rooms', label: 'Rooms' },
    { to: '/admin/complaints', label: 'Complaints' },
    { to: '/admin/notices', label: 'Notices' },
  ] : [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/preferences', label: 'Preferences' },
    { to: '/student/profile', label: 'Profile' },
    { to: '/student/complaints', label: 'Complaints' },
    { to: '/student/notices', label: 'Notices' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white border-b-2 border-gray-200 sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}>
            <motion.div 
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black">
                Vit<span className="text-gray-400">Stay</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <motion.span
                  className="text-gray-700 hover:text-black font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            
            <motion.button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t-2 border-gray-200 bg-white"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                <div className="block px-4 py-2 hover:bg-gray-100 rounded-lg font-semibold">
                  {link.label}
                </div>
              </Link>
            ))}
            
            <div className="pt-3 border-t border-gray-200">
              <div className="px-4 py-2 bg-gray-50 rounded-lg mb-2">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-black text-white rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
