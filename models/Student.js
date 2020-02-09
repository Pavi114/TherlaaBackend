const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
  rollNumber: String,
  upiId: String,
  loginPin: String,
  lastLogin: Date
});

module.exports = mongoose.model('Student', studentSchema)
