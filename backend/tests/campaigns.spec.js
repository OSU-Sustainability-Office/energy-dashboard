/*
 * @Author: Milan Donhowe
 * @Date:   4/25/2021
 * @Last Modified By:  Milan Donhowe
 * @Last Modified Time:  4/25/2021
 * @Copyright:  Oregon State University 2021
 * @Description: Unit tests for API endpoints associated with
 *               the frontend campaigns VueX module
 */
const testConfig = require('./assertedData/test_config.json');
const CORSUtil = require('./utility/cors_test_utility.js');
const server = testConfig['serverOrigin'];
const client = testConfig['clientOrigin'];

const MOCK_REQUEST_EVENT = {
  headers: {
    origin: `${client.scheme}://${client.host}`,
  },
};

// Lambda function
const CampaignGetAll = require('../app/campaign.js');

describe('Testing campaigns.module.js related API endpoints...', () => {
  let response;

  it('/campaigns returns valid data...', async () => {
    response = await CampaignGetAll.all(MOCK_REQUEST_EVENT);
    const jsonData = JSON.parse(response.body)[0];
    // id should be number
    expect(isNaN(jsonData['id'])).not.toBe(true);
    // group ids should be numbers
    for (let id of jsonData['meterGroupIDs']) {
      expect(isNaN(id)).not.toBe(true);
    }
    // compare time stamps
    expect(Date.parse(jsonData['dateStart'])).not.toBe(NaN);
    expect(Date.parse(jsonData['dateEnd'])).not.toBe(NaN);
    expect(Date.parse(jsonData['compareStart'])).not.toBe(NaN);
    expect(Date.parse(jsonData['compareEnd'])).not.toBe(NaN);
  });

  it('/campaigns returns CORS headers...', async () => {
    const corsResult = CORSUtil.VerifyCORSResponse(response, client, server);
    try {
      expect(corsResult.result).toBe(true);
    } catch {
      throw new Error(corsResult.reason);
    }
  });
});
