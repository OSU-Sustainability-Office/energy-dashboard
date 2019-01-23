/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-01-08T14:12:40-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-01-08T14:15:24-08:00
 */

const fs = require('fs')

let r = [
  new Array(96).fill(100),
  new Array(96).fill(100),
  new Array(96).fill(100),
  new Array(96).fill(100),
  new Array(96).fill(100),
  new Array(96).fill(100),
  new Array(96).fill(100)
]

fs.writeFileSync('tests/assertedData/baseline.json', JSON.stringify(r), 'utf-8')
