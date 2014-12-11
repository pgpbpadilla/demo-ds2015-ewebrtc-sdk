/*jslint node: true, nomen: true, indent:2, todo: true*/

/**
 *--------------------------------------------------------
 * att-webrtc-dhs.js
 *--------------------------------------------------------
 *
 * Developer Hosted Server (DHS) implemented in NodeJS.
 *
 * Implements 2 services for its clients:
 * 1) Talks to AT&T OAuth API to obtain Access Tokens
 * 2) Talks to AT&T E911 API to obtain E911 ID
 * 
 * Utilizes:
 * 1) App Key, App Secret from configuration
 * 2) API Endpoint from configuration
 *
 *--------------------------------------------------------
 * @author Raj Sesetti, AT&T Developer Program, DRT/LTA
 *--------------------------------------------------------
 */

//--------------------------------------------------------
// Built-in libs from NodeJS platform
//--------------------------------------------------------
var fs = require('fs');

//--------------------------------------------------------
// 3rd-Party libraries 
//--------------------------------------------------------
// NONE. All dependencies moved to DHS lib

//--------------------------------------------------------
// DHS own libraries
//--------------------------------------------------------
var dhs = require('./lib');

//--------------------------------------------------------
// DHS package config
//--------------------------------------------------------
var pkg = require('./package.json');
var dhsConfig = pkg.dhs_config;

//--------------------------------------------------------
// SECTION: Initialize configuration
//--------------------------------------------------------
// Following are calculated after required configuration
// entries are read or defaulted.
//
//--------------------------------------------------------
var dhs_name = dhsConfig.dhs_name || dhs.DEF_DHS_NAME || pkg.name;
var dhs_version = dhsConfig.dhs_version || dhs.DEF_DHS_VERSION || pkg.version;

console.info('INITIALIZING DHS: %s Version: %s ...', dhs_name, dhs_version);

var dhs_host;
var dhs_fqdn;
var http_port;
var https_port;

//
// Ugly tweak to handle 3 types of deployments
// pure npm, foreman local, heroku prod
// 
var heroku_env = process.env.HEROKU_ENV;
if (heroku_env === dhs.HEROKU_ENV.PROD) {
  console.info('DETECTED Heroku Environment: %s', heroku_env);

  var env_vars = Object.keys(process.env);
  env_vars.forEach(function (env_var) {
    console.log('Variable: %s, Value: %s', env_var, process.env[env_var]);
  });

  dhs_host = process.env.HOST;
  console.info('Using DHS Host: %s', dhs_host);

  http_port = process.env.PORT;
  console.info('Using HTTP Port: %d', http_port);

  dhs_fqdn = process.env.HEROKU_FQDN;
  console.info('Using DHS FQDN: %s', dhs_fqdn);

  console.info('NOTE: HTTPS DHS wont be started');
  console.info('HTTPS URL is still available served by Heroku Proxy');

} else {

  console.info('DETECTED Plain NPM or local Foreman Environment');

  dhs_host = process.env.DHS_HOST || dhsConfig.dhs_host || dhs.DEF_DHS_HOST;
  console.info('Using DHS Host: %s', dhs_host);

  dhs_fqdn = process.env.HEROKU_FQDN || dhs_host;
  console.info('Using DHS FQDN: %s', dhs_fqdn);

  http_port = process.env.DHS_HTTP_PORT || dhsConfig.http_port || dhs.DEF_HTTP_PORT;
  console.info('Using HTTP Port: %d', http_port);

  https_port = process.env.DHS_HTTPS_PORT || dhsConfig.https_port || dhs.DEF_HTTPS_PORT;
  console.info('Using HTTPS Port: %d', https_port);
}

var logs_dir = process.env.DHS_LOGS_DIR || dhsConfig.logs_dir || dhs.DEF_LOGS_DIR;
console.info('Using directory %s to create log files', logs_dir);

var cache_dir = process.env.DHS_CACHE_DIR || dhsConfig.cache_dir || dhs.DEF_CACHE_DIR;
console.info('Using directory %s to create token and ID caches', cache_dir);
console.info('Cache feature is not available in this release');

var cors_domains = process.env.DHS_CORS_DOMAINS || dhsConfig.cors_domains || dhs.DEF_CORS_DOMAINS;
console.info('Domains to add in CORS Headers: %s', cors_domains);

var cert_file = process.env.DHS_CERT_FILE || dhsConfig.cert_file || dhs.DEF_CERT_FILE;
var key_file = process.env.DHS_KEY_FILE || dhsConfig.key_file || dhs.DEF_KEY_FILE;
console.info('Using SSL Configuration - Certificate: %s, Key File: %s', cert_file, key_file);

