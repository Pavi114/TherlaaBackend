const Socket = require('../models/Socket')

module.exports = function(io) {
  var app = require('express');
  var router = app.Router();

  io.on('connection', function(socket) {
      socket.on('setUserId', async function(data) {
          await Socket.deleteMany({$or: [{userId: data.userId}, {socketId: socket.id}]});
          await Socket.create({userId: data.userId, socketId: socket.id})
      });
      socket.on('disconnect', async function() {
          await Socket.deleteOne({socketId: socket.id})
      });
  });

  router.use((req, res, next) => {
      req.io = io;
      next()
  });

  return router;
}
