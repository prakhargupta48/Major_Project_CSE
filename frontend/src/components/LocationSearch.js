// client/src/components/LocationSearch.js
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import '../styles/LocationSearch.css';

const LocationSearch = ({ onLocationSelect, map }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (map && !geocoderRef.current) {
      // Initialize the geocoder control
      geocoderRef.current = L.Control.geocoder({
        defaultMarkGeocode: false,
        placeholder: 'Search for a location...',
        errorMessage: 'Nothing found.',
        suggestMinLength: 3,
        suggestTimeout: 250,
        queryMinLength: 1
      }).on('markgeocode', function(e) {
        const { center, name, bbox } = e.geocode;
        
        // Create a location object with the geocoded data
        const location = {
          name: name,
          address: name,
          latitude: center.lat,
          longitude: center.lng,
          bbox: bbox
        };
        
        // Call the callback with the selected location
        onLocationSelect(location);
        
        // Clear the search results
        setSearchResults([]);
        setSearchTerm('');
        
        // Fly to the location
        map.fitBounds(bbox);
      });
      
      // Add the geocoder to the map
      geocoderRef.current.addTo(map);
    }
    
    return () => {
      if (map && geocoderRef.current) {
        geocoderRef.current.remove();
        geocoderRef.current = null;
      }
    };
  }, [map, onLocationSelect]);

  // Manual search function as a backup
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Using Nominatim API for geocoding (free and open-source)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError('Error searching for location. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (result) => {
    const location = {
      name: result.display_name.split(',')[0],
      address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    };
    
    onLocationSelect(location);
    setSearchResults([]);
    setSearchTerm('');
    
    // Fly to the location
    if (map) {
      map.flyTo([location.latitude, location.longitude], 15);
    }
  };

  return (
    <div className="location-search">
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a location..."
          className="search-input"
          ref={searchRef}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          className="search-button" 
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner"></span>
          ) : (
            <i className="fas fa-search"></i>
          )}
        </button>
      </div>
      
      {error && <div className="search-error">{error}</div>}
      
      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map((result) => (
            <li 
              key={result.place_id} 
              onClick={() => handleLocationSelect(result)}
              className="search-result-item"
            >
              <div className="result-name">{result.display_name.split(',')[0]}</div>
              <div className="result-address">{result.display_name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;