const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const vehicleController = require('../controllers/vehicles');

// @route   GET api/vehicles
// @desc    Get all vehicles
// @access  Private
router.get('/', auth, vehicleController.getVehicles);

// @route   GET api/vehicles/:id
// @desc    Get vehicle  auth, vehicleController.getVehicles);

// @route   GET api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Private
router.get('/:id', auth, vehicleController.getVehicleById);

// @route   POST api/vehicles
// @desc    Create vehicle
// @access  Private
router.post('/', auth, vehicleController.createVehicle);

// @route   PUT api/vehicles/:id
// @desc    Update vehicle
// @access  Private
router.put('/:id', auth, vehicleController.updateVehicle);

// @route   DELETE api/vehicles/:id
// @desc    Delete vehicle
// @access  Private
router.delete('/:id', auth, vehicleController.deleteVehicle);

module.exports = router;