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
const DB = new sqlite3.Database('./tests/assertedData/test.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)

const fs = require('fs')
// this function amends any MySQL/SQLite keyword conflicts
const sql_utility = require('./utility/sql_test_utility.js')

function formatInserts(filename, tablename){
    let text = fs.readFileSync(filename, 'utf-8')
    return (text.split('\n').map(ln => sql_utility.fixSQLKeywords(ln.replace('``', tablename)))).join('')
}

/*
    Create table schema equivalents for sqlite.
    Not all fields in the MySQL DB are replicated here.
*/
console.log('building test database...')
DB.serialize(() => {
    // Remove tables if they already exist
    const tablenames = [
        'buildings', 
        'meter_groups', 
        'meters', 
        'meter_group_relation',
        'campaigns',
        'campaign_groups',
        'data'
    ]
    for (let name of tablenames){
        DB.run(`DROP TABLE IF EXISTS ${name};`)
    }

    DB.run(`CREATE TABLE buildings(
        id INTEGER PRIMARY KEY,
        map_id TEXT,
        image TEXT,
        building_group TEXT,
        name TEXT,
        hidden INTEGER
    )`)
    
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
    
    DB.run(`CREATE TABLE campaigns (
        id INTEGER PRIMARY KEY,
        name TEXT,
        date_start TEXT,
        date_end TEXT,
        compare_start TEXT,
        compare_end TEXT,
        media TEXT,
        visible INTEGER
    )`)

    DB.run(`CREATE TABLE campaign_groups (
        id INTEGER PRIMARY KEY,
        goal REAL,
        group_id INTEGER,
        campaign_id INTEGER
    )`)

    DB.run(`CREATE TABLE data (
        id INTEGER PRIMARY KEY,
        meter_id INTEGER,
        accumulated_real REAL,
        time_seconds INTEGER,
        error TEXT
    )`)

    /* Populate tables with data */
    DB.exec(formatInserts('tests/assertedData/buildings_insert.sql', 'buildings'))
    DB.exec(formatInserts('tests/assertedData/meter_groups_insert.sql', 'meter_groups'))
    DB.exec(formatInserts('tests/assertedData/meter_group_relation_insert.sql', 'meter_group_relation'))
    DB.exec(formatInserts('tests/assertedData/meters_insert.sql', 'meters'))
    DB.exec(formatInserts('tests/assertedData/campaigns_insert.sql', 'campaigns'))
    DB.exec(formatInserts('tests/assertedData/campaign_groups_insert.sql', 'campaign_groups'))
    DB.exec(formatInserts('tests/assertedData/data_insert.sql', 'data'), (err) => {
        if (!err) console.log('built test database!')
        else {
            console.log(err)
            process.exit(1)
        }
    })
})
DB.close();
