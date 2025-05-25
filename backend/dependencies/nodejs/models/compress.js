// Lambda Compression for API Responses from https://www.npmjs.com/package/lambda-compression

import { brotliCompressSync, gzipSync, deflateSync } from 'zlib'

function compress (event, response) {
  if (!response.body) {
    return response
  }

  const encodingHeader = event.headers['Accept-Encoding']
  const encodings = new Set()
  if (encodingHeader) {
    encodingHeader.split(',').forEach(encoding => {
      encodings.add(encoding.toLowerCase().trim())
    })
  }

  if (!response.headers) {
    response.headers = {}
  }
  if (encodings.has('br')) {
    response.headers['Content-Encoding'] = 'br'
    response.isBase64Encoded = true
    response.body = brotliCompressSync(response.body).toString('base64')
    return response
  }

  if (encodings.has('gzip')) {
    response.headers['Content-Encoding'] = 'gzip'
    response.isBase64Encoded = true
    response.body = gzipSync(response.body).toString('base64')
    return response
  }

  if (encodings.has('deflate')) {
    response.headers['Content-Encoding'] = 'deflate'
    response.isBase64Encoded = true
    response.body = deflateSync(response.body).toString('base64')
    return response
  }

  return response
}

export default compress
