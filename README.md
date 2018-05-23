# OSU Energy Dashboard
An open source data collection and visualization web application for Oregon State Universities power consumption.
## Table of Contents
- [DataBase Schema](#database-schema)
  - [Tables](#tables)
    - [Buildings](#buildings)
    - [Meters](#meters)
    - [Temporary Data](#temp_data)
    - [Data](#data)
    - [Blocks](#blocks)
    - [Block Buildings](#block_buildings)
    - [Dashboards](#dashboards)
    - [Stories](#stories)
- [API Reference](#api-reference)
  - [Buildings](#buildings)
  - [Blocks](#blocks)
  - [Dashboards](#dashboards)
  - [Stories](#stories)
- [Python Scripts](#python-scripts)
  - [Import Data](#import-data)
  - [Tempory Data to Permanent Data](#temporary-to-permanent)
- [Development Environment](#development-environment)
  - [Running a VueJS Dev Server](#running-a-vuejs-dev-server)
## DataBase Schema
### Tables
| Table Name              | Description                                                |
|-------------------------|:-----------------------------------------------------------|
| block_groups            | Relates blocks to meter groups.                            |
| blocks                  | Contains information about a collection of data points.    |
| data                    | Stores data points.                                        |
| meter_group_relation    | Relates meters to meter groups.                            |
| meter_groups            | Meter groups can be buildings, or any collection of meters.|
| meters                  | Contains meta information about each meter.                |
| stories                 | Collections of blocks.                                     |
| users                   | Contains user privileges.                                  |

### Block Groups
| Field    | Type       | Null | Key | Default | Extra |
|----------|:-----------|:-----|:----|:--------|:------|
| id       | int(11)    | NO   | PRI | NULL    |       |
| block_id | int(11)    | YES  | MUL | NULL    |       |
| group_id | int(11)    | YES  | MUL | NULL    |       |
| point    | tinyint(4) | YES  |     | NULL    |       |


### Blocks
| Field      | Type       | Null | Key | Default | Extra |
|------------|:-----------|:-----|:----|:--------|:------|
| id         | int(11)    | NO   | PRI | NULL    |       |
| date_start | datetime   | YES  |     | NULL    |       |
| date_end   | datetime   | YES  |     | NULL    |       |
| date_range | char(64)   | YES  |     | NULL    |       |
| graph_type | tinyint(4) | YES  |     | NULL    |       |
| media      | char(255)  | YES  |     | NULL    |       |
| descr      | text       | YES  |     | NULL    |       |
| story_id   | int(11)    | YES  | MUL | NULL    |       |

### Data
| Field            | Type     | Null | Key | Default | Extra |
|------------------|:---------|:-----|:----|:--------|:------|
| id               | int(11)  | NO   | PRI | NULL    |       |
| time             | datetime | NO   |     | NULL    |       |
| meter_id         | int(11)  | NO   | MUL | NULL    |       |
| accumulated_real | int(32)  | YES  |     | NULL    |       |
| real_power       | float    | YES  |     | NULL    |       |
| reactive_power   | float    | YES  |     | NULL    |       |
| apparent_power   | float    | YES  |     | NULL    |       |
| real_a           | float    | YES  |     | NULL    |       |
| real_b           | float    | YES  |     | NULL    |       |
| real_c           | float    | YES  |     | NULL    |       |
| reactive_a       | float    | YES  |     | NULL    |       |
| reactive_b       | float    | YES  |     | NULL    |       |
| reactive_c       | float    | YES  |     | NULL    |       |
| apparent_a       | float    | YES  |     | NULL    |       |
| apparent_b       | float    | YES  |     | NULL    |       |
| apparent_c       | float    | YES  |     | NULL    |       |
| pf_a             | float    | YES  |     | NULL    |       |
| pf_b             | float    | YES  |     | NULL    |       |
| pf_c             | float    | YES  |     | NULL    |       |
| vphase_ab        | float    | YES  |     | NULL    |       |
| vphase_bc        | float    | YES  |     | NULL    |       |
| vphase_ac        | float    | YES  |     | NULL    |       |
| vphase_an        | float    | YES  |     | NULL    |       |
| vphase_bn        | float    | YES  |     | NULL    |       |
| vphase_cn        | float    | YES  |     | NULL    |       |
| cphase_a         | float    | YES  |     | NULL    |       |
| cphase_b         | float    | YES  |     | NULL    |       |
| cphase_c         | float    | YES  |     | NULL    |       |

### Meter Group Relation
| Field     | Type    | Null | Key | Default | Extra |
|-----------|:--------|:-----|:----|:--------|:------|
| id        | int(11) | NO   | PRI | NULL    |       |
| meter_id  | int(11) | YES  | MUL | NULL    |       |
| group_id  | int(11) | YES  | MUL | NULL    |       |
| operation | bit(1)  | YES  |     | NULL    |       |

### Meter Groups
| Field       | Type     | Null | Key | Default | Extra |
|-------------|:---------|:-----|:----|:--------|:------|
| id          | int(11)  | NO   | PRI | NULL    |       |
| name        | char(64) | YES  |     | NULL    |       |
| is_building | bit(1)   | YES  |     | NULL    |       |
| user_id     | int(11)  | YES  | MUL | NULL    |       |

### Meters
| Field   | Type     | Null | Key | Default | Extra |
|---------|:---------|:-----|:----|:--------|:------|
| id      | int(11)  | NO   | PRI | NULL    |       |
| name    | char(64) | YES  |     | NULL    |       |
| address | char(16) | YES  |     | NULL    |       |

### Stories
| Field       | Type     | Null | Key | Default | Extra |
|-------------|:---------|:-----|:----|:--------|:------|
| id          | int(11)  | NO   | PRI | NULL    |       |
| user_id     | int(11)  | YES  | MUL | NULL    |       |
| name        | char(64) | YES  |     | NULL    |       |
| description | text     | YES  |     | NULL    |       |
| public      | bit(1)   | YES  |     | NULL    |       |

### Users
| Field     | Type      | Null | Key | Default | Extra |
|-----------|:----------|:-----|:----|:--------|:------|
| id        | int(11)   | NO   | PRI | NULL    |       |
| name      | char(255) | YES  |     | NULL    |       |
| privilege | int(11)   | YES  |     | NULL    |       |

## API Reference
### Buildings
```/api/getBuildingData```
- Method: GET
- Parameters:
  - id: Integer id of the building
  - endDate: string in ISO8601 DateTime format, specifies the end of the data retrieval
  - startDate: string in ISO8601 DateTime format, specifies the start of the data retrieval
  - range: special formatted string, integer followed by specifier (d = day, m = month, h = hour, i = minute, y = year)
    - EX: 30d -> 30 Day range
  - name: The name of the building
  - mpoints: array of specified metering points

  A name or id must be used with this call. If a range is specified without a start or end date the current date time is used as the end date and the start date is determined by the range. Start dates and end dates are always specified as the start and end. This means if the start, end and range are all specified the range is ignored. This function also automatically omits results based on the requested date range, limiting the transfer of data.

```/api/updateBuilding```
- Method: POST
- Parameters:
  - id: Integer id of the building, if none is specified the building is created in the database
  - name: the name of the building
  - meters: an array of meter objects the building uses
    - meter object: has the structure of {id, bool}, the bool specifies the operation to the buildings total (TRUE = add, FALSE = subtract)

### Blocks
```/api/getBlockData```
- Method: GET
- Parameters:
  - id: the id of the block object
Returns all the block data associated with the block id

```/api/updateBlock```
- Method: POST
- Parameters:
  - id: if specified updates the block instead of creating a new one
  - name: Name of the block
  - mpoint: Metering point
  - gtype: Graph type to display
  - media: A URL to media
  - text: text that describes or relates to the graphs shown on the block
  - dstart: date start of data display
  - dend: date end of data display
  - drange: date range, follows same format as range specified in the update building api
  - buildings: array of building ids


### Dashboards
```/api/getDashboard```
- Method: GET
- Parameters:
  - id: the id of the dashboard object

```/api/updateDashboard```
- Method: POST
- Parameters:
  - id: if specified updates the dashboard instead of creating a new one
  - name: name of the dashboard
  - blocks: array of block ids
  - description: text that describes the dashboard

### Stories
```/api/getStory```
- Method: GET
- Parameters:
  - id: the id of the story to get data for

```/api/updateStory```
- Method: POST
- Parameters:
  - id: specified if an update
  - name: name of the story
  - description: quick description of the story
  - dashboards: array of dashboard ids
### Meters
```/api/addMeter```
- Method: POST
- Parameters:
  - address: address of the meter
  - name: name of the meter
This method should only be called by the data collection script when it can not establish that a meter exists in the meters database

## Python Scripts
### Import Data
#### Process
1. Connect to old mongo db and new sql service w/config file
2. Check if table exists
3. Create table to specifications highlighted in table section
4. Populate table from old mongo db
5. Repeat steps 3 and 4 for all tables
6. Add indexes as highlighted in chart diagram
### Temporary To Permanent
#### Process
1. Connect to SQL server
2. Query all buildings in the buildings table
3. For each building query the meters table for that building id
4. Create a new dictionary object
5. Loop through the meters returned from the query
6. Add the values from the meters to the new dictionary object, be careful to follow the operation scheme laid out by the meters table. Also, use the time (w/truncated seconds) as a key for the dictionary.
7. Iterate through the dictionary you created
8. If the current key has the same amount of entries as were found in the meters table query, delete all the data points from that entry. Then insert the combined total into the data table.

- [Development Environment](#dev-environment)
  - [Running a VueJS Dev Server](#vue-dev-server)
## Development Environment
### Running a VueJS Dev Server
To run the VueJS server, navigate to /energy-dashboard-frontend. In your bash terminal, run ```npm install -g vue``` and then run ```npm run dev```.
