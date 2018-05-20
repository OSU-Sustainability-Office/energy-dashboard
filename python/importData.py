import pymongo
import mysql.connector
import json
from pymongo import MongoClient

with open('config.json') as f:
    config = json.load(f)

dbs = mysql.connector.connect(host=config['sql']['host'],    # your host, usually localhost
                     user=config['sql']['user'],         # your username
                     passwd=config['sql']['pass'],  # your password
                     db=config['sql']['db']) 

client = MongoClient(config['mongo']['uri'])
db = client.local


# for builiding in db['buildings'].find({},{'name': 1, 'data_entries' : 0}):
# 	print building
sql = dbs.cursor()

sql.execute('SHOW TABLES LIKE "buildings"')

if not sql.fetchone():
	sql.execute('CREATE TABLE buildings (id int NOT NULL AUTO_INCREMENT, Name CHAR(64), sus_map_id CHAR(64), PRIMARY KEY (id))')
	for building in db.buildings.find({}):
		sql.execute('INSERT INTO buildings (Name,sus_map_id) VALUES ("%s","%s")'%(building['name'],''))

# sql.execute('SELECT * FROM buildings')
# for row in sql.fetchall():
# 	print str(row[0]) + " " + str(row[1]) + " " + str(row[2])

sql.execute('SHOW TABLES LIKE "meters"')
if not sql.fetchone():
	sql.execute('CREATE TABLE meters (id int NOT NULL AUTO_INCREMENT, Name CHAR(64), address CHAR(16), building_id int, operation bit, PRIMARY KEY (id), FOREIGN KEY (building_id) REFERENCES buildings(id))')
	for building in db.buildings.find({}):
		sql.execute('SELECT id FROM buildings WHERE Name = "%s"'%(building['name']))
		sid = sql.fetchone()[0]
		for meter in db.meters.find({ '_id' : { '$in' : building['meters']}}):
			sql.execute('INSERT INTO meters (Name, address, building_id, operation) VALUES ("%s","%s",%d,1)'%(meter['name'],meter['meter_id'],sid))
	for meter in db.meters.find({}):
		if meter['meter_id'].find('_') >= 0:
			sql.execute('SELECT * FROM meters WHERE address = "%s"'%(meter['meter_id']))
			if not sql.fetchone():
				sql.execute('INSERT INTO meters (Name, address) VALUES ("%s","%s")'%(meter['name'],meter['meter_id']))

dbs.commit();

sql.execute('SHOW TABLES LIKE "data"')
if not sql.fetchone():
	sql.execute('CREATE TABLE data (id int NOT NULL AUTO_INCREMENT, building_id int, time TIMESTAMP, accumulated_real int, real_power float, reactive_power float, apparent_power float, real_a float, real_b float, real_c float, reactive_a float, reactive_b float, reactive_c float, apparent_a float, apparent_b float, apparent_c float, pf_a float, pf_b float, pf_c float, vphase_ab float, vphase_bc float, vphase_ac float, vphase_an float, vphase_bn float, vphase_cn float, cphase_a float, cphase_b float, cphase_c float, PRIMARY KEY (id), FOREIGN KEY (building_id) REFERENCES buildings(id))')
	#table population script 

