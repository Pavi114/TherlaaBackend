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
    refID: String,
    isReceiverVendor: {
      type: Boolean,
      default: false
    },
    isDenied: {
      type: Boolean,
      default: false
    },
    isCancelled: {
      type: Boolean,
      default: false
    },
    dateCreated: Date,
    dateCompleted: Date
});

module.exports = mongoose.model('Transaction', transactionSchema)
