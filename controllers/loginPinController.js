const hash = require('password-hash')
const Student = require('../models/Student.js')
const Vendor = require('../models/Vendor.js')

exports.setLoginPin = async (req, res) => {
    passcode = req.body.passcode
    userId = req.userId
    hashed = await hash.generate(passcode)
    if(req.loginType == 'Student') {
      Student.findOne({rollNumber: userId}, function(err, student) {
          if(err || !student) {
            console.log(err)
            res.status(401)
            res.send({message: "Invalid Action"})
          }
          else {
            student.loginPin = hashed
            student.save()
            res.send({message: 'Success'})
          }
      })
    } else if(req.loginType == 'Vendor') {
        Vendor.findOne({username: userId}, function(err, vendor) {
            if(err || !vendor) {
              console.log(err)
              res.status(401)
              res.send({message: 'Invalid Action'})
            }
            else {
              vendor.loginPin = hashed
              vendor.save()
              res.send({message: 'Success'})
            }
        })
    }
}

exports.verifyLoginPin = (req, res, next) => {
  userId = req.userId
  loginType = req.loginType
  pin = req.body.passcode
  if(loginType == 'Student') {
    Student.findOne({rollNumber: userId}, function(err, student){
      if(err || !student){
        console.log(err)
        res.status(401).send({message: 'Bad Request'})
      }
      else {
        if(hash.verify(pin, student.loginPin)){
          next()
        }
        else {
          res.status(300)
          res.send({message: 'Invalid pin'})
        }
      }
    })
  }
  else if(loginType == 'Vendor') {
    Vendor.findOne({username: userId}, function(err, vendor){
      if(err || !student){
        console.log(err)
        res.status(401).send({message: 'Bad Request'})
      }
      else {
        if(hash.verify(pin, vendor.loginPin)){
          next()
        }
        else {
          res.status(300)
          res.send({message: 'Invalid pin'})
        }
      }
    })
  }
}
