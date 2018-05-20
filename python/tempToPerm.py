import mysql.connector
import json

with open('config.json') as f:
    config = json.load(f)

dbs = mysql.connector.connect(host=config['sql']['host'],    # your host, usually localhost
                     user=config['sql']['user'],         # your username
                     passwd=config['sql']['pass'],  # your password
                     db=config['sql']['db']) 
sql = dbs.cursor()

sql.execute('SELECT id FROM buildings')

for building in sql.fetchall():
	sql.execute('SELECT address, operation FROM meters WHERE building_id = %d'%(building[0]))
	meterTime = {}
	#meters in building
	meters = sql.fetchall()
	for meter in meters:
		sql.execute('SELECT * FROM temp_data WHERE meter_address = "%s"'%(meter[0]))
		for data in sql.fetchall():
			if str(data[2])[:-3] in meterTime:
				if (meter[1]):
					meterTime[str(data[2])[:-3]][3] = meterTime[str(data[2])[:-3]][3] + data[3]
				else:
					meterTime[str(data[2])[:-3]][3] = meterTime[str(data[2])[:-3]][3] - data[3]
				meterTime[str(data[2])[:-3]][0].append(data[0])
			else:
				meterTime[str(data[2])[:-3]] = []
				if (meter[1]):
					meterTime[str(data[2])[:-3]].append([data[0]])
					for x in range(1,len(data)):
						meterTime[str(data[2])[:-3]].append(data[x])
				else:
					meterTime[str(data[2])[:-3]].append([data[0]])
					for x in range(1,len(data)):
						meterTime[str(data[2])[:-3]][x] = data[x]
					meterTime[str(data[2])[:-3]][3] = (-1)*meterTime[str(data[2])[:-3]][3]

	for key,value in meterTime.iteritems():
		if len(value[0]) == len(meters):
			for meterId in value[0]:
				sql.execute('DELETE FROM temp_data WHERE id=%d'%(meterId))
			sql.execute('INSERT INTO data (building_id, time, accumulated_real, real_power, reactive_power, apparent_power, real_a, real_b, real_c, reactive_a, reactive_b, reactive_c, apparent_a, apparent_b, apparent_c, pf_a, pf_b, pf_c, vphase_ab, vphase_bc, vphase_ac, vphase_an, vphase_bn, vphase_cn, cphase_a, cphase_b, cphase_c) VALUES (%d,"%s",%d,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f,%f)'%(building[0],value[2],value[3],value[4],value[5],value[6],value[7],value[8],value[9],value[10],value[11],value[12],value[13],value[14],value[15],value[16],value[17],value[18],value[19],value[20],value[21],value[22],value[23],value[24],value[25],value[26],value[27]))			
dbs.commit()