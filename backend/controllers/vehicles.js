const Vehicle = require('../models/Vehicle');

// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user.id }).sort({ date: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    // Check if vehicle exists
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    
    // Check user
    if (vehicle.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create vehicle
exports.createVehicle = async (req, res) => {
  const { name, capacity, count } = req.body;
  
  try {
    const newVehicle = new Vehicle({
      name,
      capacity,
      count,
      user: req.user.id
    });
    
    const vehicle = await newVehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  const { name, capacity, count } = req.body;
  
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    
    // Check if vehicle exists
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    
    // Check user
    if (vehicle.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update fields
    vehicle.name = name || vehicle.name;
    vehicle.capacity = capacity || vehicle.capacity;
    vehicle.count = count || vehicle.count;
    
    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    // Check if vehicle exists
    if (!vehicle) {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    
    // Check user
    if (vehicle.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await vehicle.remove();
    res.json({ msg: 'Vehicle removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Vehicle not found' });
    }
    res.status(500).send('Server error');
  }
};