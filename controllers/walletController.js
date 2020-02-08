const Wallet = require('../models/Wallet.js')
const Transaction = require('../models/Transaction.js')

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
