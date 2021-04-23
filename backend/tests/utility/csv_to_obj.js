/*
* @Author: Milan Donhowe
* @Date:   4/23/2021
* @Last Modified By:  Milan Donhowe
* @Last Modified Time:  4/23/2021
* @Copyright:  Oregon State University 2021
* @Description: Script to convert .csv files from the mysql db
*               to javascript-friendly object format for testing.
*/

const fs = require('fs')

/* Convert .csv file to object containing arrays */
exports.csv2object = (filename) => {
    
    const SQLObject = []

    console.log(process.cwd())
    let textContent = fs.readFileSync(filename, {flag: 'r', encoding: 'utf8'}).split('\n')
    

    const columnNames = textContent[0].split(',')

    // Add their entries as elements in an array
    for (let line of textContent.slice(1, -1)){
        const next_row = {}
        for (const [index, item] of line.split(',').entries()){
            next_row[columnNames[index]] = (isNaN(item) ? item : Number(item))
        }
        SQLObject.push(next_row)
    }
    
    return SQLObject
}

