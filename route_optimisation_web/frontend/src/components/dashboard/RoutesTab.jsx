"use client"

import { useState } from "react"

const RoutesTab = () => {
  const [isOptimizing, setIsOptimizing] = useState(false)

  const startOptimization = () => {
    setIsOptimizing(true)

    // Simulate optimization process
    setTimeout(() => {
      setIsOptimizing(false)
    }, 3000)
  }

  return (
    <div className="dashboard-tab">
      <div className="card">
        <div className="card-header">
          <h2>Route Optimization</h2>
          <p>Create and manage optimized routes for your fleet.</p>
        </div>
        <div className="card-content">
          <div className="optimization-controls">
            <div className="form-grid">
              <div className="form-group">
                <label>Select Vehicles</label>
                <select>
                  <option value="">All Vehicles</option>
                  <option value="van">Vans Only</option>
                  <option value="truck">Trucks Only</option>
                </select>
              </div>

              <div className="form-group">
                <label>Optimization Priority</label>
                <select>
                  <option value="distance">Minimize Distance</option>
                  <option value="time">Minimize Time</option>
                  <option value="cost">Minimize Cost</option>
                </select>
              </div>

              <div className="form-group">
                <label>Max Route Duration</label>
                <input type="number" placeholder="Hours" min="1" max="24" defaultValue="8" />
              </div>

              <div className="form-group">
                <label>Max Vehicle Load</label>
                <input type="number" placeholder="% of capacity" min="1" max="100" defaultValue="90" />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={startOptimization} disabled={isOptimizing}>
                {isOptimizing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Optimizing...
                  </>
                ) : (
                  "Start Optimization"
                )}
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-file-export"></i> Export Results
              </button>
            </div>
          </div>

          <div className="map-container">
            <div className="map-placeholder">
              <i className="fas fa-map-marked-alt"></i>
              <span>Map visualization will appear here</span>
              <p>Select locations and vehicles, then click "Start Optimization"</p>
            </div>
          </div>

          <div className="optimization-results">
            <h3>Optimization Results</h3>
            <div className="results-summary">
              <div className="result-item">
                <span className="result-label">Total Distance:</span>
                <span className="result-value">0 km</span>
              </div>
              <div className="result-item">
                <span className="result-label">Total Duration:</span>
                <span className="result-value">0 hours</span>
              </div>
              <div className="result-item">
                <span className="result-label">Vehicles Used:</span>
                <span className="result-value">0 / 0</span>
              </div>
              <div className="result-item">
                <span className="result-label">Average Load:</span>
                <span className="result-value">0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoutesTab

