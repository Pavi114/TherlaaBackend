const express = require('express')
const router = express.Router()
const walletController = require('../controllers/walletController.js')

router.post('/addMoneyToWallet', walletController.addMoneyToWallet)
router.post('/getBalance', walletController.getBalance)
router.post('/setPin', walletController.setWalletPin)

module.exports = router
