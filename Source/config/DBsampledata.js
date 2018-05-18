var Building = require('../app/models/building-schema');
var DataEntry = require('../app/models/data-entry-schema');

var academic_halls = ['Dryden Hall', 'Kelley Engineering Center', 'Milam Hall', 'Nash Hall', 'Weniger Hall'];
var res_halls = ['Bloss Hall', 'Buxton Hall', 'Callahan Hall', 'Cauthorn Hall', 'Finley Hall', 'Halsell Hall', 'Hawley Hall',
    'International Living Learning Center', 'McNary Hall', 'Poling Hall', 'Sackett Hall', 'Tebeau Hall',
    'Weatherford Hall', 'West Hall', 'Wilson Hall'
];
var data_center = ['Marketplace West Dining Center', 'Milne Computing Center'];
var dining_facility = ['Arnold Dining Center'];
var library = ['Valley Library'];
var rec_center = ['Dixon Recreation Center'];
var other = ['CH2M Hill Alumni Center', 'Memorial Union', 'Student Experience Center'];

// full array with all 72 points. No need to format it though
var sampleEntryTemplate = {
    point: [{
        number: 0,
        name: "Accumulated Real Energy Net",
        units: "kWh",
        value: 8992894,
        _id: "5a98fffa84856d083440b934"
    }, {
        number: 1,
        name: "Real Energy Quadrants 1 & 4, Import",
        units: "kWh",
        value: 8992909,
        _id: "5a98fffa84856d083440b935"
    }, {
        number: 2,
        name: "Real Energy Quadrants 2 & 3, Export",
        units: "kWh",
        value: 15.25,
        _id: "5a98fffa84856d083440b936"
    }, {
        number: 3,
        name: "Reactive Energy Quadrant 1",
        units: "VARh",
        value: 3347852.5,
        _id: "5a98fffa84856d083440b937"
    }, {
        number: 4,
        name: "Reactive Energy Quadrant 2",
        units: "VARh",
        value: 73.51,
        _id: "5a98fffa84856d083440b938"
    }, {
        number: 5,
        name: "Reactive Energy Quadrant 3",
        units: "VARh",
        value: 74.61,
        _id: "5a98fffa84856d083440b939"
    }, {
        number: 6,
        name: "Reactive Energy Quadrant 4",
        units: "VARh",
        value: 73.57,
        _id: "5a98fffa84856d083440b93a"
    }, {
        number: 7,
        name: "Apparent Energy Net",
        units: "VAh",
        value: 9615888,
        _id: "5a98fffa84856d083440b93b"
    }, {
        number: 8,
        name: "Apparent Energy Quadrants 1 & 4",
        units: "VAh",
        value: 9616032,
        _id: "5a98fffa84856d083440b93c"
    }, {
        number: 9,
        name: "Apparent Energy Quadrants 2 & 3",
        units: "VAh",
        value: 144.2,
        _id: "5a98fffa84856d083440b93d"
    }, {
        number: 10,
        name: "Total Net Instantaneous Real Power",
        units: "kW",
        value: 339.39,
        _id: "5a98fffa84856d083440b93e"
    }, {
        number: 11,
        name: "Total Net Instantaneous Reactive Power",
        units: "kVAR",
        value: 93.84,
        _id: "5a98fffa84856d083440b93f"
    }, {
        number: 12,
        name: "Total Net Instantaneous Apparent Power",
        units: "kVA",
        value: 352.13,
        _id: "5a98fffa84856d083440b940"
    }, {
        number: 13,
        name: "Total Power Factor",
        units: "",
        value: 0.96,
        _id: "5a98fffa84856d083440b941"
    }, {
        number: 14,
        name: "Voltage, L-L, 3p Ave",
        units: "Volts",
        value: 486.97,
        _id: "5a98fffa84856d083440b942"
    }, {
        number: 15,
        name: "Voltage, L-N, 3p Ave",
        units: "Volts",
        value: 281.08,
        _id: "5a98fffa84856d083440b943"
    }, {
        number: 16,
        name: "Current, 3p Ave",
        units: "Amps",
        value: 418.78,
        _id: "5a98fffa84856d083440b944"
    }, {
        number: 17,
        name: "Frequency",
        units: "Hz",
        value: 60.02,
        _id: "5a98fffa84856d083440b945"
    }, {
        number: 18,
        name: "Total Real Power Present Demand",
        units: "kW",
        value: 351.72,
        _id: "5a98fffa84856d083440b946"
    }, {
        number: 19,
        name: "Total Reactive Power Present Demand",
        units: "kVAR",
        value: 109.71,
        _id: "5a98fffa84856d083440b947"
    }, {
        number: 20,
        name: "Total Apparent Power Present Demand",
        units: "kVA",
        value: 368.85,
        _id: "5a98fffa84856d083440b948"
    }, {
        number: 21,
        name: "Total Real Power Max Demand, Import",
        units: "kW",
        value: 756.22,
        _id: "5a98fffa84856d083440b949"
    }, {
        number: 22,
        name: "Total Reactive Power Max Demand, Import",
        units: "kVAR",
        value: 240.72,
        _id: "5a98fffa84856d083440b94a"
    }, {
        number: 23,
        name: "Total Apparent Power Max Demand, Import",
        units: "kVA",
        value: 792.54,
        _id: "5a98fffa84856d083440b94b"
    }, {
        number: 24,
        name: "Total Real Power Max Demand, Export",
        units: "kW",
        value: -0.08,
        _id: "5a98fffa84856d083440b94c"
    }, {
        number: 25,
        name: "Total Reactive Power Max Demand, Export",
        units: "kVAR",
        value: -1.8,
        _id: "5a98fffa84856d083440b94d"
    }, {
        number: 26,
        name: "Total Apparent Power Max Demand, Export",
        units: "kVA",
        value: 266.28,
        _id: "5a98fffa84856d083440b94e"
    }, {
        number: 27,
        name: "Accumulated Real Energy, Phase A, Import",
        units: "kWh",
        value: 2945785,
        _id: "5a98fffa84856d083440b94f"
    }, {
        number: 28,
        name: "Accumulated Real Energy, Phase B, Import",
        units: "kWh",
        value: 3164238.25,
        _id: "5a98fffa84856d083440b950"
    }, {
        number: 29,
        name: "Accumulated Real Energy, Phase C, Import",
        units: "kWh",
        value: 2882884.5,
        _id: "5a98fffa84856d083440b951"
    }, {
        number: 30,
        name: "Accumulated Real Energy, Phase A, Export",
        units: "kWh",
        value: 5.05,
        _id: "5a98fffa84856d083440b952"
    }, {
        number: 31,
        name: "Accumulated Real Energy, Phase B, Export",
        units: "kWh",
        value: 5.29,
        _id: "5a98fffa84856d083440b953"
    }, {
        number: 32,
        name: "Accumulated Real Energy, Phase C, Export",
        units: "kWh",
        value: 4.92,
        _id: "5a98fffa84856d083440b954"
    }, {
        number: 33,
        name: "Accumulated Q1 Reactive Energy, Phase A, Import",
        units: "VARh",
        value: 1226257.25,
        _id: "5a98fffa84856d083440b955"
    }, {
        number: 34,
        name: "Accumulated Q1 Reactive Energy, Phase B, Import",
        units: "VARh",
        value: 968708.06,
        _id: "5a98fffa84856d083440b956"
    }, {
        number: 35,
        name: "Accumulated Q1 Reactive Energy, Phase C, Import",
        units: "VARh",
        value: 1152887.25,
        _id: "5a98fffa84856d083440b957"
    }, {
        number: 36,
        name: "Accumulated Q2 Reactive Energy, Phase A, Import",
        units: "VARh",
        value: 24.21,
        _id: "5a98fffa84856d083440b958"
    }, {
        number: 37,
        name: "Accumulated Q2 Reactive Energy, Phase B, Import",
        units: "VARh",
        value: 25.49,
        _id: "5a98fffa84856d083440b959"
    }, {
        number: 38,
        name: "Accumulated Q2 Reactive Energy, Phase C, Import",
        units: "VARh",
        value: 23.82,
        _id: "5a98fffa84856d083440b95a"
    }, {
        number: 39,
        name: "Accumulated Q3 Reactive Energy, Phase A, Export",
        units: "VARh",
        value: 24.72,
        _id: "5a98fffa84856d083440b95b"
    }, {
        number: 40,
        name: "Accumulated Q3 Reactive Energy, Phase B, Export",
        units: "VARh",
        value: 26.01,
        _id: "5a98fffa84856d083440b95c"
    }, {
        number: 41,
        name: "Accumulated Q3 Reactive Energy, Phase C, Export",
        units: "VARh",
        value: 23.88,
        _id: "5a98fffa84856d083440b95d"
    }, {
        number: 42,
        name: "Accumulated Q4 Reactive Energy, Phase A, Export",
        units: "VARh",
        value: 24.54,
        _id: "5a98fffa84856d083440b95e"
    }, {
        number: 43,
        name: "Accumulated Q4 Reactive Energy, Phase B, Export",
        units: "VARh",
        value: 25.59,
        _id: "5a98fffa84856d083440b95f"
    }, {
        number: 44,
        name: "Accumulated Q4 Reactive Energy, Phase C, Export",
        units: "VARh",
        value: 23.44,
        _id: "5a98fffa84856d083440b960"
    }, {
        number: 45,
        name: "Accumulated Apparent Energy, Phase A, Import",
        units: "VAh",
        value: 3197473.5,
        _id: "5a98fffa84856d083440b961"
    }, {
        number: 46,
        name: "Accumulated Apparent Energy, Phase B, Import",
        units: "VAh",
        value: 3316116.25,
        _id: "5a98fffa84856d083440b962"
    }, {
        number: 47,
        name: "Accumulated Apparent Energy, Phase C, Import",
        units: "VAh",
        value: 3112377.5,
        _id: "5a98fffa84856d083440b963"
    }, {
        number: 48,
        name: "Accumulated Apparent Energy, Phase A, Export",
        units: "VAh",
        value: 49.43,
        _id: "5a98fffa84856d083440b964"
    }, {
        number: 49,
        name: "Accumulated Apparent Energy, Phase B, Export",
        units: "VAh",
        value: 52.02,
        _id: "5a98fffa84856d083440b965"
    }, {
        number: 50,
        name: "Accumulated Apparent Energy, Phase C, Export",
        units: "VAh",
        value: 48.18,
        _id: "5a98fffa84856d083440b966"
    }, {
        number: 51,
        name: "Real Power, Phase A",
        units: "kW",
        value: 114.97,
        _id: "5a98fffa84856d083440b967"
    }, {
        number: 52,
        name: "Real Power, Phase B",
        units: "kW",
        value: 117.23,
        _id: "5a98fffa84856d083440b968"
    }, {
        number: 53,
        name: "Real Power, Phase C",
        units: "kW",
        value: 107.19,
        _id: "5a98fffa84856d083440b969"
    }, {
        number: 54,
        name: "Reactive Power, Phase A",
        units: "kVAR",
        value: 34.62,
        _id: "5a98fffa84856d083440b96a"
    }, {
        number: 55,
        name: "Reactive Power, Phase B",
        units: "kVAR",
        value: 26.78,
        _id: "5a98fffa84856d083440b96b"
    }, {
        number: 56,
        name: "Reactive Power, Phase C",
        units: "kVAR",
        value: 32.44,
        _id: "5a98fffa84856d083440b96c"
    }, {
        number: 57,
        name: "Apparent Power, Phase A",
        units: "kVA",
        value: 120.01,
        _id: "5a98fffa84856d083440b96d"
    }, {
        number: 58,
        name: "Apparent Power, Phase B",
        units: "kVA",
        value: 120.19,
        _id: "5a98fffa84856d083440b96e"
    }, {
        number: 59,
        name: "Apparent Power, Phase C",
        units: "kVA",
        value: 111.94,
        _id: "5a98fffa84856d083440b96f"
    }, {
        number: 60,
        name: "Power Factor, Phase A",
        units: "",
        value: 0.96,
        _id: "5a98fffa84856d083440b970"
    }, {
        number: 61,
        name: "Power Factor, Phase B",
        units: "",
        value: 0.98,
        _id: "5a98fffa84856d083440b971"
    }, {
        number: 62,
        name: "Power Factor, Phase C",
        units: "",
        value: 0.96,
        _id: "5a98fffa84856d083440b972"
    }, {
        number: 63,
        name: "Voltage, Phase A-B",
        units: "Volts",
        value: 486.15,
        _id: "5a98fffa84856d083440b973"
    }, {
        number: 64,
        name: "Voltage, Phase B-C",
        units: "Volts",
        value: 488.78,
        _id: "5a98fffa84856d083440b974"
    }, {
        number: 65,
        name: "Voltage, Phase A-C",
        units: "Volts",
        value: 485.99,
        _id: "5a98fffa84856d083440b975"
    }, {
        number: 66,
        name: "Voltage, Phase A-N",
        units: "Volts",
        value: 279.88,
        _id: "5a98fffa84856d083440b976"
    }, {
        number: 67,
        name: "Voltage, Phase B-N",
        units: "Volts",
        value: 280.73,
        _id: "5a98fffa84856d083440b977"
    }, {
        number: 68,
        name: "Voltage, Phase C-N",
        units: "Volts",
        value: 282.61,
        _id: "5a98fffa84856d083440b978"
    }, {
        number: 69,
        name: "Current, Phase A",
        units: "Amps",
        value: 431.5,
        _id: "5a98fffa84856d083440b979"
    }, {
        number: 70,
        name: "Current, Phase B",
        units: "Amps",
        value: 429.18,
        _id: "5a98fffa84856d083440b97a"
    }, {
        number: 71,
        name: "Current, Phase C",
        units: "Amps",
        value: 395.67,
        _id: "5a98fffa84856d083440b97b"
    }]
}

