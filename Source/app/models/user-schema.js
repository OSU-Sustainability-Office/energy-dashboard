var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    blocks: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Block'
    }],
    dashboards: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Dashboard'
    }],
    stories: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Story'
    }],
    accountAccess: {type: String, default: '0'}
});
// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);