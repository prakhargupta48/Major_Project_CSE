"use client"

import { useState } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import "../styles/Dashboard.css"

// Import dashboard components
import Sidebar from "../components/dashboard/Sidebar"
import DashboardHeader from "../components/dashboard/DashboardHeader"
import OverviewTab from "../components/dashboard/OverviewTab"
import VehiclesTab from "../components/dashboard/VehiclesTab"
import LocationsTab from "../components/dashboard/LocationsTab"
import RoutesTab from "../components/dashboard/RoutesTab"
import AnalyticsPage from "../components/dashboard/AnalyticsPage"
import SettingsPage from "../components/dashboard/SettingsPage"

const DashboardPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div className={`dashboard-container ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onLogout={handleLogout}
        currentPath={location.pathname}
      />

      <div className="dashboard-content">
        <DashboardHeader toggleSidebar={toggleSidebar} />

        <main className="dashboard-main">
          <Routes>
            <Route path="/" element={<OverviewTab />} />
            <Route path="/vehicles" element={<VehiclesTab />} />
            <Route path="/locations" element={<LocationsTab />} />
            <Route path="/routes" element={<RoutesTab />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage

