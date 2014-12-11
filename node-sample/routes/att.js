/*jslint node: true, nomen: true, indent:2, todo: true*/

/**
 *---------------------------------------------------------
 * routes/att.js
 *---------------------------------------------------------
 * Implements Routes for Administration functions.
 *
 * Needed only if you are planning to let AT&T Mobile 
 * Subscribers to use your App. 
 *
 * Following routes are available:
 *
 * GET /authorize
 * GET /callback
 *
 * Ultimately, Express app exposes these routes as:
 *
 * GET <your_app_url>/oauth/authorize
 * GET <your_app_url>/oauth/callback
 *
 * CAUTION:
 * Ensure that <your_app_url>/oauth/callback exactly
 * matches what you configured in the Dev Portal when
 * while you were creating app with WEBRTCMOBILE scope.
 *
 *---------------------------------------------------------
 * @author Raj Sesetti, AT&T Developer Program, DRT/LTA
 *---------------------------------------------------------
 */

var express = require('express');
var router = express.Router();

//
// Main app.js obtains these from DHS
// during start-up and initializes 
// the following.
//
var api_endpoint;
var authorize_uri;
var app_key;
var app_scope;

var auth_code;

/**
 * TODO: Add stuff later...
 *
 * To be used by dhs route. dhs and users
 * link is set up by app.js.
 *
 *
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.initDHSConfig = function (config) {

  console.log('>> att router initDHSConfig');

  api_endpoint = config.api_endpoint;
  authorize_uri = config.authorize_uri;
  app_key = config.app_key;
  app_scope = config.scope_names.MOBILE_NUMBER;

  console.log('<< att router initDHSConfig');

};

/**
 * TODO: Improve later...
 *
 * When browser client asks for AT&T subscriber's
 * authorization (aka user consent), simply redirect
 * to AT&T OAuth API for authorization
 *
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.get('/authorize', function (req, res){

  console.log('Got authorize request');

  var authorize_url = api_endpoint + authorize_uri + '?' + 'client_id=' + app_key + '&' + 'scope=' + app_scope;
  console.log('Redirecting to: %s', authorize_url);

  res.redirect(authorize_url);

});

/**
 * TODO: Improve later...
 *
 * IMPORTANT:
 * Fully-qualified URL for this route should match 
 * what you have configured in the Developer Portal 
 * when you created an App with WEBRTCMOBILE scope.
 *
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */
router.get('/callback', function (req, res){

  console.log('Got callback request');
  console.log('Checking for Authorization Code');

  var auth_code = req.query.code;
  console.log('Authorization code: %s', auth_code);

  if(auth_code) {

    console.log('Obtained authorization code');
    console.log('Caching it for this session...');

    req.session.regenerate(function () {
      req.session.auth_code = auth_code;
      req.session.success = 'AT&T Subscriber authorized this app. Authorization code is ' + auth_code;
      res.redirect('../consent.html?code=' + auth_code);
      // OR
      // res.render('main_page');
      // OR
      // res.redirect('/login');
      // now with customized l&f
    });

  } else {
    req.session.error = 'AT&T Subscriber did not authorize this app. What can we do better?';
    res.send('Taking back to Login page');
    res.redirect('/login');
  }
});

module.exports = router;

//-----------------------------------------------------------
// END: routes/att.js
//-----------------------------------------------------------

