import RouteHistoryTable from "./RouteHistoryTable"

const OverviewTab = () => {
  return (
    <div className="dashboard-tab">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Routes</h3>
            <i className="fas fa-route"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">24</div>
            <p className="stat-change positive">+5 from last month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Active Vehicles</h3>
            <i className="fas fa-truck"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">12</div>
            <p className="stat-change positive">+2 from last month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Distance</h3>
            <i className="fas fa-road"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">1,245 km</div>
            <p className="stat-change negative">-12% from last month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Delivery Locations</h3>
            <i className="fas fa-map-marker-alt"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">48</div>
            <p className="stat-change positive">+8 from last month</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="grid-item routes-history">
          <div className="card">
            <div className="card-header">
              <h2>Recent Route Optimizations</h2>
              <p>Your recent route optimization history for the last 30 days.</p>
            </div>
            <div className="card-content">
              <RouteHistoryTable />
            </div>
          </div>
        </div>

        <div className="grid-item efficiency-chart">
          <div className="card">
            <div className="card-header">
              <h2>Route Efficiency</h2>
              <p>Average load capacity and distance optimization metrics.</p>
            </div>
            <div className="card-content">
              <div className="chart-placeholder">
                <i className="fas fa-chart-bar"></i>
                <span>Chart visualization</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewTab

