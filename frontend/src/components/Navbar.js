import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaTruck, 
  FaSignOutAlt, 
  FaUser, 
  FaBars, 
  FaTimes, 
  FaSun, 
  FaMoon,
  FaCog,
  FaTachometerAlt,
  FaRoute,
  FaMapMarkedAlt,
  FaCogs
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ToastProvider';
import '../styles/Navbar.css';

const Navbar = () => {
  const { currentUser, logout, updateUserPreferences } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    notify('Logged out successfully', 'info');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/vehicles', label: 'Vehicles', icon: <FaTruck /> },
    { path: '/locations', label: 'Locations', icon: <FaMapMarkedAlt /> },
    { path: '/optimizations', label: 'Optimizations', icon: <FaRoute /> },
    { path: '/settings', label: 'Settings', icon: <FaCogs /> }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50`}>
      <div className="container mx-auto px-6">
        <Link to="/" className="navbar-brand group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <FaTruck className="text-xl" />
            </div>
            <span className="brand-text text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RouteOptimizer
            </span>
          </div>
        </Link>

        <div className="navbar-mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          {location.pathname === '/' && !currentUser ? (
            <div className="navbar-user">
              <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                Get Started
              </Link>
            </div>
          ) : (
            <>
              <div className="navbar-links">
                {navItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={`navbar-link group ${((location.pathname === item.path) || (location.pathname.startsWith(item.path))) ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {((location.pathname === item.path) || (location.pathname.startsWith(item.path))) && (
                      <div className="active-indicator" />
                    )}
                  </Link>
                ))}
              </div>

              <div className="navbar-user">
                <button 
                  className="btn btn-outline btn-sm group" 
                  onClick={async () => {
                    const newTheme = theme === 'light' ? 'dark' : 'light';
                    toggleTheme();
                    notify(`Switched to ${newTheme} theme`, 'info', { autoClose: 2000 });
                    if (currentUser) {
                      setSavingPrefs(true);
                      try { 
                        await updateUserPreferences({ theme: newTheme }); 
                      } finally { 
                        setSavingPrefs(false); 
                      }
                    }
                  }} 
                  aria-label="Toggle theme"
                >
                  {savingPrefs ? (
                    <FaCog className="animate-spin" />
                  ) : theme === 'light' ? (
                    <FaMoon className="group-hover:rotate-12 transition-transform duration-300" />
                  ) : (
                    <FaSun className="group-hover:rotate-12 transition-transform duration-300" />
                  )}
                  <span className="ml-2">
                    {savingPrefs ? 'Saving...' : theme === 'light' ? 'Dark' : 'Light'}
                  </span>
                </button>

                {currentUser ? (
                  <div className="flex items-center gap-3">
                    <div className="user-info group">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <FaUser className="text-lg" />
                      </div>
                      <span className="user-name font-medium text-slate-700 dark:text-slate-300">
                        Hi, {currentUser.name?.split(' ')[0] || 'User'}
                      </span>
                    </div>
                    <button 
                      className="btn btn-outline btn-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300" 
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>
                      Login
                    </Link>
                    <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
