var mongoose = require('mongoose');
var meterSchema = mongoose.Schema({
    name: String,
    meter_id: String,
    building: {
        type: mongoose.Schema.ObjectId,
        ref: 'Building'
    }
});
// create the model for users and expose it to our app
module.exports = mongoose.model('Meter', meterSchema);