function InitSampleDataEntry(building_id) {
    var sampleDataEntry = new DataEntry();
    var timestamp = new Date((new Date().getTime()) + Math.floor(Math.random() * 20000000) + 10000000)
    var year = timestamp.getFullYear();
    var month = timestamp.getMonth() + 1;
    var day = timestamp.getDate();
    var hour = timestamp.getHours();
    var minute = timestamp.getMinutes();
    var second = timestamp.getSeconds();
    if (month < 10)
        month = "0" + month
    if (day < 10)
        day = "0" + day
    if (hour < 10)
        hour = "0" + hour
    if (minute < 10)
        minute = "0" + minute
    if (second < 10)
        second = "0" + second
    sampleDataEntry.timestamp = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    for (var i = 0; i < 72; i++) {
        var point = {
            number: i,
            name: sampleEntryTemplate.point[i].name,
            units: sampleEntryTemplate.point[i].units,
            value: Math.floor(Math.random() * 20000) + 10000
        }
        sampleDataEntry.point.push(point);

    }
    return sampleDataEntry;

}





var count = 0;
for (res in res_halls) {
    Building.findOne({
        name: res_halls[count]
    }, function (err, building) {
        if (err)
            return done(err);
        if (building) {
            return null;
        } else {
            // if the building is not in our database, create a new building
            var res = new Building();
            // set all of the relevant information
            res.name = res_halls[count];
            res.building_type = 'Residence Hall/Dormitory';
            res.meter_id = null;
            res.data_entries.push(InitSampleDataEntry(res));
            res.data_entries.push(InitSampleDataEntry(res));
            res.data_entries.push(InitSampleDataEntry(res));


            // save the building
            res.save(function (err) {
                if (err)
                    throw err;
                console.log("Document " + res.name + " added.");

            });
        }
        count++;

    });
}

