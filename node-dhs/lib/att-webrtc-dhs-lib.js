/*jslint node: true, nomen: true, indent:2, todo: true*/

/**-------------------------------------------------------
 * att-webrtc-dhs-lib.js
 *
 * Library for NodeJS DHS. Exports helper, utility
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

//--------------------------------------------------------
// END: SECTION
//--------------------------------------------------------

//--------------------------------------------------------
// SECTION: 3rd party libraries
//--------------------------------------------------------
//
//--------------------------------------------------------
var restify = require('restify');
exports.restify = restify;

var bunyan = require('bunyan');
exports.bunyan = bunyan;

//--------------------------------------------------------
// END: SECTION
//--------------------------------------------------------


//--------------------------------------------------------
// SECTION: Constants
//--------------------------------------------------------
// DON'T change entries in this section unless API changes
//
//--------------------------------------------------------

//
// Scope names that AT&T OAuth API
// can accept...
//
var APP_SCOPE = {};
APP_SCOPE.MOBILE_NUMBER = 'WEBRTCMOBILE';
APP_SCOPE.VIRTUAL_NUMBER = 'WEBRTC';
APP_SCOPE.ACCOUNT_ID = 'WEBRTC';
APP_SCOPE.E911 = 'EMERGENCYSERVICES';
Object.freeze(APP_SCOPE);

exports.APP_SCOPE = APP_SCOPE;

//
// Grant types that AT&T OAuth API
// can accept...
//
var GRANT_TYPE = {};
GRANT_TYPE.MOBILE_NUMBER = 'authorization_code';
GRANT_TYPE.VIRTUAL_NUMBER = 'client_credentials';
GRANT_TYPE.ACCOUNT_ID = 'client_credentials';
GRANT_TYPE.E911 = 'client_credentials';
GRANT_TYPE.REFRESH = 'refresh_token';
Object.freeze(GRANT_TYPE);

exports.GRANT_TYPE = GRANT_TYPE;

//
// Token policies that we made up
//
var TOKEN_POLICY = {};
TOKEN_POLICY.ALWAYS = 'always';
TOKEN_POLICY.REUSE = 'reuse';
Object.freeze(TOKEN_POLICY);

exports.TOKEN_POLICY = TOKEN_POLICY;

//
// E911 ID policies that we made up
//
var E911ID_POLICY = {};
E911ID_POLICY.ALWAYS = 'always';
E911ID_POLICY.REUSE = 'reuse';
Object.freeze(E911ID_POLICY);

exports.E911ID_POLICY = E911ID_POLICY;

//
// Heroku Environment Names
//
var HEROKU_ENV = {};
HEROKU_ENV.PROD = 'prod';
HEROKU_ENV.LOCAL = 'local';
Object.freeze(HEROKU_ENV);

exports.HEROKU_ENV = HEROKU_ENV;

//
// API URIs for OAuth Services
//
var OAUTH_TOKEN_URI = '/oauth/token';

exports.OAUTH_TOKEN_URI = OAUTH_TOKEN_URI;

var OAUTH_AUTHORIZE_URI = '/oauth/authorize';
exports.OAUTH_AUTHORIZE_URI = OAUTH_AUTHORIZE_URI;

//
// API URIs for E911 Service
//
var E911_URI = '/emergencyServices/v1/e911Locations';
exports.E911_URI = E911_URI;

//
// Environment names we made up and recognize
// package.json's dhs_config->api_env can take
// only the following values
//
var API_ENV = {};
API_ENV.prod = 'prod';
API_ENV.sandbox = 'sandbox';
API_ENV.preprod = 'preprod';
API_ENV.test = 'test';
API_ENV.ams = 'ams';
API_ENV.mock = 'mock';
Object.freeze(API_ENV);

exports.API_ENV = API_ENV;

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
exports.DEF_DHS_NAME = 'att.webrtc.dhs';
exports.DEF_DHS_VERSION = '1.0.0';
exports.DEF_DHS_HOST = 'localhost';
exports.DEF_HTTP_PORT = 10010;
exports.DEF_HTTPS_PORT = 10011;
exports.DEF_CERT_FILE = 'dhs.cert';
exports.DEF_KEY_FILE = 'dhs.key';
exports.DEF_LOGS_DIR = 'logs';

exports.DEF_API_ENV = API_ENV.sandbox;

exports.DEF_TOKEN_POLICY = TOKEN_POLICY.ALWAYS;
exports.DEF_E911ID_POLICY = E911ID_POLICY.ALWAYS;
exports.DEF_CACHE_DIR = 'cache';

exports.DEF_CORS_DOMAINS = ['*'];

exports.DEF_HEROKU_ENV = HEROKU_ENV.PROD;
exports.DEF_HEROKU_HOST = '0.0.0.0';

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

//
// These vars are init'ed right after
// configuration entries are read
// 
var log;

var dhs_name, dhs_version, dhs_host;
var cors_domains;

var api_env, api_endpoint;
var app_key, app_secret, oauth_callback;
var virtual_numbers_pool, ewebrtc_domain;

//
// These vars are init'ed after both
// the Servers start successfully
//
var dhs_http_url, dhs_https_url;

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

  dhs_name = config.dhs_name;
  dhs_version = config.dhs_version;
  dhs_host = config.dhs_host;
  cors_domains = config.cors_domains;

  api_env = config.api_env;
  api_endpoint = config.api_endpoint;

  app_key = config.app_key;
  app_secret = config.app_secret;
  oauth_callback = config.oauth_callback;

  virtual_numbers_pool = config.virtual_numbers_pool;
  ewebrtc_domain = config.ewebrtc_domain;

  log.trace('<<< initConfig');

};

/**
 * This should be invoked by the main server after
 * successful start-up of HTTP and HTTPS services.
 *
 * Then, it passes those objects to this library.
 */
