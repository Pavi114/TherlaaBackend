const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
  rollnumber: String,
  upiId: String
});

module.exports = mongoose.model('Student', studentSchema)
