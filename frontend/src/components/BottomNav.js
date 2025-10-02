import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaTruck, FaMapMarkerAlt, 
  FaRoute, FaCog 
} from 'react-icons/fa';
import '../styles/BottomNav.css';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/vehicles', label: 'Vehicles', icon: <FaTruck /> },
    { path: '/locations', label: 'Locations', icon: <FaMapMarkerAlt /> },
    { path: '/optimizations', label: 'Routes', icon: <FaRoute /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> }
  ];

  return (
    <nav className="bottom-nav md:hidden">
      <div className="bottom-nav-container">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${
              location.pathname === item.path || location.pathname.startsWith(item.path)
                ? 'active'
                : ''
            }`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;