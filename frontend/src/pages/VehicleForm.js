import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VehicleService from '../services/vehicle.service';
import '../styles/Forms.css';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    count: '1'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await VehicleService.get(id);
      const { name, capacity, count } = response;
      setFormData({ name, capacity: capacity.toString(), count: count.toString() });
    } catch (err) {
      setError('Failed to load vehicle data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const vehicleData = {
        name: formData.name,
        capacity: parseInt(formData.capacity),
        count: parseInt(formData.count)
      };

      if (isEditMode) {
        await VehicleService.update(id, vehicleData);
      } else {
        await VehicleService.create(vehicleData);
      }

      navigate('/vehicles');
    } catch (err) {
      setError('Failed to save vehicle');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="form-container container mx-auto px-6 py-8">
      <h1>{isEditMode ? 'Edit Vehicle' : 'Add Vehicle'}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={onSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm max-w-xl">
        <div className="form-group">
          <label htmlFor="name">Vehicle Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            placeholder="e.g., Delivery Truck"
          />
        </div>
        <div className="form-group">
          <label htmlFor="capacity">Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={onChange}
            required
            min="1"
            placeholder="e.g., 1000"
          />
        </div>
        <div className="form-group">
          <label htmlFor="count">Number of Vehicles</label>
          <input
            type="number"
            id="count"
            name="count"
            value={formData.count}
            onChange={onChange}
            required
            min="1"
            placeholder="e.g., 3"
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary rounded-lg px-4 py-2" onClick={() => navigate('/vehicles')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary rounded-lg px-4 py-2" disabled={loading}>
            {loading ? 'Saving...' : 'Save Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;