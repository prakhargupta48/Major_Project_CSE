const ortools = require('ortools-node');
const axios = require('axios');

// --- 1. Get Distance Matrix from OpenRouteService ---
async function getDistanceMatrix(locations, apiKey) {
  if (!apiKey) {
    throw new Error('OpenRouteService API key is required.');
  }
  // ORS expects coordinates in [longitude, latitude] format
  const coordinates = locations.map(loc => [loc.longitude, loc.latitude]);

  try {
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/matrix/driving-car', {
        locations: coordinates,
        metrics: ['distance'],
        units: 'm',
      }, {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    // Convert the array-of-arrays to a more stable object-of-objects format
    const distances = response.data.distances;
    const distanceMatrix = {};
    for (let i = 0; i < distances.length; i++) {
      distanceMatrix[i] = {};
      for (let j = 0; j < distances[i].length; j++) {
        // Use a large number for unreachable locations
        distanceMatrix[i][j] = distances[i][j] === null ? 9999999 : Math.round(distances[i][j]);
      }
    }
    return distanceMatrix;
  } catch (error) {
    console.error('Error fetching distance matrix from ORS:', error.response ? error.response.data : error.message);
    return null;
  }
}

// --- 2. Solve the CVRP using OR-Tools ---
function solveCVRP(distanceMatrix, vehicles, demands, locationNames, timeLimitSeconds = 15) {
  const numLocations = locationNames.length;
  const numVehicles = vehicles.length;
  const depotIndex = 0;

  const manager = new ortools.RoutingIndexManager(numLocations, numVehicles, depotIndex);
  const routing = new ortools.RoutingModel(manager);

  // Distance Callback
  const distanceCallback = (fromIndex, toIndex) => {
    const fromNode = manager.indexToNode(fromIndex);
    const toNode = manager.indexToNode(toIndex);
    return distanceMatrix[fromNode][toNode];
  };
  const transitCallback = routing.registerTransitCallback(distanceCallback);
  routing.setArcCostEvaluatorOfAllVehicles(transitCallback);

  // Demand (Capacity) Callback
  const demandCallback = (fromIndex) => {
    const fromNode = manager.indexToNode(fromIndex);
    return demands[fromNode];
  };
  const demandCallbackIndex = routing.registerUnaryTransitCallback(demandCallback);
  routing.addDimensionWithVehicleCapacity(
    demandCallbackIndex,
    0, // null capacity slack
    vehicles.map(v => v.capacity), // array of vehicle capacities
    true, // start cumul to zero
    'Capacity'
  );

  // Search Parameters
  const searchParameters = ortools.main.defaultRoutingSearchParameters();
  searchParameters.time_limit = { seconds: timeLimitSeconds };
  searchParameters.local_search_metaheuristic = ortools.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH;
  searchParameters.first_solution_strategy = ortools.FirstSolutionStrategy.PATH_CHEAPEST_ARC;

  const solution = routing.solveWithParameters(searchParameters);

  if (!solution) {
    console.warn('OR-Tools solver could not find a solution.');
    return null;
  }

  // Process the solution
  const results = [];
  for (let i = 0; i < numVehicles; i++) {
    let index = routing.start(i);
    if (routing.isEnd(solution.value(routing.nextVar(index)))) {
      continue; // Skip unused vehicles
    }

    const path = [];
    let routeLoad = 0;
    while (!routing.isEnd(index)) {
      const nodeIndex = manager.indexToNode(index);
      path.push(nodeIndex);
      if (nodeIndex !== depotIndex) {
        routeLoad += demands[nodeIndex];
      }
      index = solution.value(routing.nextVar(index));
    }
    path.push(manager.indexToNode(index)); // Add final depot stop

    if (path.length > 2) {
      let routeDistanceMeters = 0;
      for (let j = 0; j < path.length - 1; j++) {
        routeDistanceMeters += distanceMatrix[path[j]][path[j + 1]];
      }

      const vehicle = vehicles[i];
      const distanceKm = Math.round((routeDistanceMeters / 1000) * 100) / 100;

      results.push({
        "Vehicle ID": vehicle.id,
        "Vehicle Capacity": vehicle.capacity,
        "Route Indices": path,
        "Route": path.map(nodeIdx => locationNames[nodeIdx]).join(' → '),
        "Load Carried": routeLoad,
        "Distance (km)": distanceKm,
        // You can add cost calculations here if needed
      });
    }
  }
  return results;
}

// --- 3. Compute Route Geometries for Mapping ---
async function computeRouteGeometries(locations, optimizedData, apiKey) {
  const getSegment = async (startCoord, endCoord) => {
    try {
      const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
          coordinates: [
            [startCoord.longitude, startCoord.latitude],
            [endCoord.longitude, endCoord.latitude],
          ],
        }, {
          headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
        }
      );
      // ORS returns [lon, lat], convert to [lat, lon] for Leaflet/frontend
      return response.data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
    } catch (error) {
      console.warn('ORS directions API failed for a segment. Falling back to straight line.');
      return [
        [startCoord.latitude, startCoord.longitude],
        [endCoord.latitude, endCoord.longitude],
      ];
    }
  };

  for (const route of optimizedData) {
    const pathIndices = route["Route Indices"] || [];
    const fullCoords = [];
    if (pathIndices.length > 1) {
      for (let i = 0; i < pathIndices.length - 1; i++) {
        const startLoc = locations[pathIndices[i]];
        const endLoc = locations[pathIndices[i + 1]];
        const segment = await getSegment(startLoc, endLoc);
        if (fullCoords.length === 0) {
          fullCoords.push(...segment);
        } else {
          fullCoords.push(...segment.slice(1)); // Avoid duplicate points
        }
      }
    }
    route["Route Geometry"] = fullCoords;
  }
  return optimizedData;
}


module.exports = {
  getDistanceMatrix,
  solveCVRP,
  computeRouteGeometries
};