var token_policy = process.env.DHS_TOKEN_POLICY || dhsConfig.token_policy || dhs.DEF_TOKEN_POLICY;
console.info('Using Token Policy: %s', token_policy);

var e911id_policy = process.env.DHS_E911ID_POLICY || dhsConfig.e911id_policy || dhs.DEF_E911ID_POLICY;
console.info('Using E911ID Policy: %s', e911id_policy);

var api_env = process.argv[2] || process.env.DHS_API_ENV || dhsConfig.api_env || dhs.DEF_API_ENV;
console.info('API environment to use: %s', api_env);
console.info('Will now read corresponding configuration...');

// Read configuration for the API environment
// being used. If either one of the following
// three are not configured, exit.
//
// These are mandatory
//
var api_endpoint, app_key, app_secret;

// These are optional
//
var oauth_callback, virtual_numbers_pool, ewebrtc_domain;

switch (api_env) {

case dhs.API_ENV.prod:
  api_endpoint = pkg.prod.api_endpoint;
  app_key = pkg.prod.app_key;
  app_secret = pkg.prod.app_secret;
  oauth_callback = pkg.prod.oauth_callback;
  virtual_numbers_pool = pkg.prod.virtual_numbers_pool;
  ewebrtc_domain = pkg.prod.ewebrtc_domain;
  break;

case dhs.API_ENV.sandbox:
  api_endpoint = pkg.sandbox.api_endpoint;
  app_key = pkg.sandbox.app_key;
  app_secret = pkg.sandbox.app_secret;
  oauth_callback = pkg.sandbox.oauth_callback;
  virtual_numbers_pool = pkg.sandbox.virtual_numbers_pool;
  ewebrtc_domain = pkg.sandbox.ewebrtc_domain;
  break;

case dhs.API_ENV.preprod:
  api_endpoint = pkg.preprod.api_endpoint;
  app_key = pkg.preprod.app_key;
  app_secret = pkg.preprod.app_secret;
  oauth_callback = pkg.preprod.oauth_callback;
  virtual_numbers_pool = pkg.preprod.virtual_numbers_pool;
  ewebrtc_domain = pkg.preprod.ewebrtc_domain;
  break;

case dhs.API_ENV.test:
  api_endpoint = pkg.test.api_endpoint;
  app_key = pkg.test.app_key;
  app_secret = pkg.test.app_secret;
  oauth_callback = pkg.test.oauth_callback;
  virtual_numbers_pool = pkg.test.virtual_numbers_pool;
  ewebrtc_domain = pkg.test.ewebrtc_domain;
  break;

case dhs.API_ENV.ams:
  api_endpoint = pkg.ams.api_endpoint;
  app_key = pkg.ams.app_key;
  app_secret = pkg.ams.app_secret;
  oauth_callback = pkg.ams.oauth_callback;
  virtual_numbers_pool = pkg.ams.virtual_numbers_pool;
  ewebrtc_domain = pkg.ams.ewebrtc_domain;
  break;

case dhs.API_ENV.mock:
  api_endpoint = pkg.mock.api_endpoint;
  app_key = pkg.mock.app_key;
  app_secret = pkg.mock.app_secret;
  oauth_callback = pkg.mock.oauth_callback;
  virtual_numbers_pool = pkg.mock.virtual_numbers_pool;
  ewebrtc_domain = pkg.mock.ewebrtc_domain;
  break;

default:
  console.error('Unknown Environment: %s', api_env);
  console.error('Should be one of: %s', Object.keys(dhs.API_ENV));
  console.error('Exiting...');
  process.exit(1);

}

if (!api_endpoint || !app_key || !app_secret) {
  console.error('Insufficient App Configuration');
  console.error('Entries api_endpoint, app_key, app_secret are mandatory');
  console.error('Check package.json for entries under "%s" section', api_env);
  console.error('Exiting...');
  process.exit(1);
}

console.info('#####################################################');
console.info('Using API Environment: %s', api_env);
console.info('      Its Endpoint is: %s', api_endpoint);
console.info('        Using App Key: %s', app_key);
console.info('     Using App Secret: %s', app_secret);
console.info('#####################################################');

if (oauth_callback) {
  console.info('   OAuth Callback URL: %s', oauth_callback);
  console.info('#####################################################');
  console.info('Your Web Application should implement the above URL');
  console.info('#####################################################');
} else {
  console.info('You are not using Mobile Numbers');
}

