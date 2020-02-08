const KeyPair = require('../models/KeyPair')
const keyPairHelpers = require('../helpers/keyPairHelpers')

exports.performKeyExchange = async (req, res) => {
  let { peer_public_key } = req.body;

  let keyPair = keyPairHelpers.generateKeypair();

  let keyPairInstance = await KeyPair.create({peer_public_key: peer_public_key, private_key: keyPair.private(), public_key: keyPair.public()})

  return res.send({ message: "Success", public_key: keyPair.public() })
}
