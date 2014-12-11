/*jslint node: true, nomen: true, indent:2, todo: true*/

/**
 *---------------------------------------------------------
 * routes/users.js
 *---------------------------------------------------------
 * Implements Routes for User Management functions.
 *
 *
 * Following routes are available.
 *
 * Any public user can:
 * --------------------
 * POST /
 *
 * Only authenticated users can:
 * -----------------------------
 * GET /:id
 * PUT /:id
 * DELETE /:id
 *
 * Ultimately, Express app exposes these routes as:
 *
 * POST <your_app_url>/users
 * GET <your_app_url>/users/:id
 * PUT <your_app_url>/users/:id
 * DELETE <your_app_url>/users/:id
 *
 * NOTE:
 * -----
 * Administrators can do some user management functions as
 * well. Check out /admin routes.
 * 
 *---------------------------------------------------------
 * @author Raj Sesetti, AT&T Developer Program, DRT/LTA
 *---------------------------------------------------------
 */

var fs = require('fs');

var express = require('express');
var router = express.Router();

var hasher = require('./hasher');

var USER_TYPE = {
  MOBILE_NUMBER: 'MOBILE_NUMBER',
  VIRTUAL_NUMBER: 'VIRTUAL_NUMBER',
  ACCOUNT_ID: 'ACCOUNT_ID'
};
Object.freeze(USER_TYPE);
exports.USER_TYPE = USER_TYPE;

var ROLE_TYPE = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};
Object.freeze(ROLE_TYPE);
exports.ROLE_TYPE = ROLE_TYPE;

// Password tester regexp
//
// At least:
// 8 chars, 1 uppercase, 1 lowercase, 1 digit
//
var goodPassword = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

// Cheap persistence mechanism instead of
// a Database. This is only a Sample. For
// Production, use a robust database for
// these functions.
// 
//
var USERS_FILE = 'users.json';
var users = {};

fs.readFile(USERS_FILE, function (err, data) {
  if (err) {
    console.log('Unable to read %s: %s', USERS_FILE, err);
    console.log('No users are available in the system...');
  } else {
    users = JSON.parse(data);
    console.log('Read Users: %j', users);
  }
});

var virtual_numbers_file;
var virtual_numbers = {};


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

router.initVirtualNumbersInfo = function (i_virtual_numbers_file, i_virtual_numbers) {

  console.log('>> initVirtualNumbersInfo');
  console.log('-------------------------');
  console.log('Got i_virtual_numbers_file: %s', i_virtual_numbers_file);
  console.log('Got i_virtual_numbers: %j', i_virtual_numbers);
  console.log('-------------------------');

  virtual_numbers_file = i_virtual_numbers_file;
  virtual_numbers = i_virtual_numbers;

  console.log('<< initVirtualNumbersInfo');

};

var ewebrtc_domain;

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

router.initEWebRTCDomain = function (i_ewebrtc_domain) {

  console.log('>> initEWebRTCDomain');
  console.log('-------------------------');
  console.log('Got i_ewebrtc_domain: %s', i_ewebrtc_domain);
  console.log('-------------------------');

  ewebrtc_domain = i_ewebrtc_domain;

  console.log('<< initEWebRTCDomain');

};

var indexRoute;

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

