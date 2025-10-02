const Optimization = require('../models/Optimization');
const Vehicle = require('../models/Vehicle');
const Location = require('../models/Location');

// Global constants
const SPEED_KMH = 40; // average speed for duration estimation

// Get all optimizations
exports.getOptimizations = async (req, res) => {
  try {
    const optimizations = await Optimization.find({ user: req.user.id })
      .populate('vehicles')
      .populate('locations')
      .sort({ date: -1 });
    res.json(optimizations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get optimization by ID
exports.getOptimizationById = async (req, res) => {
  try {
    const optimization = await Optimization.findById(req.params.id)
      .populate('vehicles')
      .populate('locations');
    
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

// Create optimization with algorithm comparison or single algorithm
exports.createOptimization = async (req, res) => {
  const { name, vehicleIds, locationIds, algorithm, runComparison = false } = req.body;

  try {
    // Validate input data
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ msg: 'Valid optimization name is required' });
    }

    if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return res.status(400).json({ msg: 'At least one vehicle must be selected' });
    }

    if (!Array.isArray(locationIds) || locationIds.length === 0) {
      return res.status(400).json({ msg: 'At least one location must be selected' });
    }

    // Validate dataset size for performance
    if (locationIds.length > 100) {
      return res.status(400).json({ msg: 'Maximum 100 locations allowed for optimization. Please reduce the number of locations.' });
    }

    if (vehicleIds.length > 20) {
      return res.status(400).json({ msg: 'Maximum 20 vehicles allowed for optimization. Please reduce the number of vehicles.' });
    }

    // Performance monitoring
    const startOptimizationTime = Date.now();
    console.log(`Starting optimization with ${locationIds.length} locations and ${vehicleIds.length} vehicles`);

    // Get vehicles and locations
    const vehicles = await Vehicle.find({
      _id: { $in: vehicleIds },
      user: req.user.id
    });
    // console.log(vehicles)

    const locations = await Location.find({
      _id: { $in: locationIds },
      user: req.user.id
    });
    // console.log(locations)

    if (vehicles.length === 0) {
      return res.status(400).json({ msg: 'No valid vehicles found. Please check your vehicle selection.' });
    }

    if (locations.length === 0) {
      return res.status(400).json({ msg: 'No valid locations found. Please check your location selection.' });
    }

    // Find depot (or use first location as depot)
    const depot = locations.find(loc => loc.isDepot) || locations[0];

    // Validate that we have at least one depot
    if (!locations.find(loc => loc.isDepot)) {
      return res.status(400).json({ msg: 'At least one location must be marked as a depot' });
    }

    // Calculate total vehicle capacity upfront
    const totalVehicleCapacity = vehicles.reduce((sum, v) => sum + ((v.capacity || 0) * (v.count || 1)), 0);

    // Map frontend algorithm names to backend functions (removed sweep algorithm)
    const algorithmMap = {
      'clarke-wright': { name: 'Clarke-Wright Savings', function: clarkeWrightAlgorithm },
      'nearest-neighbor': { name: 'Nearest Neighbor', function: nearestNeighborAlgorithm },
      'enhanced-clarke-wright': { name: 'Enhanced Clarke-Wright', function: enhancedClarkeWrightAlgorithm },
      'genetic': { name: 'Genetic Algorithm VRP', function: geneticAlgorithmVRP },
      'tabu-search': { name: 'Tabu Search VRP', function: tabuSearchVRP },
      'simulated-annealing': { name: 'Simulated Annealing VRP', function: simulatedAnnealingVRP },
      'ant-colony': { name: 'Ant Colony Optimization VRP', function: antColonyOptimizationVRP },
      'or-tools': { name: 'Google OR-Tools VRP', function: orToolsAlgorithm }
    };

    const algorithmResults = [];

    if (runComparison) {
      // Run all algorithms for comparison
      console.log('Running algorithm comparison...');

      for (const [key, algo] of Object.entries(algorithmMap)) {
        try {
          console.log(`Running ${algo.name}...`);
          const startTime = Date.now();

          // Run algorithm without timeout to ensure completion
          const routes = await Promise.resolve(algo.function(vehicles, locations, depot));

          const executionTime = Date.now() - startTime;

          // Calculate total distance and duration
          let totalDistance = 0;
          let totalDuration = 0;
          let totalDemandServed = 0;
          const servedLocationIds = new Set();

          routes.forEach(route => {
            totalDistance += route.distance || 0;
            totalDuration += route.duration || 0;
            // Calculate total demand served
            totalDemandServed += route.totalCapacity || 0;

            // Collect unique location IDs served (excluding depot)
            route.stops.forEach(stop => {
              if (stop.locationId && stop.locationId.toString() !== depot._id.toString()) {
                servedLocationIds.add(stop.locationId.toString());
              }
            });
          });

          const totalLocationsServed = servedLocationIds.size;
          const totalLocations = locations.filter(l => !l.isDepot).length;
          const coveragePercentage = totalLocations > 0 ? (totalLocationsServed / totalLocations) * 100 : 0;

          // Calculate vehicle utilization
          const totalVehicleCapacity = vehicles.reduce((sum, v) => sum + ((v.capacity || 0) * (v.count || 1)), 0);
          const vehicleUtilization = totalVehicleCapacity > 0 ? (totalDemandServed / totalVehicleCapacity) * 100 : 0;

          algorithmResults.push({
            algorithm: algo.name,
            algorithmKey: key,
            routes,
            totalDistance,
            totalDuration,
            executionTime,
            totalLocationsServed,
            totalDemandServed,
            coveragePercentage,
            totalLocations: totalLocations,
            vehicleUtilization,
            totalVehicleCapacity,
            routesCount: routes.length,
            averageRouteDistance: routes.length > 0 ? totalDistance / routes.length : 0,
            averageRouteDuration: routes.length > 0 ? totalDuration / routes.length : 0
          });

          console.log(`${algo.name} completed in ${executionTime}ms with distance ${totalDistance}km, serving ${totalLocationsServed}/${totalLocations} locations (${coveragePercentage.toFixed(1)}% coverage)`);

          // Validate algorithm results
          if (routes.length === 0) {
            console.warn(`${algo.name} returned no routes - this may indicate an algorithm issue`);
          }

          if (totalLocationsServed === 0 && totalLocations > 0) {
            console.warn(`${algo.name} served no locations - check algorithm implementation`);
          }
        } catch (algoErr) {
          console.error(`Error running ${algo.name}:`, algoErr);
          // Continue with other algorithms instead of failing completely
          const totalLocations = locations.filter(l => !l.isDepot).length;
          algorithmResults.push({
            algorithm: algo.name,
            algorithmKey: key,
            routes: [],
            totalDistance: 0,
            totalDuration: 0,
            executionTime: 0,
            totalLocationsServed: 0,
            totalDemandServed: 0,
            coveragePercentage: 0,
            totalLocations: totalLocations,
            vehicleUtilization: 0,
            totalVehicleCapacity: totalVehicleCapacity,
            routesCount: 0,
            averageRouteDistance: 0,
            averageRouteDuration: 0,
            error: algoErr.message
          });
        }
      }

      // Find the best result prioritizing coverage over distance
      const validResults = algorithmResults.filter(r => !r.error);

      let bestResult;
      if (validResults.length > 0) {
        // Step 1: Find maximum coverage achieved
        const maxCoverage = Math.max(...validResults.map(r => r.coveragePercentage || 0));

        // Step 2: Get all algorithms that achieve maximum coverage
        const maxCoverageResults = validResults.filter(r => (r.coveragePercentage || 0) === maxCoverage);

        if (maxCoverageResults.length === 1) {
          // Only one algorithm achieves max coverage
          bestResult = maxCoverageResults[0];
        } else {
          // Multiple algorithms achieve max coverage, choose the one with minimum distance
          bestResult = maxCoverageResults.reduce((best, current) => {
            return (current.totalDistance || Infinity) < (best.totalDistance || Infinity) ? current : best;
          });
        }

        console.log(`Algorithm selection process:`);
        console.log(`- Maximum coverage achieved: ${maxCoverage}%`);
        console.log(`- Algorithms with max coverage: ${maxCoverageResults.map(r => r.algorithm).join(', ')}`);
        console.log(`- Selected algorithm: ${bestResult.algorithm} (Coverage: ${bestResult.coveragePercentage}%, Distance: ${bestResult.totalDistance}km)`);

        // Log ranking for reference
        const rankedResults = validResults
          .sort((a, b) => {
            // Primary sort: coverage (descending)
            if ((a.coveragePercentage || 0) !== (b.coveragePercentage || 0)) {
              return (b.coveragePercentage || 0) - (a.coveragePercentage || 0);
            }
            // Secondary sort: distance (ascending)
            return (a.totalDistance || Infinity) - (b.totalDistance || Infinity);
          });

        console.log(`Full ranking by coverage then distance:`);
        rankedResults.forEach((result, index) => {
          console.log(`${index + 1}. ${result.algorithm}: Coverage ${(result.coveragePercentage || 0).toFixed(1)}%, Distance ${result.totalDistance}km`);
        });
      } else {
        bestResult = algorithmResults[0];
      }

      // Use the best result for legacy fields
      const result = bestResult;

      const newOptimization = new Optimization({
        name,
        vehicles: vehicleIds,
        locations: locationIds,
        algorithmResults,
        selectedAlgorithm: bestResult.algorithmKey,
        // Legacy fields for backward compatibility
        routes: result.routes,
        totalDistance: result.totalDistance,
        totalDuration: result.totalDuration,
        user: req.user.id
      });

      const optimization = await newOptimization.save();

      // Populate the response
      const populatedOptimization = await Optimization.findById(optimization._id)
        .populate('vehicles')
        .populate('locations');

      res.json({
        ...populatedOptimization.toObject(),
        comparisonRun: true,
        bestAlgorithm: bestResult.algorithmKey
      });

    } else {
      // Run single selected algorithm
      const selectedAlgo = algorithmMap[algorithm] || algorithmMap['clarke-wright'];

      // Run the selected algorithm with error handling
      try {
        const startTime = Date.now();

        // Run algorithm without timeout to ensure completion
        const routes = await Promise.resolve(selectedAlgo.function(vehicles, locations, depot));

        const executionTime = Date.now() - startTime;

// Assign vehicles to routes
const speedKmh = SPEED_KMH;
        // Assign vehicles to routes
        const routesWithVehicles = assignVehiclesToRoutes(routes, vehicles, {}, speedKmh);

        // Calculate total distance and duration
        let totalDistance = 0;
        let totalDuration = 0;
        let totalDemandServed = 0;
        const servedLocationIds = new Set();

        routesWithVehicles.forEach(route => {
          totalDistance += route.distance || 0;
          totalDuration += route.duration || 0;
          totalDemandServed += route.totalCapacity || 0;

          // Collect unique location IDs served (excluding depot)
          route.stops.forEach(stop => {
            if (stop.locationId && stop.locationId.toString() !== depot._id.toString()) {
              servedLocationIds.add(stop.locationId.toString());
            }
          });
        });

        const totalLocationsServed = servedLocationIds.size;
        const totalLocations = locations.filter(l => !l.isDepot).length;
        const coveragePercentage = totalLocations > 0 ? (totalLocationsServed / totalLocations) * 100 : 0;

        // Calculate vehicle utilization
        const totalVehicleCapacity = vehicles.reduce((sum, v) => sum + ((v.capacity || 0) * (v.count || 1)), 0);
        const vehicleUtilization = totalVehicleCapacity > 0 ? (totalDemandServed / totalVehicleCapacity) * 100 : 0;

        algorithmResults.push({
          algorithm: selectedAlgo.name,
          algorithmKey: algorithm,
          routes: routesWithVehicles,
          totalDistance,
          totalDuration,
          executionTime,
          totalLocationsServed,
          totalDemandServed,
          coveragePercentage,
          totalLocations: totalLocations,
          vehicleUtilization,
          totalVehicleCapacity,
          routesCount: routesWithVehicles.length,
          averageRouteDistance: routesWithVehicles.length > 0 ? totalDistance / routesWithVehicles.length : 0,
          averageRouteDuration: routesWithVehicles.length > 0 ? totalDuration / routesWithVehicles.length : 0
        });
      } catch (algoErr) {
        console.error(`Error running ${selectedAlgo.name}:`, algoErr);
        return res.status(500).json({ msg: `Algorithm execution failed: ${algoErr.message}` });
      }

      // Use the result for legacy fields
      const result = algorithmResults[0];

      const newOptimization = new Optimization({
        name,
        vehicles: vehicleIds,
        locations: locationIds,
        algorithmResults,
        selectedAlgorithm: algorithm,
        // Legacy fields for backward compatibility
        routes: result.routes,
        totalDistance: result.totalDistance,
        totalDuration: result.totalDuration,
        user: req.user.id
      });

      const optimization = await newOptimization.save();

      // Populate the response
      const populatedOptimization = await Optimization.findById(optimization._id)
        .populate('vehicles')
        .populate('locations');

      // Log final performance summary
      const totalOptimizationTime = Date.now() - startOptimizationTime;
      console.log(`Optimization completed in ${totalOptimizationTime}ms`);
      console.log(`Processed ${locationIds.length} locations with ${vehicleIds.length} vehicles`);

      res.json(populatedOptimization);
    }
  } catch (err) {
    console.error('Optimization creation error:', err.message);
    res.status(500).json({ msg: 'Server error during optimization creation' });
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
    
    await Optimization.deleteOne({ _id: req.params.id, user: req.user.id });
    res.json({ msg: 'Optimization removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Optimization not found' });
    }
    res.status(500).send('Server error');
  }
};

