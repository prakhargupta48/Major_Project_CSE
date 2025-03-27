import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LocationService from '../services/location.service';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Forms.css';

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    demand: '0',
    isDepot: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchLocation();
    }

    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Add click event to map
      mapInstanceRef.current.on('click', handleMapClick);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick);
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [id]);

  useEffect(() => {
    // Update marker when coordinates change
    if (mapInstanceRef.current && formData.latitude && formData.longitude) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.remove();
        }
        
        // Add new marker
        markerRef.current = L.marker([lat, lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(formData.name || 'New Location');
        
        // Center map on marker
        mapInstanceRef.current.setView([lat, lng], 13);
      }
    }
  }, [formData.latitude, formData.longitude, formData.name]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const response = await LocationService.get(id);
      const { name, latitude, longitude, demand, isDepot } = response.data;
      setFormData({
        name,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        demand: (demand || 0).toString(),
        isDepot: isDepot || false
      });
    } catch (err) {
      setError('Failed to load location data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (e) => {
    setFormData({
      ...formData,
      latitude: e.latlng.lat.toString(),
      longitude: e.latlng.lng.toString()
    });
  };

  const onChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const locationData = {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        demand: parseInt(formData.demand),
        isDepot: formData.isDepot
      };

      if (isEditMode) {
        await LocationService.update(id, locationData);
      } else {
        await LocationService.create(locationData);
      }

      navigate('/locations');
    } catch (err) {
      setError('Failed to save location');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="form-container">
      <h1>{isEditMode ? 'Edit Location' : 'Add Location'}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="map-container" ref={mapRef}></div>
      <p className="map-help">Click on the map to set location coordinates</p>

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Location Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            placeholder="e.g., Warehouse A"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={onChange}
              required
              placeholder="e.g., 40.7128"
            />
          </div>
          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={onChange}
              required
              placeholder="e.g., -74.0060"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="demand">Demand</label>
          <input
            type="number"
            id="demand"
            name="demand"
            value={formData.demand}
            onChange={onChange}
            min="0"
            placeholder="e.g., 100"
          />
        </div>
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isDepot"
            name="isDepot"
            checked={formData.isDepot}
            onChange={onChange}
          />
          <label htmlFor="isDepot">This is a depot</label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/locations')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Location'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationForm;