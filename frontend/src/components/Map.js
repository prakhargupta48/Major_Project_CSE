
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import LocationSearch from './LocationSearch';
import '../styles/Map.css';
import { useTheme } from '../context/ThemeContext';

// Create custom icons for different location types (emoji-based for reliability)
const createCustomIcon = (type, color) => {
  return L.divIcon({
    className: `custom-marker ${type}`,
    html: `<div style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
              <span style="color: white; font-size: 18px; font-weight: bold;">
                ${type === 'depot' ? '🏭' : type === 'vehicle' ? '🚛' : '📍'}
              </span>
            </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const createNumberedPinIcon = (color, number) => {
  return L.divIcon({
    className: 'custom-marker numbered-stop',
    html: `<div style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); position: relative;">
              <span style="color: white; font-size: 16px; font-weight: bold;">${number}</span>
              <div style="position: absolute; top: -2px; left: -2px; width: 20px; height: 20px; background: #111827; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 10px;">🚩</span>
              </div>
            </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

// Map controller component to access the map instance
const MapController = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
};

const Map = ({ 
  locations = [], 
  routes = [], 
  vehicles = [],
  onLocationSelect, 
  onMapClick,
  center = [22.7196, 75.8577],
  zoom = 13,
  height = "500px",
  useRoadNetwork = false,
  routedPolylines = {},
}) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [routeVisibility, setRouteVisibility] = useState({});
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const routeColors = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8', 
    '#33FFF6', '#FFB533', '#BD33FF', '#FF3333', '#33FF33'
  ];

  // Get vehicle by ID
  const getVehicleById = (vehicleId) => {
    return vehicles.find(v => v._id === vehicleId) || { name: 'Unknown Vehicle' };
  };

  // Handle map click
  const handleMapClick = (e) => {
    if (onMapClick) {
      const { lat, lng } = e.latlng;
      onMapClick({ latitude: lat, longitude: lng });
    }
  };

  useEffect(() => {
    // initialize visibility when routes change
    const vis = {};
    routes.forEach((_, idx) => { vis[idx] = true; });
    setRouteVisibility(vis);
  }, [routes]);

  // Theme-aware tiles
  const tileUrl = isDark 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = isDark
    ? '&copy; <a href="https://carto.com/attributions">CARTO</a> contributors &copy; OpenStreetMap'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const hasRoutes = Array.isArray(routes) && routes.length > 0;

  // Ensure all locations are properly formatted
  const validLocations = locations.filter(location => 
    location && 
    location.latitude && 
    location.longitude && 
    !isNaN(Number(location.latitude)) && 
    !isNaN(Number(location.longitude))
  );

  // Debug logging
  console.log('Map render - Locations:', validLocations.length, 'Routes:', routes.length);
  console.log('Valid locations:', validLocations);

  return (
    <div className="map-wrapper" style={{ height }}>
      {onLocationSelect && (
        <div className="map-search-container">
          <LocationSearch 
            onLocationSelect={onLocationSelect} 
            map={mapInstance} 
          />
        </div>
      )}

      <div className="map-toolbar" style={{ position: 'absolute', zIndex: 1000, right: 12, top: 12, display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
        <button className="btn btn-outline btn-sm" onClick={() => setShowRoutes((v) => !v)}>
          {showRoutes ? 'Hide Routes' : 'Show Routes'}
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => setShowVehicles((v) => !v)}>
          {showVehicles ? 'Hide Vehicles' : 'Show Vehicles'}
        </button>
        {showRoutes && hasRoutes && (
          <div className="card card-hover" style={{ padding: 8, maxHeight: 260, overflow: 'auto' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Routes</div>
            {routes.map((route, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: routeColors[idx % routeColors.length] }} />
                <input type="checkbox" checked={!!routeVisibility[idx]} onChange={() => setRouteVisibility(prev => ({ ...prev, [idx]: !prev[idx] }))} />
                <span style={{ fontSize: 12 }}>{(vehicles.find(v => v._id === route.vehicle)?.name) || route.vehicleName || `Route ${idx+1}`}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="map-container" 
        style={{ height: '100%' }}
        whenCreated={setMapInstance}
        onClick={handleMapClick}
      >
        <MapController onMapReady={setMapInstance} />
        
        <TileLayer
          url={tileUrl}
          attribution={tileAttribution}
        />
        
        {/* Always render ALL locations as markers - this fixes the issue */}
        {validLocations.map((location, index) => {
          console.log(`Rendering location ${index}:`, location.name, location.latitude, location.longitude);
          const iconColor = location.isDepot ? '#FF5733' : '#3357FF';
          return (
            <Marker 
              key={location._id || `temp-${location.latitude}-${location.longitude}`}
              position={[Number(location.latitude), Number(location.longitude)]}
              icon={createCustomIcon(
                location.isDepot ? 'depot' : 'location',
                iconColor
              )}
              zIndexOffset={500}
            >
              <Popup>
                <div className="location-popup">
                  <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                  {location.address && <p className="text-gray-600 mb-2">{location.address}</p>}
                  <p className="text-sm text-gray-500 mb-2">
                    <strong>Coordinates:</strong> {Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}
                  </p>
                  {location.isDepot && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      <span>🏭</span> Depot
                    </div>
                  )}
                  {location.demand > 0 && (
                    <p className="text-sm"><strong>Demand:</strong> {location.demand}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Render routes as polylines with stop icons */}
        {showRoutes && routes && routes.map((route, index) => {
          if (!routeVisibility[index]) return null;
          if (!route.stops || route.stops.length < 2) return null;
          const color = routeColors[index % routeColors.length];
          
          let coordinates = [];
          const routed = useRoadNetwork && routedPolylines && routedPolylines[index];
          if (routed && routed.coordinates) {
            // GeoJSON coordinates are [lng, lat]
            coordinates = routed.coordinates.map(([lng, lat]) => [lat, lng]);
          } else {
            coordinates = route.stops.map(stop => {
              const locationId = stop.locationId || (typeof stop.location === 'object' ? stop.location._id : stop.location);
              const loc = locations.find(l => l._id === locationId) || { latitude: stop.latitude, longitude: stop.longitude };
              return loc ? [Number(loc.latitude), Number(loc.longitude)] : null;
            }).filter(Boolean);
          }

          return (
            <React.Fragment key={`route-${index}`}>
              <Polyline 
                positions={coordinates}
                color={color}
                weight={5}
                opacity={0.8}
              />

              {/* Depot pins at start and end */}
              {(() => {
                const firstStop = route.stops[0];
                const lastStop = route.stops[route.stops.length - 1];
                const firstLocId = firstStop.locationId || (typeof firstStop.location === 'object' ? firstStop.location._id : firstStop.location);
                const lastLocId = lastStop.locationId || (typeof lastStop.location === 'object' ? lastStop.location._id : lastStop.location);
                const firstLoc = locations.find(l => l._id === firstLocId) || { latitude: firstStop.latitude, longitude: firstStop.longitude };
                const lastLoc = locations.find(l => l._id === lastLocId) || { latitude: lastStop.latitude, longitude: lastStop.longitude };
                const vehicle = getVehicleById(route.vehicle);
                return (
                  <>
                    <Marker
                      key={`route-${index}-start`}
                      position={[Number(firstLoc.latitude), Number(firstLoc.longitude)]}
                      icon={createCustomIcon('depot', '#FF5733')}
                      zIndexOffset={900}
                    >
                      <Popup>
                        <div className="stop-popup">
                          <h3 className="font-bold text-lg mb-2">🏭 Depot (Start)</h3>
                          <p className="text-sm mb-1"><strong>Vehicle:</strong> {vehicle.name}</p>
                          <p className="text-xs text-gray-500"><strong>Coordinates:</strong> {Number(firstLoc.latitude).toFixed(6)}, {Number(firstLoc.longitude).toFixed(6)}</p>
                        </div>
                      </Popup>
                    </Marker>
                    <Marker
                      key={`route-${index}-end`}
                      position={[Number(lastLoc.latitude), Number(lastLoc.longitude)]}
                      icon={createCustomIcon('depot', '#FF5733')}
                      zIndexOffset={900}
                    >
                      <Popup>
                        <div className="stop-popup">
                          <h3 className="font-bold text-lg mb-2">🏭 Depot (End)</h3>
                          <p className="text-sm mb-1"><strong>Vehicle:</strong> {vehicle.name}</p>
                          <p className="text-xs text-gray-500"><strong>Coordinates:</strong> {Number(lastLoc.latitude).toFixed(6)}, {Number(lastLoc.longitude).toFixed(6)}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </>
                );
              })()}

              {/* Numbered pin icons for intermediate stops */}
              {route.stops.map((stop, stopIndex) => {
                if (stopIndex === 0 || stopIndex === route.stops.length - 1) return null; // skip depot ends here
                const locationId = stop.locationId || (typeof stop.location === 'object' ? stop.location._id : stop.location);
                const loc = locations.find(l => l._id === locationId) || { latitude: stop.latitude, longitude: stop.longitude };
                if (!loc) return null;
                return (
                  <Marker
                    key={`route-${index}-stop-${stopIndex}`}
                    position={[Number(loc.latitude), Number(loc.longitude)]}
                    icon={createNumberedPinIcon(color, stopIndex)}
                    zIndexOffset={800}
                  >
                    <Popup>
                      <div className="stop-popup">
                        <h3 className="font-bold text-lg mb-2">📍 {stop.locationName || 'Stop'} (#{stopIndex})</h3>
                        {stop.demand > 0 && <p className="text-sm mb-1"><strong>Demand:</strong> {stop.demand}</p>}
                        <p className="text-xs text-gray-500"><strong>Coordinates:</strong> {Number(loc.latitude).toFixed(6)}, {Number(loc.longitude).toFixed(6)}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Vehicle markers at the start of each route */}
        {showVehicles && showRoutes && routes && routes.map((route, index) => {
          if (!route.stops || route.stops.length < 2) return null;

          const firstStop = route.stops[0];
          const locationId = firstStop.locationId || (typeof firstStop.location === 'object' ? firstStop.location._id : firstStop.location);
          const loc = locations.find(l => l._id === locationId) || { latitude: firstStop.latitude, longitude: firstStop.longitude };
          if (!loc) return null;

          const vehicle = getVehicleById(route.vehicle);
          const color = routeColors[index % routeColors.length];

          return (
            <Marker
              key={`vehicle-${index}`}
              position={[Number(loc.latitude), Number(loc.longitude)]}
              icon={L.divIcon({
                className: 'vehicle-marker',
                html: `<div style="background: linear-gradient(135deg, ${color}, ${color}dd); padding: 6px 8px; border-radius: 999px; color: white; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid white;">🚛<span class="vehicle-name">${vehicle.name}</span></div>`,
                iconSize: [120, 36],
                iconAnchor: [60, 18]
              })}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="vehicle-popup">
                  <h3 className="font-bold text-lg mb-2">🚛 {vehicle.name}</h3>
                  <p className="text-sm text-gray-600">Route #{index + 1}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
