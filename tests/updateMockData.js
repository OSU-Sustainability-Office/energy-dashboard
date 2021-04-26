/**
* @Author: Milan Donhowe
* @Email: Milan.Donhowe@oregosntate.edu
* @Date Created:       4/20/2021
* @Date Last Modified: 4/23/2021
* @Description: Dynamically update the Mock Data used by the unit tests
*/

const fs = require('fs')
const axios = require('axios')

function GetMockData(url, filename){
    axios.get(url)
      .then(response => {
        fs.writeFileSync(filename, JSON.stringify(response.data), {encoding:'utf8'})
      })
      .catch(err => console.log(err))
}

const api = 'https://api.sustainability.oregonstate.edu/v2/energy/'
GetMockData(`${api}allbuildings`, './assertedData/mock_allbuildings.json')
GetMockData(`${api}data?id=6&startDate=1613232900&endDate=1618504200&point=accumulated_real&meterClass=5`, './assertedData/mock_meter_data.json')


