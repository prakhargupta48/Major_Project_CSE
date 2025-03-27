import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VehicleService from '../services/vehicle.service';
import '../styles/Vehicles.css';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await VehicleService.getAll();
      setVehicles(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load vehicles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await VehicleService.remove(id);
      setVehicles(vehicles.filter(vehicle => vehicle._id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete vehicle: ' + err.message);
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm('Are you sure you want to delete this vehicle?')) {
  //     try {
  //       await VehicleService.remove(id);
  //       setVehicles(vehicles.filter(vehicle =>  {
  //     try {
  //       await VehicleService.remove(id);
  //       setVehicles(vehicles.filter(vehicle => vehicle._id !== id));
  //       setError('');
  //     } catch (err) {
  //       setError('Failed to delete vehicle');
  //       console.error(err);
  //     }
  //   }
  // };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="vehicles-container">
      <div className="vehicles-header">
        <h1>Vehicles</h1>
        <Link to="/vehicles/add" className="btn btn-primary">
          <i className="fas fa-plus"></i> Add Vehicle
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {vehicles.length === 0 ? (
        <div className="no-data">
          <p>No vehicles found. Add your first vehicle!</p>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map(vehicle => (
            <div key={vehicle._id} className="vehicle-card">
              <div className="vehicle-icon">
                <i className="fas fa-truck"></i>
              </div>
              <div className="vehicle-details">
                <h3>{vehicle.name}</h3>
                <p>
                  <strong>Capacity:</strong> {vehicle.capacity}
                </p>
                <p>
                  <strong>Count:</strong> {vehicle.count}
                </p>
              </div>
              <div className="vehicle-actions">
                <Link to={`/vehicles/edit/${vehicle._id}`} className="btn btn-secondary btn-sm">
                  <i className="fas fa-edit"></i> Edit
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(vehicle._id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vehicles;