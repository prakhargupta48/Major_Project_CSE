const Location = require('../models/Location');

// Get all locations
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ user: req.user.id }).sort({ date: -1 });
    res.json(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get location by ID
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    // Check if location exists
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }
    
    // Check user
    if (location.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    res.json(location);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Location not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create location
exports.createLocation = async (req, res) => {
  const { name, address, latitude, longitude, demand, isDepot } = req.body;
  
  try {
    const newLocation = new Location({
      name,
      address,
      latitude,
      longitude,
      demand: demand || 0,
      isDepot: isDepot || false,
      user: req.user.id
    });
    
    const location = await newLocation.save();
    res.json(location);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update location
exports.updateLocation = async (req, res) => {
  const { name, address, latitude, longitude, demand, isDepot } = req.body;
  
  try {
    let location = await Location.findById(req.params.id);
    
    // Check if location exists
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }
    
    // Check user
    if (location.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update fields
    location.name = name || location.name;
    location.address = address || location.address;
    location.latitude = latitude || location.latitude;
    location.longitude = longitude || location.longitude;
    
    if (demand !== undefined) location.demand = demand;
    if (isDepot !== undefined) location.isDepot = isDepot;
    
    await location.save();
    res.json(location);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Location not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete location
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    // Check if location exists
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }
    
    // Check user
    if (location.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await location.remove();
    res.json({ msg: 'Location removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Location not found' });
    }
    res.status(500).send('Server error');
  }
};