const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
  rollNumber: String,
  upiId: String
});

module.exports = mongoose.model('Student', studentSchema)
