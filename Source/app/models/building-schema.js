var mongoose = require('mongoose');
var buildingSchema = mongoose.Schema({
    name: String,
    building_type: String,
    meters: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Meter'
    }],
    data_entries: [{
        type: mongoose.Schema.ObjectId,
        ref: 'DataEntry'
    }]
});
// create the model for users and expose it to our app
module.exports = mongoose.model('Building', buildingSchema);