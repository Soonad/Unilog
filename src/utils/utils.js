exports.base64_url_encode = function(buffer) {
  return buffer.toString('base64').replace('+', '-').replace('/', '_').replace(/=+$/, '')
}

exports.base64_url_decode = function(base64_url_encoded) {
  let base64_encoded = base64_url_encoded.replace('-', '+').replace('_', '/')

  // Ensure padding is on
  while (base64_encoded.length % 4)
    base64_encoded += '=';

  // Decode from base64
  return Buffer.from(base64_encoded, 'base64')
}

// Checks if base64 string is well formed
exports.isBase64 = function (base64_str) {
  return Buffer.from(base64_str, 'base64').toString('base64')
  .replace('+', '-').replace('/', '_').replace(/=+$/, '') == base64_str
}

// checks if input size is valid
exports.isSizeValid = function (base64_str, max_size) {
  return (Buffer.from(base64_str, 'base64').length) <= max_size
}
