const Socket = require('../models/Socket')

exports.sendSocketDataToUser = function(io, userId, data) {
    Socket.findOne({ userId: userId }, function(err, socket) {
        if (err || !socket) {
            console.log(err);
            return false;
        }
        io.to(socket.id).emit('data', data)
    })
}
