
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import LocationSearch from './LocationSearch';
import '../styles/Map.css';
import { useTheme } from '../context/ThemeContext';

const svgPin = (fill) => (
  `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
     <path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6z" fill="${fill}" stroke="#ffffff" stroke-width="1"/>
     <circle cx="12" cy="8.5" r="2.5" fill="white"/>
   </svg>`
);

const svgTruck = (fill) => (
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
     <rect x="2" y="7" width="11" height="8" rx="1" fill="${fill}" stroke="#ffffff" stroke-width="0.75"/>
     <path d="M13 9h4l3 3v3h-7V9z" fill="${fill}" stroke="#ffffff" stroke-width="0.75"/>
     <circle cx="6" cy="17" r="2" fill="#ffffff"/>
     <circle cx="18" cy="17" r="2" fill="#ffffff"/>
   </svg>`
);

const svgFlag = (fill) => (
  `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
     <path d="M6 2v20" stroke="#ffffff" stroke-width="2"/>
     <path d="M6 3h11l-3 4 3 4H6V3z" fill="${fill}" stroke="#ffffff" stroke-width="0.75"/>
   </svg>`
);

const createCustomIcon = (color, type) => {
  const iconSvg = svgPin(color);
  return L.divIcon({
    className: `custom-marker ${type}`,
    html: `<div style="width:36px; height:36px; display:flex; align-items:center; justify-content:center;">${iconSvg}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const createNumberedPinIcon = (color, number) => {
  const pin = svgPin(color);
  const badge = `<div style="position:absolute; bottom:-2px; right:-6px; background:#111827; color:#fff; font-size:12px; line-height:18px; width:18px; height:18px; border-radius:999px; text-align:center; border:2px solid #ffffff;">${number}</div>`;
  const flag = `<div style="position:absolute; top:-2px; left:-2px;">${svgFlag('#111827')}</div>`;
  return L.divIcon({
    className: 'custom-marker numbered-stop',
    html: `<div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center;">${pin}${flag}${badge}</div>`,
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

  // Format distance
  const formatDistance = (distance) => {
    const n = Number(distance ?? 0);
    if (!isFinite(n) || n <= 0) return 'N/A';
    return `${n.toFixed(2)} km`;
  };

  // Format duration
  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    
    return hours > 0 
      ? `${hours} hr ${minutes} min` 
      : `${minutes} min`;
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
        
        {/* Render locations as markers only when there are no routes */}
        {!hasRoutes && locations && locations.map((location) => (
          <Marker 
            key={location._id || `temp-${location.latitude}-${location.longitude}`}
            position={[Number(location.latitude), Number(location.longitude)]}
            icon={createCustomIcon(
              location.isDepot ? '#FF5733' : '#3357FF', 
              location.isDepot ? 'depot' : 'location'
            )}
            zIndexOffset={500}
          >
            <Popup>
              <div className="location-popup">
                <h3>{location.name}</h3>
                <p>{location.address}</p>
                <p className="coordinates">
                  <strong>Coordinates:</strong> {Number(location?.latitude ?? 0).toFixed(6)}, {Number(location?.longitude ?? 0).toFixed(6)}
                </p>
                {location.isDepot && <p className="depot-label">Depot</p>}
                {location.demand > 0 && (
                  <p><strong>Demand:</strong> {location.demand}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
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
                      icon={createCustomIcon('#FF5733', 'depot')}
                      zIndexOffset={900}
                    >
                      <Popup>
                        <div className="stop-popup">
                          <h3>Depot (Start)</h3>
                          <p><strong>Vehicle:</strong> {vehicle.name}</p>
                          <p className="coordinates"><strong>Coordinates:</strong> {Number(firstLoc.latitude).toFixed(6)}, {Number(firstLoc.longitude).toFixed(6)}</p>
                        </div>
                      </Popup>
                    </Marker>
                    <Marker
                      key={`route-${index}-end`}
                      position={[Number(lastLoc.latitude), Number(lastLoc.longitude)]}
                      icon={createCustomIcon('#FF5733', 'depot')}
                      zIndexOffset={900}
                    >
                      <Popup>
                        <div className="stop-popup">
                          <h3>Depot (End)</h3>
                          <p><strong>Vehicle:</strong> {vehicle.name}</p>
                          <p className="coordinates"><strong>Coordinates:</strong> {Number(lastLoc.latitude).toFixed(6)}, {Number(lastLoc.longitude).toFixed(6)}</p>
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
                        <h3>{stop.locationName || 'Stop'} (#{stopIndex})</h3>
                        {stop.demand > 0 && <p><strong>Demand:</strong> {stop.demand}</p>}
                        <p className="coordinates"><strong>Coordinates:</strong> {Number(loc.latitude).toFixed(6)}, {Number(loc.longitude).toFixed(6)}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Vehicle markers at the start of each route */}
        {showRoutes && routes && routes.map((route, index) => {
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
                html: `<div style="background-color: ${color}; padding: 4px 6px; border-radius: 999px; color: white; display: inline-flex; align-items: center; gap: 6px; font-size: 12px;">${svgTruck('#ffffff')}<span class="vehicle-name">${vehicle.name}</span></div>`,
                iconSize: [100, 32],
                iconAnchor: [50, 16]
              })}
              zIndexOffset={1000}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
