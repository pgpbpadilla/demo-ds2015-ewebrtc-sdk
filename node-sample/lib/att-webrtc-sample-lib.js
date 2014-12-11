/*jslint node: true, nomen: true, indent:2, todo: true*/

/**-------------------------------------------------------
 * att-webrtc-sample-lib.js
 *
 * Library for NodeJS Sample. Exports helper, utility
 * functions to be used by server code.
 *
 *
 *--------------------------------------------------------
 * @author Raj Sesetti, AT&T Developer Program, DRT/LTA
 *--------------------------------------------------------
 */

//--------------------------------------------------------
// SECTION: Other own libraries being used
//--------------------------------------------------------
// NONE
//

//--------------------------------------------------------
// END: SECTION
//--------------------------------------------------------

//--------------------------------------------------------
// SECTION: 3rd party libraries
//--------------------------------------------------------


//--------------------------------------------------------
// END: SECTION
//--------------------------------------------------------


//--------------------------------------------------------
// SECTION: Constants
//--------------------------------------------------------
// DON'T change entries in this section unless API changes
//
//--------------------------------------------------------

//--------------------------------------------------------
// END: SECTION: Constants
//--------------------------------------------------------

//--------------------------------------------------------
// SECTION: Defaults
//--------------------------------------------------------
// Reasonable defaults if corresponding config entries
// are not found.
//
//--------------------------------------------------------
exports.DEF_SAMPLE_NAME = 'att.webrtc.sample';
exports.DEF_SAMPLE_VERSION = '1.0.0';
exports.DEF_SAMPLE_HOST = 'localhost';
exports.DEF_HTTP_PORT = 20020;
exports.DEF_HTTPS_PORT = 20021;
exports.DEF_CERT_FILE = 'sample.cert';
exports.DEF_KEY_FILE = 'sample.key';

exports.DEF_DHS_URL = 'https://localhost:10011';

exports.DEF_LOGS_DIR = 'logs';

//--------------------------------------------------------
// END: SECTION: Defaults
//--------------------------------------------------------

//--------------------------------------------------------
// SECTION: 'private' functions and variables
//--------------------------------------------------------
// Private functions are used by other exported functions.
// Private vars are used by all functions.
//
// These should not be visible outside this module.
// So, don't export these.
//
//--------------------------------------------------------
var log;

// init'ed before servers are init'ed
var sample_name, sample_version, sample_host_name; 

// updated after GET /config on DHS
var api_env, api_endpoint, app_key; // TODO: What else?

// updated after servers start
var sample_http_url, sample_https_url;

//--------------------------------------------------------
// END: SECTION
//--------------------------------------------------------

//--------------------------------------------------------
// SECTION: exported functions
//--------------------------------------------------------
// Enough said :)
//
//--------------------------------------------------------

/**
 * This should be invoked by the main server after
 * it reads configuration and initialized itself.
 * Then, it passes those objects to this library.
 *
 */
exports.initConfig = function (config) {

  console.info(config, '>>> initConfig');

  log = config.log;

  sample_name = config.sample_name;
  sample_version = config.sample_version;
  sample_host_name = config.sample_host_name;

  log.trace('<<< initConfig');

};

/**
 * This should be invoked by the main server after
 * successful GET /config on DHS
 *
 */
exports.updateDHSConfig = function (config) {

  console.info(config, '>>> updateDHSConfig');

  api_env = config.api_env;
  api_endpoint = config.api_endpoint;
  // TODO: What else?

  log.trace('<<< updateDHSConfig');

};

/**
 * This should be invoked by the main server after
 * successful start-up of HTTP and HTTPS services.
 *
 * Then, it passes those objects to this library.
 */
exports.updateConfig = function (config) {

  console.info(config, '>>> updateConfig');

  sample_http_url = config.sample_http_url;
  sample_https_url = config.sample_https_url;

  log.trace('<<< updateConfig');

};

/**
 * TODO
 *
 * Then, it passes those objects to this library.
 */
exports.extractAuthCode = function (req, res) {

  console.info(config, '>>> extractAuthCode');

  res.send(200, 'Not Implemented');

  log.trace('<<< extractAuthCode');

};

/**
 * TODO
 *
 * Then, it passes those objects to this library.
 */
exports.authorize = function (req, res) {

  console.info(config, '>>> authorize');

  res.send(200, 'Not Implemented');

  log.trace('<<< authorize');

};

//--------------------------------------------------------
// END: SECTION
//--------------------------------------------------------


//--------------------------------------------------------
// END: att-webrtc-sample-lib.js
//--------------------------------------------------------

