const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController.js')

// API
router.post('/studentLogin', authController.studentLogin) // Return a json-web-token
router.post('/vendorLogin', authController.vendorLogin)
router.use('/pay', authController.validateJWT)

module.exports = router
