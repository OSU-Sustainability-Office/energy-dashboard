/*
* @Author: Milan Donhowe
* @Date Created:   5/3/2021
* @Copyright:  Oregon State University 2021
* @Description: Creates the sqlite3 database which gets built before any tests are called.
*               This sqlite database mocks the MySQL RDS instance which we interface with
*               in production.  While sqlite doesn't entirely match 1:1 with mysql, it should be
*               close enough in most cases--and when if it ever fails we can just hard-code a different
*               mock response.
*/

const sqlite3 = require('sqlite3')
const DB = new sqlite3.Database('assertedData/test.db')
const fs = require('fs')

// Super hacky function to bypass sqlite3's keyword restrictions
function fixKeywords(line){
    const keywords = ['group', 'default']
    for (let keyword of keywords){
        while (line.match(new RegExp(`(?<!building_)${keyword}\``))) line = line.replace(keyword, `building_${keyword}`)
    }
    return line
}

function formatInserts(filename, tablename){
    let text = fs.readFileSync(filename, 'utf-8')
    return (text.split('\n').map(ln => fixKeywords(ln.replace('``', tablename)))).join('')
}

/*
    Create table schema equivalents for sqlite.
    Some fields have been removed since they're not used
    in any queries, and ergo aren't super useful for testing purposes.
*/
DB.serialize(() => {
    const tablenames = ['buildings', 'meter_groups', 'meters', 'meter_group_relation']
    for (let name of tablenames){
        DB.run(`DROP TABLE IF EXISTS ${name};`)
    }

    // create buildings
    DB.run(`CREATE TABLE buildings(
        id INTEGER PRIMARY KEY,
        map_id TEXT,
        image TEXT,
        building_group TEXT,
        name TEXT,
        hidden INTEGER
    );`, (err) => {
        console.log('at create table', err)
    })
    
    // create meter-group table
    DB.run(`CREATE TABLE meter_groups (
        id INTEGER PRIMARY KEY,
        name TEXT,
        user_id INTEGER,
        is_building INTEGER,
        affiliation TEXT,
        building_id TEXT,
        story_id INTEGER,
        building_id_2 INTEGER,
        building_default INTEGER
    )`)

    DB.run(`CREATE TABLE meter_group_relation (
        id INTEGER PRIMARY KEY,
        meter_id INTEGER,
        group_id INTEGER,
        operation INTEGER
    )`)
    
    DB.run(`CREATE TABLE meters (
        id INTEGER PRIMARY KEY,
        name TEXT,
        type TEXT,
        negate INTEGER,
        class INTEGER
    )`)
    
    
    /* Populate tables with data */
    DB.exec(formatInserts('assertedData/buildings_insert.sql', 'buildings'))
    DB.exec(formatInserts('assertedData/meter_groups_insert.sql', 'meter_groups'))
    DB.exec(formatInserts('assertedData/meter_group_relation_insert.sql', 'meter_group_relation'))
    DB.exec(formatInserts('assertedData/meters_insert.sql', 'meters'))
    
    /*
    DB.all('SELECT * from meters;', (err, rows) => {
        if (err) console.log('error: ', err)
        if (rows) console.log(rows)
    })*/

})

// I need to create 3 tables
// and then insert all the relevant data

// CREATE TABLES & INSERT DATA
// --> data
// --> buildings