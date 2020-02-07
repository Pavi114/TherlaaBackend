const Vendor = require('../models/Vendor.js')
const Student = require('../models/Student.js')
const Transaction = require('../models/transaction.js')

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
    res.send('Lalalalal')
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
