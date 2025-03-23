const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  vehicleName: String,
  stops: [{
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    locationName: String,
    latitude: Number,
    longitude: Number,
    demand: Number,
    order: Number
  }],
  totalDistance: Number,
  totalCapacity: Number
});

const OptimizationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  routes: [RouteSchema],
  totalDistance: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Optimization', OptimizationSchema);