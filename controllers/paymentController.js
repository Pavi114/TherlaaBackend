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
            Transaction.create({receiver: userId, amount: amount}, function(err, newTransaction){
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
            if(err){
                console.log(err)
                return res.status(500).send({'message': 'Unknown Error'})
            }
            if(transaction.receiver == userId){
                return res.status(403).send({'message': 'Invalid Action'})
            }
            transaction.sender = userId
            transaction.isActivated = true
            transaction.save(function(err){
                if(err){
                    console.log(err)
                }
                return res.status(200).send({'message': 'Success'})
            })
        })
    }
}

exports.cancelPayment = (req, res, next) => {
    res.send('Lalalalal')
}

exports.denyPayment = (req, res, next) => {
    res.send('Lalalalal')
}

exports.pendingRequests = (req, res, next) => {
    res.send('Lalalalal')
}

exports.pendingPayments = (req, res, next) => {
    res.send('Lalalalal')
}
