'use strict';

// info: these days (10/2019) the fcc-backend was renewed and it is impossible
// post new prjects due to a bug

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

// alternative to google finance
// https://repeated-alpaca.glitch.me/ to get up-to-date stock price information without needing to sign up for your own key


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
	defaultSrc: ["'self'"]
} } ) );


// ----------------- middleware functions -----------------------
// ...

// ----------------- get/post functions -----------------------
//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
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