if (virtual_numbers_pool) {
  console.info('*****Using Virtual Number Pool: %s', virtual_numbers_pool);
} else {
  console.info('Virtual Number Pool is NOT Configured');
}

if (ewebrtc_domain) {
  console.info('**Using Enhanced WebRTC Domain: %s', ewebrtc_domain);
} else {
  console.info('Enhanced WebRTC Domain is NOT Configured');
}

// Initialize OAuth and E911 service URLs
//
var  token_url = api_endpoint + dhs.OAUTH_TOKEN_URI;
console.info('Using OAuth Service URL: %s', token_url);

var  e911_url = api_endpoint + dhs.E911_URI;
console.info('Using E911 Service URL: %s', e911_url);

//--------------------------------------------------------
// END SECTION: Initialize configuration
//--------------------------------------------------------


//--------------------------------------------------------
// SECTION: start of action
//--------------------------------------------------------
// Configuration is all ready. We are good to go.
//
//--------------------------------------------------------

//
// If logs_dir does not exist, create it
//
console.info('Attempting to detect logs directory: %s', logs_dir);
var no_logs_dir = true;
try {
  if (fs.statSync(logs_dir).isDirectory()) {
    console.info('Directory %s exists', logs_dir);
    no_logs_dir = false;
  } else if (fs.statSync(logs_dir).isFile()) {
    console.error('%s is already a file. Not a directory', logs_dir);
    console.error('Cannot create logs directory. Exiting...');
    process.exit(1);
  }
} catch(err) {
  console.info(err);
}

if (no_logs_dir) {
  console.info('Attempting to create logs directory: %s', logs_dir);
  try {
    fs.mkdirSync(logs_dir, mode = 0777 & (~process.umask()));
  } catch (err) {
    console.error('Cannot create logs directory: %s', err);
    console.error('Exiting...');
    process.exit(1);
  }
}

//
// If cache_dir does not exist, create it
//
console.info('Attempting to detect cache directory: %s', cache_dir);
var no_cache_dir = true;
try {
  if (fs.statSync(cache_dir).isDirectory()) {
    console.info('Directory %s exists', cache_dir);
    no_cache_dir = false;
  } else if (fs.statSync(cache_dir).isFile()) {
    console.error('%s is already a file. Not a directory', cache_dir);
    console.error('Cannot create cache directory. Exiting...');
    process.exit(1);
  }
} catch (err) {
  console.info(err);
}

if (no_cache_dir) {
  console.info('Attempting to create cache directory: %s', cache_dir);
  try {
    fs.mkdirSync(cache_dir, mode = 0777 & (~process.umask()));
  } catch (err) {
    console.error('Cannot create cache directory: %s', err);
    console.error('Exiting...');
    process.exit(1);
  }
}

//
// Initialize Logger 
//
var log_file = logs_dir + require('path').sep + dhs_name + '.log';
console.info('Log file path: %s', log_file);

var log = dhs.bunyan.createLogger({
  name: dhs_name,
  streams: [
    { level: 'trace', stream: process.stdout },
    { level: 'info', type: 'rotating-file', path: log_file }
  ],
  serializers: {
    req: dhs.bunyan.stdSerializers.req,
    res: dhs.bunyan.stdSerializers.res
  }
});
console.info('DONE: createLogger');

// Handle this process just in case...
// so that the Log strems are not corrupted
//
process.on('SIGUSR2', function () {
  console.info('Signal SIGUSR2 received. Reopening log streams...');
  log.info('Signal SIGUSR2 received. Reopening log streams...');
  log.reopenFileStreams();
});

//
// Now is a good time to init DHS library
//
var i_config = {
  log: log,
  dhs_name: dhs_name,
  dhs_version: dhs_version,
  dhs_host: dhs_host,
  dhs_fqdn: dhs_fqdn,
  cors_domains: cors_domains,
  api_env: api_env,
  api_endpoint: api_endpoint,
  app_key: app_key,
  app_secret: app_secret,
  oauth_callback: oauth_callback,
  virtual_numbers_pool: virtual_numbers_pool,
  ewebrtc_domain: ewebrtc_domain
};
dhs.initConfig(i_config);

//
// Create and configure REST Servers - HTTP and HTTPS
//

var http_server, https_server;

log.info('BEGIN: HTTP REST Server Creation');
var http_server = dhs.restify.createServer({
  name: dhs_name,
  log: log
});
log.info('END: HTTP REST Server Creation');

log.info('BEGIN: HTTP REST Server Configuration');
dhs.configureServer(http_server);
log.info('END: HTTP REST Server Configuration');

