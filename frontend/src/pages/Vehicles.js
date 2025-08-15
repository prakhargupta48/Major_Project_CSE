import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import VehicleService from '../services/vehicle.service';
import '../styles/Vehicles.css';
import { useToast } from '../components/ToastProvider';
import { 
  FaPlus, 
  FaTruck, 
  FaEdit, 
  FaTrash, 
  FaRoute, 
  FaChartLine,
  FaCog,
  FaInfoCircle
} from 'react-icons/fa';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { notify } = useToast();

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await VehicleService.getAll();
      setVehicles(response || []);
      setError('');
      notify('Vehicles loaded successfully', 'success', { autoClose: 1200 });
    } catch (err) {
      setError('Failed to load vehicles');
      notify('Failed to load vehicles', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [notify]);
  
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await VehicleService.remove(id);
        setVehicles(vehicles.filter(vehicle => vehicle._id !== id));
        setError('');
        notify('Vehicle deleted successfully', 'success');
      } catch (err) {
        const msg = err?.response?.data?.msg || ('Failed to delete vehicle: ' + err.message);
        setError(msg);
        notify(msg, 'error');
      }
    }
  };

  const getVehicleStats = () => {
    const total = vehicles.length;
    const totalCapacity = vehicles.reduce((sum, v) => sum + (v.capacity || 0), 0);
    const totalCount = vehicles.reduce((sum, v) => sum + (v.count || 0), 0);
    const avgCapacity = total > 0 ? Math.round(totalCapacity / total) : 0;
    
    return { total, totalCapacity, totalCount, avgCapacity };
  };

  const stats = getVehicleStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Vehicles</h1>
            <Link to="/vehicles/add" className="btn btn-primary">
              <FaPlus className="mr-2" />
              Add Vehicle
            </Link>
          </div>
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              <FaTruck className="inline-block mr-3 text-blue-600" />
              Vehicles
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Manage your fleet and vehicle specifications
            </p>
          </div>
          <Link 
            to="/vehicles/add" 
            className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <FaPlus className="mr-2" />
            Add Vehicle
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Vehicles</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <FaTruck className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Units</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <FaRoute className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Capacity</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalCapacity}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <FaChartLine className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Capacity</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgCapacity}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <FaCog className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-6">
            <FaTruck className="mr-2" />
            {error}
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-lg">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTruck className="text-4xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              No vehicles found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Get started by adding your first vehicle to begin building your fleet and optimizing routes.
            </p>
            <Link 
              to="/vehicles/add" 
              className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <FaPlus className="mr-2" />
              Add Your First Vehicle
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Fleet Overview
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage and monitor your vehicle fleet
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                  <div 
                    key={vehicle._id} 
                    className="group bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <FaTruck className="text-2xl" />
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          to={`/vehicles/edit/${vehicle._id}`} 
                          className="btn btn-secondary btn-sm"
                        >
                          <FaEdit className="mr-1" />
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(vehicle._id)}
                        >
                          <FaTrash className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                          {vehicle.name}
                        </h3>
                        {vehicle.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {vehicle.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-600 p-3 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <FaChartLine className="text-blue-600 text-sm" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              Capacity
                            </span>
                          </div>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            {vehicle.capacity}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-slate-600 p-3 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <FaRoute className="text-green-600 text-sm" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              Count
                            </span>
                          </div>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            {vehicle.count}
                          </p>
                        </div>
                      </div>

                      {vehicle.type && (
                        <div className="flex items-center gap-2">
                          <FaInfoCircle className="text-slate-400 text-sm" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Type: <span className="font-medium">{vehicle.type}</span>
                          </span>
                        </div>
                      )}

                      {vehicle.notes && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Notes:</strong> {vehicle.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;