exports.updateConfig = function (config) {

  console.info(config, '>>> updateConfig');

  if (config.dhs_http_url) dhs_http_url = config.dhs_http_url;
  if (config.dhs_https_url) dhs_https_url = config.dhs_https_url;

  log.trace('<<< updateConfig');

};

/**
 *  
 *
 *
 */
exports.configureServer = function (server) {

  log.info(server, '>>> configureServer');

  server.use(restify.acceptParser(server.acceptable));
  log.info('DONE: acceptParser');

  server.use(restify.authorizationParser());
  log.info('DONE: authorizationParser');

  server.use(restify.dateParser());
  log.info('DONE: dateParser');

  server.use(restify.queryParser());
  log.info('DONE: queryServer');

  server.use(restify.CORS());
  log.info('DONE: CORS');

  // This is a simplified example just to give you an idea
// You will probably need more allowed headers

  server.on('MethodNotAllowed', function (req, res) {
    if (req.method.toLowerCase() === 'options') {
      var allowHeaders = ['Accept', 'Content-Type', 'Location'];

      if (res.methods.indexOf('OPTIONS') === -1) {
        res.methods.push('OPTIONS');
      }

      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
      res.header('Access-Control-Expose-Headers', allowHeaders.join(', '));
      res.header('Access-Control-Allow-Methods', res.methods.join(', '));
      res.header('Access-Control-Allow-Origin', req.headers.origin);

      return res.send(204);
    }
    return res.send(new restify.MethodNotAllowedError());
  });

  server.use(restify.gzipResponse());
  log.info('DONE: gzipResponse');

  server.use(restify.bodyParser());
  log.info('DONE: bodyParser');

  log.trace('<<< configureServer');

}; // END: configureServer


/**
 *  
 *
 *
 */
exports.describeRoutes = function (req, res, next) {

  log.info(req.params, '>>> describeRoutes');

  res.header('Access-Control-Allow-Origin', cors_domains);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');

  log.info('ADDED: CORS Headers');

  var routes = [ 
    'GET /', 
    'GET /config', 
    'POST /tokens', 
    'POST /e911ids' 
  ];

  log.info(routes, 'Sending routes info to the client');
  res.send(200, routes);

  log.trace('<<< describeRoutes');
  return next;

}; // END: describeRoutes

