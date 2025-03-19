const AnalyticsPage = () => {
  return (
    <div className="dashboard-tab">
      <div className="card">
        <div className="card-header">
          <h2>Analytics Dashboard</h2>
          <p>View detailed analytics about your routes and fleet performance.</p>
        </div>
        <div className="card-content">
          <div className="analytics-filters">
            <div className="form-group">
              <label>Date Range</label>
              <select>
                <option value="7">Last 7 days</option>
                <option value="30" selected>
                  Last 30 days
                </option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <div className="form-group">
              <label>Vehicle Type</label>
              <select>
                <option value="all">All Vehicles</option>
                <option value="van">Vans</option>
                <option value="truck">Trucks</option>
              </select>
            </div>
            <button className="btn btn-outline">Apply Filters</button>
          </div>

          <div className="analytics-grid">
            <div className="analytics-chart">
              <h3>Distance by Vehicle Type</h3>
              <div className="chart-placeholder">
                <i className="fas fa-chart-pie"></i>
                <span>Pie chart visualization</span>
              </div>
            </div>

            <div className="analytics-chart">
              <h3>Routes Over Time</h3>
              <div className="chart-placeholder">
                <i className="fas fa-chart-line"></i>
                <span>Line chart visualization</span>
              </div>
            </div>

            <div className="analytics-chart">
              <h3>Load Capacity Utilization</h3>
              <div className="chart-placeholder">
                <i className="fas fa-chart-bar"></i>
                <span>Bar chart visualization</span>
              </div>
            </div>

            <div className="analytics-chart">
              <h3>Cost Savings</h3>
              <div className="chart-placeholder">
                <i className="fas fa-chart-area"></i>
                <span>Area chart visualization</span>
              </div>
            </div>
          </div>

          <div className="analytics-summary">
            <h3>Performance Summary</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-value">23%</span>
                <span className="stat-label">Distance Reduction</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value">18%</span>
                <span className="stat-label">Time Savings</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value">85%</span>
                <span className="stat-label">Avg. Vehicle Utilization</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value">$12,450</span>
                <span className="stat-label">Estimated Cost Savings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage

