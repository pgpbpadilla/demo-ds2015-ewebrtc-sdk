/*jslint node: true, nomen: true, indent:2, todo: true*/

/**
 *---------------------------------------------------------
 * routes/dhs.js
 *---------------------------------------------------------
 * Implements a Route for SDK running inside the browser
 * to query for AT&T App details (as configured in DHS)
 *
 * Typically, before running your DHS, you configured it
 * with app details you got when you created an App in
 * AT&T Developer Portal.
 *
 *
 * Following routes are available:
 
 * GET /
 *
 * Ultimately, Express app exposes this route as:
 *
 * GET <your_app_url>/dhs
 *
 * CAUTION:
 * --------
 * SDK uses this internally to initialize itself. Make sure
 * this route is baked into Web Server from which your Web
 * App with AT&T Enhanced WebRTC JS SDK is served.
 * 
 *---------------------------------------------------------
 * @author Raj Sesetti, AT&T Developer Program, DRT/LTA
 *---------------------------------------------------------
 */

var express = require('express');
var router = express.Router();

var https = require('https');
var fs = require('fs');
var package = require('../package');

var VIRTUAL_NUMBERS_FILE = 'virtual_numbers.json';

var DHS_GET_CONFIG_URI = '/config';

var visible_dhs_config = {};
var full_dhs_config = {};

/**
 * TODO: Add stuff later...
 *
 * 
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.initialize = function (dhs_https_host, dhs_https_port, attRoute, usersRoute) {

  console.log('>> Entering router dhs.initialize');

  // Use the reqOptions object if you secured
  // your DHS with additional username/password
  // style security. Right now, our OOTB DHS
  // does not have this.
  //
  // var reqOptions = { host: dhs_https_host, port: 99999, path: 'your_dhs_config_path', method: 'GET' };
  //

  var reqOptions = {
      host: dhs_https_host,
      path: DHS_GET_CONFIG_URI,
      rejectUnauthorized: false,
      port: dhs_https_port || 80
    },
    dhsReq;

  console.log('Using reqOptions: %j', reqOptions);
  console.log('About to do GET /config on DHS');

  dhsReq = https.get(reqOptions, function (dhsResp) {

    console.log('Got Response Status Code: %d', dhsResp.statusCode);
    console.log('Got Response Headers: %s', dhsResp.headers);

    console.log('Now reading Response body...');

    var buffer = '';
    dhsResp.on('data', function (chunk) {

      console.info('>> dhsResp.on(\'data\')');
      buffer += chunk;

    });

    dhsResp.on('end', function (respError) {

      console.info('>> dhsResp.on(\'end\')');

      full_dhs_config = JSON.parse(buffer);

      console.log('------------------------------');
      console.log('Full config received from DHS');
      console.log('------------------------------');
      console.log('%j', full_dhs_config);
      console.log('------------------------------');


      visible_dhs_config.dhs_name = full_dhs_config.dhs_name;
      visible_dhs_config.dhs_version = full_dhs_config.dhs_version;
      visible_dhs_config.dhs_https_url = full_dhs_config.dhs_https_url;
      visible_dhs_config.api_endpoint = full_dhs_config.api_endpoint;
      visible_dhs_config.ewebrtc_domain = full_dhs_config.ewebrtc_domain;
      visible_dhs_config.scope_names = full_dhs_config.scope_names;

      console.log('------------------------------');
      console.log('DHS config visible to clients');
      console.log('------------------------------');
      console.log('%j', visible_dhs_config);
      console.log('------------------------------');

      // Let 'att' route know about the configuration
      // we just retrieved. 'att' route will use it
      // for making 'authorize' calls to AT&T OAuth API
      //
      attRoute.initDHSConfig(full_dhs_config);

      // Don't have to wait for this to complete
      // before you send the response back to client
      //

      // Initialize our virtual number pool and write it to
      // to our file database.
      //
      var virtualNumbers = {};
      full_dhs_config.virtual_numbers_pool.forEach(function (elem) {
        virtualNumbers[elem] = null;
      });

      fs.writeFile(VIRTUAL_NUMBERS_FILE, JSON.stringify(virtualNumbers), function (writeError) {
        if (writeError) {
          console.log('Failure. Writing to virtual number file database');
          console.error(writeError);
        } else {
          console.log('-------------------------------------------');
          console.log('Virtual Number List: %j', virtualNumbers);
          console.log('-------------------------------------------');
          console.log('Success. Virtual Number file database initialized with');
          console.log('info retrieved from DHS. These Virtual Numbers will be');
          console.log('automatically assigned one-by-one as your');
          console.log('end users sign up with this Web Application');
          console.log('-------------------------------------------');

          // Give Virtual Numbers to users route
          //
          usersRoute.initVirtualNumbersInfo(VIRTUAL_NUMBERS_FILE, virtualNumbers);
        }
      });

      // Initialize users route with Enhance WebRTC domain
      // name retrieved from DHS configuration
      //
      usersRoute.initEWebRTCDomain(full_dhs_config.ewebrtc_domain);

    });

  });

  // TODO: Is this really needed?
  //
  // dhsReq.end();

  // Handle the error nicely. May be set a flag
  // to retry later?
  //
  dhsReq.on('error', function (dhsError) {
    console.error('!!!!!!!!!');
    console.error('Error retrieving configuration from DHS', dhsError);
    console.error('!!!!!!!!!');
  });

  console.log('<< Exiting router dhs.initialize');

};

/**
 * TODO: Add stuff later...
 *
 * 
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.get('/', function (req, res) {
  console.log('Got authorize request');
  res.send(visible_dhs_config);
});

module.exports = router;

//-----------------------------------------------------------
// END: routes/dhs.js
//-----------------------------------------------------------


