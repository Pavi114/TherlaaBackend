const Wallet = require('../models/Wallet.js')

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
