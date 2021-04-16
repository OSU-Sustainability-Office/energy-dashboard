/*
* @Author: Milan Donhowe
* @Date:   4/15/2021
* @Last Modified By:  Milan Donhowe
* @Last Modified Time:  4/15/2021
* @Copyright:  Oregon State University 2021
* @Description: Queries every single lambda function and tests if the CORS headers
*               are set correctly.  This should verify that we won't get a CORS
*               error on load-up. 
*/

const CORSUtil = require('./cors_test_utility.js')
const test = require('../app/test.js')

// TODO: import lambda functions
// TODO: REMEMBER WE'RE MOCKING THE REQUESTS AS IF THEY CAME FROM PRODUCTION SITE.
describe('Performing simple CORS check', () => {
    it('test.js should fail without headers', async () => {
        const test_response = await test.test()
        const cors_result = CORSUtil.VerifyCORSResponse(test_response)
        // We use try-except to print out helpful CORS-specific error message.
        try {
            expect(cors_result.result).toBe(false)
        } catch (err) {
            throw new Error(cors_result.reason)
        }
    })
})