/*
 * @ Filename: buildTestDatabase.js
 * @ Description: Connects to the test mysql database which should be running in a docker container and populates
 *                the database with some mock-data.
 */

import { createConnection } from 'mysql'
const DB = createConnection({
  host: process.env.MYSQL_HOST,
  user: 'root',
  password: 'password',
  database: 'energy',
  multipleStatements: true
})

import { readFileSync } from 'fs'
function formatInserts (filename, tablename) {
  let text = readFileSync(filename, 'utf-8')
  return text
    .split('\n')
    .map(ln => ln.replace('``', tablename))
    .join('')
}

/*
    Create table schema equivalents for sqlite.
    Not all fields in the MySQL DB are replicated here.
*/
console.log('building test database...')
DB.beginTransaction(err => {
  if (err) {
    throw err
  }

  // Let's just make one monster query
  let gigantic_query_string = ''

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

  for (let name of tablenames) {
    gigantic_query_string += `DROP TABLE IF EXISTS \`${name}\`;`
    // DB.query(`DROP TABLE IF EXISTS ${name};`)
  }

  gigantic_query_string += `CREATE TABLE \`buildings\` (
        \`id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`map_id\` text,
        \`image\` text,
        \`group\` text,
        \`name\` text,
        hidden int,
        geojson json,
        PRIMARY KEY (\`id\`)
    );`

  gigantic_query_string += `CREATE TABLE meter_groups (
        \`id\` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
        \`name\` TEXT,
        \`building_id\` INTEGER,
        \`default\` INTEGER,
        PRIMARY KEY (\`id\`)
    );`

  gigantic_query_string += `CREATE TABLE meter_group_relation (
        \`id\` INTEGER NOT NULL AUTO_INCREMENT,
        \`meter_id\` INTEGER,
        \`group_id\` INTEGER,
        PRIMARY KEY (\`id\`)
    );`

  gigantic_query_string += `CREATE TABLE meters (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` TEXT,
        \`address\` char(16) DEFAULT NULL,
        \`type\` TEXT,
        \`class\` INTEGER,
        \`pacific_power_id\` INTEGER,
        PRIMARY KEY (\`id\`)
    );`

  gigantic_query_string += `CREATE TABLE campaigns (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` TEXT,
        \`date_start\` TEXT,
        \`date_end\` TEXT,
        \`compare_start\` TEXT,
        \`compare_end\` TEXT,
        \`media\` TEXT,
        \`visible\` INTEGER,
        PRIMARY KEY (\`id\`)
    );`

  gigantic_query_string += `CREATE TABLE campaign_groups (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`goal\` REAL,
        \`group_id\` INTEGER,
        \`campaign_id\` INTEGER,
        PRIMARY KEY (\`id\`)
    );`

  gigantic_query_string += `CREATE TABLE data (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`meter_id\` INTEGER,
        \`accumulated_real\` int,
        \`time_seconds\` INTEGER,
        \`error\` TEXT,
        PRIMARY KEY (\`id\`)
    );`

  /*
    The default node mysql driver (which we're using for our tests) uses a bunch callback
    functions for mass query operations.
  */
  DB.query(gigantic_query_string, err => {
    if (err)
      return DB.rollback(() => {
        throw err
      })
    console.log('Table schemas setup!')

    DB.query(formatInserts('tests/assertedData/buildings_insert.sql', 'buildings'), err => {
      if (err)
        return DB.rollback(() => {
          throw err
        })

      console.log('added data to the buildings table')
      DB.query(formatInserts('tests/assertedData/meter_groups_insert.sql', 'meter_groups'), err => {
        if (err)
          return DB.rollback(() => {
            throw err
          })
        console.log('added data to the meter_groups table!')

        DB.query(formatInserts('tests/assertedData/meter_group_relation_insert.sql', 'meter_group_relation'), err => {
          if (err)
            return DB.rollback(() => {
              throw err
            })
          console.log('added data to the meter_group_relation table!')

          DB.query(formatInserts('tests/assertedData/meters_insert.sql', 'meters'), err => {
            if (err)
              return DB.rollback(() => {
                throw err
              })
            console.log('added data to the meters table!')

            DB.query(formatInserts('tests/assertedData/campaigns_insert.sql', 'campaigns'), err => {
              if (err)
                return DB.rollback(() => {
                  throw err
                })
              console.log('added data to the campaigns table!')

              DB.query(formatInserts('tests/assertedData/campaign_groups_insert.sql', 'campaign_groups'), err => {
                if (err)
                  return DB.rollback(() => {
                    throw err
                  })
                console.log('added data to the campaign_groups table!')

                DB.query(formatInserts('tests/assertedData/data_insert.sql', 'data'), err => {
                  if (err)
                    return DB.rollback(() => {
                      throw err
                    })
                  console.log('added mock meter data!')

                  DB.commit(err => {
                    if (err)
                      return DB.rollback(() => {
                        throw err
                      })
                    console.log('built test database!')
                    DB.end()
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})
