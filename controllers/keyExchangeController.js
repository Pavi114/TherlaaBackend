const KeyPair = require('../models/KeyPair')
const keyPairHelpers = require('../helpers/keyPairHelpers')

exports.performKeyExchange = async (req, res) => {
  console.log("lalala");
  let { peer_public_key } = req.body;

  let keyPair = keyPairHelpers.generateKeypair();
  let keyPairInstance = await KeyPair.create({peer_public_key: peer_public_key, private_key: keyPair.private(), userId: req.userId})

  console.log({ message: "Success", public_key: keyPair.public().toString("base64") });
  return res.send({ message: "Success", public_key: keyPair.public().toString("base64") })

}