var ac_count = 0;
for (ac in academic_halls) {

    Building.findOne({
        name: academic_halls[ac_count]
    }, function (err, building) {
        if (err)
            return done(err);
        if (building) {
            return null;
        } else {

            // if the building is not in our database, create a new building
            var acBuilding = new Building();
            // set all of the relevant information
            acBuilding.name = academic_halls[ac_count];
            acBuilding.building_type = 'Academic';
            acBuilding.meter_id = Math.floor(Math.random() * 20000) + 10000;
            acBuilding.data_entries.push(InitSampleDataEntry(acBuilding));
            acBuilding.data_entries.push(InitSampleDataEntry(acBuilding));
            acBuilding.data_entries.push(InitSampleDataEntry(acBuilding));
            acBuilding.data_entries.push(InitSampleDataEntry(acBuilding));
            acBuilding.data_entries.push(InitSampleDataEntry(acBuilding));


            // save the building
            acBuilding.save(function (err) {
                if (err)
                    throw err;
                console.log("Document " + acBuilding.name + " added.");

            });
        }
        ac_count++;
    });
}
var dc_count = 0;
for (dc in data_center) {
    Building.findOne({
        name: data_center[dc_count]
    }, function (err, building) {
        if (err)
            return done(err);
        if (building) {
            return null;
        } else {
            // if the building is not in our database, create a new building
            var dcBuilding = new Building();
            // set all of the relevant information
            dcBuilding.name = data_center[dc_count];
            dcBuilding.building_type = 'Data Center';
            dcBuilding.meter_id = Math.floor(Math.random() * 20000) + 10000;
            dcBuilding.data_entries.push(InitSampleDataEntry(dcBuilding));
            dcBuilding.data_entries.push(InitSampleDataEntry(dcBuilding));
            dcBuilding.data_entries.push(InitSampleDataEntry(dcBuilding));
            dcBuilding.data_entries.push(InitSampleDataEntry(dcBuilding));
            dcBuilding.data_entries.push(InitSampleDataEntry(dcBuilding));
            dcBuilding.data_entries.push(InitSampleDataEntry(dcBuilding));
            dcBuilding.data_entries.push(InitSampleDataEntry(dcBuilding));
            dcBuilding.data_entries.push(InitSampleDataEntry(dcBuilding));


            // save the building
            dcBuilding.save(function (err) {
                if (err)
                    throw err;
                console.log("Document " + dcBuilding.name + " added.");

            });
        }
        dc_count++;
    });
}