// Enhanced Clarke-Wright algorithm with proper endpoint merges, capacity checks, and post-assignment
function clarkeWrightAlgorithm(vehicles, locations, depot) {
  console.log("1")
  const speedKmh = 40; // average speed for duration estimation

  const toId = (objId) => objId.toString();

  // Build distance matrix keyed by string ids
  const distances = {};
  const allIds = locations.map((l) => toId(l._id));
  locations.forEach((l1) => {
    const id1 = toId(l1._id);
    distances[id1] = {};
    locations.forEach((l2) => {
      const id2 = toId(l2._id);
      distances[id1][id2] = calculateDistance(
        l1.latitude,
        l1.longitude,
        l2.latitude,
        l2.longitude
      );
    });
  });

  const depotId = toId(depot._id);
  const nonDepot = locations.filter((l) => toId(l._id) !== depotId);

  // Initial routes: depot -> i -> depot
  const makeDepotStop = (order) => ({
    locationId: depot._id,
    locationName: depot.name,
    latitude: depot.latitude,
    longitude: depot.longitude,
    demand: depot.demand || 0,
    order
  });

  const routes = nonDepot.map((loc) => {
    const stops = [
      makeDepotStop(0),
      {
        locationId: loc._id,
        locationName: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        demand: loc.demand || 0,
        order: 1
      },
      makeDepotStop(2)
    ];
    const distance = distances[depotId][toId(loc._id)] * 2;
    const duration = Math.round((distance / speedKmh) * 60);
    return {
      vehicle: undefined,
      vehicleName: 'Unassigned',
      stops,
      distance,
      duration,
      totalCapacity: loc.demand || 0
    };
  });

  // Savings list
  const savings = [];
  for (let i = 0; i < nonDepot.length; i++) {
    for (let j = i + 1; j < nonDepot.length; j++) {
      const li = nonDepot[i];
      const lj = nonDepot[j];
      const idI = toId(li._id);
      const idJ = toId(lj._id);
      const saving =
        distances[depotId][idI] + distances[depotId][idJ] - distances[idI][idJ];
      savings.push({ i: li, j: lj, saving });
    }
  }
  savings.sort((a, b) => b.saving - a.saving);

  const maxCapacity = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.capacity || 0)) : 0;

  const findRouteIndexByLocation = (idStr) => {
    for (let r = 0; r < routes.length; r++) {
      const rt = routes[r];
      const foundIdx = rt.stops.findIndex((s) => toId(s.locationId) === idStr);
      if (foundIdx !== -1) {
        return { routeIndex: r, stopIndex: foundIdx };
      }
    }
    return null;
  };

  const isStartEndpoint = (rt, idx) => idx === 1; // first non-depot
  const isEndEndpoint = (rt, idx) => idx === rt.stops.length - 2; // last non-depot

  const recomputeRouteMetrics = (rt) => {
    let dist = 0;
    for (let k = 0; k < rt.stops.length - 1; k++) {
      const from = rt.stops[k];
      const to = rt.stops[k + 1];
      const fromId = toId(from.locationId);
      const toIdStr = toId(to.locationId);
      dist += distances[fromId]?.[toIdStr] ?? calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);
    }
    rt.distance = dist;
    rt.duration = Math.round((dist / speedKmh) * 60);
  };

  // Merge using savings
  for (const s of savings) {
    const idI = toId(s.i._id);
    const idJ = toId(s.j._id);

    const posI = findRouteIndexByLocation(idI);
    const posJ = findRouteIndexByLocation(idJ);
    if (!posI || !posJ) continue;
    if (posI.routeIndex === posJ.routeIndex) continue;

    const r1 = routes[posI.routeIndex];
    const r2 = routes[posJ.routeIndex];

    const iAtEndOfR1 = isEndEndpoint(r1, posI.stopIndex);
    const iAtStartOfR1 = isStartEndpoint(r1, posI.stopIndex);
    const jAtEndOfR2 = isEndEndpoint(r2, posJ.stopIndex);
    const jAtStartOfR2 = isStartEndpoint(r2, posJ.stopIndex);

    let newStops = null;

    // Case 1: i at end of r1, j at start of r2 -> r1 + r2
    if (iAtEndOfR1 && jAtStartOfR2) {
      newStops = [
        ...r1.stops.slice(0, -1), // r1 without final depot
        ...r2.stops.slice(1) // r2 without initial depot
      ];
    }
    // Case 2: j at end of r2, i at start of r1 -> r2 + r1
    else if (jAtEndOfR2 && iAtStartOfR1) {
      newStops = [
        ...r2.stops.slice(0, -1),
        ...r1.stops.slice(1)
      ];
    }

    if (!newStops) continue; // endpoints not mergeable per CW

    const combinedDemand = (r1.totalCapacity || 0) + (r2.totalCapacity || 0);
    if (combinedDemand > maxCapacity) continue;

    // Reorder with updated orders
    newStops = newStops.map((st, idx) => ({ ...st, order: idx }));
    const merged = {
      vehicle: undefined,
      vehicleName: 'Unassigned',
      stops: newStops,
      distance: 0,
      duration: 0,
      totalCapacity: combinedDemand
    };
    recomputeRouteMetrics(merged);

    // Replace two routes with merged
    const idxToRemove = Math.max(posI.routeIndex, posJ.routeIndex);
    const idxToReplace = Math.min(posI.routeIndex, posJ.routeIndex);
    routes.splice(idxToRemove, 1);
    routes.splice(idxToReplace, 1, merged);
  }

  // If more routes than available vehicles, try to merge smallest-demand routes while feasible
  const totalVehicleSlots = vehicles.reduce((sum, v) => sum + (v.count || 0), 0);
  if (Number.isFinite(totalVehicleSlots) && totalVehicleSlots > 0) {
    let guard = 0;
    while (routes.length > totalVehicleSlots && guard < 1000) {
      guard++;
      // sort by demand asc
      routes.sort((a, b) => (a.totalCapacity || 0) - (b.totalCapacity || 0));
      let mergedAny = false;
      for (let a = 0; a < routes.length - 1; a++) {
        for (let b = a + 1; b < routes.length; b++) {
          const ra = routes[a];
          const rb = routes[b];
          if ((ra.totalCapacity || 0) + (rb.totalCapacity || 0) > maxCapacity) continue;
          // attempt endpoint merge ra end + rb start or rb end + ra start
          const raEndId = toId(ra.stops[ra.stops.length - 2].locationId);
          const raStartId = toId(ra.stops[1].locationId);
          const rbEndId = toId(rb.stops[rb.stops.length - 2].locationId);
          const rbStartId = toId(rb.stops[1].locationId);

          let ns = null;
          if (distances[raEndId] && distances[raEndId][rbStartId] != null) {
            ns = [...ra.stops.slice(0, -1), ...rb.stops.slice(1)];
          } else if (distances[rbEndId] && distances[rbEndId][raStartId] != null) {
            ns = [...rb.stops.slice(0, -1), ...ra.stops.slice(1)];
          }
          if (!ns) continue;

          ns = ns.map((st, i) => ({ ...st, order: i }));
          const mergedR = {
            vehicle: undefined,
            vehicleName: 'Unassigned',
            stops: ns,
            distance: 0,
            duration: 0,
            totalCapacity: (ra.totalCapacity || 0) + (rb.totalCapacity || 0)
          };
          recomputeRouteMetrics(mergedR);

          // replace a and b with mergedR
          routes.splice(b, 1);
          routes.splice(a, 1, mergedR);
          mergedAny = true;
          break;
        }
        if (mergedAny) break;
      }
      if (!mergedAny) break;
    }
  }

  // Assign vehicles to routes based on capacity
  const vehicleSlots = [];
  vehicles.forEach((v) => {
    const count = v.count || 1;
    for (let i = 0; i < count; i++) {
      vehicleSlots.push({ _id: v._id, name: v.name, capacity: v.capacity || 0, used: false });
    }
  });
  
  // Sort routes by capacity (largest first) and vehicles by capacity (largest first)
  routes.sort((a, b) => (b.totalCapacity || 0) - (a.totalCapacity || 0));
  vehicleSlots.sort((a, b) => b.capacity - a.capacity);

  // Strict vehicle assignment with NO capacity violations
  routes.sort((a, b) => (b.totalCapacity || 0) - (a.totalCapacity || 0));

  // First pass: assign vehicles to routes that fit within capacity
  for (const r of routes) {
    if (r.vehicle) continue; // Skip if already assigned

    const requiredCapacity = r.totalCapacity || 0;
    const slot = vehicleSlots.find((vs) => !vs.used && vs.capacity >= requiredCapacity);
    if (slot) {
      r.vehicle = slot._id;
      r.vehicleName = slot.name;
      slot.used = true;
      slot.currentLoad = requiredCapacity;
      r.capacityExceeded = false;
    }
  }

  // Second pass: try to merge smaller routes into existing vehicles if capacity allows
  const unassignedRoutes = routes.filter(r => !r.vehicle);
  for (const unassignedRoute of unassignedRoutes) {
    if (unassignedRoute.vehicle) continue; // Skip if already assigned

    const requiredCapacity = unassignedRoute.totalCapacity || 0;

    // Find a vehicle that has enough remaining capacity
    const availableSlot = vehicleSlots.find((vs) =>
      vs.used && (vs.capacity - vs.currentLoad) >= requiredCapacity
    );

    if (availableSlot) {
      // Merge this route with the existing vehicle's route
      const existingRoute = routes.find(r => r.vehicle && r.vehicle.toString() === availableSlot._id.toString());
      if (existingRoute) {
        // Combine the routes by adding stops
        const depotStop = existingRoute.stops[existingRoute.stops.length - 1];
        const newStops = [
          ...existingRoute.stops.slice(0, -1), // Remove final depot
          ...unassignedRoute.stops.slice(1, -1), // Add middle stops from unassigned route
          depotStop // Add depot back
        ];

        // Update stop orders
        newStops.forEach((stop, idx) => stop.order = idx);

        existingRoute.stops = newStops;
        existingRoute.totalCapacity = (existingRoute.totalCapacity || 0) + requiredCapacity;
        availableSlot.currentLoad += requiredCapacity;

        // Recompute route metrics
        recomputeRouteMetrics(existingRoute);

        unassignedRoute.vehicle = availableSlot._id;
        unassignedRoute.vehicleName = availableSlot.name;
        unassignedRoute.capacityExceeded = false;
      }
    }
  }

  // Third pass: for any remaining unassigned routes, try to split them across multiple vehicles
  const stillUnassignedRoutes = routes.filter(r => !r.vehicle);
  for (const unassignedRoute of stillUnassignedRoutes) {
    if (unassignedRoute.vehicle) continue; // Skip if already assigned

    const requiredCapacity = unassignedRoute.totalCapacity || 0;

    // Try to split the route across multiple vehicles if possible
    if (unassignedRoute.stops.length > 3) { // depot + at least 1 location + depot
      const middleStops = unassignedRoute.stops.slice(1, -1); // Exclude depot stops
      let currentVehicleLoad = 0;
      let currentVehicleStops = [unassignedRoute.stops[0]]; // Start with depot
      let assignedVehicle = null;

      for (let i = 0; i < middleStops.length; i++) {
        const stop = middleStops[i];
        const stopDemand = stop.demand || 0;

        // If adding this stop would exceed current vehicle capacity, start new vehicle
        if (assignedVehicle && currentVehicleLoad + stopDemand > assignedVehicle.capacity) {
          // Close current vehicle route
          currentVehicleStops.push(unassignedRoute.stops[unassignedRoute.stops.length - 1]); // Add depot
          const newRoute = {
            vehicle: assignedVehicle._id,
            vehicleName: assignedVehicle.name,
            stops: currentVehicleStops.map((s, idx) => ({ ...s, order: idx })),
            distance: 0,
            duration: 0,
            totalCapacity: currentVehicleLoad
          };
          recomputeRouteMetrics(newRoute);
          routes.push(newRoute);

          // Start new vehicle
          currentVehicleStops = [unassignedRoute.stops[0]]; // Start with depot
          currentVehicleLoad = 0;
          assignedVehicle = null;
        }

        // Find available vehicle for this stop
        if (!assignedVehicle) {
          assignedVehicle = vehicleSlots.find((vs) =>
            !vs.used && vs.capacity >= stopDemand
          );
          if (!assignedVehicle) {
            // No vehicle available for this stop - mark as unassigned
            console.warn(`No vehicle available for stop with demand ${stopDemand}`);
            continue;
          }
          assignedVehicle.used = true;
        }

        currentVehicleStops.push(stop);
        currentVehicleLoad += stopDemand;
      }

      // Close the last vehicle route
      if (assignedVehicle && currentVehicleStops.length > 1) {
        currentVehicleStops.push(unassignedRoute.stops[unassignedRoute.stops.length - 1]); // Add depot
        const finalRoute = {
          vehicle: assignedVehicle._id,
          vehicleName: assignedVehicle.name,
          stops: currentVehicleStops.map((s, idx) => ({ ...s, order: idx })),
          distance: 0,
          duration: 0,
          totalCapacity: currentVehicleLoad
        };
        recomputeRouteMetrics(finalRoute);
        routes.push(finalRoute);
      }

      // Mark original route as processed (remove it from routes array)
      const routeIndex = routes.indexOf(unassignedRoute);
      if (routeIndex > -1) {
        routes.splice(routeIndex, 1);
      }
    } else {
      // Single stop route - try to find any available vehicle
      const slot = vehicleSlots.find((vs) => !vs.used && vs.capacity >= requiredCapacity);
      if (slot) {
        unassignedRoute.vehicle = slot._id;
        unassignedRoute.vehicleName = slot.name;
        slot.used = true;
        slot.currentLoad = requiredCapacity;
        unassignedRoute.capacityExceeded = false;
      } else {
        // No vehicle available - this route cannot be served
        console.warn(`Route with ${requiredCapacity} demand cannot be assigned - no suitable vehicle available`);
        unassignedRoute.capacityExceeded = true;
        unassignedRoute.vehicle = null;
        unassignedRoute.vehicleName = 'Unassigned - Insufficient Capacity';
      }
    }
  }

  // Recompute metrics post-assignment (no change, but ensures consistency)
  routes.forEach(recomputeRouteMetrics);

  // Local search refinement (2-opt then 3-opt) per route excluding depots
  routes.forEach((r) => {
    improveRouteWithLocalSearch(r, distances, speedKmh);
  });
  return routes;
}