if (heroku_env === dhs.HEROKU_ENV.PROD) {

  log.info('SKIPPING: HTTPS REST Server Creation');

} else {

  log.info('BEGIN: HTTPS REST Server Creation');
  https_server = dhs.restify.createServer({
    name: dhs_name,
    log: log,
    certificate: fs.readFileSync(cert_file),
    key: fs.readFileSync(key_file)
  });
  log.info('END: HTTPS REST Server Creation');

  log.info('BEGIN: HTTPS REST Server Configuration');
  dhs.configureServer(https_server);
  log.info('END: HTTPS REST Server Configuration');
}

//--------------------------------------------------------
// Set up Routes for our POST, PUT, GET services
// 
//--------------------------------------------------------

//
// Get Info on Server Routes
//
http_server.get('/', dhs.describeRoutes);

//
// Get Server Configuration
//
http_server.get('/config', dhs.getServerConfig);

//
// Create a new AccessToken
//
http_server.post('/tokens', dhs.createAccessToken);

//
// Create an E911 ID
//
http_server.post('/e911ids', dhs.createE911ID);

//
// NOT IN SCOPE
//
// 2 placeholder methods
//
// Refresh an AccessToken
// Delete an AccessToken
//
http_server.put('/tokens/:token', dhs.refreshAccessToken);
http_server.del('/tokens/:token', dhs.deleteAccessToken);

if (heroku_env === dhs.HEROKU_ENV.PROD) {

  log.info('Heroku Production Environment');
  log.info('SKIPPING: HTTPS Route Set-up');

} else if (https_server) {

  log.info('SETTING UP: HTTPS Routes');
  https_server.get('/', dhs.describeRoutes);
  https_server.get('/config', dhs.getServerConfig);
  https_server.post('/tokens', dhs.createAccessToken);
  https_server.post('/e911ids', dhs.createE911ID);
  https_server.put('/tokens/:token', dhs.refreshAccessToken);
  https_server.del('/tokens/:token', dhs.deleteAccessToken);
}

//--------------------------------------------------------
// Now, we start HTTP and HTTPS servers
//--------------------------------------------------------

log.info('Attempting HTTP REST Server Start...');

if (heroku_env === dhs.HEROKU_ENV.PROD) {
  log.info('Heroku Production Environment');
  log.info('Heroku chooses its own hostname');

  log.info('Attempting HTTP REST Server Start...');
  http_server.listen(http_port, function () {
    log.info('SUCCESS: HTTP REST Server Started. Name: %s, URL: %s', http_server.name, http_server.url);

    // Faking dhs_http_url and dhs_https_url
    // for Heroku case
    dhs_http_url = 'http://' + dhs_fqdn;
    dhs_https_url = 'https://' + dhs_fqdn;

    log.info('Updating DHS library configuration');
    log.info('dhs_http_url: %s', dhs_http_url);
    log.info('dhs_https_url: %s', dhs_https_url);

    dhs.updateConfig({ dhs_http_url: dhs_http_url, dhs_https_url: dhs_https_url });
  });

  log.info('No HTTPS REST Server Possible');

  log.info('COMPLETE: Configuration, Library Initialization, HTTP Server Start-up!');
  log.info('!!! AT&T Enhanced WebRTC NodeJS DHS is GOOD to GO !!!');

} else {

  log.info('NPM Environment or Heroku local Environment');
  log.info('Servers\' Hostname is %s from configuration', dhs_host);

  log.info('Attempting HTTP REST Server Start...');
  http_server.listen(http_port, dhs_host, function () {
    log.info('SUCCESS: HTTP REST Server Started. Name: %s, URL: %s', http_server.name, http_server.url);
    log.info('Updating DHS library configuration with %s', http_server.url);
    dhs.updateConfig({ dhs_http_url: http_server.url });
  });

  if (https_server) {
    log.info('Attempting HTTPS REST Server Start...');
    https_server.listen(https_port, dhs_host, function () {
      log.info('SUCCESS: Secure HTTPS Server Started. Name: %s, URL: %s', https_server.name, https_server.url);
      log.info('Updating DHS library configuration with %s', https_server.url);
      dhs.updateConfig({ dhs_https_url: https_server.url });

      log.info('COMPLETE: Configuration, Library Initialization, HTTP & HTTPS Servers Start-up!');
      log.info('!!! AT&T Enhanced WebRTC NodeJS DHS is GOOD to GO !!!');
    });
  }
}


//--------------------------------------------------------
// END: att-webrtc-dhs.js
//--------------------------------------------------------

