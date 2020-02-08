const mongoose = require('mongoose')

const walletPaymentSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  transactionId: String,
  amount: Number,
  isAuthenticated: {
      type: Boolean,
      default: false
  },
  dateCreated: Date,
  dateCompleted: Date
});

module.exports = mongoose.model('WalletPayment', walletPaymentSchema)