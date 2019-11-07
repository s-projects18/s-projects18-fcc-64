'use strict';

// info: these days (10/2019) the fcc-backend was renewed;
// there were some problems in submitting new projects but fcc solved the problems

// ======================== [1] require ===========================
var express     = require('express');
var bodyParser  = require('body-parser');
var expect      = require('chai').expect;
var cors        = require('cors');
var helmet            = require('helmet');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

// using express-response-formatter
// https://github.com/aofleejay/express-response-formatter
// { meta: ..., data: ...,  error: ... }
const responseEnhancer = require('express-response-formatter')

// mount database-helper lib
var database = require('./helper/database.js');


// ================= [2] create + configure app =====================
var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add formatter functions to "res" object via "responseEnhancer()"
app.use(responseEnhancer());

// Set the content security policies to only allow loading of scripts and css from your server
// -> content-security-policy: default-src 'self'
app.use( helmet.contentSecurityPolicy( {directives: {
	defaultSrc: ["'self'"],
  scriptSrc: ["'self'", 'code.jquery.com', "'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"]
} } ) );

// https://stackoverflow.com/questions/10849687/express-js-how-to-get-remote-client-address
// without: 127.0.0.1 is returned (proxy) for res.ip
app.set('trust proxy', true);

// ----------------- middleware functions -----------------------
// show error page if there is no database-connection
app.use((req, res, next)=>{
  if(database.checkConnection()) next();
  else res.render('error-db.pug', {title: 'No database connection'});
});


// testing status for frontend
app.use((req, res, next)=>{
  if(req.query.test!==undefined) {
    if(req.query.test==200) res.formatter.ok([{title:'200: an dummy request'}], {info: 'Testinfo'});
    if(req.query.test==400) res.formatter.badRequest([{details:'400: an dummy bad request'},{details:'...'}]);
    if(req.query.test==500) res.formatter.serverError([{details:'500: an dummy bad request'},{details:'...'}]);
  } else next();
});


// ----------------- get/post functions -----------------------
//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

app.route('/user-stories.html')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/user-stories.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});


// ================= [3] connect to database and start listening ================
// start listening - no matter what db-status is
// checking connection in middleware
database.connect();

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
