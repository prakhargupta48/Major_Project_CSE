const Optimization = require('../models/Optimization');
const Vehicle = require('../models/Vehicle');
const Location = require('../models/Location');

// Get all optimizations
exports.getOptimizations = async (req, res) => {
  try {
    const optimizations = await Optimization.find({ user: req.user.id }).sort({ date: -1 });
    res.json(optimizations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get optimization by ID
exports.getOptimizationById = async (req, res) => {
  try {
    const optimization = await Optimization.findById(req.params.id);
    
    // Check if optimization exists
    if (!optimization) {
      return res.status(404).json({ msg: 'Optimization not found' });
    }
    
    // Check user
    if (optimization.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(optimization);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Optimization not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create optimization
exports.createOptimization = async (req, res) => {
  const { name, vehicleIds, locationIds } = req.body;
  
  try {
    // Get vehicles and locations
    const vehicles = await Vehicle.find({ 
      _id: { $in: vehicleIds },
      user: req.user.id
    });
    
    const locations = await Location.find({
      _id: { $in: locationIds },
      user: req.user.id
    });
    
    if (vehicles.length === 0 || locations.length === 0) {
      return res.status(400).json({ msg: 'Vehicles or locations not found' });
    }
    
    // Find depot (or use first location as depot)
    const depot = locations.find(loc => loc.isDepot) || locations[0];
    
    // Run optimization algorithm (Clarke-Wright savings algorithm)
    const routes = clarkeWrightAlgorithm(vehicles, locations, depot);
    
    // Calculate total distance
    let totalDistance = 0;
    routes.forEach(route => {
      totalDistance += route.totalDistance;
    });
    
    const newOptimization = new Optimization({
      name,
      routes,
      totalDistance,
      user: req.user.id
    });
    
    const optimization = await newOptimization.save();
    res.json(optimization);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete optimization
exports.deleteOptimization = async (req, res) => {
  try {
    const optimization = await Optimization.findById(req.params.id);
    
    // Check if optimization exists
    if (!optimization) {
      return res.status(404).json({ msg: 'Optimization not found' });
    }
    
    // Check user
    if (optimization.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await optimization.remove();
    res.json({ msg: 'Optimization removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Optimization not found' });
    }
    res.status(500).send('Server error');
  }
};

// Clarke-Wright savings algorithm for capacitated vehicle routing
function clarkeWrightAlgorithm(vehicles, locations, depot) {
  // Calculate distances between all locations
  const distances = {};
  locations.forEach(loc1 => {
    distances[loc1._id] = {};
    locations.forEach(loc2 => {
      distances[loc1._id][loc2._id] = calculateDistance(
        loc1.latitude, loc1.longitude,
        loc2.latitude, loc2.longitude
      );
    });
  });
  
  // Calculate savings for each location pair
  const savings = [];
  locations.forEach(loc1 => {
    if (loc1._id.toString() === depot._id.toString()) return;
    
    locations.forEach(loc2 => {
      if (loc2._id.toString() === depot._id.toString() || 
          loc1._id.toString() === loc2._id.toString()) return;
      
      const saving = distances[depot._id][loc1._id] + 
                    distances[depot._id][loc2._id] - 
                    distances[loc1._id][loc2._id];
      
      savings.push({
        loc1: loc1,
        loc2: loc2,
        saving
      });
    });
  });
  
  // Sort savings in descending order
  savings.sort((a, b) => b.saving - a.saving);
  
  // Initialize routes (one per location excluding depot)
  const routes = [];
  const nonDepotLocations = locations.filter(loc => 
    loc._id.toString() !== depot._id.toString()
  );
  
  // Assign vehicles to routes
  let vehicleIndex = 0;
  const availableVehicles = [];
  
  vehicles.forEach(vehicle => {
    for (let i = 0; i < vehicle.count; i++) {
      availableVehicles.push({
        ...vehicle.toObject(),
        remainingCapacity: vehicle.capacity
      });
    }
  });
  
  // Create initial routes (depot -> location -> depot)
  nonDepotLocations.forEach(location => {
    if (vehicleIndex >= availableVehicles.length) return;
    
    const vehicle = availableVehicles[vehicleIndex];
    
    // Skip if location demand exceeds vehicle capacity
    if (location.demand > vehicle.remainingCapacity) return;
    
    const route = {
      vehicleId: vehicle._id,
      vehicleName: vehicle.name,
      stops: [
        {
          locationId: depot._id,
          locationName: depot.name,
          latitude: depot.latitude,
          longitude: depot.longitude,
          demand: depot.demand,
          order: 0
        },
        {
          locationId: location._id,
          locationName: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          demand: location.demand,
          order: 1
        },
        {
          locationId: depot._id,
          locationName: depot.name,
          latitude: depot.latitude,
          longitude: depot.longitude,
          demand: depot.demand,
          order: 2
        }
      ],
      totalDistance: distances[depot._id][location._id] * 2,
      totalCapacity: location.demand
    };
    
    routes.push(route);
    vehicle.remainingCapacity -= location.demand;
    vehicleIndex++;
  });
  
  // Merge routes based on savings
  savings.forEach(saving => {
    const { loc1, loc2 } = saving;
    
    // Find routes containing loc1 and loc2
    let route1 = null, route2 = null;
    
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      
      // Check if route contains loc1
      const containsLoc1 = route.stops.some(stop => 
        stop.locationId.toString() === loc1._id.toString()
      );
      
      // Check if route contains loc2
      const containsLoc2 = route.stops.some(stop => 
        stop.locationId.toString() === loc2._id.toString()
      );
      
      if (containsLoc1 && !route1) route1 = { index: i, route };
      if (containsLoc2 && !route2) route2 = { index: i, route };
      
      if (route1 && route2) break;
    }
    
    // Skip if either location is not in a route
    if (!route1 || !route2) return;
    
    // Skip if both locations are in the same route
    if (route1.index === route2.index) return;
    
    // Check if routes can be merged (capacity constraint)
    const totalDemand = route1.route.totalCapacity + route2.route.totalCapacity;
    const vehicle = availableVehicles.find(v => 
      v._id.toString() === route1.route.vehicleId.toString()
    );
    
    if (!vehicle || totalDemand > vehicle.capacity) return;
    
    // Merge routes
    const newStops = [];
    let order = 0;
    
    // Add depot as first stop
    newStops.push({
      ...route1.route.stops[0],
      order: order++
    });
    
    // Add stops from route1 (excluding depot)
    route1.route.stops.slice(1, -1).forEach(stop => {
      newStops.push({
        ...stop,
        order: order++
      });
    });
    
    // Add stops from route2 (excluding depot)
    route2.route.stops.slice(1, -1).forEach(stop => {
      newStops.push({
        ...stop,
        order: order++
      });
    });
    
    // Add depot as last stop
    newStops.push({
      ...route1.route.stops[0],
      order: order
    });
    
    // Calculate new total distance
    let totalDistance = 0;
    for (let i = 0; i < newStops.length - 1; i++) {
      const from = newStops[i];
      const to = newStops[i + 1];
      totalDistance += distances[from.locationId][to.locationId];
    }
    
    // Create merged route
    const mergedRoute = {
      vehicleId: route1.route.vehicleId,
      vehicleName: route1.route.vehicleName,
      stops: newStops,
      totalDistance,
      totalCapacity: totalDemand
    };
    
    // Update vehicle capacity
    vehicle.remainingCapacity = vehicle.capacity - totalDemand;
    
    // Remove old routes and add merged route
    routes.splice(Math.max(route1.index, route2.index), 1);
    routes.splice(Math.min(route1.index, route2.index), 1, mergedRoute);
  });
  
  return routes;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}