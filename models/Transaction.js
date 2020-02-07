const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    receiver: String,
    is_activated: {
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
