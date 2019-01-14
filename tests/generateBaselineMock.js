/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-01-07T14:28:05-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-01-07T14:39:19-08:00
 */

const fs = require('fs')

let time = new Date('2018-06-01T00:00:00.000Z')
const endTime = (new Date('2018-06-15T00:15:00.000Z')).getTime()
let output = []
let runningMeasure = 0
while (time.getTime() <= endTime) {
  output.push({ time: time.toISOString(), accumulated_real: runningMeasure })
  runningMeasure += 100
  time.setTime(time.getTime() + 900000)
}

fs.writeFileSync('./src/store/__mocks__/__mockdata__/data?id=1&startDate=2018-06-01T00:00:00.000Z&endDate=2018-06-15T00:15:00.000Z&point=accumulated_real_get.json', JSON.stringify(output), 'utf-8')
