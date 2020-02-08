const imaps = require('imap-simple')
const jwt = require('jsonwebtoken')
const hash = require('password-hash')
const Student = require('../models/Student.js')
const Vendor = require('../models/Vendor.js')
const Wallet = require('../models/Wallet.js')
const { check, validationResult } = require('express-validator')
const config = require('../config')

exports.validateStudentLogin = [
  check('rollNumber')
    .exists().withMessage('Roll Number missing'),
  check('password')
    .exists().withMessage('Password Missing')
]

exports.studentLogin = (req, res) => {
  const errors = validationResult(req).array()
  if (errors.length) {
    res.status(400)
    res.send({ message: 'Bad Request' })
    return false
  }

  const imapConfig = {
    imap: {
      user: req.body.rollNumber,
      password: req.body.password,
      host: 'webmail.nitt.edu',
      port: 143,
      tls: false,
      authTimeout: 30000
    }
  }

  imaps.connect(imapConfig).then(async connection => {
    const response = {
      message: 'Login Successful'
    }
    connection.end()

    // Find User ID
    Student.findOne({ rollNumber: req.body.rollNumber }, function (err, student) {
      if (err) {
        console.log(err);
      }

      // If student doesn't exist create a new entry.
      if (!student) {
        Student.create({ rollNumber: req.body.rollNumber }, function (err, newstudent) {
          if (err) {
            console.log(err);
          }
          Wallet.create({userId: req.body.rollNumber, amount: 0, isVendor: false}, function(err, newWallet){
            if(err) {
              console.log(err)
              res.status(403).send({message: 'Idk'})
            }
            response.APIToken = jwt.sign({ rollNumber: req.body.rollNumber, loginType: 'Student', time: Date.now() }, config.apiSecret)

            res.status(200)
            res.send(response)
          })
        })
      } else {
        response.APIToken = jwt.sign({ rollNumber: req.body.rollNumber, loginType: 'Student', time: Date.now() }, config.apiSecret)

        res.status(200)
        res.send(response)
      }
    })
  }).catch(err => {
    console.log(err);

    const response = {
      message: 'Invalid Credentials'
    }

    res.status(401)
    res.send(response)
  })
}

exports.vendorRegister = async (req, res, next) => {
    var { username, password, upiId } = req.body

    let vendor = await Vendor.findOne({ $or: [{username: username}, {upiId: upiId}] });
    if (vendor) {
      return res.status(401).send({'message': 'Username or UPI Id already exists'});
    }
    var hashedPassword = hash.generate(password)
    const response = {
      message: 'Register Successful'
    }
    Vendor.create({ username: username, password: hashedPassword, upiId: upiId }, function(err, newVendor){
      if (err) {
        console.log(err)
        return res.status(500).send({'message': 'Unknown Error'})
      }
      Wallet.create({userId: username, amount: 0, isVendor: true}, function(err, newWallet){
        if(err) {
          console.log(err)
          res.status(403).send({message: 'Idk'})
        }
        response.APIToken = jwt.sign({ rollNumber: username, loginType: 'Vendor', time: Date.now() }, config.apiSecret)

        res.status(200)
        res.send(response)
      })
    })
}

exports.vendorLogin = (req, res, next) => {
    var username = req.body.username
    var password = req.body.password
    const response = {
      message: 'Login Successful'
    }
    Vendor.findOne({username: username}, function(err, vendor) {
        if(err) {
          console.log(err)
          res.status(404).send({message: "Unknown error"})
        }
        if (hash.verify(password, vendor.password)) {
          response.APIToken = jwt.sign({ username: req.body.username, loginType: 'Vendor', time: Date.now() }, config.apiSecret)
          res.status(200)
          res.send(response)
        }
        else {
          const response = {
            message: 'Invalid Credentials'
          }
          res.status(401).send(response)
        }
    })
}

exports.validateJWT = (req, res, next) => {
  if (!req.body.hasOwnProperty('APIToken')) {
    res.status(500)
    return res.send({ message: 'Missing API Token' })
  }

  jwt.verify(req.body.APIToken, config.apiSecret, function (err, decoded) {
    if (err) {
      console.log(err);

      res.status(401)
      res.send({ message: 'Invalid API Token' })
    } else {
      if (decoded.loginType === 'Student') {
        Student.findOne({ rollNumber: decoded.rollNumber }, function (err, student) {
          if (err) {
            console.log(err);
          }
          if (!student) {
            res.status(401)
            res.send({ message: 'Invalid API Token' })
          } else {
            req.userId = decoded.rollNumber
            req.loginType = 'Student'
            next()
          }
        })
      } else if (decoded.loginType === 'Vendor') {
        Vendor.findOne({ username: decoded.username }, function (err, vendor) {
          if (err) {
            console.log(err);
          }
          if (!vendor) {
            res.status(401)
            res.send({ message: 'Invalid API Token' })
          } else {
            req.userId = decoded.username
            req.loginType = 'Vendor'
            next()
          }
        })
      }
    }
  })
}