function improveRouteWithLocalSearch(route, distances, speedKmh) {
  // Extract non-depot stops
  console.log("2")
  if (!route.stops || route.stops.length < 3) return;
  const first = route.stops[0];
  const last = route.stops[route.stops.length - 1];
  const middle = route.stops.slice(1, -1);

  const toId = (x) => x.locationId.toString();
  const calcDist = (seq) => {
    let d = 0;
    for (let i = 0; i < seq.length - 1; i++) {
      const a = seq[i];
      const b = seq[i + 1];
      const ai = toId(a);
      const bi = toId(b);
      d += distances[ai]?.[bi] ?? calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude);
    }
    return d;
  };

  // 2-opt improvement
  let improved = true;
  let seq = [first, ...middle, last];
  while (improved) {
    improved = false;
    for (let i = 1; i < seq.length - 2; i++) {
      for (let k = i + 1; k < seq.length - 1; k++) {
        const newSeq = [...seq.slice(0, i), ...seq.slice(i, k + 1).reverse(), ...seq.slice(k + 1)];
        if (calcDist(newSeq) + 1e-9 < calcDist(seq)) {
          seq = newSeq;
          improved = true;
        }
      }
    }
  }

  // 3-opt limited improvement (simple swap of three segments)
  const threeOptOnce = () => {
    for (let i = 1; i < seq.length - 3; i++) {
      for (let j = i + 1; j < seq.length - 2; j++) {
        for (let k = j + 1; k < seq.length - 1; k++) {
          const A = seq.slice(0, i);
          const B = seq.slice(i, j);
          const C = seq.slice(j, k);
          const D = seq.slice(k);
          const candidates = [
            [...A, ...B, ...C, ...D], // original
            [...A, ...B.reverse(), ...C, ...D],
            [...A, ...B, ...C.reverse(), ...D],
            [...A, ...C, ...B, ...D],
            [...A, ...C.reverse(), ...B, ...D],
            [...A, ...B.reverse(), ...C.reverse(), ...D],
          ];
          const base = calcDist(seq);
          let best = seq;
          let bestD = base;
          for (const cand of candidates) {
            const d = calcDist(cand);
            if (d + 1e-9 < bestD) {
              bestD = d;
              best = cand;
            }
          }
          if (best !== seq) {
            seq = best;
            return true;
          }
        }
      }
    }
    return false;
  };

  if (threeOptOnce()) {
    // run a brief 2-opt again
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 1; i < seq.length - 2; i++) {
        for (let k = i + 1; k < seq.length - 1; k++) {
          const newSeq = [...seq.slice(0, i), ...seq.slice(i, k + 1).reverse(), ...seq.slice(k + 1)];
          if (calcDist(newSeq) + 1e-9 < calcDist(seq)) {
            seq = newSeq;
            changed = true;
          }
        }
      }
    }
  }

  // Rebuild route
  route.stops = seq.map((s, idx) => ({ ...s, order: idx }));
  // Recompute metrics
  let totalDistance = 0;
  for (let i = 0; i < route.stops.length - 1; i++) {
    const a = route.stops[i];
    const b = route.stops[i + 1];
    const ai = toId(a);
    const bi = toId(b);
    totalDistance += distances[ai]?.[bi] ?? calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude);
  }
  route.distance = totalDistance;
  route.duration = Math.round((totalDistance / speedKmh) * 60);
}

