require('dotenv').config();
const axios = require('axios');

async function getDistanceORS(lat1, lon1, lat2, lon2) {
  try {
    const res = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        coordinates: [
          [lon1, lat1],
          [lon2, lat2]
        ]
      },
      {
        headers: { Authorization: process.env.ORS_API_KEY }
      }
    );

    const distanceMeters = res.data.features[0].properties.summary.distance;
    return distanceMeters / 1000; // km
  } catch (err) {
    console.warn('ORS API failed, using fallback Haversine:', err.message);

    // Haversine fallback
    const toRad = (deg) => deg * Math.PI / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat/2)**2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R;
  }
}

// Example usage
(async () => {
  const km = await getDistanceORS(22.7200, 75.8853, 22.7512, 75.8935);
  console.log('Distance (km):', km.toFixed(3));
})();
