import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VehicleService from '../services/vehicle.service';
import '../styles/Vehicles.css';
import { useToast } from '../components/ToastProvider';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { notify } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await VehicleService.getAll();
      setVehicles(response || []);
      setError('');
      notify('Vehicles loaded', 'success', { autoClose: 1200 });
    } catch (err) {
      setError('Failed to load vehicles');
      notify('Failed to load vehicles', 'error');
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
      notify('Vehicle deleted', 'success');
    } catch (err) {
      const msg = err?.response?.data?.msg || ('Failed to delete vehicle: ' + err.message);
      setError(msg);
      notify(msg, 'error');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="vehicles-container container mx-auto px-6 py-8">
      <div className="vehicles-header">
        <h1>Vehicles</h1>
        <Link to="/vehicles/add" className="btn btn-primary rounded-lg px-4 py-2">
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
          {vehicles && vehicles.map(vehicle => (
            <div key={vehicle._id} className="vehicle-card rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm card-hover">
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
              <div className="vehicle-actions flex gap-2">
                <Link to={`/vehicles/edit/${vehicle._id}`} className="btn btn-secondary btn-sm rounded-md px-3 py-1.5">
                  <i className="fas fa-edit"></i> Edit
                </Link>
                <button
                  className="btn btn-danger btn-sm rounded-md px-3 py-1.5"
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