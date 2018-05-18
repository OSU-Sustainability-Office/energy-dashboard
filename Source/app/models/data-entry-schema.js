var mongoose = require('mongoose');
var dataEntrySchema = mongoose.Schema({
    building: {
        type: mongoose.Schema.ObjectId,
        ref: 'Building'
    },
    meter_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Meter'
    },
    timestamp: {
        type: String,
        required: true
    },
    point: [{
        number: Number,
        name: String,
        units: String,
        value: Number
    }]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('DataEntry', dataEntrySchema);