var din_count = 0;
for (din in dining_facility) {
    Building.findOne({
        name: dining_facility[din_count]
    }, function (err, building) {
        if (err)
            return done(err);
        if (building) {
            return null;
        } else {
            // if the building is not in our database, create a new building
            var dinBuilding = new Building();
            // set all of the relevant information
            dinBuilding.name = dining_facility[din_count];
            dinBuilding.building_type = 'Dining Facility';
            dinBuilding.meter_id = Math.floor(Math.random() * 20000) + 10000;
            dinBuilding.data_entries.push(InitSampleDataEntry(dinBuilding));
            dinBuilding.data_entries.push(InitSampleDataEntry(dinBuilding));
            dinBuilding.data_entries.push(InitSampleDataEntry(dinBuilding));
            dinBuilding.data_entries.push(InitSampleDataEntry(dinBuilding));
            dinBuilding.data_entries.push(InitSampleDataEntry(dinBuilding));


            // save the building
            dinBuilding.save(function (err) {
                if (err)
                    throw err;
                console.log("Document " + dinBuilding.name + " added.");

            });
        }
        din_count++;
    });
}

var lib_count = 0;
for (lib in library) {
    Building.findOne({
        name: library[lib_count]
    }, function (err, building) {
        if (err)
            return done(err);
        if (building) {
            return null;
        } else {
            // if the building is not in our database, create a new building
            var libBuilding = new Building();
            // set all of the relevant information
            libBuilding.name = library[lib_count];
            libBuilding.building_type = 'Library';
            libBuilding.meter_id = Math.floor(Math.random() * 20000) + 10000;
            libBuilding.data_entries.push(InitSampleDataEntry(libBuilding));
            libBuilding.data_entries.push(InitSampleDataEntry(libBuilding));
            libBuilding.data_entries.push(InitSampleDataEntry(libBuilding));
            libBuilding.data_entries.push(InitSampleDataEntry(libBuilding));


            // save the building
            libBuilding.save(function (err) {
                if (err)
                    throw err;
                console.log("Document " + libBuilding.name + " added.");

            });
        }
        lib_count++;
    });
}