// Nearest Neighbor heuristic with capacity awareness
function nearestNeighborAlgorithm(vehicles, locations, depot) {
  console.log("3")
  const speedKmh = 40;
  const toId = (id) => id.toString();
  const depotId = toId(depot._id);
  const pending = locations.filter((l) => toId(l._id) !== depotId);

  // Expand vehicles by count
  const vehicleSlots = [];
  vehicles.forEach((v) => {
    const count = v.count || 1;
    for (let i = 0; i < count; i++) {
      vehicleSlots.push({ _id: v._id, name: v.name, capacity: v.capacity || 0 });
    }
  });

  const routes = [];
  const used = new Set();

  const dist = (a, b) => calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude);

  for (const vs of vehicleSlots) {
    let remaining = vs.capacity;
    const rtStops = [
      {
        locationId: depot._id,
        locationName: depot.name,
        latitude: depot.latitude,
        longitude: depot.longitude,
        demand: depot.demand || 0,
        order: 0,
      },
    ];

    let current = depot;
    let order = 1;

    while (true) {
      // pick nearest not used, within remaining capacity
      let best = null;
      let bestD = Infinity;
      for (const loc of pending) {
        if (used.has(toId(loc._id))) continue;
        if ((loc.demand || 0) > remaining) continue;
        const d = dist(current, loc);
        if (d < bestD) {
          bestD = d;
          best = loc;
        }
      }
      if (!best) break;

      rtStops.push({
        locationId: best._id,
        locationName: best.name,
        latitude: best.latitude,
        longitude: best.longitude,
        demand: best.demand || 0,
        order: order++,
      });
      remaining -= best.demand || 0;
      used.add(toId(best._id));
      current = best;
    }

    // Close route if it visited something
    if (rtStops.length > 1) {
      rtStops.push({
        locationId: depot._id,
        locationName: depot.name,
        latitude: depot.latitude,
        longitude: depot.longitude,
        demand: depot.demand || 0,
        order: order,
      });

      let totalDist = 0;
      for (let i = 0; i < rtStops.length - 1; i++) {
        totalDist += calculateDistance(rtStops[i].latitude, rtStops[i].longitude, rtStops[i + 1].latitude, rtStops[i + 1].longitude);
      }
      const duration = Math.round((totalDist / speedKmh) * 60);

      routes.push({
        vehicle: vs._id,
        vehicleName: vs.name,
        stops: rtStops,
        distance: totalDist,
        duration,
        totalCapacity: rtStops.reduce((s, st) => s + (st.demand || 0), 0) - (depot.demand || 0),
      });
    }

    // stop early if all assigned
    if (used.size === pending.length) break;
  }

  // Any unassigned left? Try to add them as separate small routes if possible
  for (const loc of pending) {
    if (used.has(toId(loc._id))) continue;
    // pick any vehicle that can cover it
    const vs = vehicleSlots.find((v) => (v.capacity || 0) >= (loc.demand || 0));
    if (!vs) continue;

    const stops = [
      {
        locationId: depot._id,
        locationName: depot.name,
        latitude: depot.latitude,
        longitude: depot.longitude,
        demand: depot.demand || 0,
        order: 0,
      },
      {
        locationId: loc._id,
        locationName: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        demand: loc.demand || 0,
        order: 1,
      },
      {
        locationId: depot._id,
        locationName: depot.name,
        latitude: depot.latitude,
        longitude: depot.longitude,
        demand: depot.demand || 0,
        order: 2,
      },
    ];
    const d = dist(depot, loc) * 2;
    routes.push({
      vehicle: vs._id,
      vehicleName: vs.name,
      stops,
      distance: d,
      duration: Math.round((d / speedKmh) * 60),
      totalCapacity: loc.demand || 0,
    });
    used.add(toId(loc._id));
  }

  return routes;
}

// Enhanced Clarke-Wright algorithm with advanced features
function enhancedClarkeWrightAlgorithm(vehicles, locations, depot) {
  console.log("4")
 const speedKmh = 40;
 const toId = (objId) => objId.toString();

 // Build distance matrix
 const distances = {};
 const allIds = locations.map((l) => toId(l._id));
 locations.forEach((l1) => {
   const id1 = toId(l1._id);
   distances[id1] = {};
   locations.forEach((l2) => {
     const id2 = toId(l2._id);
     distances[id1][id2] = calculateDistance(
       l1.latitude, l1.longitude, l2.latitude, l2.longitude
     );
   });
 });

 const depotId = toId(depot._id);
 const nonDepot = locations.filter((l) => toId(l._id) !== depotId);

 // Enhanced savings calculation with multiple advanced components
 const savings = [];
 for (let i = 0; i < nonDepot.length; i++) {
   for (let j = i + 1; j < nonDepot.length; j++) {
     const li = nonDepot[i];
     const lj = nonDepot[j];
     const idI = toId(li._id);
     const idJ = toId(lj._id);

     const basicSaving = distances[depotId][idI] + distances[depotId][idJ] - distances[idI][idJ];

     // Angular component for better route continuity
     const angleI = Math.atan2(li.latitude - depot.latitude, li.longitude - depot.longitude);
     const angleJ = Math.atan2(lj.latitude - depot.latitude, lj.longitude - depot.longitude);
     const angularDiff = Math.abs(angleI - angleJ);
     const angularBonus = Math.min(angularDiff, 2 * Math.PI - angularDiff) / Math.PI;

     // Capacity compatibility bonus
     const demandI = li.demand || 0;
     const demandJ = lj.demand || 0;
     const combinedDemand = demandI + demandJ;
     const maxVehicleCapacity = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.capacity || 0)) : Infinity;
     const capacityCompatibility = combinedDemand <= maxVehicleCapacity ? 1 : Math.max(0.1, maxVehicleCapacity / combinedDemand);

     // Service time consideration (estimated based on demand)
     const serviceTimeI = Math.max(5, demandI * 2); // Minimum 5 minutes, 2 minutes per unit demand
     const serviceTimeJ = Math.max(5, demandJ * 2);
     const combinedServiceTime = serviceTimeI + serviceTimeJ;

     // Time window compatibility (placeholder for future implementation)
     const timeCompatibility = 1; // Would be calculated based on time windows if available

     // Urgency factor based on demand size (higher demand = higher priority)
     const urgencyFactor = Math.min(1.2, 1 + (combinedDemand / maxVehicleCapacity) * 0.2);

     // Distance efficiency bonus (prefer closer pairs)
     const distanceEfficiency = Math.max(0.8, 1 - (distances[idI][idJ] / 50)); // Bonus for pairs within 50km

     // Enhanced saving with multiple factors
     const enhancedSaving = basicSaving *
       (1 + angularBonus * 0.15) *           // Angular continuity
       capacityCompatibility *                // Capacity feasibility
       urgencyFactor *                       // Demand priority
       distanceEfficiency *                  // Distance efficiency
       timeCompatibility;                    // Time compatibility

     savings.push({
       i: li,
       j: lj,
       saving: enhancedSaving,
       basicSaving,
       angularBonus,
       capacityCompatibility,
       combinedDemand,
       urgencyFactor,
       distanceEfficiency,
       serviceTime: combinedServiceTime
     });
   }
 }
 savings.sort((a, b) => b.saving - a.saving);

 // Initialize routes
 const makeDepotStop = (order) => ({
   locationId: depot._id,
   locationName: depot.name,
   latitude: depot.latitude,
   longitude: depot.longitude,
   demand: depot.demand || 0,
   order
 });

 const routes = nonDepot.map((loc) => {
   const stops = [
     makeDepotStop(0),
     {
       locationId: loc._id,
       locationName: loc.name,
       latitude: loc.latitude,
       longitude: loc.longitude,
       demand: loc.demand || 0,
       order: 1
     },
     makeDepotStop(2)
   ];
   const distance = distances[depotId][toId(loc._id)] * 2;
   return {
     vehicle: undefined,
     vehicleName: 'Unassigned',
     stops,
     distance,
     duration: Math.round((distance / speedKmh) * 60),
     totalCapacity: loc.demand || 0
   };
 });

 const maxCapacity = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.capacity || 0)) : 0;

 const findRouteIndexByLocation = (idStr) => {
   for (let r = 0; r < routes.length; r++) {
     const rt = routes[r];
     const foundIdx = rt.stops.findIndex((s) => toId(s.locationId) === idStr);
     if (foundIdx !== -1) {
       return { routeIndex: r, stopIndex: foundIdx };
     }
   }
   return null;
 };

 const isStartEndpoint = (rt, idx) => idx === 1;
 const isEndEndpoint = (rt, idx) => idx === rt.stops.length - 2;

 const recomputeRouteMetrics = (rt) => {
   let dist = 0;
   for (let k = 0; k < rt.stops.length - 1; k++) {
     const from = rt.stops[k];
     const to = rt.stops[k + 1];
     const fromId = toId(from.locationId);
     const toIdStr = toId(to.locationId);
     dist += distances[fromId]?.[toIdStr] ?? calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);
   }
   rt.distance = dist;
   rt.duration = Math.round((dist / speedKmh) * 60);
 };

 // Enhanced merging with capacity consideration
 for (const s of savings) {
   const idI = toId(s.i._id);
   const idJ = toId(s.j._id);

   const posI = findRouteIndexByLocation(idI);
   const posJ = findRouteIndexByLocation(idJ);
   if (!posI || !posJ || posI.routeIndex === posJ.routeIndex) continue;

   const r1 = routes[posI.routeIndex];
   const r2 = routes[posJ.routeIndex];

   const iAtEndOfR1 = isEndEndpoint(r1, posI.stopIndex);
   const iAtStartOfR1 = isStartEndpoint(r1, posI.stopIndex);
   const jAtEndOfR2 = isEndEndpoint(r2, posJ.stopIndex);
   const jAtStartOfR2 = isStartEndpoint(r2, posJ.stopIndex);

   let newStops = null;

   if (iAtEndOfR1 && jAtStartOfR2) {
     newStops = [...r1.stops.slice(0, -1), ...r2.stops.slice(1)];
   } else if (jAtEndOfR2 && iAtStartOfR1) {
     newStops = [...r2.stops.slice(0, -1), ...r1.stops.slice(1)];
   }

   if (!newStops) continue;

   const combinedDemand = (r1.totalCapacity || 0) + (r2.totalCapacity || 0);
   if (combinedDemand > maxCapacity) continue;

   newStops = newStops.map((st, idx) => ({ ...st, order: idx }));
   const merged = {
     vehicle: undefined,
     vehicleName: 'Unassigned',
     stops: newStops,
     distance: 0,
     duration: 0,
     totalCapacity: combinedDemand
   };
   recomputeRouteMetrics(merged);

   const idxToRemove = Math.max(posI.routeIndex, posJ.routeIndex);
   const idxToReplace = Math.min(posI.routeIndex, posJ.routeIndex);
   routes.splice(idxToRemove, 1);
   routes.splice(idxToReplace, 1, merged);
 }

 // Advanced vehicle assignment with load balancing
 const vehicleSlots = [];
 vehicles.forEach((v) => {
   const count = v.count || 1;
   for (let i = 0; i < count; i++) {
     vehicleSlots.push({
       _id: v._id,
       name: v.name,
       capacity: v.capacity || 0,
       used: false,
       currentLoad: 0
     });
   }
 });

 // Sort routes by demand descending, vehicles by capacity descending
 routes.sort((a, b) => (b.totalCapacity || 0) - (a.totalCapacity || 0));
 vehicleSlots.sort((a, b) => b.capacity - a.capacity);

 // Best-fit assignment
 for (const route of routes) {
   const bestSlot = vehicleSlots
     .filter(vs => !vs.used && vs.capacity >= (route.totalCapacity || 0))
     .sort((a, b) => (a.capacity - (a.currentLoad + (route.totalCapacity || 0))) -
                     (b.capacity - (b.currentLoad + (route.totalCapacity || 0))))[0];

   if (bestSlot) {
     route.vehicle = bestSlot._id;
     route.vehicleName = bestSlot.name;
     bestSlot.used = true;
     bestSlot.currentLoad += route.totalCapacity || 0;
   }
 }

 // Advanced local search with multiple techniques
 routes.forEach((route) => {
   enhancedLocalSearch(route, distances, speedKmh);
 });

 return routes;
}

