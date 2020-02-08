const express = require('express')
const router = express.Router()
const upiController = require('../controllers/upiController.js')

router.post('/getUpi', upiController.getUpi)
router.post('/setUpi', upiController.setUpi)

module.exports = router