router.registerIndexRoute = function (i_indexRoute) {

  console.log('>> registerIndexRoute');

  indexRoute = i_indexRoute;

  console.log('<< registerIndexRoute');

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

function getNextAvailableVirtualNumber() {

  // NOT NEEDED for this function
  // itself. But, take this opportunity
  // to re-load the file to update
  // the cached virtual_numbers variable
  //
  fs.readFile(virtual_numbers_file, function (err, data) {
    if (err) {
      console.log('Unable to read %s: %s', virtual_numbers_file, err);
      console.log('No Virtual Numbers are available in the system...');
    } else {
      virtual_numbers = JSON.parse(data);
      console.log('Read Virtual Numbers: %j', virtual_numbers);
    }
  });

  // Real work is done by this routine
  //
  for (var prop in virtual_numbers) {
    if (virtual_numbers.hasOwnProperty(prop)) {
      if (virtual_numbers[prop] === null) {
        console.log('Found available Virtual Number %s', prop);
        return prop;
      } else {
        console.log('Virtual Number %s is already assigned to %s', prop, virtual_numbers[prop]);
      }
    }
  }

  console.log('No free Virtual Number Available');
  return null;
}


/**
 * TODO: Add stuff later...
 *
 * 
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api private
 */

function getVirtualNumberByUsername(user_id) {

  for (var prop in virtual_numbers) {
    if (virtual_numbers.hasOwnProperty(prop)) {
      if (virtual_numbers[prop] === user_id) return prop;
    }
  }

  console.log('No virtual number Assigned to %s', user_id);
  return null;
}


/**
 * TODO: Add stuff later...
 *
 * 
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api private
 */

function onlyAuthenticatedUser(req, res, next) {

  if (req.session.user) {
    console.log('Request came from a logged-in session');
    next();

  } else {

    console.log('No logged-in session');
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }

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

router.post('/', function (req, res) {

  var user_id = req.body.user_id;
  var user_name = req.body.user_name;
  var user_type = req.body.user_type;
  var password = req.body.password;
  console.log('user_id %s, user_type %s, password %s', user_id, user_type, password);

  if (!user_id || !user_name || !user_type || !password) {
    res.send(412, 'Missing parameter(s). Required: user_id, user_name, user_type, password');
    return;
  }

  if (!goodPassword.test(password)) {
    res.send(412, 'password should have at least: 8 chars, 1 uppercase, 1 lowercase, 1 digit');
    return;
  }

  if (users[user_id]) {
    res.send(409, user_id + ' already exists');
    return;
  }

  if (!(user_type === USER_TYPE.MOBILE_NUMBER || user_type === USER_TYPE.VIRTUAL_NUMBER || user_type === USER_TYPE.ACCOUNT_ID)) {
    res.send(406, 'user_type should be one of: ' + Object.keys(USER_TYPE));
    return;
  }

  // Start populating the new_user object
  //
  var new_user = { user_id: user_id, user_name: user_name, user_type: user_type, role_type: ROLE_TYPE.USER };

  // Find a virtual number to assign if user requested
  // to be virtual number user type. If none available,
  // don't even create the user entry.
  //
  var next_virtual_number = getNextAvailableVirtualNumber();

  if (user_type == USER_TYPE.VIRTUAL_NUMBER && (next_virtual_number === null)) {
    res.send(424, 'No virtual number Available');
    return;
  } 
  
  if (user_type == USER_TYPE.VIRTUAL_NUMBER) {
    new_user.virtual_number = next_virtual_number;
  } else if (user_type == USER_TYPE.ACCOUNT_ID) {
    new_user.account_id = user_id + '@' + ewebrtc_domain;
  }

  // Create hashed password and store the hash and salt
  //
  hasher.hash(password, function (pErr, pSalt, pHash) {

    if (pErr) {

      console.log('Could not generate hash for safe-storing the password');
      console.log('Error: %s', pErr);
      res.send(500, 'Problem storing password. Try later');
      return;

    } else {

      console.log('Salt: %s, Hash: %s', pSalt, pHash);

      // Update new_user object with salt and hash
      //
      new_user.password = pHash;
      new_user.salt = pSalt;

      // Add new_user object to users.json
      //
      users[user_id] = new_user;

      fs.writeFile(USERS_FILE, JSON.stringify(users), function (error) {

        if (error) {

          res.send(424, 'Unable to store user');
          return;

        } else if (user_type == USER_TYPE.VIRTUAL_NUMBER) {

          indexRoute.updateUsers(users);
          virtual_numbers[next_virtual_number] = user_id;

          fs.writeFile(virtual_numbers_file, JSON.stringify(virtual_numbers), function (error) {

            if (error) {

              res.send(424, 'Unable to store virtual number for ' + user_id);
              return;

            } else {


              res.send(201, {
                user_id: new_user.user_id,
                user_name: new_user.user_name,
                user_type: new_user.user_type,
                virtual_number: new_user.virtual_number
              });

            }

          }); // virtual_numbers.json write end

        } else {

          // ACCOUNT_ID or MOBILE_NUMBER user
          //
          indexRoute.updateUsers(users);
          res.send(201, {
            user_id: new_user.user_id,
            user_name: new_user.user_name,
            user_type: new_user.user_type,
            virtual_number: new_user.account_id
          });
        }

      }); // users.json write end

    } // hash was good

  }); // hash end

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

router.get('/:id', onlyAuthenticatedUser, function (req, res){

  var user_id = req.params.id;

  if (users[user_id]) {
    res.send(200, users[user_id]);
  } else {
    res.send(404, 'User ' + user_id + ' not found');
  }

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

router.put('/:id', onlyAuthenticatedUser, function (req, res) {

  var user_id = req.params.id;
  var old_password = req.body.old_password;
  var new_password = req.body.new_password;

  console.log('-------------------------');
  console.log('Input parameter values...');
  console.log('-------------------------');
  console.log('user_id %s', user_id);
  console.log('old_password %s', old_password);
  console.log('new_password %s', new_password);

  if (!users[user_id]) {
    console.log('Not found: %s', user_id);
    res.send(404, 'User ' + user_id + ' not found');
    return;
  }

  var ex_password_hash = users[user_id].password;
  console.log('Existing Password Hash: %s', ex_password_hash);

  var ex_salt = users[user_id].salt;
  console.log('Existing Password Salt: %s', ex_salt);

  hasher.hash(old_password, ex_salt, function (hErr, hOPswd) {

    if (hErr) {

      console.log('Unable to generate hash');
      res.send(500, 'Internal Error: Unable to compare old_password with existing password');
      return;

    } else if (ex_password_hash !== hOPswd) {

      console.log('Calculated hash for input old_password: %s', hOPswd);
      console.log('Input old_password and existing password');
      console.log('in database DON\'T match. Returning error...');

      res.send(417, 'Input old_password does not match our database');

      return;

    } else {

      console.log('Calculated hash for input old_password: %s', hOPswd);
      console.log('Input old_password and existing password');
      console.log('in database do match. Proceeding for update...');

      if (!goodPassword.test(new_password)) {

        console.log('New password is not strong enough');
        res.send(412, 'new_password should have at least: 8 chars, 1 uppercase, 1 lowercase, 1 digit');

        return;
      }

      console.log('Attempting to update password...');
      users[user_id].password = new_password;

      fs.writeFile(USERS_FILE, JSON.stringify(users), function (error) {
        if (error) {
          users[user_id].password = old_password;
          console.log('Restored old password for user');

          res.send(424, 'Unable to update password');
          return;

        } else {

              indexRoute.updateUsers(users);

          console.log('Success. Password update stored');
          res.send(201, 'Updated password for user: ' + user_id);
        }
      });

    } // end: else

  }); // end: hash

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

router.delete('/:id', onlyAuthenticatedUser, function (req, res) {

  var user_id = req.params.id;

  console.log('-------------------------');
  console.log('Input parameter values...');
  console.log('-------------------------');
  console.log('user_id %s', user_id);

  if (!users[user_id]) {
    console.log('Not found: %s', user_id);
    res.send(404, 'User ' + user_id + ' not found');
    return;
  }

  console.log('All good. Attempting to delete...');
  delete users[user_id];

  fs.writeFile(USERS_FILE, JSON.stringify(users), function (error) {
    if (error) {
      console.log('Problem updating user database');

      res.send(424, 'Problem updating user database. Try again after sometime.');
      return;

    } else {

      indexRoute.updateUsers(users);

      var virtual_number_for_user = getVirtualNumberByUsername(user_id);
      console.log('Unassigning virtual number...');
      virtual_numbers[virtual_number_for_user] = null;

      fs.writeFile(virtual_numbers_file, JSON.stringify(virtual_numbers), function (error) {
        if (error) {
          console.log('Failure. Error updating virtual number database');
          res.send(424, 'Problem updating virtual number database for this user');
        } else {
          console.log('Success. Deleted user: %s', user_id);
          res.send(201, 'Success. Deleted user: ' + user_id);
        }
      });
    }
  });

});

module.exports = router;

//-----------------------------------------------------------
// END: routes/users.js
//-----------------------------------------------------------


