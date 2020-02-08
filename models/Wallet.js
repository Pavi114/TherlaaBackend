const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    userId: String,
    amount: Number,
    isVendor: {
      type: Boolean,
      default: false
    }
})

module.exports = mongoose.model('Wallet', walletSchema)