// Sweep algorithm for angular-based route construction
function sweepAlgorithm(vehicles, locations, depot) {
 const speedKmh = 40;
 const toId = (id) => id.toString();
 const depotId = toId(depot._id);
 const nonDepot = locations.filter((l) => toId(l._id) !== depotId);

 // Calculate angles from depot
 nonDepot.forEach(loc => {
   loc.angle = Math.atan2(loc.latitude - depot.latitude, loc.longitude - depot.longitude);
 });

 // Sort by angle
 nonDepot.sort((a, b) => a.angle - b.angle);

 const vehicleSlots = [];
 vehicles.forEach((v) => {
   const count = v.count || 1;
   for (let i = 0; i < count; i++) {
     vehicleSlots.push({
       _id: v._id,
       name: v.name,
       capacity: v.capacity || 0,
       currentLoad: 0,
       stops: [{
         locationId: depot._id,
         locationName: depot.name,
         latitude: depot.latitude,
         longitude: depot.longitude,
         demand: depot.demand || 0,
         order: 0
       }]
     });
   }
 });

 const routes = [];
 let currentVehicleIndex = 0;

 for (const location of nonDepot) {
   let assigned = false;

   // Try to add to existing routes first
   for (let i = 0; i < Math.min(vehicleSlots.length, currentVehicleIndex + 1); i++) {
     const slot = vehicleSlots[i];
     if (slot.currentLoad + (location.demand || 0) <= slot.capacity) {
       slot.stops.push({
         locationId: location._id,
         locationName: location.name,
         latitude: location.latitude,
         longitude: location.longitude,
         demand: location.demand || 0,
         order: slot.stops.length
       });
       slot.currentLoad += location.demand || 0;
       assigned = true;
       break;
     }
   }

   // If not assigned, start a new route
   if (!assigned && currentVehicleIndex < vehicleSlots.length) {
     const slot = vehicleSlots[currentVehicleIndex];
     if (slot.currentLoad + (location.demand || 0) <= slot.capacity) {
       slot.stops.push({
         locationId: location._id,
         locationName: location.name,
         latitude: location.latitude,
         longitude: location.longitude,
         demand: location.demand || 0,
         order: slot.stops.length
       });
       slot.currentLoad += location.demand || 0;
       assigned = true;
     }
     currentVehicleIndex++;
   }
 }

 // Close all routes and calculate metrics
 for (const slot of vehicleSlots) {
   if (slot.stops.length > 1) {
     // Add depot at the end
     slot.stops.push({
       locationId: depot._id,
       locationName: depot.name,
       latitude: depot.latitude,
       longitude: depot.longitude,
       demand: depot.demand || 0,
       order: slot.stops.length
     });

     // Calculate distance
     let totalDistance = 0;
     for (let i = 0; i < slot.stops.length - 1; i++) {
       totalDistance += calculateDistance(
         slot.stops[i].latitude, slot.stops[i].longitude,
         slot.stops[i + 1].latitude, slot.stops[i + 1].longitude
       );
     }

     routes.push({
       vehicle: slot._id,
       vehicleName: slot.name,
       stops: slot.stops,
       distance: totalDistance,
       duration: Math.round((totalDistance / speedKmh) * 60),
       totalCapacity: slot.currentLoad
     });
   }
 }

 return routes;
}

// Enhanced local search with multiple techniques
function enhancedLocalSearch(route, distances, speedKmh) {
 if (!route.stops || route.stops.length < 4) return;

 const toId = (x) => x.locationId.toString();
 const calcDist = (seq) => {
   let d = 0;
   for (let i = 0; i < seq.length - 1; i++) {
     const a = seq[i];
     const b = seq[i + 1];
     const ai = toId(a);
     const bi = toId(b);
     d += distances[ai]?.[bi] ?? calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude);
   }
   return d;
 };

 const first = route.stops[0];
 const last = route.stops[route.stops.length - 1];
 let middle = route.stops.slice(1, -1);

 // 2-opt improvement
 let improved = true;
 let seq = [first, ...middle, last];
 while (improved) {
   improved = false;
   for (let i = 1; i < seq.length - 2; i++) {
     for (let k = i + 1; k < seq.length - 1; k++) {
       const newSeq = [...seq.slice(0, i), ...seq.slice(i, k + 1).reverse(), ...seq.slice(k + 1)];
       if (calcDist(newSeq) + 1e-9 < calcDist(seq)) {
         seq = newSeq;
         improved = true;
       }
     }
   }
 }

 // Or-opt: move segments of 1-2-3 consecutive cities
 for (let length = 1; length <= 3; length++) {
   for (let i = 1; i < seq.length - length - 1; i++) {
     const segment = seq.slice(i, i + length);
     const remaining = [...seq.slice(0, i), ...seq.slice(i + length)];

     for (let j = 1; j < remaining.length; j++) {
       const newSeq = [
         ...remaining.slice(0, j),
         ...segment,
         ...remaining.slice(j)
       ];

       if (calcDist(newSeq) + 1e-9 < calcDist(seq)) {
         seq = newSeq;
       }
     }
   }
 }

 // Update route
 route.stops = seq.map((s, idx) => ({ ...s, order: idx }));

 // Recompute metrics
 let totalDistance = 0;
 for (let i = 0; i < route.stops.length - 1; i++) {
   const a = route.stops[i];
   const b = route.stops[i + 1];
   const ai = toId(a);
   const bi = toId(b);
   totalDistance += distances[ai]?.[bi] ?? calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude);
 }
 route.distance = totalDistance;
 route.duration = Math.round((totalDistance / speedKmh) * 60);
}

// Advanced Tabu Search VRP Algorithm
function tabuSearchVRP(vehicles, locations, depot) {
  const speedKmh = 40;
  const toId = (objId) => objId.toString();

  // Build distance matrix
  const distances = {};
  locations.forEach((l1) => {
    const id1 = toId(l1._id);
    distances[id1] = {};
    locations.forEach((l2) => {
      const id2 = toId(l2._id);
      distances[id1][id2] = calculateDistance(
        l1.latitude, l1.longitude, l2.latitude, l2.longitude
      );
    });
  });

  const depotId = toId(depot._id);
  const nonDepot = locations.filter((l) => toId(l._id) !== depotId);

  // Start with a good initial solution using Enhanced Clarke-Wright
  let currentSolution = enhancedClarkeWrightAlgorithm(vehicles, locations, depot);
  let bestSolution = JSON.parse(JSON.stringify(currentSolution));
  let bestCost = calculateTotalCost(bestSolution, distances);

  // Tabu Search parameters (optimized for performance)
  const tabuTenure = Math.min(15, Math.max(5, nonDepot.length / 2));
  const maxIterations = Math.min(100, Math.max(20, nonDepot.length * 3));
  const tabuList = new Map();

  const generateNeighbors = (solution) => {
    const neighbors = [];

    // 2-opt moves within routes
    for (const route of solution) {
      if (route.stops.length < 4) continue;

      const middleStops = route.stops.slice(1, -1);
      for (let i = 0; i < middleStops.length - 1; i++) {
        for (let j = i + 1; j < middleStops.length; j++) {
          const newMiddle = [...middleStops];
          [newMiddle[i], newMiddle[j]] = [newMiddle[j], newMiddle[i]];

          const newRoute = {
            ...route,
            stops: [route.stops[0], ...newMiddle, route.stops[route.stops.length - 1]]
          };

          const newSolution = solution.map(r => r === route ? newRoute : r);
          recomputeAllRouteMetrics(newSolution, distances, speedKmh);
          neighbors.push(newSolution);
        }
      }
    }

    return neighbors.slice(0, 50); // Limit neighbors for performance
  };

  // Main Tabu Search loop
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const neighbors = generateNeighbors(currentSolution);

    let bestNeighbor = null;
    let bestNeighborCost = Infinity;

    for (const neighbor of neighbors) {
      const cost = calculateTotalCost(neighbor, distances);
      const neighborKey = generateSolutionKey(neighbor);

      if (!tabuList.has(neighborKey) && cost < bestNeighborCost) {
        bestNeighbor = neighbor;
        bestNeighborCost = cost;
      }
    }

    if (!bestNeighbor) break;

    currentSolution = bestNeighbor;

    if (bestNeighborCost < bestCost) {
      bestSolution = JSON.parse(JSON.stringify(bestNeighbor));
      bestCost = bestNeighborCost;
    }

    // Update tabu list
    const solutionKey = generateSolutionKey(currentSolution);
    tabuList.set(solutionKey, iteration + tabuTenure);

    // Remove expired tabu entries
    for (const [key, expiry] of tabuList) {
      if (expiry <= iteration) {
        tabuList.delete(key);
      }
    }
  }

  return assignVehiclesToRoutes(bestSolution, vehicles, distances, speedKmh);
}

