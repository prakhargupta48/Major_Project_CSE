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
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);
  const geocoderRef = useRef(null);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('locationSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search to history
  const saveToHistory = (searchTerm) => {
    const newHistory = [
      searchTerm,
      ...searchHistory.filter(item => item !== searchTerm)
    ].slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(newHistory);
    localStorage.setItem('locationSearchHistory', JSON.stringify(newHistory));
  };

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
    
    // Save search term to history
    saveToHistory(searchTerm);
    
    onLocationSelect(location);
    setSearchResults([]);
    setSearchTerm('');
    setShowHistory(false);
    
    // Fly to the location
    if (map) {
      map.setView([location.latitude, location.longitude], 15);
    }
  };

  const handleHistorySelect = (historyItem) => {
    setSearchTerm(historyItem);
    setShowHistory(false);
    handleSearch();
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('locationSearchHistory');
  };

  return (
    <div className="location-search-container" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          placeholder="Search for a location..."
          className="search-input"
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading || !searchTerm.trim()}
          className="search-button"
        >
          {isLoading ? '🔍' : '🔍'}
        </button>
      </div>

      {/* Search History */}
      {showHistory && searchHistory.length > 0 && (
        <div className="search-history">
          <div className="history-header">
            <span>Recent Searches</span>
            <button onClick={clearHistory} className="clear-history-btn">
              Clear
            </button>
          </div>
          {searchHistory.map((item, index) => (
            <div
              key={index}
              className="history-item"
              onClick={() => handleHistorySelect(item)}
            >
              <span className="history-icon">🕒</span>
              <span className="history-text">{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="search-result-item"
              onClick={() => handleLocationSelect(result)}
            >
              <div className="result-name">{result.display_name.split(',')[0]}</div>
              <div className="result-address">{result.display_name}</div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="search-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;