/**
 *  
 *
 *
 */
exports.getServerConfig = function (req, res, next) {

  log.info(req.params, '>>> getServerConfig');
  
  res.header('Access-Control-Allow-Origin', cors_domains);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  log.info('ADDED: CORS Headers');

  var result = {};

  result.dhs_name = dhs_name;
  result.dhs_version = dhs_version;

  result.dhs_host = dhs_host;
  result.dhs_http_url = dhs_http_url;
  result.dhs_https_url = dhs_https_url;
  result.cors_domains = cors_domains;

  result.api_env = api_env;
  result.api_endpoint = api_endpoint;

  result.token_uri = OAUTH_TOKEN_URI;
  result.authorize_uri = OAUTH_AUTHORIZE_URI;
  if (oauth_callback) result.oauth_callback = oauth_callback;

  result.app_key = app_key;
  result.scope_names = APP_SCOPE;

  if (virtual_numbers_pool) result.virtual_numbers_pool = virtual_numbers_pool;
  if (ewebrtc_domain) result.ewebrtc_domain = ewebrtc_domain;

  log.info(result, 'Sending result to the client');
  res.send(result);

  log.trace('<<< getServerConfig');
  return next;

}; // END: getServerConfig

/**
 * CAUTION, WIP: This method is not finished.
 *
 * A route /authorize needs to be implemented
 * in your Web Application tier until an
 * an alternative is available in DHS.
 *
 * This method should NEVER be invoked.
 *
 */
exports.getAuthorize = function (req, res, next) {

  log.info(req.params, '>>> getAuthorize');

  res.header('Access-Control-Allow-Origin', cors_domains);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  log.info('ADDED: CORS Headers');

  // This will be invoked only for MOBILE_NUMBER
  // case. Hence, scope is always MOBILE_NUMBER.
  //
  var calc_scope = APP_SCOPE.MOBILE_NUMBER;
  log.info('Calculated scope: %s', calc_scope);

  var payload = { client_id: app_key, scope: calc_scope, redirect_uri: oauth_callback };
  log.info(payload, 'DONE: API request payload prepared');

  var options = {  
    url: api_endpoint, 
    userAgent: dhs_name, 
    accept: 'application/json',
    rejectUnauthorized: false 
  };
  log.info(options, 'Options to send in API request');

  var restClient = restify.createStringClient(options);
  log.info('DONE: Created stringClient');

  restClient.get(OAUTH_AUTHORIZE_URI, payload, function (api_err, api_req, api_resp, api_result) {

    if (api_err) {

      log.error('ERROR invoking API', api_err);
      return next(api_err);

    } else if (api_resp.statusCode > 300 && api_resp.statusCode < 400 && api_resp.headers.location) {

      log.info('HTTP Redirect Detected. Setting status and location...');
      // Location for most redirects will contain
      // only the path, not the hostname. Detect
      // this and add host to the path
      // 
      if (url.parse(api_resp.headers.location).hostname) {
        // Hostname included. Make request
        // to res.headers.location
      } else {
        // Hostname not included. Get host from 
        // requested URL (url.parse()) and prepend 
        // to location
      }

      log.info('Response Status Code: %d, Headers: %j', api_resp.statusCode, api_resp.headers);
      res.headers.location = api_resp.headers.location;
      res.send(api_resp.statusCode, api_resp);
      return next;

    } else {

      res.send(api_resp.statusCode, api_resp);
      return next;
    }
  });

  log.trace('<<< getAuthorize');

}; // END: getAuthorize

/**
 *  
 *
 *
 */