// Simulated Annealing VRP Algorithm
function simulatedAnnealingVRP(vehicles, locations, depot) {
  const speedKmh = 40;
  const toId = (objId) => objId.toString();

  const distances = {};
  locations.forEach((l1) => {
    const id1 = toId(l1._id);
    distances[id1] = {};
    locations.forEach((l2) => {
      const id2 = toId(l2._id);
      distances[id1][id2] = calculateDistance(
        l1.latitude, l1.longitude, l2.latitude, l2.longitude
      );
    });
  });

  const depotId = toId(depot._id);
  const nonDepot = locations.filter((l) => toId(l._id) !== depotId);

  let currentSolution = enhancedClarkeWrightAlgorithm(vehicles, locations, depot);
  let bestSolution = JSON.parse(JSON.stringify(currentSolution));

  let currentCost = calculateTotalCost(currentSolution, distances);
  let bestCost = currentCost;

  let temperature = 1000;
  const coolingRate = 0.95;
  const minTemperature = 1;
  const maxIterations = Math.min(200, Math.max(50, nonDepot.length * 5));

  const generateNeighbor = (solution) => {
    const neighbor = JSON.parse(JSON.stringify(solution));

    if (neighbor.length >= 2) {
      const routeIndex = Math.floor(Math.random() * neighbor.length);
      const route = neighbor[routeIndex];

      if (route.stops.length >= 4) {
        const i = Math.floor(Math.random() * (route.stops.length - 3)) + 1;
        const j = Math.floor(Math.random() * (route.stops.length - 3)) + 1;

        if (i !== j) {
          [route.stops[i], route.stops[j]] = [route.stops[j], route.stops[i]];
        }
      }
    }

    recomputeAllRouteMetrics(neighbor, distances, speedKmh);
    return neighbor;
  };

  while (temperature > minTemperature) {
    for (let i = 0; i < maxIterations; i++) {
      const neighbor = generateNeighbor(currentSolution);
      const neighborCost = calculateTotalCost(neighbor, distances);

      const costDifference = neighborCost - currentCost;

      if (costDifference < 0 || Math.random() < Math.exp(-costDifference / temperature)) {
        currentSolution = neighbor;
        currentCost = neighborCost;

        if (currentCost < bestCost) {
          bestSolution = JSON.parse(JSON.stringify(currentSolution));
          bestCost = currentCost;
        }
      }
    }
    temperature *= coolingRate;
  }

  return assignVehiclesToRoutes(bestSolution, vehicles, distances, speedKmh);
}

// Advanced Genetic Algorithm VRP
function geneticAlgorithmVRP(vehicles, locations, depot) {
  const speedKmh = 40;
  const toId = (objId) => objId.toString();

  // Build distance matrix
  const distances = {};
  locations.forEach((l1) => {
    const id1 = toId(l1._id);
    distances[id1] = {};
    locations.forEach((l2) => {
      const id2 = toId(l2._id);
      distances[id1][id2] = calculateDistance(
        l1.latitude, l1.longitude, l2.latitude, l2.longitude
      );
    });
  });

  const depotId = toId(depot._id);
  const nonDepot = locations.filter((l) => toId(l._id) !== depotId);

  // Genetic Algorithm parameters (optimized for performance)
  const populationSize = Math.min(30, Math.max(10, nonDepot.length * 2));
  const generations = Math.min(50, Math.max(15, nonDepot.length * 2));
  const mutationRate = 0.1;
  const crossoverRate = 0.8;
  const tournamentSize = 3;

  // Create initial population
  const population = [];
  for (let i = 0; i < populationSize; i++) {
    population.push(createRandomSolution(vehicles, locations, depot, distances, speedKmh));
  }

  let bestSolution = population.reduce((best, current) =>
    calculateTotalCost(current, distances) < calculateTotalCost(best, distances) ? current : best
  );

  // Main GA loop
  for (let generation = 0; generation < generations; generation++) {
    const newPopulation = [];

    // Elitism: keep best solution
    newPopulation.push(JSON.parse(JSON.stringify(bestSolution)));

    // Generate new offspring
    while (newPopulation.length < populationSize) {
      // Selection
      const parent1 = tournamentSelection(population, distances, tournamentSize);
      const parent2 = tournamentSelection(population, distances, tournamentSize);

      // Crossover
      let offspring;
      if (Math.random() < crossoverRate) {
        offspring = crossover(parent1, parent2, vehicles, locations, depot, distances, speedKmh);
      } else {
        offspring = JSON.parse(JSON.stringify(parent1));
      }

      // Mutation
      if (Math.random() < mutationRate) {
        mutate(offspring, vehicles, locations, depot, distances, speedKmh);
      }

      newPopulation.push(offspring);
    }

    population.splice(0, population.length, ...newPopulation);

    // Update best solution
    const currentBest = population.reduce((best, current) =>
      calculateTotalCost(current, distances) < calculateTotalCost(best, distances) ? current : best
    );

    if (calculateTotalCost(currentBest, distances) < calculateTotalCost(bestSolution, distances)) {
      bestSolution = JSON.parse(JSON.stringify(currentBest));
    }
  }

  return assignVehiclesToRoutes(bestSolution, vehicles, distances, speedKmh);
}

// Helper functions for Genetic Algorithm
function createRandomSolution(vehicles, locations, depot, distances, speedKmh) {
  const toId = (objId) => objId.toString();
  const depotId = toId(depot._id);
  const nonDepot = locations.filter((l) => toId(l._id) !== depotId);

  // Shuffle locations randomly
  const shuffledLocations = [...nonDepot].sort(() => Math.random() - 0.5);

  // Create routes by assigning locations to vehicles
  const routes = [];
  const vehicleSlots = vehicles.map(v => ({
    vehicle: v,
    locations: [],
    capacity: v.capacity || 0,
    usedCapacity: 0
  }));

  for (const location of shuffledLocations) {
    // Find vehicle with enough capacity
    const availableVehicle = vehicleSlots.find(slot =>
      slot.usedCapacity + (location.demand || 0) <= slot.capacity
    );

    if (availableVehicle) {
      availableVehicle.locations.push(location);
      availableVehicle.usedCapacity += location.demand || 0;
    } else {
      // No vehicle has capacity for this location, skip
    }
  }

  // Convert to route format
  vehicleSlots.forEach(slot => {
    if (slot.locations.length > 0) {
      const stops = [
        {
          locationId: depot._id,
          locationName: depot.name,
          latitude: depot.latitude,
          longitude: depot.longitude,
          demand: depot.demand || 0,
          order: 0
        },
        ...slot.locations.map((loc, idx) => ({
          locationId: loc._id,
          locationName: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          demand: loc.demand || 0,
          order: idx + 1
        })),
        {
          locationId: depot._id,
          locationName: depot.name,
          latitude: depot.latitude,
          longitude: depot.longitude,
          demand: depot.demand || 0,
          order: slot.locations.length + 1
        }
      ];

      let distance = 0;
      for (let i = 0; i < stops.length - 1; i++) {
        const fromId = toId(stops[i].locationId);
        const toIdStr = toId(stops[i + 1].locationId);
        distance += distances[fromId]?.[toIdStr] || 0;
      }

      routes.push({
        vehicle: slot.vehicle._id,
        vehicleName: slot.vehicle.name,
        stops,
        distance,
        duration: Math.round((distance / speedKmh) * 60),
        totalCapacity: slot.usedCapacity
      });
    }
  });

  return routes;
}

function tournamentSelection(population, distances, tournamentSize) {
  let best = population[Math.floor(Math.random() * population.length)];
  let bestCost = calculateTotalCost(best, distances);

  for (let i = 1; i < tournamentSize; i++) {
    const competitor = population[Math.floor(Math.random() * population.length)];
    const competitorCost = calculateTotalCost(competitor, distances);
    if (competitorCost < bestCost) {
      best = competitor;
      bestCost = competitorCost;
    }
  }

  return best;
}

function crossover(parent1, parent2, vehicles, locations, depot, distances, speedKmh) {
  // Simple route-based crossover
  const child = [];
  const maxRoutes = Math.max(parent1.length, parent2.length);

  for (let i = 0; i < maxRoutes; i++) {
    if (i < parent1.length && i < parent2.length) {
      // Randomly choose route from either parent
      child.push(Math.random() < 0.5 ?
        JSON.parse(JSON.stringify(parent1[i])) :
        JSON.parse(JSON.stringify(parent2[i]))
      );
    } else if (i < parent1.length) {
      child.push(JSON.parse(JSON.stringify(parent1[i])));
    } else if (i < parent2.length) {
      child.push(JSON.parse(JSON.stringify(parent2[i])));
    }
  }

  // Recompute metrics
  recomputeAllRouteMetrics(child, distances, speedKmh);
  return child;
}

function mutate(solution, vehicles, locations, depot, distances, speedKmh) {
  if (solution.length === 0) return;

  const routeIndex = Math.floor(Math.random() * solution.length);
  const route = solution[routeIndex];

  if (route.stops.length > 3) { // Need at least depot + 1 location + depot
    // Swap two random locations in the route
    const stop1 = Math.floor(Math.random() * (route.stops.length - 2)) + 1;
    const stop2 = Math.floor(Math.random() * (route.stops.length - 2)) + 1;

    if (stop1 !== stop2) {
      [route.stops[stop1], route.stops[stop2]] = [route.stops[stop2], route.stops[stop1]];
      // Update order numbers
      route.stops.forEach((stop, idx) => stop.order = idx);
      // Recompute route metrics inline
      recomputeRouteMetricsInline(route, distances, speedKmh);
    }
  }
}

// Inline function to recompute route metrics (to avoid scope issues)
function recomputeRouteMetricsInline(route, distances, speedKmh) {
  const toId = (objId) => objId.toString();
  let dist = 0;
  for (let k = 0; k < route.stops.length - 1; k++) {
    const from = route.stops[k];
    const to = route.stops[k + 1];
    const fromId = toId(from.locationId);
    const toIdStr = toId(to.locationId);
    dist += distances[fromId]?.[toIdStr] || calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);
  }
  route.distance = dist;
  route.duration = Math.round((dist / speedKmh) * 60);
}


