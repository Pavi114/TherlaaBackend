const imaps = require('imap-simple')
const jwt = require('jsonwebtoken')
const Student = require('../models/Student.js')
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
      host: '203.129.195.133',
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
          response.APIToken = jwt.sign({ rollNumber: req.body.rollNumber, loginType: 'Student', time: Date.now() }, config.apiSecret)

          res.status(200)
          res.send(response)
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

exports.vendorLogin = (req, res, next) => {
    res.send('Lalalalal')
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
