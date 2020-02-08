const Vendor = require('../models/Vendor.js')
const Student = require('../models/Student.js')
const Transaction = require('../models/Transaction.js')
const KeyPair = require('../models/KeyPair.js')
const socketController = require('./socketController')
const keyPairHelpers = require('../helpers/keyPairHelpers')

const TRANSACTION_REGISTERED = 0;
const TRANSACTION_COMPLETED = 1;
const TRANSACTION_DENIED = 2;
const TRANSACTION_CANCELLED = 3;

exports.createPayment = (req, res) => {
    var userId = req.userId
    var amount = req.body.amount
    var loginType = req.loginType

    if (loginType == "Vendor"){
        Vendor.findOne({username: userId}, function(err, vendor){
            if(err){
                console.log(err)
                return res.status(500).send({'message': 'Unknown Error'})
            }
            if(vendor.upiId == ""){
                return res.status(500).send({'message': 'UPI not found'})
            }
            Transaction.create({receiver: userId, amount: amount, isReceiverVendor: true, dateCreated: Date.now()}, function(err, newTransaction){
                if(err){
                    console.log(err)
                }
                return res.send({'transactionId': newTransaction._id})
            })
        })
    }
    else if (loginType == "Student") {
        Student.findOne({rollNumber: userId}, function(err, student){
            if(err){
                console.log(err)
                return res.status(500).send({'message': 'Unknown Error'})
            }
            if(student.upiId == ""){
                return res.status(500).send({'message': 'UPI not found'})
            }
            Transaction.create({receiver: userId, amount: amount}, function(err, newTransaction){
                if(err){
                    console.log(err)
                }
                return res.send({'transactionId': newTransaction._id})
            })
        })
    }
}

exports.registerPayment = async (req, res, next) => {
    var userId = req.userId
    var loginType = req.loginType
    var data = req.body.data
    if(loginType != "Student"){
        return res.status(401).send({'message': 'Invalid Action'})
    }
    else{
        try{
            let keyPair = await KeyPair.findOne({userId: userId})
        } catch(err){
            console.log(err)
            return res.status(500).send({'message': 'Unknown Error'})
        }
        var body = JSON.parse(keyPairHelpers.decrypt(data, keyPair.private_key, keyPair.peer_public_key))
        var transactionId = body.transactionId
        Transaction.findById(transactionId, async function(err, transaction){
            if(err || !transaction){
                console.log(err)
                return res.status(500).send({'message': 'Unknown Error'})
            }
            if(transaction.receiver == userId){
                return res.status(403).send({'message': 'Invalid Action'})
            }
            var pendingRequests = []
            let transactions = await Transaction.find({receiver: transaction.receiver, sender: userId, isActivated: true});
            for (let pending of transactions) {
                pendingRequests.push({
                    transactionId: pending._id,
                    sender: pending.sender,
                    amount: pending.amount
                })
            }
            transaction.sender = userId
            transaction.isActivated = true
            transaction.save(function(err){
                if(err){
                    console.log(err)
                }
                var response = {type: TRANSACTION_REGISTERED, transactionId: transaction._id}
                var returnData = keyPairHelpers.encrypt(JSON.stringify(response), keyPair.private_key, keyPair.peer_public_key)
                socketController.sendSocketDataToUser(req.io, transaction.receiver, {data: returnData})
                return res.status(200).send({'message': 'Success', pendingRequests: pendingRequests})
            })
        })
    }
}

exports.getUpiPaymentDetails = async (req, res, next) => {
  var userId = req.userId
  var loginType = req.loginType
  var data = req.body.data
  try{
    let keyPair = await KeyPair.findOne({userId: userId})
  } catch(err){
    console.log(err)
    return res.status(500).send({'message': 'Unknown Error'})
  }
  var body = JSON.parse(keyPairHelpers.decrypt(data, keyPair.private_key, keyPair.peer_public_key))
  var transactionId = body.transactionId
  var transaction = await Transaction.findOne({_id: transactionId, sender: userId})
  if (!transaction) {
    res.status(500).send("Server error");
  }
  if (transaction.isReceiverVendor) {
    var vendor = await Vendor.findOne({ username: transaction.receiver})
    var response = { receiverId: vendor.username, upiId: vendor.upiId, amount: transaction.amount }
    var returnData = keyPairHelpers.encrypt(JSON.stringify(response), keyPair.private_key, keyPair.peer_public_key)
    return res.send({data: returnData})
  } else {
    var student = await Student.findOne({ rollNumber: transaction.receiver})
    var response = { receiverId: student.rollNumber, upiId: student.upiId, amount: transaction.amount }
    var returnData = keyPairHelpers.encrypt(JSON.stringify(response), keyPair.private_key, keyPair.peer_public_key)
    return res.send({data: returnData})
  }
}

