"use client"
import { Link } from "react-router-dom"

const Sidebar = ({ isOpen, toggleSidebar, onLogout, currentPath }) => {
  // Function to check if a link is active
  const isActive = (path) => {
    return currentPath === `/dashboard${path}` ? "active" : ""
  }

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <i className="fas fa-truck"></i>
          <span>RouteOptimizer</span>
        </Link>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i className={`fas fa-chevron-${isOpen ? "left" : "right"}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li className={isActive("/")}>
            <Link to="/dashboard">
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={isActive("/vehicles")}>
            <Link to="/dashboard/vehicles">
              <i className="fas fa-truck"></i>
              <span>Vehicles</span>
            </Link>
          </li>
          <li className={isActive("/locations")}>
            <Link to="/dashboard/locations">
              <i className="fas fa-map-marker-alt"></i>
              <span>Locations</span>
            </Link>
          </li>
          <li className={isActive("/routes")}>
            <Link to="/dashboard/routes">
              <i className="fas fa-route"></i>
              <span>Routes</span>
            </Link>
          </li>
          <li className={isActive("/analytics")}>
            <Link to="/dashboard/analytics">
              <i className="fas fa-chart-bar"></i>
              <span>Analytics</span>
            </Link>
          </li>
          <li className={isActive("/settings")}>
            <Link to="/dashboard/settings">
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="user-details">
            <span className="user-name">John Doe</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