exports.createAccessToken = function (req, res, next) {

  log.info(req.params, '>>> createAccessToken');

  res.header('Access-Control-Allow-Origin', cors_domains);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  log.info('ADDED: CORS Headers');

  var app_scope = req.params.app_scope;
  if (undefined == app_scope) {
    var err_msg = 'app_scope is mandatory';
    log.error(err_msg);
    return next(new restify.InvalidArgumentError(err_msg));
  }

  var calc_grant_type = GRANT_TYPE[app_scope];
  var calc_scope = APP_SCOPE[app_scope];

  log.info('Calculated grant_type: %s', calc_grant_type);
  log.info('Calculated scope: %s', calc_scope);

  var payload = { client_id: app_key, client_secret: app_secret };
  payload.grant_type = calc_grant_type;

  if (calc_scope == APP_SCOPE.MOBILE_NUMBER) {

      var auth_code = req.params.auth_code;
      if (undefined == auth_code) {
        var err_msg = 'auth_code is mandatory for ' + app_scope;
        log.error(err_msg);
        return next(new restify.InvalidArgumentError(err_msg));
      } else {
        log.info('auth_code: %s', auth_code);
        payload.code = auth_code;
      }

  } else if (calc_scope == APP_SCOPE.VIRTUAL_NUMBER) {

    payload.scope = calc_scope;

  } else if (calc_scope == APP_SCOPE.ACCOUNT_ID) {

    payload.scope = calc_scope;

  } else if (calc_scope == APP_SCOPE.E911) {

    payload.scope = calc_scope;

  } else {

      var err_msg = 'Unknown app_scope';
      log.error(err_msg);
      return next(new restify.InvalidArgumentError(err_msg));
  };

  log.info(payload, 'DONE: API request payload prepared');

  var options = {  
    url: api_endpoint, 
    userAgent: dhs_name, 
    accept: 'application/json',
    rejectUnauthorized: false 
  };
  log.info(options, 'Options to send in API request');

  var restClient = restify.createStringClient(options);
  log.info('DONE: Created stringClient');

  restClient.post(OAUTH_TOKEN_URI, payload, function (api_err, api_req, api_resp, api_result) {

    if (api_err) {
      log.error('ERROR invoking API', api_err);
      return next(api_err);
    } else if (api_result) {
      log.info(api_result, 'SUCCESS invoking API');
      res.send(api_result);
      return next;
    }
  });

  log.trace('<<< createAccessToken');

}; // END: createAccessToken

/**
 * 
 *
 *
 */
