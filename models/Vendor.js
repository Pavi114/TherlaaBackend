const mongoose = require('mongoose')

const vendorSchema = new mongoose.Schema({
  username: String,
  password: String,
  upiId: String,
  loginPin: String,
  lastLogin: Date
});

module.exports = mongoose.model('Vendor', vendorSchema)