// Advanced Ant Colony Optimization VRP Algorithm
function antColonyOptimizationVRP(vehicles, locations, depot) {
  const speedKmh = 40;
  const toId = (objId) => objId.toString();

  // Build distance matrix
  const distances = {};
  locations.forEach((l1) => {
    const id1 = toId(l1._id);
    distances[id1] = {};
    locations.forEach((l2) => {
      const id2 = toId(l2._id);
      distances[id1][id2] = calculateDistance(
        l1.latitude, l1.longitude, l2.latitude, l2.longitude
      );
    });
  });

  const depotId = toId(depot._id);
  const nonDepot = locations.filter((l) => toId(l._id) !== depotId);

  // ACO Parameters (optimized for performance)
  const numAnts = Math.min(20, Math.max(5, nonDepot.length));
  const numIterations = Math.min(50, Math.max(10, nonDepot.length * 2));
  const alpha = 1; // pheromone importance
  const beta = 2; // distance importance
  const rho = 0.1; // pheromone evaporation rate
  const Q = 100; // pheromone deposit factor

  // Initialize pheromone trails
  const pheromones = {};
  locations.forEach(l1 => {
    const id1 = toId(l1._id);
    pheromones[id1] = {};
    locations.forEach(l2 => {
      const id2 = toId(l2._id);
      pheromones[id1][id2] = 1.0; // initial pheromone
    });
  });

  const maxCapacity = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.capacity || 0)) : 0;

  let bestSolution = null;
  let bestCost = Infinity;

  // Main ACO loop
  for (let iteration = 0; iteration < numIterations; iteration++) {
    const antSolutions = [];

    // Each ant constructs a solution
    for (let ant = 0; ant < numAnts; ant++) {
      const solution = constructAntSolution(vehicles, locations, depot, distances, pheromones, alpha, beta, maxCapacity);
      if (solution) {
        antSolutions.push(solution);
        const cost = calculateTotalCost([solution], distances);
        if (cost < bestCost) {
          bestCost = cost;
          bestSolution = solution;
        }
      }
    }

    // Update pheromones
    updatePheromones(pheromones, antSolutions, rho, Q, distances);
  }

  return bestSolution ? [bestSolution] : [];
}

// Construct solution for one ant
function constructAntSolution(vehicles, locations, depot, distances, pheromones, alpha, beta, maxCapacity) {
  const toId = (objId) => objId.toString();
  const depotId = toId(depot._id);
  const nonDepot = [...locations.filter((l) => toId(l._id) !== depotId)];

  // Shuffle locations for randomization
  for (let i = nonDepot.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nonDepot[i], nonDepot[j]] = [nonDepot[j], nonDepot[i]];
  }

  const vehicleSlots = vehicles.map(v => ({
    vehicle: v,
    locations: [],
    capacity: v.capacity || 0,
    usedCapacity: 0
  }));

  let currentVehicleIndex = 0;
  const assignedLocations = new Set();

  // Assign locations to vehicles using probabilistic selection
  for (const location of nonDepot) {
    if (assignedLocations.has(toId(location._id))) continue;

    let assigned = false;

    // Try to add to existing routes first
    for (let i = 0; i < Math.min(vehicleSlots.length, currentVehicleIndex + 1); i++) {
      const slot = vehicleSlots[i];
      if (slot.usedCapacity + (location.demand || 0) <= slot.capacity) {
        slot.locations.push(location);
        slot.usedCapacity += location.demand || 0;
        assignedLocations.add(toId(location._id));
        assigned = true;
        break;
      }
    }

    // If not assigned, start new route
    if (!assigned && currentVehicleIndex < vehicleSlots.length) {
      const slot = vehicleSlots[currentVehicleIndex];
      if (slot.usedCapacity + (location.demand || 0) <= slot.capacity) {
        slot.locations.push(location);
        slot.usedCapacity += location.demand || 0;
        assignedLocations.add(toId(location._id));
        assigned = true;
        currentVehicleIndex++;
      }
    }
  }

  // Convert to route format
  const routes = [];
  vehicleSlots.forEach(slot => {
    if (slot.locations.length > 0) {
      const stops = [
        {
          locationId: depot._id,
          locationName: depot.name,
          latitude: depot.latitude,
          longitude: depot.longitude,
          demand: depot.demand || 0,
          order: 0
        },
        ...slot.locations.map((loc, idx) => ({
          locationId: loc._id,
          locationName: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          demand: loc.demand || 0,
          order: idx + 1
        })),
        {
          locationId: depot._id,
          locationName: depot.name,
          latitude: depot.latitude,
          longitude: depot.longitude,
          demand: depot.demand || 0,
          order: slot.locations.length + 1
        }
      ];

      let distance = 0;
      for (let i = 0; i < stops.length - 1; i++) {
        const fromId = toId(stops[i].locationId);
        const toIdStr = toId(stops[i + 1].locationId);
        distance += distances[fromId]?.[toIdStr] || 0;
      }

      routes.push({
        vehicle: slot.vehicle._id,
        vehicleName: slot.vehicle.name,
        stops,
        distance,
        duration: Math.round((distance / 40) * 60),
        totalCapacity: slot.usedCapacity
      });
    }
  });

  return routes.length > 0 ? routes[0] : null; // Return first route for simplicity
}

// Google OR-Tools VRP Algorithm with fallback support
const axios = require('axios');

