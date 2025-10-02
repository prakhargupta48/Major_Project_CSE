const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  count: {
    type: Number,
    required: true,
    default: 1
  },
  maxDistance: {
    type: Number,
    default: 100000 // 100km in meters
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);