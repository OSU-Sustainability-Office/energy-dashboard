var mongoose = require('mongoose');
var storySchema = mongoose.Schema({
    name: String,
    is_public : Boolean,
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    dashboards: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Dashboard'
    }]
});
// create the model for users and expose it to our app
module.exports = mongoose.model('Story', storySchema);