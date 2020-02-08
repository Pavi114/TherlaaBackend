const themis = require('jsthemis')

exports.generateKeypair = () => {
  return keypair = new themis.KeyPair()
}

exports.encrypt = (message, private_key, peer_public_key) => {
  var smessage = new themis.SecureMessage(private_key, peer_public_key)
  try {
    var encrypted_message = smessage.encrypt(message)
    return encrypted_message
  } catch (error) {
    return false
  }
}

exports.decrypt = (encrypted_message, private_key, peer_public_key) => {
  var smessage = new themis.SecureMessage(private_key, peer_public_key)
  try {
    var decrypted_message = smessage.decrypt(encrypted_message)
    return decrypted_message
  } catch (error) {
    return false
  }
}
