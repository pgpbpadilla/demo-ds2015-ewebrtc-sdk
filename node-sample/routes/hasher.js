/*jslint node: true, nomen: true, indent:2, todo: true*/

/**
 *---------------------------------------------------------
 * routes/hasher.js
 *---------------------------------------------------------
 * This is really a library for password 'hash' function.
 *
 * There are no routes available in this.
 *
 * Using 'routes' directory to save unnecessary 'lib'
 * directory creation. If your Express set-up already has
 * a 'lib' directory, this can be safely moved there.
 *
 * If you do want to use 'lib' directory, just make sure 
 * that correct path for this is used in 'require's of
 * index.js, users.js, admin.js and wherever else you are
 * planning to use this function.
 * 
 *---------------------------------------------------------
 * @author Raj Sesetti, AT&T Developer Program, DRT/LTA
 *---------------------------------------------------------
 */

var crypto = require('crypto');

// Byte size
//
var len = 128;

// Takes about 300ms
//
var iterations = 12000;

var hasher = {};

/**
 * Hashes a password with optional `salt`, otherwise
 * generate a salt for `pass` and invoke `fn(err, salt, hash)`.
 *
 * @param {String} password to hash
 * @param {String} optional salt
 * @param {Function} callback
 * @api private
 */
hasher.hash = function (pwd, salt, fn) {
  if (3 === arguments.length) {
    crypto.pbkdf2(pwd, salt, iterations, len, function (err, hash) {
      fn(err, hash.toString('base64'));
    });
  } else {
    fn = salt;
    crypto.randomBytes(len, function (err, salt){
      if (err) return fn(err);
      salt = salt.toString('base64');
      crypto.pbkdf2(pwd, salt, iterations, len, function (err, hash){
        if (err) return fn(err);
        fn(null, salt, hash.toString('base64'));
      });
    });
  }
};

module.exports = hasher;

//-----------------------------------------------------------
// END: routes/hasher.js
//-----------------------------------------------------------

