const Vendor = require('../models/Vendor.js')
const Student = require('../models/Student.js')
const Transaction = require('../models/Transaction.js')

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
            Transaction.create({receiver: userId, amount: amount, isReceiverVendor: true}, function(err, newTransaction){
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

exports.registerPayment = (req, res, next) => {
    var userId = req.userId
    var loginType = req.loginType
    var transactionId = req.body.transactionId
    if(loginType != "Student"){
        return res.status(401).send({'message': 'Invalid Action'})
    }
    else{
        Transaction.findById(transactionId, function(err, transaction){
            if(err || !transaction){
                console.log(err)
                return res.status(500).send({'message': 'Unknown Error'})
            }
            if(transaction.receiver == userId){
                return res.status(403).send({'message': 'Invalid Action'})
            }
            var pendingRequests = []
            Transaction.find({receiver: transaction.receiver, sender: userId, isActivated: true}, function(err,transactions){
                if(err){
                    console.log(err)
                }
                if(transactions){
                    for (let pending of transactions) {
                        pendingRequests.push({
                            transactionId: pending._id,
                            sender: pending.sender,
                            amount: pending.amount
                        })
                    }
                }
            })
            transaction.sender = userId
            transaction.isActivated = true
            transaction.save(function(err){
                if(err){
                    console.log(err)
                }
                return res.status(200).send({'message': 'Success', pendingRequests: pendingRequests})
            })
        })
    }
}

exports.getUpiPaymentDetails = (req, res, next) => {
  var userId = req.userId
  var loginType = req.loginType
  var transactionId = req.body.transactionId
  Transaction.findById(transactionId, function(err, transaction) {
    if (err || !transaction || transaction.sender != userId) {
      console.log(err)
      res.send(500).send({message: "Bad request"})
    }
    else {
      if(loginType == 'Vendor'){
          Vendor.findOne({username: transaction.sender}, function(err, vendor){
              if(err){
                console.log(err)
                res.status(500).send({message: 'Unknown error'})
              }
              else {
                res.send({upiId: vendor.upiId, amount: transaction.amount})
              }
          })
      }
      else if(loginType == 'Student'){
        Student.findOne({rollNumber: transaction.sender}, function(err, student){
            if(err){
              console.log(err)
              res.status(500).send({message: 'Unknown error'})
            }
            else {
              res.send({upiId: student.upiId, amount: transaction.amount})
            }
        })
      }
      else {
        res.status(500).send({message: 'Bad Request'})
      }
    }
  })
}

exports.payThruWallet = (req, res, next) => {
  var userId = req.userId
  var loginType = req.loginType
  var transactionId = req.body.transactionId
  Transaction.findById(transactionId, function (err, transaction){
      if(userId != transaction.sender){
        res.status(500).send('Bad Request')
      }
      else {
        Wallet.findOne({userId: userId}, function(er, wallet) {
          if(err){
            console.log(err)
            res.status(400).send('Unknown error')
          }
          else {
            Wallet.findOne({userId: transaction.receiver}, function(e, receiverWallet){
              if(err) {
                console.log(err)
                res.status(400).send('Unknown Error')
              }
              else {
                  wallet.amount -= transaction.amount
                  receiverWallet.amount += transaction.amount
                  res.send({message: 'Success'})
              }
            })
          }
        })
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
                amount: transaction.amount
            })
        }
        return res.send({ message: 'Success', completedPayments: completedPayments })
    })
}