async function orToolsAlgorithm(vehicles, locations, depot) {
 const PYTHON_API_URL = 'https://backend-for-route-optimization-gzok.onrender.com/optimize';
//  const PYTHON_API_URL = 'http://127.0.0.1:8000/optimize'; // URL of your running FastAPI app

  try {
    // 1. Prepare the data in the format expected by the Python API
    const requestData = {
      locations: locations.map(loc => ({
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
      })),
      // CORRECTED: Map all relevant vehicle properties, not just id and capacity.
      vehicles: vehicles.map(v => {
        // Provide a random fallback if cost data is missing to prevent errors.
        const fuelCost = v.fuel_cost_per_km || (Math.random() * (8 - 3) + 3); // Random cost between 3 and 8
        const driverCost = v.driver_cost_per_km || (Math.random() * (12 - 5) + 5); // Random cost between 5 and 12

        return {
          id: v._id.toString(),
          capacity: v.capacity,
          // Add other vehicle properties that the Python model uses.
          fuel_cost_per_km: parseFloat(fuelCost.toFixed(2)),
          driver_cost_per_km: parseFloat(driverCost.toFixed(2)),
          type: v.type, // Pass vehicle type if available
        };
      }),
      demands: locations.map(loc => loc.demand || 0),
      // Optional parameters
      include_geometry: true,
      time_limit_seconds: 30,
    };

    // Ensure the depot is the first location in the locations array
    const depotIndex = requestData.locations.findIndex(loc => loc.name === depot.name);
    if (depotIndex > 0) {
      const depotLocation = requestData.locations.splice(depotIndex, 1)[0];
      requestData.locations.unshift(depotLocation);
      const depotDemand = requestData.demands.splice(depotIndex, 1)[0];
      requestData.demands.unshift(depotDemand);
    }
     // The demand for the depot must be 0 for the python script
     if(requestData.demands.length > 0) {
        requestData.demands[0] = 0;
    }

    console.log('Sending data to Python VRP solver...');
    const response = await axios.post(PYTHON_API_URL, requestData);

    // 2. Process the response from the Python API
    if (response.data && response.data.result) {
      console.log('Successfully received VRP solution from Python API');
      // 3. Transform the Python API response to the format expected by your Node.js application
      return response.data.result.map(route => {
        // Find the original vehicle data to get the name
        const vehicle = vehicles.find(v => v._id.toString() === route['Vehicle ID']);
        const vehicleName = vehicle ? vehicle.name : 'Unknown Vehicle';
        const stops = route['Route Indices'].map((locationIndex, order) => {
            const location = locations[locationIndex];
            return {
                locationId: location._id,
                locationName: location.name,
                latitude: location.latitude,
                longitude: location.longitude,
                demand: location.demand || 0,
                order: order,
            };
        });

        return {
          vehicle: route['Vehicle ID'],
          vehicleName: vehicleName,
          stops: stops,
          distance: route['Distance (km)'],
          duration: Math.round((route['Distance (km)'] / 40) * 60), // Assuming 40 km/h
          totalCapacity: route['Load Carried'],
          // You can add other metrics from the Python response if needed
        };
      });
    } else {
      console.warn('Python API did not return a valid result. Falling back.');
      // Fallback to another algorithm if the Python API fails
      return enhancedClarkeWrightAlgorithm(vehicles, locations, depot);
    }
  } catch (error) {
    console.error('Error calling Python VRP solver:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    console.log('Falling back to Enhanced Clarke-Wright due to API error.');
    // Fallback to another algorithm if the request fails
    return enhancedClarkeWrightAlgorithm(vehicles, locations, depot);
  }
}
// Google OR-Tools implementation
// Corrected: Fixes the logic for adding vehicle capacity constraints.
function solveWithORTools(vehicles, locations, depot, distances, ortools) {
  const toId = (objId) => objId.toString();
  const depotId = toId(depot._id);
  const nonDepot = locations.filter((l) => toId(l._id) !== depotId);

  try {
    // Create the routing index manager
    const manager = new ortools.RoutingIndexManager(
      locations.length, // Use full locations length
      vehicles.length,  // number of vehicles
      0                 // depot index
    );

    // Create Routing Model
    const routing = new ortools.RoutingModel(manager);

    // Create and register a transit callback
    const transitCallbackIndex = routing.RegisterTransitCallback((fromIndex, toIndex) => {
      const fromNode = manager.IndexToNode(fromIndex);
      const toNode = manager.IndexToNode(toIndex);
      const fromId = toId(locations[fromNode]._id);
      const toIdStr = toId(locations[toNode]._id);
      return Math.round((distances[fromId][toIdStr] || 0) * 100); // Convert to integer for OR-Tools
    });

    // Define cost of each arc
    routing.SetArcCostEvaluatorOfAllVehicles(transitCallbackIndex);

    // Add capacity constraints
    const demandCallbackIndex = routing.RegisterUnaryTransitCallback((fromIndex) => {
      const fromNode = manager.IndexToNode(fromIndex);
      return locations[fromNode].demand || 0;
    });

    // --- CORRECTION START ---
    // The capacity dimension must be added ONCE with an array of ALL vehicle capacities.
    const vehicleCapacities = vehicles.map(v => v.capacity || 0);
    routing.AddDimensionWithVehicleCapacity(
      demandCallbackIndex,
      0, // null capacity slack
      vehicleCapacities, // an array of capacities for all vehicles
      true, // start cumul to zero
      'Capacity'
    );
    // --- CORRECTION END ---


    // Setting first solution heuristic
    const searchParameters = ortools.DefaultRoutingSearchParameters();
    searchParameters.first_solution_strategy = ortools.FirstSolutionStrategy.PATH_CHEAPEST_ARC;
    searchParameters.local_search_metaheuristic = ortools.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH;
    searchParameters.time_limit.seconds = 30; // 30 second time limit

    // Solve the problem
    const solution = routing.SolveWithParameters(searchParameters);

    if (!solution) {
      console.log('OR-Tools could not find a solution');
      return null;
    }

    // Extract routes from solution
    const routes = [];
    for (let vehicleIndex = 0; vehicleIndex < vehicles.length; vehicleIndex++) {
      let index = routing.Start(vehicleIndex);
      // Skip unused vehicles
      if (routing.IsEnd(solution.Value(routing.NextVar(index)))) {
          continue;
      }

      const routeStops = [];
      let totalCapacity = 0;

      while (!routing.IsEnd(index)) {
        const nodeIndex = manager.IndexToNode(index);
        const location = locations[nodeIndex];
        
        routeStops.push({
            locationId: location._id,
            locationName: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            demand: location.demand || 0,
            order: routeStops.length
        });
        
        if (nodeIndex !== 0) { // Don't add depot demand
             totalCapacity += location.demand || 0;
        }
        index = solution.Value(routing.NextVar(index));
      }
      
      // Add final depot stop to complete the loop visually
      const lastNodeIndex = manager.IndexToNode(index);
      const lastLocation = locations[lastNodeIndex];
      routeStops.push({
          locationId: lastLocation._id,
          locationName: lastLocation.name,
          latitude: lastLocation.latitude,
          longitude: lastLocation.longitude,
          demand: lastLocation.demand || 0,
          order: routeStops.length
      });

      if (routeStops.length > 2) { // Has actual stops
        // Calculate route distance
        let totalDistance = 0;
        for (let i = 0; i < routeStops.length - 1; i++) {
          const fromId = toId(routeStops[i].locationId);
          const toIdStr = toId(routeStops[i + 1].locationId);
          totalDistance += distances[fromId][toIdStr] || 0;
        }

        routes.push({
          vehicle: vehicles[vehicleIndex]._id,
          vehicleName: vehicles[vehicleIndex].name,
          stops: routeStops,
          distance: totalDistance,
          duration: Math.round((totalDistance / 40) * 60), // 40 km/h average speed
          totalCapacity: totalCapacity
        });
      }
    }

    console.log(`OR-Tools found ${routes.length} routes with total distance: ${routes.reduce((sum, r) => sum + r.distance, 0)} km`);
    return routes;

  } catch (error) {
    console.error('Error in OR-Tools implementation:', error);
    return null;
  }
}

// Update pheromone trails
function updatePheromones(pheromones, solutions, rho, Q, distances) {
  const toId = (objId) => objId.toString();

  // Evaporation
  Object.keys(pheromones).forEach(fromId => {
    Object.keys(pheromones[fromId]).forEach(toId => {
      pheromones[fromId][toId] *= (1 - rho);
    });
  });

  // Deposit pheromones based on solution quality
  solutions.forEach(solution => {
    if (!solution || !solution.stops) return;

    const cost = calculateTotalCost([solution], distances);
    const deltaPheromone = Q / cost;

    for (let i = 0; i < solution.stops.length - 1; i++) {
      const fromId = toId(solution.stops[i].locationId);
      const toIdStr = toId(solution.stops[i + 1].locationId);

      if (pheromones[fromId] && pheromones[fromId][toIdStr]) {
        pheromones[fromId][toIdStr] += deltaPheromone;
      }
    }
  });
}

// Helper functions

function assignVehiclesToRoutes(routes, vehicles, distances, speedKmh) {
  const vehicleSlots = [];
  vehicles.forEach((v) => {
    const count = v.count || 1;
    for (let i = 0; i < count; i++) {
      vehicleSlots.push({
        _id: v._id,
        name: v.name,
        capacity: v.capacity || 0,
        used: false,
        currentLoad: 0
      });
    }
  });

  routes.sort((a, b) => (b.totalCapacity || 0) - (a.totalCapacity || 0));
  vehicleSlots.sort((a, b) => b.capacity - a.capacity);

  for (const route of routes) {
    const bestSlot = vehicleSlots
      .filter(vs => !vs.used && vs.capacity >= (route.totalCapacity || 0))
      .sort((a, b) => (a.capacity - (a.currentLoad + (route.totalCapacity || 0))) -
                      (b.capacity - (b.currentLoad + (route.totalCapacity || 0))))[0];

    if (bestSlot) {
      route.vehicle = bestSlot._id;
      route.vehicleName = bestSlot.name;
      bestSlot.used = true;
      bestSlot.currentLoad += route.totalCapacity || 0;
    }
  }

  // Validate route integrity
  validateRoutes(routes, vehicles);
  return routes;
}

function validateRoutes(routes, vehicles) {
  let totalAssignedCapacity = 0;
  let totalVehicleCapacity = 0;

  routes.forEach(route => {
    if (route.vehicle) {
      const vehicle = vehicles.find(v => v._id.toString() === route.vehicle.toString());
      if (vehicle) {
        const routeCapacity = route.totalCapacity || 0;
        const vehicleCapacity = vehicle.capacity || 0;
        if (routeCapacity > vehicleCapacity) {
          console.warn(`Route capacity (${routeCapacity}) exceeds vehicle capacity (${vehicleCapacity}) for vehicle ${vehicle.name}`);
        }
        totalAssignedCapacity += routeCapacity;
      }
    }
  });

  vehicles.forEach(v => {
    totalVehicleCapacity += (v.capacity || 0) * (v.count || 1);
  });

  if (totalAssignedCapacity > totalVehicleCapacity) {
    console.warn(`Total assigned capacity (${totalAssignedCapacity}) exceeds total vehicle capacity (${totalVehicleCapacity})`);
  }

  console.log(`Route validation: ${routes.filter(r => r.vehicle).length}/${routes.length} routes assigned, ${totalAssignedCapacity}/${totalVehicleCapacity} capacity utilized`);
}

// Helper functions moved to top to avoid initialization errors
// Robust Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
      typeof lat2 !== 'number' || typeof lon2 !== 'number' ||
      isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.warn('Invalid coordinates for distance calculation:', { lat1, lon1, lat2, lon2 });
    return 0;
  }

  const toRad = (deg) => deg * Math.PI / 180;

  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1000) / 1000; // km rounded to 3 decimals
}
function calculateTotalCost(solution, distances) {
  const toIdLocal = (objId) => objId.toString();
  return solution.reduce((total, route) => {
    let routeCost = 0;
    for (let i = 0; i < route.stops.length - 1; i++) {
      const fromId = toIdLocal(route.stops[i].locationId);
      const toIdStr = toIdLocal(route.stops[i + 1].locationId);
      routeCost += distances[fromId]?.[toIdStr] || 0;
    }
    return total + routeCost;
  }, 0);
}

function recomputeAllRouteMetrics(solution, distances, speedKmh) {
  const toId = (objId) => objId.toString();
  solution.forEach(route => {
    let dist = 0;
    for (let k = 0; k < route.stops.length - 1; k++) {
      const from = route.stops[k];
      const to = route.stops[k + 1];
      const fromId = toId(from.locationId);
      const toIdStr = toId(to.locationId);
      dist += distances[fromId]?.[toIdStr] || calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);
    }
    route.distance = dist;
    route.duration = Math.round((dist / speedKmh) * 60);
  });
}

function generateSolutionKey(solution) {
  return solution.map(route =>
    route.stops.map(stop => stop.locationId.toString()).join('-')
  ).sort().join('|');
}


// Get routed polyline and metrics from OSRM for a stop sequence
async function getOsrmRouteForStops(stops) {
  // OSRM public demo server (rate-limited); for production, host your own
  const base = 'https://router.project-osrm.org/route/v1/driving/';
  const coords = stops.map(s => `${s.longitude},${s.latitude}`).join(';');
  const url = `${base}${coords}?overview=full&geometries=geojson&steps=false&alternatives=false`;

  try {
    console.log('Fetching OSRM route for:', coords);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CVRP-Optimizer/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OSRM request failed with status ${res.status}`);
    }

    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found in OSRM response');
    }

    const route = data.routes[0];

    // Validate geometry
    if (!route.geometry || !route.geometry.coordinates || route.geometry.coordinates.length === 0) {
      throw new Error('Invalid geometry in OSRM response');
    }

    console.log('OSRM route fetched successfully');

    return {
      geometry: route.geometry, // GeoJSON LineString
      distanceKm: (route.distance || 0) / 1000,
      durationMin: Math.round((route.duration || 0) / 60)
    };
  } catch (e) {
    console.error('OSRM error:', e.message);

    // Fallback: return straight-line route
    console.log('Falling back to straight-line route');
    return {
      geometry: {
        type: 'LineString',
        coordinates: stops.map(s => [s.longitude, s.latitude])
      },
      distanceKm: calculateStraightLineDistance(stops),
      durationMin: Math.round((calculateStraightLineDistance(stops) / 40) * 60), // Assume 40 km/h average speed
      fallback: true
    };
  }
}

// Calculate straight-line distance for fallback
function calculateStraightLineDistance(stops) {
  let totalDistance = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    totalDistance += calculateDistance(stops[i].latitude, stops[i].longitude, stops[i + 1].latitude, stops[i + 1].longitude);
  }
  return totalDistance;
}

// API helper to route a given route's stops
exports.getRoutedPolyline = async (req, res) => {
  try {
    const { id, routeIndex } = req.params;
    const optimization = await Optimization.findById(id);
    if (!optimization) return res.status(404).json({ msg: 'Optimization not found' });
    if (optimization.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });
    const route = optimization.routes[Number(routeIndex)];
    if (!route) return res.status(404).json({ msg: 'Route not found' });

    const osrm = await getOsrmRouteForStops(route.stops);
    if (!osrm) return res.status(502).json({ msg: 'Failed to get routed polyline' });

    res.json(osrm);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};