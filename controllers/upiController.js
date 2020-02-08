const Vendor = require('../models/Vendor.js')
const Student = require('../models/Student.js')

exports.getUpi = (req, res) => {
    var userId = req.userId
    var loginType = req.loginType
    if (loginType == 'Vendor') {
      Vendor.findOne({username: userId}, function(err, vendor){
        if(err){
          console.log(err)
          return res.status(500).send({'message': 'Unknown Error'})
        }
        return res.send({upiId: vendor.upiId})
      })
    }
    else if(loginType == 'Student'){
      Student.findOne({rollNumber: userId}, function(err, student) {
        if(err){
          console.log(err)
          return res.status(500).send({'message': 'Unknown Error'})
        }
        return res.send({upiId: student.upiId})
      })
    }
}

exports.setUpi = (req, res) => {
    var userId = req.userId
    var loginType = req.loginType
    var upiId = req.body.upiId
    if (loginType == 'Vendor') {
      Vendor.findOne({username: userId}, function(err, vendor){
        if(err) {
          console.log(err)
          return res.status(500).send({'message': 'Unknown Error'})
        }
        vendor.upiId = upiId
        vendor.save()
        return res.send({message: 'success'})
      })
    }
    else if(loginType == 'Student'){
        Student.findOne({rollNumber: userId}, function(err, student) {
            if(err) {
              console.log(err)
              return res.status(500).send({'message': 'Unknown Error'})
            }
            student.upiId = upiId
            student.save()
            return res.send({message: 'success'})
        })
    }
}
