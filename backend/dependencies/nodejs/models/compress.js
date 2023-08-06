// Lambda Compression for API Responses from https://www.npmjs.com/package/lambda-compression

const zlib = require('zlib');

function compress(event, response) {
  if (!response.body) {
    return result;
  }

  const encodingHeader = event.headers['Accept-Encoding'];
  const encodings = new Set();
  if (encodingHeader) {
    encodingHeader.split(',').forEach(encoding => {
      encodings.add(encoding.toLowerCase().trim());
    });
  }

  if (!response.headers) {
    response.headers = {};
  }
  if (encodings.has('br')) {
    response.headers['Content-Encoding'] = 'br';
    response.isBase64Encoded = true;
    response.body = zlib.brotliCompressSync(response.body).toString('base64');
    return response;
  }

  if (encodings.has('gzip')) {
    response.headers['Content-Encoding'] = 'gzip';
    response.isBase64Encoded = true;
    response.body = zlib.gzipSync(response.body).toString('base64');
    return response;
  }

  if (encodings.has('deflate')) {
    response.headers['Content-Encoding'] = 'deflate';
    response.isBase64Encoded = true;
    response.body = zlib.deflateSync(response.body).toString('base64');
    return response;
  }

  return response;
}

module.exports = compress;
