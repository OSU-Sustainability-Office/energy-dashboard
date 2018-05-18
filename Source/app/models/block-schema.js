var mongoose = require('mongoose');
var blockSchema = mongoose.Schema({
        name: String,
        created_by: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
        },
        building: [{
                type: mongoose.Schema.ObjectId,
                ref: 'Building'
        }],
        chart: String,
        is_public : Boolean,
        variable: String
});
// create the model for users and expose it to our app
module.exports = mongoose.model('Block', blockSchema);