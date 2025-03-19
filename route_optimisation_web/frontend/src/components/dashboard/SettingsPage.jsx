"use client"

import { useState } from "react"

const SettingsPage = () => {
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Acme Logistics",
    email: "admin@acmelogistics.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
  })

  const [optimizationSettings, setOptimizationSettings] = useState({
    defaultAlgorithm: "clarke-wright",
    maxRouteTime: "8",
    maxVehicleLoad: "90",
    costPerKm: "0.5",
    costPerHour: "25",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    routeCompletionAlerts: true,
    weeklyReports: true,
    systemUpdates: false,
  })

  const handleGeneralChange = (e) => {
    const { name, value } = e.target
    setGeneralSettings({
      ...generalSettings,
      [name]: value,
    })
  }

  const handleOptimizationChange = (e) => {
    const { name, value } = e.target
    setOptimizationSettings({
      ...optimizationSettings,
      [name]: value,
    })
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    })
  }

  const handleSubmit = (e, formType) => {
    e.preventDefault()
    // In a real app, you would save these settings to the backend
    alert(`${formType} settings saved successfully!`)
  }

  return (
    <div className="dashboard-tab">
      <div className="settings-container">
        <div className="card">
          <div className="card-header">
            <h2>General Settings</h2>
            <p>Update your company information and preferences.</p>
          </div>
          <div className="card-content">
            <form onSubmit={(e) => handleSubmit(e, "General")}>
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={generalSettings.companyName}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={generalSettings.email}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={generalSettings.phone}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Business Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralChange}
                  rows="3"
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary">
                Save General Settings
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Optimization Settings</h2>
            <p>Configure default settings for route optimization.</p>
          </div>
          <div className="card-content">
            <form onSubmit={(e) => handleSubmit(e, "Optimization")}>
              <div className="form-group">
                <label htmlFor="defaultAlgorithm">Default Algorithm</label>
                <select
                  id="defaultAlgorithm"
                  name="defaultAlgorithm"
                  value={optimizationSettings.defaultAlgorithm}
                  onChange={handleOptimizationChange}
                >
                  <option value="clarke-wright">Clarke-Wright Savings</option>
                  <option value="nearest-neighbor">Nearest Neighbor</option>
                  <option value="genetic">Genetic Algorithm</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="maxRouteTime">Max Route Time (hours)</label>
                <input
                  id="maxRouteTime"
                  name="maxRouteTime"
                  type="number"
                  min="1"
                  max="24"
                  value={optimizationSettings.maxRouteTime}
                  onChange={handleOptimizationChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxVehicleLoad">Max Vehicle Load (%)</label>
                <input
                  id="maxVehicleLoad"
                  name="maxVehicleLoad"
                  type="number"
                  min="1"
                  max="100"
                  value={optimizationSettings.maxVehicleLoad}
                  onChange={handleOptimizationChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="costPerKm">Cost per Kilometer ($)</label>
                <input
                  id="costPerKm"
                  name="costPerKm"
                  type="number"
                  step="0.01"
                  min="0"
                  value={optimizationSettings.costPerKm}
                  onChange={handleOptimizationChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="costPerHour">Cost per Hour ($)</label>
                <input
                  id="costPerHour"
                  name="costPerHour"
                  type="number"
                  step="0.01"
                  min="0"
                  value={optimizationSettings.costPerHour}
                  onChange={handleOptimizationChange}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Save Optimization Settings
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Notification Settings</h2>
            <p>Configure when and how you receive notifications.</p>
          </div>
          <div className="card-content">
            <form onSubmit={(e) => handleSubmit(e, "Notification")}>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                  />
                  <span>Email Notifications</span>
                </label>
                <p className="checkbox-description">Receive notifications via email</p>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="routeCompletionAlerts"
                    checked={notificationSettings.routeCompletionAlerts}
                    onChange={handleNotificationChange}
                  />
                  <span>Route Completion Alerts</span>
                </label>
                <p className="checkbox-description">Get notified when routes are completed</p>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="weeklyReports"
                    checked={notificationSettings.weeklyReports}
                    onChange={handleNotificationChange}
                  />
                  <span>Weekly Reports</span>
                </label>
                <p className="checkbox-description">Receive weekly summary reports</p>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="systemUpdates"
                    checked={notificationSettings.systemUpdates}
                    onChange={handleNotificationChange}
                  />
                  <span>System Updates</span>
                </label>
                <p className="checkbox-description">Get notified about system updates and maintenance</p>
              </div>

              <button type="submit" className="btn btn-primary">
                Save Notification Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