exports.createE911ID = function (req, res, next) {

  log.info(req.params, '>>> createE911ID');

  res.header('Access-Control-Allow-Origin', cors_domains);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  log.info('ADDED: CORS Headers');

  var access_token = req.params.access_token;
  if (undefined == access_token) {
        var err_msg = 'access_token is mandatory';
        log.error(err_msg);
        return next(new restify.InvalidArgumentError(err_msg));
  } else {
    log.info('access_token: %s', access_token);
  }

  // Mandatory attributes. Return if not available
  // 
  var first_name = req.params.first_name;
  if (undefined == first_name) {
        var err_msg = 'first_name is mandatory';
        log.error(err_msg);
        return next(new restify.InvalidArgumentError(err_msg));
  } else {
    log.info('first_name: %s', first_name);
  }

  var last_name = req.params.last_name;
  var full_name;
  if (undefined == last_name) {
        var err_msg = 'last_name is mandatory';
        log.error(err_msg);
        return next(new restify.InvalidArgumentError(err_msg));
  } else {
    log.info('last_name: %s', last_name);

    full_name = first_name + ' ' + last_name;
    log.info('full_name: %s', full_name);
  }

  var house_number = req.params.house_number;
  if (undefined == house_number) {
        var err_msg = 'house_number is mandatory';
        log.error(err_msg);
        return next(new restify.InvalidArgumentError(err_msg));
  } else {
    log.info('house_number: %s', house_number);
  }

  var street = req.params.street;
  if (undefined == street) {
        var err_msg = 'street is mandatory';
        log.error(err_msg);
        return next(new restify.InvalidArgumentError(err_msg));
  } else {
    log.info('street: %s', street);
  }

  var unit = req.params.unit;
  log.info('unit: %s', unit);

  var city = req.params.city;
  if (undefined == city) {
        var err_msg = 'city is mandatory';
        log.error(err_msg);
        return next(new restify.InvalidArgumentError(err_msg));
  } else {
    log.info('city: %s', city);
  }

  var state = req.params.state;
  if (undefined == state) {
        var err_msg = 'state is mandatory';
        log.error(err_msg);
        return next(new restify.InvalidArgumentError(err_msg));
  } else {
    log.info('state: %s', state);
  }

  var zip = req.params.zip;
  if (undefined == zip) {
        var err_msg = 'zip is mandatory';
        log.error(err_msg);
        return next(new restify.InvalidArgumentError(err_msg));
  } else {
    log.info('zip: %s', zip);
  }

  var isAddressConfirmed;

  // Optional field - Can be defaulted to false
  // if not available in the request
  // 
  var is_confirmed = req.params.is_confirmed || false;
  log.info('is_confirmed: %s'. is_confirmed);

  var address = {
    name: full_name,
    houseNumber: house_number,
    street: street,
    unit: unit,
    city: city,
    state: state,
    zip: zip };
  var payload = { e911Context: { address: address, isAddressConfirmed: is_confirmed } };

  // Optional fields - Use them if available
  // 
  if (req.params.house_number_extension) payload.e911Context.address.houseNumExt = req.params.house_number_extension;
  if (req.params.street_name_suffix) payload.e911Context.address.streetNameSuffix = req.params.street_name_suffix;
  if (req.params.street_dir) payload.e911Context.address.streetDir = req.params.street_dir;
  if (req.params.street_dir_suffix) payload.e911Context.address.streetDirSuffix = req.params.street_dir_suffix;
  if (req.params.address_additional) payload.e911Context.address.addressAdditional = req.params.address_additional;
  if (req.params.comments) payload.e911Context.address.comments = req.params.comments;

  log.info(payload, 'PREPARED: E911 API request payload');

  var options = {  
    url: api_endpoint, 
    userAgent: dhs_name, 
    accept: 'application/json',
    headers: { Authorization: 'bearer ' + access_token },
    rejectUnauthorized: false 
  };
  log.info(options, 'Options for API client');

  var restClient = restify.createJsonClient(options);
  log.info('DONE: Created JsonClient');

  restClient.post(E911_URI, payload, function (api_err, api_req, api_resp, api_result) {

    //log.info(api_resp, 'After API invocation');

    if (api_err) {
      log.info(api_err, 'ERROR invoking API');
      return next(api_err);
    } else if (api_result) {
      log.info(api_result, 'SUCCESS invoking API');
      res.send(api_result);
      return next;
    }
  });

  log.trace('<<< createE911ID');
  return next;

}; // END: createE911ID

/**
 * NOT IN SCOPE - Placeholder method 
 *
 *
 */
exports.refreshAccessToken = function (req, res, next) {

  log.info(req.params, '>>> refreshAccessToken');

  res.header('Access-Control-Allow-Origin', cors_domains);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  log.info('ADDED: CORS Headers');

  var err_msg = 'Not Implemented. Planned for later releases.';
  log.error(err_msg);

  log.trace('<<< refreshAccessToken');
  return next(new restify.InvalidArgumentError(err_msg));

}; // END: refreshToken

/**
 * NOT IN SCOPE - Placeholder method 
 *
 *
 */
exports.deleteAccessToken = function (req, res, next) {

  log.info(req.params, '>>> deleteAccessToken');

  res.header('Access-Control-Allow-Origin', cors_domains);
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  log.info('ADDED: CORS Headers');

  var err_msg = 'Not Implemented. Planned for later releases.';
  log.error(err_msg);

  log.trace('<<< deleteAccessToken');
  return next(new restify.InvalidArgumentError(err_msg));

}; // END: deleteAccessToken

//--------------------------------------------------------
// END: SECTION
//--------------------------------------------------------


//--------------------------------------------------------
// END: att-webrtc-dhs-lib.js
//--------------------------------------------------------

