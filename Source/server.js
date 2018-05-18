// server.js

// set up ======================================================================
// get all the tools we need
var dotenv = require('dotenv').config();
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var filter = require('content-filter');
require('./config/passport')(passport); // pass passport for configuration

// configuration ===============================================================

mongoose.connect(process.env.MONGO_DATABASE_URL, {
    useMongoClient: true
}); // connect to our database
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("We're connected");
});
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json()); // get information from html forms
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));
// required for passport
app.use(session({
    secret: 'sustainabilityisawesome',
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

var User = require('./app/models/user-schema');
var Building = require('./app/models/building-schema');
var Meter = require('./app/models/meter-schema');
var DataEntry = require('./app/models/data-entry-schema');
var Dashboard = require('./app/models/dashboard-schema');
var Block = require('./app/models/block-schema');
var Story = require('./app/models/story-schema');


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
// require('./config/DBsampledata.js');

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);