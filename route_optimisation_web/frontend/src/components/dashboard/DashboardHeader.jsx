"use client"

const DashboardHeader = ({ toggleSidebar }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <h1>Dashboard</h1>
      </div>

      <div className="header-search">
        <div className="search-input">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="header-actions">
        <button className="notification-btn">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">3</span>
        </button>
        <div className="user-dropdown">
          <button className="user-dropdown-btn">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <span className="user-name">John Doe</span>
            <i className="fas fa-chevron-down"></i>
          </button>
          {/* Dropdown menu would go here */}
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader

