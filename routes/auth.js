const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController.js')
const keyExchangeRoutes = require('../controllers/keyExchangeController.js')

router.post('/studentLogin', authController.validateStudentLogin, authController.studentLogin) // Return a json-web-token
router.post('/vendorRegister', authController.vendorRegister)
router.post('/vendorLogin', authController.vendorLogin)
router.use('/pay', authController.validateJWT)
router.use('/upi', authController.validateJWT)

router.post('/keyExchange', keyExchangeRoutes.performKeyExchange)

module.exports = router
