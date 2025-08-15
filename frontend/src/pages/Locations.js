import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LocationService from '../services/location.service';
import Map from '../components/Map';
import '../styles/Locations.css';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../components/ToastProvider';
import { FaPlus, FaMapMarkedAlt, FaEdit, FaTrash, FaWarehouse, FaMapPin } from 'react-icons/fa';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [previewLocations, setPreviewLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState([22.7196, 75.8577]);
  const [mapZoom, setMapZoom] = useState(10);
  const { notify } = useToast();

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await LocationService.getAll();
      const fetchedLocations = response || [];
      setLocations(fetchedLocations);
      
      // Auto-center map if locations exist
      if (fetchedLocations.length > 0) {
        const validLocations = fetchedLocations.filter(loc => 
          loc.latitude && loc.longitude && 
          !isNaN(Number(loc.latitude)) && !isNaN(Number(loc.longitude))
        );
        
        if (validLocations.length > 0) {
          const avgLat = validLocations.reduce((sum, loc) => sum + Number(loc.latitude), 0) / validLocations.length;
          const avgLng = validLocations.reduce((sum, loc) => sum + Number(loc.longitude), 0) / validLocations.length;
          setMapCenter([avgLat, avgLng]);
          setMapZoom(validLocations.length > 1 ? 12 : 15);
        }
      }
      
      setError('');
      notify('Locations loaded successfully', 'success', { autoClose: 1200 });
    } catch (err) {
      setError('Failed to load locations');
      notify('Failed to load locations', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await LocationService.remove(id);
        setLocations(locations.filter(location => location._id !== id));
        setError('');
        notify('Location deleted successfully', 'success');
      } catch (err) {
        const msg = err?.response?.data?.msg || 'Failed to delete location';
        setError(msg);
        notify(msg, 'error');
        console.error('Delete location error:', err?.response?.data || err);
      }
    }
  };

  const handleLocationSelect = ({ latitude, longitude, name }) => {
    setPreviewLocations([{ 
      _id: 'preview', 
      name: name || 'Selected Location', 
      latitude, 
      longitude, 
      demand: 0, 
      isDepot: false 
    }]);
  };

  const getLocationStats = () => {
    const total = locations.length;
    const depots = locations.filter(loc => loc.isDepot).length;
    const deliveryPoints = total - depots;
    const totalDemand = locations.reduce((sum, loc) => sum + (loc.demand || 0), 0);
    
    return { total, depots, deliveryPoints, totalDemand };
  };

  const stats = getLocationStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Locations</h1>
            <Link to="/locations/add" className="btn btn-primary">
              <FaPlus className="mr-2" />
              Add Location
            </Link>
          </div>
          <LoadingSkeleton lines={5} />
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
              <FaMapMarkedAlt className="inline-block mr-3 text-blue-600" />
              Locations
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Manage your delivery locations and depots
            </p>
          </div>
          <Link 
            to="/locations/add" 
            className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <FaPlus className="mr-2" />
            Add Location
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Locations</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <FaMapPin className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Depots</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.depots}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                <FaWarehouse className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Delivery Points</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.deliveryPoints}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <FaMapMarkedAlt className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Demand</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalDemand}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-6">
            <FaMapMarkedAlt className="mr-2" />
            {error}
          </div>
        )}
  
        {/* Map Section */}
        {locations.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Interactive Map
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Click on the map to add new locations or view existing ones
              </p>
            </div>
            <div className="h-96 md:h-[500px] lg:h-[600px]">
              {(() => {
                const allLocations = [...locations, ...previewLocations];
                console.log('Locations being passed to Map:', allLocations);
                console.log('Locations count:', allLocations.length);
                console.log('Sample location:', allLocations[0]);
                return (
                  <Map 
                    locations={allLocations} 
                    onLocationSelect={handleLocationSelect}
                    center={mapCenter}
                    zoom={mapZoom}
                    height="100%"
                  />
                );
              })()}
            </div>
          </div>
        )}

        {/* Locations List */}
        {locations.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-lg">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaMapMarkedAlt className="text-4xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              No locations found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Get started by adding your first delivery location or depot to begin optimizing your routes.
            </p>
            <Link 
              to="/locations/add" 
              className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <FaPlus className="mr-2" />
              Add Your First Location
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Location Details
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage and edit your delivery locations
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Coordinates
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Demand
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {locations.map((location, index) => (
                    <tr 
                      key={location._id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {location.name}
                          </div>
                          {location.address && (
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {location.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                          {Number(location?.latitude ?? 0).toFixed(6)}, {Number(location?.longitude ?? 0).toFixed(6)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {location.isDepot ? (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
                            <FaWarehouse />
                            Depot
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                            <FaMapPin />
                            Delivery Point
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {location.demand || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link 
                            to={`/locations/edit/${location._id}`} 
                            className="btn btn-secondary btn-sm"
                          >
                            <FaEdit className="mr-1" />
                            Edit
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(location._id)}
                          >
                            <FaTrash className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;