var rec_count = 0;
for (rec in rec_center) {
    Building.findOne({
        name: rec_center[rec_count]
    }, function (err, building) {
        if (err)
            return done(err);
        if (building) {
            return null;
        } else {
            // if the building is not in our database, create a new building
            var recBuilding = new Building();
            // set all of the relevant information
            recBuilding.name = rec_center[rec_count];
            recBuilding.building_type = 'Recreation Center';
            recBuilding.meter_id = Math.floor(Math.random() * 20000) + 10000;
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));
            recBuilding.data_entries.push(InitSampleDataEntry(recBuilding));

            // save the building
            recBuilding.save(function (err) {
                if (err)
                    throw err;
                console.log("Document " + recBuilding.name + " added.");

            });
        }
        rec_count++;
    });
}

var o_count = 0;
for (o in other) {
    Building.findOne({
        name: other[o_count]
    }, function (err, building) {
        if (err)
            return done(err);
        if (building) {
            return null;
        } else {
            // if the building is not in our database, create a new building
            var oBuilding = new Building();
            // set all of the relevant information
            oBuilding.name = other[o_count];
            oBuilding.building_type = 'Other';
            oBuilding.meter_id = Math.floor(Math.random() * 20000) + 10000;
            oBuilding.data_entries.push(InitSampleDataEntry(oBuilding));
            oBuilding.data_entries.push(InitSampleDataEntry(oBuilding));
            oBuilding.data_entries.push(InitSampleDataEntry(oBuilding));
            oBuilding.data_entries.push(InitSampleDataEntry(oBuilding));
            oBuilding.data_entries.push(InitSampleDataEntry(oBuilding));

            // save the building
            oBuilding.save(function (err) {
                if (err)
                    throw err;
                console.log("Document " + oBuilding.name + " added.");

            });
        }
        o_count++;
    });
}