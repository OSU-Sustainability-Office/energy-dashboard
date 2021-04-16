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
*   This provides a class to define the endpoints between the Dashboard's API requests.
*   The client & server object are locally exposed constants (i.e. they shouldn't be
*   modifiable outside this file).
*/
class Origin {
    constructor(scheme, host, port){
        this.scheme = scheme;
        this.host = host;
        this.port = port;
    }
    // returns string of scheme & host assuming default port
    getOriginDefaultPort(){
        return this.scheme + '://' + this.host
    }
    // object equality (can't operator overload in JS)
    Equals(otherOrigin){
        if (this.scheme !== otherOrigin.scheme) return false
        if (this.host !== otherOrigin.host) return false
        return this.port === otherOrigin.port
    }
}

// Production API origins (assumed correct by automated tests)
const testClientOrigin = new Origin('https', 'dashboard.sustainability.oregonstate.edu', 443);
const testServerOrigin = new Origin('https', 'api.sustainability.oregonstate.edu/v2/energy', 443);



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
exports.VerifyCORSResponse = (response) => {
    // if it's same origin, CORS doesn't come into play.
    // extract response headers.  Not all of these need to be defined, which is OK.
    if (response.headers){
        const allowedOrigin = response.headers['Access-Control-Allow-Origin']
        const withCredentials = response.headers['Access-Control-Allow-Credentials']
        const allowedMethods = response.headers['Access-Control-Allow-Methods']
        const statusCode = response.statusCode
        
        // Make sure we aren't re-directing
        if ([301, 307, 308].includes(statusCode)) return {result: false, reason: 'CORS request external redirect not allowed'}

        // Make sure they have specified an Origin.
        if (!allowedOrigin) return {result: false, reason: 'CORS header \'Access-Control-Allow-Origin\' missing.  Did you use the Request class?'}

        // Edge-case w/ wild card
        if (allowedOrigin === '*'){
            if (withCredentials !== 'false') return {result: false, reason: 'Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’'}
            return {result: true, reason: 'allowed origin is a wildcard, anyone can access this resource'}
        }
        
        // Make sure the origin matches production
        if (allowedOrigin !== clientOrigin.getOriginDefaultPort()) return {result: false, reason: `'Access-Control-Allow-Origin' does not match '${clientOrigin.getOriginDefaultPort()}'`}
        
        // Make sure we're not returning bad method names.
        if (allowedMethods){
            const validMethods = 'GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH'.split(', ')
            for (method of allowedMethods.split(', ')){
                if (!validMethods.includes(method)){
                    return {result: false, reason: `invalid token: '${method}' in CORS header ‘Access-Control-Allow-Methods`}
                }
            }
        }

        return {result: true, resason: 'no error detected'};
    }
    return {result: false, reason: 'no headers specified,  did you remember to use the Response class?'}
}