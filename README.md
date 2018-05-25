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
| Table Name     | Description                                                |
|----------------|:-----------------------------------------------------------|
| buildings      | Stores info. of building on campus.                        |
| meters         | Specifies existence and relation to building of a meter.   |
| temp_data      | Temp. data storage. Relation to meter not building.        |
| data           | Data storage, relation to building.                        |
| blocks         | Unit for graph information.                                |
| block_buildings| Relates buildings to blocks.                               |
| stories        | Unit of dashboards.                                        |
| user_stories   | Relates users to stories.                                  |
| users          | Holds user priviliges.                                     |

#### buildings

| Field       | Type     | NULL   | Key   | Default   | Extra      |
|-------------|:--------:|:------:|:-----:|:---------:|:----------:|
| id          |int(11)   | NO     | PRI   | NULL      | auto_incr  |
| Name        |char(64)  | YES    |       | NULL      |            |
| sus_map_id  |char(64)  | YES    |       | NULL      |            |


#### meters
| Field       | Type     | NULL   | Key   | Default   | Extra      |
|-------------|:--------:|:------:|:-----:|:---------:|:----------:|
| id          |int(11)   | NO     | PRI   | NULL      | auto_incr  |
| Name        |char(64)  | YES    |       | NULL      |            |
| address     |char(64)  | YES    |       | NULL      |            |
| building_id |int(11)   | YES    | MUL   | NULL      |            |
| operation   |bit(1)    | YES    |       | NULL      |            |

#### temp_data
| Field            | Type      | NULL | KEY | DEFAULT           | Extra                       |
|------------------|:---------:|:----:|:---:|:-----------------:|:---------------------------:|
| id               | int(11)   | NO   | PRI | NULL              | auto_increment              |
| meter_address    | char(16)  | YES  | MUL | NULL              |                             |
| time             | timestamp | YES  |     | CURRENT_TIMESTAMP |                             |
| accumulated_real | int(11)   | YES  |     | NULL              |                             |
| real_power       | float     | YES  |     | NULL              |                             |
| reactive_power   | float     | YES  |     | NULL              |                             |
| apparent_power   | float     | YES  |     | NULL              |                             |
| real_a           | float     | YES  |     | NULL              |                             |
| real_b           | float     | YES  |     | NULL              |                             |
| real_c           | float     | YES  |     | NULL              |                             |
| reactive_a       | float     | YES  |     | NULL              |                             |
| reactive_b       | float     | YES  |     | NULL              |                             |
| reactive_c       | float     | YES  |     | NULL              |                             |
| apparent_a       | float     | YES  |     | NULL              |                             |
| apparent_b       | float     | YES  |     | NULL              |                             |
| apparent_c       | float     | YES  |     | NULL              |                             |
| pf_a             | float     | YES  |     | NULL              |                             |
| pf_b             | float     | YES  |     | NULL              |                             |
| pf_c             | float     | YES  |     | NULL              |                             |
| vphase_ab        | float     | YES  |     | NULL              |                             |
| vphase_bc        | float     | YES  |     | NULL              |                             |
| vphase_ac        | float     | YES  |     | NULL              |                             |
| vphase_an        | float     | YES  |     | NULL              |                             |
| vphase_bn        | float     | YES  |     | NULL              |                             |
| vphase_cn        | float     | YES  |     | NULL              |                             |
| cphase_a         | float     | YES  |     | NULL              |                             |
| cphase_b         | float     | YES  |     | NULL              |                             |
| cphase_c         | float     | YES  |     | NULL              |                             |

