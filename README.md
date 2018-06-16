# OSU Energy Dashboard
An open source data collection and visualization web application for Oregon State Universities power consumption.
## Table of Contents
- [Dependencies](#dependencies)
  - [DotEnv](#dotenv)
  - [Express](#express)
  - [Mocha](#mocha)
  - [MySQL](#mysql)
  - [NoDemon](#nodemon)
  - [Request](#request)
  - [Sanitizee](#sanitize)
- [DataBase Schema](#database-schema)
  - [Tables](#tables)
    - [Buildings](#buildings)
    - [Meters](#meters)
    - [Temporary Data](#temp_data)
    - [Data](#data)
    - [Blocks](#blocks)
    - [Block Buildings](#block_buildings)
    - [Stories](#stories)
    - [User Stories](#user_stories)
    - [Users](#users)
- [API Reference](#api-reference)
  - [Buildings](#buildings)
  - [Blocks](#blocks)
  - [Meters](#meters)
  - [Meter Groups](#meter-groups)
  - [Stories](#stories)
- [Python Scripts](#python-scripts)
  - [Import Data](#import-data)
  - [Tempory Data to Permanent Data](#temporary-to-permanent)
- [Development Environment](#development-environment)
  - [Running a VueJS Dev Server](#running-a-vuejs-dev-server)
## Dependencies
### DotEnv
  Used for loading environment files into the application. Needed to specify the database users, passwords and hosts.
### Express
  Used for URL routing.
### Mocha
  Used for writing functional tests.
### MySQL
  Used to communicate with database.
### NoDemon
  Used to automatically restart the server with file changes for development purposes.
### Request
  Used in conjunction with Mocha to test different routes.
### Sanitize
  Used to ensure security on server request parameters.
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
```/api/getAllBuildings```
- Method: GET
- Parameters: None
- Returns: JSON ```[{id, name}]```

Gets all the meter groups labeled as a building.

### Blocks
```/api/getBlock```
- Method: GET
- Parameters:
  - id: the id of the block object
- Returns: JSON ```{d_start, d_end, d_range, name, g_type, media, descr, story_id, current, meter_groups}```

```/api/getBlockMeters```
- Method: GET
- Parameters:
  - id: the id of the block object
- Returns: Array of meter ids

```/api/updateBlock```
- Method: POST
- Parameters:
  - name: name of the block (specify for creation along with user_id)
  - id: leave null for creation, needed for update
  - user_id: only needed for creation of block
  - date_range: range to display the data, special formatted string, integer followed by specifier (d = day, m = month, h = hour, i = minute, y = year)
    - EX: 30d -> 30 Day range
  - graph_type: type of graph the block displays, int value (0-255)
  - meter_group_id: specified to change the meter point of the group
  - meter_point: specified in conjunction with meter_group_id to change the metering point
  - description: description text
  - link: external link to more information
  - start_date: start date of the graph
  - end_date: end date of the graph
  - meter_groups: an array of ids that specifies what meter groups are in the graph
  - current: specifies if the graph should display current (day, month or year), single char (d, m, y)
- Returns: Success or Failure

```/api/getBlockDataForStory```
- Method: GET
- Parameters:
  - story: story id
returns all blocks from the story with the specified id

 ### Meters
```/api/getDefaultMeters```
- Method: GET
- Parameters: None
- Returns: JSON format of meters table

```/api/getMeterData```
- Method: GET
- Parameters:
  - id: Integer id of the meter
  - endDate: string in ISO8601 DateTime format, specifies the end of the data retrieval
  - startDate: string in ISO8601 DateTime format, specifies the start of the data retrieval
  - mpoints: array of specified metering points, comma deliminated

  - unit: minute, hour, day or month specifying the delimiter of the intervals
  - int: the count of the unit to get data from
    - ex: (minute, 30) would return data points for every 30 minutes
- Returns: array of {meter_id, time, mpoints...}

### Meter Groups
```/api/updateMeterGroup```
- Method: POST
- Parameters:
  - id: id of the meter group specified for updating the meter groups name, building status or meters
  - name: name to change the group to
  - user_id: user linked to the group, needed to create a group
  - building: specifies if the group represents a meter or not
  - meters: array of meter ids with operation ```[{id,operation},...]```

```/api/getMetersForBuildings```
- Method: GET
- Parameters: None
- Returns: Array of JSON {name, meters(array of JSON {meter id, operation})}

```/api/getMeterGroupsForUser```
- Method: GET
- Parameters:
  - id: id of the user
- Returns: Array of JSON {name, meters(array of JSON {meter id, operation})}

### Stories
```/api/getBlocksForStory```
- Method: GET
- Parameters:
  - id: the id of the story to get data for
- Returns: Array of block ids

```/api/getPublicStories```
- Method: GET
- Parameters: None
- Returns: JSON {name, id, description}

```/api/getStoriesForUser```
- Method: GET
- Parameters:
  - user: the user name that is associated with the stories
- Returns: JSON {name, id, description}

```/api/updateStory```
- Method: POST
- Parameters:
  - id: specified if an update
  - name: name of the story
  - description: quick description of the story
  - blocks: array of block ids
  - public: bitm, if should be a public story

## Development Environment
### Running a VueJS Dev Server
To run the VueJS server, navigate to /energy-dashboard-frontend. In your bash terminal, run ```npm install -g vue```, ```npm install```, and then run ```npm run dev```.
