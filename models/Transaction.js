const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    isActivated: {
      type: Boolean,
      default: false
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    amount: Number,
    ref_ID: String,
    is_receiver_vendor: {
      type: Boolean,
      default: false
    }
});

module.exports = mongoose.model('Transaction', transactionSchema)
