const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/paymentController.js')

router.post('/createPayment', paymentController.createPayment) // To generate bill and return QR (or just return payment ID and generate QR on phone, will probably be faster)
router.post('/registerPayment', paymentController.registerPayment) // To register a payment by sending the payment ID (ours) and refId (UPIs)
router.post('/cancelPayment', paymentController.cancelPayment)
router.post('/denyPayment', paymentController.denyPayment)
router.post('/pendingRequests', paymentController.pendingRequests) // To get pending requests on Client
router.post('/pendingPayments', paymentController.pendingPayments) // To get pening payments on Server
router.post('/completedTransactions', paymentController.completedTransactions)
router.post('/payThruWallet', paymentController.payThruWallet)

module.exports = router
