const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController.js')
const keyExchangeController = require('../controllers/keyExchangeController')

router.post('/studentLogin', authController.validateStudentLogin, authController.studentLogin) // Return a json-web-token
router.post('/vendorRegister', authController.vendorRegister)
router.post('/vendorLogin', authController.vendorLogin)
router.use('/pay', authController.validateJWT)
router.use('/upi', authController.validateJWT)

router.post('/keyExchange', keyExchangeController.performKeyExchange)

module.exports = router
