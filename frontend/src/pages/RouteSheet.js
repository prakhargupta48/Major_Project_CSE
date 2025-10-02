import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import OptimizationService from '../services/optimization.service';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import QRCode from "react-qr-code";

// Helper function to create a numbered icon for regular stops
const createNumberedIcon = (number) => {
  return L.divIcon({
    html: `<div class="map-marker-number">${number}</div>`,
    className: 'map-marker-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Custom icon for the depot (the starting point)
const depotIcon = L.icon({
  iconUrl: "https://png.pngtree.com/element_our/20190529/ourmid/pngtree-flat-warehouse-image_1199036.jpg", // A warehouse icon
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Helper function to generate a Google Maps URL from the stops
const generateGoogleMapsUrl = (stops) => {
  if (!stops || stops.length < 2) return "https://maps.google.com";
  
  const baseUrl = "https://www.google.com/maps/dir/";
  const waypoints = stops.map(s => `${s.latitude},${s.longitude}`).join('/');
  
  return baseUrl + waypoints;
};

const RouteSheet = () => {
  const { id } = useParams();
  const [optimization, setOptimization] = useState(null);
  const [openMapIndex, setOpenMapIndex] = useState(null);
  const [activeRoutePath, setActiveRoutePath] = useState([]);
  const [position, setPosition] = useState([22.7200, 75.8853]);

  useEffect(() => {
    (async () => {
      try {
        const data = await OptimizationService.get(id);
        setOptimization(data);
      } catch (e) {
        console.error("Failed to fetch optimization data:", e);
      }
    })();
  }, [id]);

  useEffect(() => {
    document.body.classList.add('print-friendly');
    return () => document.body.classList.remove('print-friendly');
  }, []);

  // Animation effect for the moving vehicle marker
  useEffect(() => {
    if (openMapIndex !== null && activeRoutePath.length > 1) {
      let segment = 0;
      let t = 0;
      const speed = 0.01;

      const interval = setInterval(() => {
        const [lat1, lng1] = activeRoutePath[segment];
        const [lat2, lng2] = activeRoutePath[(segment + 1) % activeRoutePath.length];
        const lat = lat1 + (lat2 - lat1) * t;
        const lng = lng1 + (lng2 - lng1) * t;
        setPosition([lat, lng]);
        t += speed;
        if (t > 1) {
          t = 0;
          if (segment < activeRoutePath.length - 2) {
            segment++;
          } else {
            segment = 0; // Loop the animation
          }
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [openMapIndex, activeRoutePath]);

  // Handles showing and hiding the map for a specific route
  const handleToggleMap = (route, idx) => {
    const isOpening = openMapIndex !== idx;
    if (isOpening) {
      const newPath = route.stops.map(stop => [stop.latitude, stop.longitude]);
      setActiveRoutePath(newPath);
      setOpenMapIndex(idx);
      if (newPath.length > 0) setPosition(newPath[0]);
    } else {
      setOpenMapIndex(null);
      setActiveRoutePath([]);
    }
  };

  if (!optimization) return <div className="container mx-auto px-6 py-8">Loading...</div>;

  return (
    <>
      {/* CSS for the numbered markers */}
      <style>{`
        .map-marker-number {
          background-color: #3b82f6;
          color: white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
      `}</style>

      <div className="container mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Route Sheets: {optimization.name}</h1>
        <button className="btn btn-outline mb-6" onClick={() => window.print()}>Print</button>
        <div className="grid md:grid-cols-2 gap-6">
          {optimization.routes.map((route, idx) => {
            const assignedVehicle = optimization.vehicles.find(v => v._id === route.vehicle);
            const capacityUtilization = assignedVehicle && assignedVehicle.capacity > 0
              ? Math.min((route.totalCapacity / assignedVehicle.capacity) * 100, 100)
              : 0;

            return (
              <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-lg font-semibold">Vehicle: {route.vehicleName || `Route ${idx+1}`}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Stops: {route.stops.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Distance: {route.distance.toFixed(2)} km
                    </div>
                  </div>
                  
                  <div className="p-2 bg-white rounded-lg">
                    <QRCode value={generateGoogleMapsUrl(route.stops)} size={80} />
                  </div>
                </div>

                {assignedVehicle && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs font-mono text-gray-500 dark:text-gray-400">
                      <span>Load Carried</span>
                      <span>{route.totalCapacity} / {assignedVehicle.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${capacityUtilization}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* ✅ This container ensures the content inside it has a consistent height */}
                <div className="flex-grow min-h-[250px] mb-4">
                  {/* ✅ CONDITIONAL RENDERING: Show MAP or show LIST */}
                  {openMapIndex === idx ? (
                    // If map is open, show the map container
                    <div className="rounded-lg overflow-hidden h-full w-full">
                      <MapContainer center={activeRoutePath[0]} zoom={12} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Polyline positions={activeRoutePath} color="#3b82f6" weight={5} />
                        
                        {route.stops.map((stop, stopIndex) => {
                          if (stopIndex === route.stops.length - 1 && stopIndex !== 0) return null;
                          return (
                            <Marker
                              key={stopIndex}
                              position={[stop.latitude, stop.longitude]}
                              icon={stopIndex === 0 ? depotIcon : createNumberedIcon(stopIndex)}
                            >
                              <Popup>
                                <b>{stopIndex === 0 ? 'Depot' : `Stop ${stopIndex}`}</b>: {stop.locationName}
                              </Popup>
                            </Marker>
                          );
                        })}
                        
                        <Marker
                          position={position}
                          icon={L.icon({
                            iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                            iconSize: [32, 32],
                          })}
                        />
                      </MapContainer>
                    </div>
                  ) : (
                    // If map is closed, show the list of stops
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      {route.stops.map((s, i) => (
                        <li key={i}>
                          {s.locationName} {s.demand ? `(Demand: ${s.demand})` : ''}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <button
                  className="btn btn-sm btn-primary mt-auto"
                  onClick={() => handleToggleMap(route, idx)}
                >
                  {/* ✅ The button text now clearly indicates the action */}
                  {openMapIndex === idx ? "Show Stop List" : "Show Map"}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  );
};

export default RouteSheet;