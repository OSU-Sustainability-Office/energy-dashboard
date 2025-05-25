/*
 * @Author: Milan Donhowe
 * @Date:   4/15/2021
 * @Last Modified By:  Milan Donhowe
 * @Last Modified Time:  4/15/2021
 * @Copyright:  Oregon State University 2021
 * @Description: Defines utility functions & classes to provide some light-weight
 *               CORS request testing.
 *               See the following resources for details on common CORS errors & the spec:
 *               >> https://fetch.spec.whatwg.org/#http-cors-protocol
 *               >> https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors
 */

/*
    This function provides some light sanity testing for CORS responses
    coming from the Lambda services just to make sure things look OK.

    While this isn't rigorous enough to provide 100% certainty that the CORS responses
    won't fail in production, it should be enough to verify that if the CORS
    responses do error out it's because of something fairly spectacular.

    Some notable assumptions this function makes:
        1. that request occurs over https (ssh keys assumed valid)
        2. that client & server origin are accurate and use default port for ssh
*/
export function VerifyCORSResponse (response, clientOrigin, serverOrigin) {
  if (clientOrigin.scheme !== serverOrigin.scheme) {
    return {
      result: false,
      reason: 'CORS response scheme did not match request scheme.'
    }
  }
  if (clientOrigin.port !== serverOrigin.port) {
    return {
      result: false,
      reason: 'CORS response port did not match request port.'
    }
  }
  // extract response headers.  Not all of these need to be defined, which is OK.
  if (response.headers) {
    const allowedOrigin = response.headers['Access-Control-Allow-Origin']
    const withCredentials = response.headers['Access-Control-Allow-Credentials']
    const allowedMethods = response.headers['Access-Control-Allow-Methods']
    const statusCode = response.statusCode

    // Make sure we aren't re-directing
    if ([301, 307, 308].includes(statusCode))
      return {
        result: false,
        reason: 'CORS request external redirect not allowed'
      }

    // Make sure they have specified an Origin.
    if (!allowedOrigin)
      return {
        result: false,
        reason: "CORS header 'Access-Control-Allow-Origin' missing.  Did you use the Request class?"
      }

    // Edge-case w/ wild card
    if (allowedOrigin === '*') {
      if (withCredentials !== 'false')
        return {
          result: false,
          reason: 'Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’'
        }
      return {
        result: true,
        reason: 'allowed origin is a wildcard, anyone can access this resource'
      }
    }

    // Make sure the origin matches production
    const client = `${clientOrigin.scheme}://${clientOrigin.host}`
    if (allowedOrigin !== client) {
      return {
        result: false,
        reason: `'Access-Control-Allow-Origin' does not match '${client}'`
      }
    }

    // Make sure we're not returning bad method names.
    if (allowedMethods) {
      const validMethods = 'GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH'.split(', ')
      for (const method of allowedMethods.split(', ')) {
        if (!validMethods.includes(method)) {
          return {
            result: false,
            reason: `invalid token: '${method}' in CORS header ‘Access-Control-Allow-Methods`
          }
        }
      }
    }

    return { result: true, reason: 'no error detected' }
  }
  return {
    result: false,
    reason: 'no headers specified,  did you remember to use the Response class?'
  }
}
