const Wallet = require('../models/Wallet.js')
const WalletPayment = require('../models/WalletPayment.js')
const Transaction = require('../models/Transaction.js')
const hash = require('password-hash')

exports.addMoneyToWallet = (req, res, next) => {
  Wallet.findOne({userId: req.userId}, function(err, wallet) {
      if (err) {
        console.log(err)
        res.status(404).send({message: 'Bad Request'})
      }
      else {
        wallet.amount += req.body.amount
        wallet.save()
        res.send({message: 'Successfully Updated'})
      }
  })
}

exports.getBalance = (req, res, next) => {
  Wallet.findOne({userId: req.userId}, function(err, wallet) {
    if (err) {
      console.log(err)
      res.status(404).send({message: 'Bad Request'})
    }
    else {
       res.send({amount: wallet.amount})
    }
  })
}

exports.setWalletPin = (req, res, next) => {
  Wallet.findOne({userId: req.userId}, function(err, wallet) {
    if (err || !wallet) {
      console.log(err)
      res.status(500).send({message: 'Invalid request'})
    }
    else {
      wallet.walletPin = hash.generate(req.pin)
      wallet.save()
      res.status(200).send({message: 'Set Successfully'})
    }
  })
}

exports.newWalletPayment = (req, res, next) => {
  var sender = req.userId
  var transactionId = req.body.transactionId
  var receiver = req.body.receiverId
  var amount = req.body.amount
  WalletPayment.create({sender: sender, receiver: receiver, amount: amount, transactionId: transactionId, dateCreated: Date.now()}, function(err, newPayment){
    if(err){
      console.log(err)
    }
    return res.status(200).send({'message': 'Success', 'paymentId': newPayment._id})
  })
}

exports.finishWalletPayment = async (req, res, next) => {
  var password = req.body.password
  var walletPaymentId = req.body.walletPaymentId
  var userId = req.userId

  Wallet.findOne({userId: userId}, function(err, wallet){
    if(err || !wallet){
      console.log(err)
      res.status(500).send({message: 'Invalid request'})
    }
    else{
      var walletPin = wallet.walletPin
      if(hash.verify(password, walletPin)){
        try {
          let walletPayment = await WalletPayment.findById(walletPaymentId)
        } catch (error) {
          console.log(error)
          return res.status(500).send({message: 'Invalid request'})
        }
        walletPayment.isAuthenticated = true
        walletPayment.dateCompleted = Date.now()
        walletPayment.save()
        try {
          let senderWallet = await Wallet.findById(walletPayment.sender)
        } catch(error){
          console.log(error)
          return res.status(500).send({message: 'Invalid request'})
        }
        try {
          let receiverWallet = await Wallet.findById(walletPayment.receiver)
        } catch(error){
          console.log(error)
          return res.status(500).send({message: 'Invalid request'})
        }
        senderWallet.amount-=walletPayment.amount
        receiverWallet.amount+=walletPayment.amount
        senderWallet.save()
        receiverWallet.save()
        try{
          let completed = await Transaction.findById(walletPayment.transactionId)
        } catch(error){
          console.log(error)
          return res.status(500).send({message: 'Invalid request'})
        }
        completed.isCompleted = true
        completed.isActivated = false
        completed.save()
        return res.status(200).send({message: 'Success'})          
      }
      else{
        return res.status(402).send({message: 'Invalid request'})
      }
    }
  })
}
