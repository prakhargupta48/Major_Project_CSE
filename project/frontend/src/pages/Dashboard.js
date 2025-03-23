import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import VehicleService from '../services/vehicle.service';
import LocationService from '../services/location.service';
import OptimizationService from '../services/optimization.service';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [optimizations, setOptimizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehiclesRes, locationsRes, optimizationsRes] = await Promise.all([
          VehicleService.getAll(),
          LocationService.getAll(),
          OptimizationService.getAll()
        ]);

        setVehicles(vehiclesRes.data);
        setLocations(locationsRes.data);
        setOptimizations(optimizationsRes.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome, {currentUser?.name}!</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-truck"></i>
          </div>
          <div className="stat-content">
            <h3>Vehicles</h3>
            <p className="stat-number">{vehicles.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-map-marker-alt"></i>
          </div>
          <div className="stat-content">
            <h3>Locations</h3>
            <p className="stat-number">{locations.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-route"></i>
          </div>
          <div className="stat-content">
            <h3>Optimizations</h3>
            <p className="stat-number">{optimizations.length}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/vehicles/add" className="btn btn-primary">
          <i className="fas fa-plus"></i> Add Vehicle
        </Link>
        <Link to="/locations/add" className="btn btn-primary">
          <i className="fas fa-plus"></i> Add Location
        </Link>
        <Link to="/optimizations/new" className="btn btn-success">
          <i className="fas fa-route"></i> New Optimization
        </Link>
      </div>

      <div className="dashboard-recent">
        <h2>Recent Optimizations</h2>
        {optimizations.length === 0 ? (
          <p>No optimizations yet. Create your first optimization!</p>
        ) : (
          <div className="recent-optimizations">
            {optimizations.slice(0, 3).map(optimization => (
              <div key={optimization._id} className="optimization-card">
                <h3>{optimization.name}</h3>
                <p>
                  <i className="fas fa-calendar"></i>{' '}
                  {new Date(optimization.date).toLocaleDateString()}
                </p>
                <p>
                  <i className="fas fa-route"></i> Routes: {optimization.routes.length}
                </p>
                <p>
                  <i className="fas fa-road"></i> Total Distance: {optimization.totalDistance.toFixed(2)} km
                </p>
                <Link to={`/optimizations/${optimization._id}`} className="btn btn-secondary btn-sm">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;