# sql.execute('SHOW TABLES LIKE "temp_data"')
# if not sql.fetchone():
# 	sql.execute('CREATE TABLE temp_data (id int NOT NULL AUTO_INCREMENT, meter_address CHAR(16), time TIMESTAMP, accumulated_real int, real_power float, reactive_power float, apparent_power float, real_a float, real_b float, real_c float, reactive_a float, reactive_b float, reactive_c float, apparent_a float, apparent_b float, apparent_c float, pf_a float, pf_b float, pf_c float, vphase_ab float, vphase_bc float, vphase_ac float, vphase_an float, vphase_bn float, vphase_cn float, cphase_a float, cphase_b float, cphase_c float, PRIMARY KEY (id))')
for entry in db.dataentries.find({}).sort([( 'timestamp', pymongo.DESCENDING )]).limit(5000):
	meter = db.meters.find_one({ '_id' : entry['meter_id']})
	# sql.execute('SELECT id FROM meters WHERE address = "%s"'%(meter['meter_id']))
	# for sid in sql.fetchall():
	if len(entry['point']) == 72:
		sql.execute('INSERT INTO temp_data (meter_address, time, accumulated_real, real_power, reactive_power, apparent_power, real_a, real_b, real_c, reactive_a, reactive_b, reactive_c, apparent_a, apparent_b, apparent_c, pf_a, pf_b, pf_c, vphase_ab, vphase_bc, vphase_ac, vphase_an, vphase_bn, vphase_cn, cphase_a, cphase_b, cphase_c) VALUES ("%s","%s",%d,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f)'%(meter['meter_id'], entry['timestamp'], entry['point'][0]['value'],entry['point'][21]['value'],entry['point'][22]['value'],entry['point'][23]['value'],entry['point'][51]['value'],entry['point'][52]['value'],entry['point'][53]['value'],entry['point'][54]['value'],entry['point'][55]['value'],entry['point'][56]['value'],entry['point'][57]['value'],entry['point'][58]['value'],entry['point'][59]['value'],entry['point'][60]['value'],entry['point'][61]['value'],entry['point'][62]['value'],entry['point'][63]['value'],entry['point'][64]['value'],entry['point'][65]['value'],entry['point'][66]['value'],entry['point'][67]['value'],entry['point'][68]['value'],entry['point'][69]['value'],entry['point'][70]['value'],entry['point'][71]['value']))
dbs.commit();

sql.execute('SHOW TABLES LIKE "stories"')
if not sql.fetchone():
	sql.execute('CREATE TABLE stories (id int NOT NULL AUTO_INCREMENT, Name CHAR(64), description VARCHAR(255), PRIMARY KEY (id))')
	#table population script 

sql.execute('SHOW TABLES LIKE "dashboards"')
if not sql.fetchone():
	sql.execute('CREATE TABLE dashboards (id int NOT NULL AUTO_INCREMENT, Name CHAR(64), story_id int, description VARCHAR(255), PRIMARY KEY (id), FOREIGN KEY (story_id) REFERENCES stories(id))')

sql.execute('SHOW TABLES LIKE "blocks"')
if not sql.fetchone():
	sql.execute('CREATE TABLE blocks (id int NOT NULL AUTO_INCREMENT, m_point int, Name CHAR(64), g_type int, media VARCHAR(255), text VARCHAR(255), dashboard_id int, PRIMARY KEY (id), FOREIGN KEY (dashboard_id) REFERENCES dashboards(id))')
	#table population script 

sql.execute('SHOW TABLES LIKE "block_buildings"')
if not sql.fetchone():
	sql.execute('CREATE TABLE block_buildings (id int NOT NULL AUTO_INCREMENT, Name CHAR(64), block_id int, building_id int, PRIMARY KEY (id), FOREIGN KEY (block_id) REFERENCES blocks(id), FOREIGN KEY (building_id) REFERENCES buildings(id))')


# sql.execute('CREATE INDEX meter_building ON meters (building_id)')
# sql.execute('CREATE INDEX temp_data_meter ON temp_data (meter_address)')
# sql.execute('CREATE INDEX data_building ON data (building_id)')
# sql.execute('CREATE INDEX data_time ON data (time)')
# sql.execute('CREATE INDEX bbuilding_block ON block_buildings (block_id)')
# sql.execute('CREATE INDEX bbuilding_building ON block_buildings (building_id)')
# sql.execute('CREATE INDEX block_dashboard ON blocks (dashboard_id)')
# sql.execute('CREATE INDEX dashboard_story ON dashboards (story_id)')

dbs.commit();
dbs.close();





