# OSU Energy Dashboard
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
- [Python Scripts](#python-scripts)
  - [Import Data](#import-data)
  - [Tempory Data to Permanent Data](#temporary-to-permanent)
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
| dashboards     | Unit of blocks.                                            |
| stories        | Unit of dashboards.                                        |

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
| meter_address    | char(16)  | YES  |     | NULL              |                             |
| time             | timestamp | NO   |     | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
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
| time             | timestamp | NO   | MUL | CURRENT_TIMESTAMP | on update CURRENT_TIMESTAMP |
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
| Field        | Type       | NULL   | Key   | Default   | Extra      |
|--------------|:----------:|:------:|:-----:|:---------:|:----------:|
| id           |int(11)     | NO     | PRI   | NULL      | auto_incr  |
| m_point      |int(11)     | YES    |       | NULL      |            |
| Name         |char(64)    | YES    |       | NULL      |            |
| g_type       |int(11)     | YES    |       | NULL      |            |
| media        |varchar(255)| YES    |       | NULL      |            |
| text         |varchar(255)| YES    |       | NULL      |            |
| dashboard_id |varchar(255)| YES    | MUL   | NULL      |            |

#### block_buildings
| Field       | Type     | NULL   | Key   | Default   | Extra      |
|-------------|:--------:|:------:|:-----:|:---------:|:----------:|
| id          |int(11)   | NO     | PRI   | NULL      | auto_incr  |
| Name        |char(64)  | YES    |       | NULL      |            |
| block_id    |int(11)   | YES    | MUL   | NULL      |            |
| building_id |int(11)   | YES    | MUL   | NULL      |            |

#### dashboards
| Field       | Type         | NULL | Key | Default | Extra          |
|-------------|:------------:|:----:|:---:|:-------:|:--------------:|
| id          | int(11)      | NO   | PRI | NULL    | auto_increment |
| Name        | char(64)     | YES  |     | NULL    |                |
| story_id    | int(11)      | YES  | MUL | NULL    |                |
| description | varchar(255) | YES  |     | NULL    |                |
#### stories
| Field       | Type         | NULL | Key | Default | Extra          |
|-------------|:------------:|:----:|:---:|:-------:|:--------------:|
| id          | int(11)      | NO   | PRI | NULL    | auto_increment |
| Name        | char(64)     | YES  |     | NULL    |                |
| description | varchar(255) | YES  |     | NULL    |                |
## API Reference
## Python Scripts
### Import Data
### Temporary To Permanent
