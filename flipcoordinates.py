import json

with open('controllers/building-data-bad-cords.json') as f:
    data = json.load(f);
new_data = []
for building in data['buildings']:
    polygon = []
    for coord in building['polygon']:
        polygon.append([coord[1],coord[0]])
    building['polygon'] = polygon
    new_data.append(building)

with open('controllers/building-data.json','w') as outfile:
    json.dump(new_data, outfile)
