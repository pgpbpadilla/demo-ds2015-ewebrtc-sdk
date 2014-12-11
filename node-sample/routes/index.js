/*jslint node: true, nomen: true, indent:2, todo: true*/

/**
 *---------------------------------------------------------
 * routes/att.js
 *---------------------------------------------------------
 * Implements Routes for Login/Logout functions for both
 * regular User and Administrator-type User.
 *
 *
 * Following routes are available:
 *
 * GET /
 *
 * GET /login
 * POST /login
 *
 * GET /logout
 *
 * Express app exposes these routes at the route level
 * itself.
 *
 * WIP: Admin routes.
 *
 *---------------------------------------------------------
 * @author Raj Sesetti, AT&T Developer Program, DRT/LTA
 *---------------------------------------------------------
 */

var express = require('express');
var router = express.Router();

// Added for password hashing
//
var hash = require('./hasher').hash;

// Any time users route does something
// it updates index route.
//
// TODO: Is this really needed?
//
var users;
router.updateUsers = function (i_users) {
  users = i_users;
  console.log('index route\'s users object updated to: %j', users);
};

/**
 * TODO: Add stuff later...
 *
 * 
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api private
 */

function authenticateUser(user_id, password, cb) {

  console.log('>> authenticateUser %s', user_id);

  if (!users) {
    return cb(new Error('Cannot find user. No users available in the system.'));
  }

  var user = users[user_id];

  console.log(users);
  if (!user) {
    return cb(new Error('Cannot find user'));
  }

  console.log('Found matching user entry in the database: %j', user);
  hash(password, user.salt, function (err, hash) {

    if (err) {
      console.log('Internal error generating hash %j', err);
      return cb(err);
    }

    if (hash == user.password) {
      console.log('Input password matches!');
      return cb(null, user);
    }

    cb(new Error('Input password does not match'));

  });

  console.log('<< authenticateUser');
}


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
  res.redirect('/login');
});


/**
 * TODO: Add stuff later...
 *
 * 
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.get('/login', function (req, res) {
  res.send(200, {
    message: 'User Login Success'
  });
});

/**
 * TODO: Add stuff later...
 *
 * 
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.post('/login', function (req, res) {

  console.log('>> /login route entered. Payload: %j', req.body);

  authenticateUser(req.body.user_id, req.body.password, function (err, authed_user) {

    console.log('Entered authenticateUser callback');

    if (err) {

      console.log('Error from authenticateUser: %s', err);

      req.session.error = 'Authentication failed, please check your user id or password';

      res.send(401, {
        error: 'Authentication failed, please check your user id or password'
      });
      return;

    }

    if (authed_user) {

      console.log('Authentication success');

      console.log('Retrieved user: %j', authed_user);

      var user = {};

      user.user_id = authed_user.user_id;
      user.user_name = authed_user.user_name;
      user.user_type = authed_user.user_type;
      user.role_type = authed_user.role_type;

      if (authed_user.virtual_number) user.virtual_number = authed_user.virtual_number;
      if (authed_user.account_id) user.account_id = authed_user.account_id;

      req.session.regenerate(function () {
        req.session.user = user;
        console.log('User object in session: %j', user);
        
        req.session.success = 'Authenticated as ' + user.user_id;
        res.send(200, user);
      });

    } else {

      console.log('Authentication failure');

      req.session.error = 'Authentication failed, please check your user id or password';
      res.send(401, {
        error: 'Authentication failed, please check your user id or password'
      });

    }

  });

});

/**
 * TODO: Add stuff later...
 *
 * 
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.delete('/logout', function (req, res) {

  // Destroy the user's session 
  // to log them out. A new session
  // will be created on next request
  //
  req.session.destroy(function () {
    res.send(200, {
      message: 'User logged out successfully'
    });
  });

});

module.exports = router;

//-----------------------------------------------------------
// END: routes/index.js
//-----------------------------------------------------------

