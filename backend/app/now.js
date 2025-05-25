/* Filename: app/now.js
  * Description: API endpoint to return the current system time
*/
import Response from '/opt/nodejs/response.js'

export async function systemtime (event, context) {
  let TimeResponse = new Response(event)
  TimeResponse.body = Date.now().toString()
  return TimeResponse
}
