const mongoose = require('mongoose')

const vendorSchema = new mongoose.Schema({
  username: String,
  password: String,
  upiId: String
});

module.exports = mongoose.model('Vendor', vendorSchema)