exports.confirmPayment = async (req, res, next) => {
    var userId = req.userId
    var data = req.body.data
    try{
        let keyPair = await KeyPair.findOne({userId: userId})
    } catch(err){
        console.log(err)
        return res.status(500).send({'message': 'Unknown Error'})
    }
    var body = JSON.parse(keyPairHelpers.decrypt(data, keyPair.private_key, keyPair.peer_public_key))
    var transactionId = body.transactionId

    Transaction.findById(transactionId, function(err, transaction){
        if(err){
            console.log(err)
            return res.status(500).send({'message': 'Unknown Error'})
        }
        else{
            transaction.refID = body.refID
            transaction.isCompleted = true
            transaction.isActivated = false
            transaction.dateCompleted = Date.now()
            transaction.save()
            return res.status(200).send({message: 'Success'})
        }
    })
}

exports.cancelPayment = (req, res, next) => {
    var userId = req.userId
    var transactionId = req.body.transactionId

    Transaction.findOne({_id: transactionId, receiver: userId}, function(err, transaction){
        if(err || !transaction){
            console.log(err)
            return res.status(401).send({'message': 'Invalid Action'})
        }
        transaction.isCancelled = true
        transaction.isActivated = false
        transaction.save(function(err){
            if(err){
                console.log(err)
            }
            socketController.sendSocketDataToUser(req.io, transaction.sender, {type: TRANSACTION_CANCELLED, transactionId: transaction._id})
            return res.status(200).send({'message': 'Success'})
        })
    })
}

exports.denyPayment = (req, res, next) => {
    var transactionId = req.body.transactionId
    if (req.loginType != Student){
      return res.status(401).send({'message': 'Invalid Action'})
    }
    else {
      Transaction.findById(transactionId, function(err, transaction) {
        if (err) {
          console.log(err)
          return res.status(403).send({'message': 'Bad Request'})
        }
        else {
          transaction.isDenied = true
          transaction.save()
          socketController.sendSocketDataToUser(req.io, transaction.receiver, {type: TRANSACTION_DENIED, transactionId: transaction._id})
          return res.send({message: "Success"})
        }
      })
    }
}

exports.pendingRequests = (req, res) => {
    var userId = req.userId
    var loginType = req.loginType

    if (loginType !== 'Student') {
        return req.status(401).send({ message: "Invalid actions" })
    }

    Transaction.find({ sender: userId, isActive: true, isCompleted: false }, function(err, transactions){
        if (err) {
            console.log(err);
            return res.status(500).send({'message': 'Unknown Error'})
        }
        const pendingRequests = []
        for (let transaction of transactions) {
            pendingRequests.push({
                transactionId: transaction._id,
                receiver: transaction.receiver,
                amount: transaction.amount
            })
        }
        return res.send({ message: 'Success', pendingRequests: pendingRequests })
    })
}

exports.pendingPayments = (req, res) => {
    var userId = req.userId

    Transaction.find({ receiver: userId, isActive: true, isCompleted: false }, function(err, transactions){
        if (err) {
            console.log(err);
            return res.status(500).send({'message': 'Unknown Error'})
        }
        const pendingPayments = []
        for (let transaction of transactions) {
            pendingPayments.push({
                transactionId: transaction._id,
                sender: transaction.sender,
                amount: transaction.amount
            })
        }
        return res.send({ message: 'Success', pendingPayments: pendingPayments })
    })
}

exports.completedTransactions = (req, res) => {
    var userId = req.userId

    Transaction.find({ $or: [{ receiver: userId }, { sender: userId }], isCompleted: true }, function(err, transactions){
        if (err) {
            console.log(err);
            return res.status(500).send({'message': 'Unknown Error'})
        }
        const completedPayments = []
        for (let transaction of transactions) {
            completedPayments.push({
                transactionId: transaction._id,
                sender: transaction.sender,
                receiver: transaction.receiver,
                amount: transaction.amount,
                modeOfPayment: transaction.isUpi ? 'UPI' : 'Wallet',
                dateOfPayment: transaction.dateCompleted
            })
        }
        return res.send({ message: 'Success', completedPayments: completedPayments })
    })
}
