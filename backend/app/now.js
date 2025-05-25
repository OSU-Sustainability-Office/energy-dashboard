/*
 * @Author: Milan Donhowe
 * @Date:   Monday September 4th 2021
 * @Last Modified By:  Milan Donhowe
 * @Last Modified Time:  Monday September 4th 2021
 * @Copyright:  Oregon State University 2021
 * @Description: Handler returns current system time in milliseconds
 *               (should be time for AWS services on us-west-2).
 */

import Response from '/opt/nodejs/response.js'

export async function systemtime (event, context) {
  let TimeResponse = new Response(event)
  TimeResponse.body = Date.now().toString()
  return TimeResponse
}
