const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const locationController = require('../controllers/locations');

// @route   GET api/locations
// @desc    Get all locations
// @access  Private
router.get('/', auth, locationController.getLocations);

// @route   GET api/locations/:id
// @desc    Get location by ID
// @access  Private
router.get('/:id', auth, locationController.getLocationById);

// @route   POST api/locations
// @desc    Create location
// @access  Private
router.post('/', auth, locationController.createLocation);

// @route   PUT api/locations/:id
// @desc    Update location
// @access  Private
router.put('/:id', auth, locationController.updateLocation);

// @route   DELETE api/locations/:id
// @desc    Delete location
// @access  Private
router.delete('/:id', auth, locationController.deleteLocation);

module.exports = router;