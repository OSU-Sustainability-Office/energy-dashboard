/**
* @Author: Milan Donhowe
* @Date: 4/9/2021
* @Email: Milan.Donhowe@oregosntate.edu
* @Description: MOCK api requests
* 
*/

// Tell Jest it can mock our API
const axios = require('axios')
import API from '@/store/api.js'

// Only mock the actual requests
// (We want to test the internal API calls)
jest.mock('axios')


describe('Testing API Module', () => {
    it('Can get System Time', async () => {
        const mockTime = Date.now().toString()
        axios.mockResolvedValue( { data: mockTime } )
        return API.systemtime().then(payload => {
            expect(payload).toBe(mockTime)
        })
    })
    // Maybe add more tests if you feel like it.
})