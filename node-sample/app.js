/*jslint node: true, nomen: true, indent:2, todo: true*/

/**
 *---------------------------------------------------------
 * app.js
 *---------------------------------------------------------
 *
 * Sample Web Application implemented in NodeJS.
 *
 * Illustrates what a Developer typically needs to do to
 * use AT&T WebRTC JS SDK to add Telephony and add realtime
 * Call and Conference Management functions into a Web
 * Application.
 *
 *----------------
 * Pre-requisites:
 *----------------
 * Before starting work on your Web Application, it is assumed
 * that, you previously:
 *
 * a) Created an app on AT&T Developer Portal with:
 * 
 * WEBRTCMOBILE scope ( 'AT&T Mobile Number' feature)
 * and/or
 * WEBRTC scope ( 'Virtual Number' and 'Account ID' features)
 *
 * b) Configured the resulting App Key, App Secret, Virtual
 * numbers etc. in your DHS
 *
 * c) Started your instance of DHS, noted its URL, configured
 * your DHS URL in package.json of this ExpressJS set-up.
 *
 *-----------------------------
 * This Sample App illustrates:
 *-----------------------------
 *
 *-------------------------------------------
 * 1) Setting up /dhs routes in your web-tier
 *-------------------------------------------
 * to help client-side SDK retrieve configuration info
 * about AT&T API App Key, API Endpoint, DHS Endpoint etc.
 *
 * You can use the file ./routes/dhs.js as-is out-of-the-box.
 * 
 *---------------------------------------------
 * 2) Setting up /oauth routes in your web-tier
 *---------------------------------------------
 * to handle User Consent if your application's
 * end user is an AT&T Mobility Subscriber. ( aka 'AT&T
 * Mobile Number' ) feature
 *
 * NOTE:
 *------
 * This set up is needed ONLY IF you plan to use 'AT&T
 * Mobile Number' feature in your Web Application. You
 * can skip it if you plan to use only 'Virtual Number' and
 * 'Account ID' features.
 *
 * Following 2 routes are set up:
 * a) /oauth/authorize
 * b) /oauth/callback
 *
 * You can use the file ./routes/att.js as-is out-of-the-box.
 *
 *---------------------------------------------
 * 3) Other functional routes in your web-tier
 *---------------------------------------------
 * To help you jump start, this Sample App also provides
 * quick-n-dirty implementations of User Login/Logout,
 * User Management, User Administration and Virtual Number Dispensing
 * features.
 *
 * You can write your own code or use your existing Web App
 * for this functionality.
 *
 * WebRTC core is not dependent on these functions.
 *
 *---------------------------------------------------------
 * @author Raj Sesetti, AT&T Developer Program, DRT/LTA
 *---------------------------------------------------------
 */

// ---------------------------------------------
// Boiler-plate Express App 'require' statements
// ---------------------------------------------
//
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// ---------------------------------------------
// END: Boiler-plate 'require' statements
// ---------------------------------------------

//
// Extra: library for session handling
//
var session = require('express-session');


// ---------------------------------------------
// BEGIN: Boiler-plate Express app set-up
// ---------------------------------------------
//
var app = express();

// View Engine setup
//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// Middleware
//
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'some-very-very-secret-stuff'
}));

app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------
// END: Boiler-plate Express app set-up
// ---------------------------------------------


// ---------------------------------------------
// BEGIN: Functional stuff for Sample App
// ---------------------------------------------
//
// NOTE that there is nothing special here for
// AT&T WebRTC. This is your usual code for:
//
// Home/Login/Logout
// User Management
// Administration
//
// We provided these just to jump start your
// Sample App.
// ---------------------------------------------

// Home/Login/Logout routes
//
var index = require('./routes/index');
app.use( '/', index );

// User Management routes
//
var users = require('./routes/users');
app.use( '/users', users );

// Admin Functions routes
//
var admin = require('./routes/admin');
app.use( '/admin', admin );

// ---------------------------------------------
// END: Functional stuff
// ---------------------------------------------


// ---------------------------------------------
// BEGIN: CUSTOM CODE for WebRTC functionality
// ---------------------------------------------
// This is the meat of code to enable AT&T WebRTC
//
// ---------------------------------------------
// CUSTOM CODE to enable 'AT&T Mobile Number'
// ---------------------------------------------
// OAuth Routes need for AT&T Authorization if
// you are planning for AT&T Mobility Subscribers
// to use your App. This is also known as 
// 'AT&T Mobile Number' feature of AT&T Enhanced WebRTC API
//
// You don't need to include the following 2 lines
// if you don't use that feature
//
var att = require('./routes/att');
app.use( '/oauth', att );

// ---------------------------------------------
// END: CUSTOM CODE for 'AT&T Mobile Number'
// ---------------------------------------------

// ---------------------------------------------
// CUSTOM CODE to include to enable AT&T Enhanced WebRTC
// functionality. Use this no matter what.
// ---------------------------------------------
// Now is also a good time to talk to DHS and 
// obtain important configuration information
// for your AT&T Developer App. Ensure that you
// configured all your API items ( App Key, App
// Secret, Virtual Number Pool, Enhanced WebRTC domain, OAuth callback
// URL etc.) in DHS. Ensure that your instance of
// DHS is up and running.
//
var package = require('./package');

// TODO: Add the reason Why I use 'host', not URL
//
var dhs_https_host =  process.env.DHS_HTTPS_HOST || package.dhs_https_host;
var dhs_https_port = package.dhs_https_port;

console.log( 'DHS HTTPS HOST: %s', dhs_https_host );

if( dhs_https_host ) {

  // dhs library will talk to DHS
  // and obtain configuration info
  //
  // and expose a route for your
  // web client to retrieve that info
  //
  // Once done,
  // your web app client can directly
  // talk to DHS to obtain Access Token,
  // E911 ID etc...
  //
  var dhs = require( './routes/dhs' );
  app.use( '/dhs', dhs );

  // dhs router talks to DHS and retrieves
  // your AT&T app configuration (api_key,
  // api_secret, virtual_number_pool, ewebrtc_domain,
  // authorize_uri etc.)
  //
  // It injects that info to whoever needs
  // it. In this case, /att route needs it
  // for authorize function. users route 
  // needs it for Virtual Number disbursement.
  //
  dhs.initialize( dhs_https_host, dhs_https_port, att, users );
  users.registerIndexRoute( index );

} else {

  console.log( 'FATAL!!! Cannot use AT&T API without' );
  console.log( 'retrieving configuration from DHS' );
  console.log( 'Please obtain DHS URL from your administrator' );
  console.log( 'or, for testing purposes, use the one' );
  console.log( 'AT&T is hosting on cloud');
  console.log( 'Exiting...' );
  process.exit( 1 );
}

// ---------------------------------------------
// END: CUSTOM CODE for AT&T Enhanced WebRTC
// ---------------------------------------------


// ---------------------------------------------
// BEGIN: Boiler-plate Express app route set-up
// ---------------------------------------------
// Business as usual from below
//
// catch 404 and forward to error handler
//
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// DEV error handler
// No stacktraces shown to end user.
//
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// PROD error handler
// No stacktraces shown to end user.
//
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

// ---------------------------------------------
// END: Boiler-plate Express app route set-up
// ---------------------------------------------

//-----------------------------------------------------------
// END: app.js
//-----------------------------------------------------------



