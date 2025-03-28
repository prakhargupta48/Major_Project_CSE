import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Map.css';

const Map = ({ locations, routes }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers and routes
    mapInstanceRef.current.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add location markers
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds();
      
      locations.forEach(location => {
        const marker = L.marker([location.latitude, location.longitude])
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>${location.name}</b><br>Demand: ${location.demand || 0}`);
        
        bounds.extend([location.latitude, location.longitude]);
      });
      
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Add route lines
    if (routes && routes.length > 0) {
      const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8', '#33FFF6'];
      
      routes.forEach((route, index) => {
        const color = colors[index % colors.length];
        const points = route.stops.map(stop => [stop.latitude, stop.longitude]);
        
        L.polyline(points, { color, weight: 3 })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Route ${index + 1}</b><br>Vehicle: ${route.vehicleName}`);
      });
    }

    return () => {
      // No cleanup needed as we're reusing the map instance
    };
  }, [locations, routes]);

  return <div ref={mapRef} className="map-container" />;
};

export default Map;