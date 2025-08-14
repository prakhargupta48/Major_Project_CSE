import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) return null;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-4 text-center text-sm">
        <Link to="/dashboard" className={`py-3 ${location.pathname === '/dashboard' ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>Dashboard</Link>
        <Link to="/vehicles" className={`py-3 ${location.pathname.startsWith('/vehicles') ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>Vehicles</Link>
        <Link to="/locations" className={`py-3 ${location.pathname.startsWith('/locations') ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>Locations</Link>
        <Link to="/optimizations" className={`py-3 ${location.pathname.startsWith('/optimizations') ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>Routes</Link>
      </div>
    </nav>
  );
};

export default BottomNav;