#### data
| Field            | Type      | NULL | KEY | DEFAULT           | Extra                       |
|------------------|:---------:|:----:|:---:|:-----------------:|:---------------------------:|
| id               | int(11)   | NO   | PRI | NULL              | auto_increment              |
| building_id      | int(11)   | YES  | MUL | NULL              |                             |
| time             | timestamp | YES  | MUL | CURRENT_TIMESTAMP |                             |
| accumulated_real | int(11)   | YES  |     | NULL              |                             |
| real_power       | float     | YES  |     | NULL              |                             |
| reactive_power   | float     | YES  |     | NULL              |                             |
| apparent_power   | float     | YES  |     | NULL              |                             |
| real_a           | float     | YES  |     | NULL              |                             |
| real_b           | float     | YES  |     | NULL              |                             |
| real_c           | float     | YES  |     | NULL              |                             |
| reactive_a       | float     | YES  |     | NULL              |                             |
| reactive_b       | float     | YES  |     | NULL              |                             |
| reactive_c       | float     | YES  |     | NULL              |                             |
| apparent_a       | float     | YES  |     | NULL              |                             |
| apparent_b       | float     | YES  |     | NULL              |                             |
| apparent_c       | float     | YES  |     | NULL              |                             |
| pf_a             | float     | YES  |     | NULL              |                             |
| pf_b             | float     | YES  |     | NULL              |                             |
| pf_c             | float     | YES  |     | NULL              |                             |
| vphase_ab        | float     | YES  |     | NULL              |                             |
| vphase_bc        | float     | YES  |     | NULL              |                             |
| vphase_ac        | float     | YES  |     | NULL              |                             |
| vphase_an        | float     | YES  |     | NULL              |                             |
| vphase_bn        | float     | YES  |     | NULL              |                             |
| vphase_cn        | float     | YES  |     | NULL              |                             |
| cphase_a         | float     | YES  |     | NULL              |                             |
| cphase_b         | float     | YES  |     | NULL              |                             |
| cphase_c         | float     | YES  |     | NULL              |                             |

#### blocks
| Field        | Type       | NULL   | Key   | Default           | Extra      |
|--------------|:----------:|:------:|:-----:|:-----------------:|:----------:|
| id           |int(11)     | NO     | PRI   | NULL              | auto_incr  |
| Name         |char(64)    | YES    |       | NULL              |            |
| g_type       |int(11)     | YES    |       | NULL              |            |
| media        |varchar(255)| YES    |       | NULL              |            |
| text         |varchar(255)| YES    |       | NULL              |            |
| story_id     |varchar(255)| YES    | MUL   | NULL              |            |
| d_start      | timestamp  | YES    |       | CURRENT_TIMESTAMP |            |
| d_end        | timestamp  | YES    |       | CURRENT_TIMESTAMP |            |
| d_range      | int(11)    | YES    |       | NULL              |            |
| d_range      | char(1)    | YES    |       | NULL              |            |
#### block_buildings
| Field       | Type     | NULL   | Key   | Default   | Extra      |
|-------------|:--------:|:------:|:-----:|:---------:|:----------:|
| id          |int(11)   | NO     | PRI   | NULL      | auto_incr  |
| Name        |char(64)  | YES    |       | NULL      |            |
| block_id    |int(11)   | YES    | MUL   | NULL      |            |
| building_id |int(11)   | YES    | MUL   | NULL      |            |
| m_point     |int(11)   | YES    | MUL   | NULL      |            |
#### stories
| Field       | Type         | NULL | Key | Default | Extra          |
|-------------|:------------:|:----:|:---:|:-------:|:--------------:|
| id          | int(11)      | NO   | PRI | NULL    | auto_increment |
| Name        | char(64)     | YES  |     | NULL    |                |
| description | varchar(255) | YES  |     | NULL    |                |
| public      | int          | YES  |     | NULL    |                |
#### user_ stories
| Field       | Type         | NULL | Key | Default | Extra          |
|-------------|:------------:|:----:|:---:|:-------:|:--------------:|
| id          | int(11)      | NO   | PRI | NULL    | auto_increment |
| user_id     | int(11)      | YES  | MUL | NULL    |                |
| story_id    | int(11)      | YES  | MUL | NULL    |                |
#### users
| Field       | Type         | NULL | Key | Default | Extra          |
|-------------|:------------:|:----:|:---:|:-------:|:--------------:|
| id          | int(11)      | NO   | PRI | NULL    | auto_increment |
| Name        | char(255)    | YES  |     | NULL    |                |
| privilige   | int(11)      | YES  |     | NULL    |                |

## API Reference
### Buildings
```/api/getAllBuildings```
- Method: GET
- Parameters: None
- Returns: JSON ```[{id, name}]```

Gets all the meter groups labeled as a building.

```/api/updateBuilding```
- Method: POST
- Parameters:
  - id: Integer id of the building, if none is specified the building is created in the database
  - name: the name of the building
  - meters: an array of meter objects the building uses
    - meter object: has the structure of {id, bool}, the bool specifies the operation to the buildings total (TRUE = add, FALSE = subtract)

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

  If a range is specified without a start or end date the current date time is used as the end date and the start date is determined by the range. Start dates and end dates are always specified as the start and end. This means if the start, end and range are all specified the range is ignored. This function also automatically omits results based on the requested date range, limiting the transfer of data.

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

## Development Environment
### Running a VueJS Dev Server
To run the VueJS server, navigate to /energy-dashboard-frontend. In your bash terminal, run ```npm install -g vue``` and then run ```npm run dev```.
