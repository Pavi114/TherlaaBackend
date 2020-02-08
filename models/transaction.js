const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    receiver: String,
    is_activated: {
      type: Boolean,
      default: False
    },
    ref_ID: String
});

module.exports = mongoose('Transaction', transactionSchema)
