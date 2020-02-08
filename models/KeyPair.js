const mongoose = require('mongoose')

const keyPairSchema = new mongoose.Schema({
  peer_public_key: String,
  private_key: String
});

module.exports = mongoose.model('KeyPair', keyPairSchema)
