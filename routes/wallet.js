const express = require('express')
const router = express.Router()
const walletController = require('../controllers/walletController.js')

router.post('/addMoneyToWallet', walletController.addMoneyToWallet)

module.exports = router
