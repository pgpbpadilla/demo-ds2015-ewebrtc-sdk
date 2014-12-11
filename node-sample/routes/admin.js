/*jslint node: true, nomen: true, indent:2, todo: true*/

/**
 *---------------------------------------------------------
 * routes/admin.js
 *---------------------------------------------------------
 * Implements Routes for User and virtual number administration functions.
 *
 * Following routes are available:
 *
 * GET /users
 * DELETE /users/:id
 * DELETE /users
 * DELETE /virtualnumbersassigns/:id
 * DELETE /virtualnumbersassigns
 * 
 * Ultimately, Express app exposes these routes as:
 *
 * GET <your_app_url>/admin/users
 * DELETE <your_app_url>/admin/users/:id
 * DELETE <your_app_url>/admin/users
 * DELETE <your_app_url>/admin/virtualnumbersassigns/:id
 * DELETE <your_app_url>/admin/virtualnumbersassigns
 * 
 * TODO:
 * Merge into users.js and add admin auth mw
 *
 *---------------------------------------------------------
 * @author Raj Sesetti, AT&T Developer Program, DRT/LTA
 *---------------------------------------------------------
 */

var express = require('express');
var router = express.Router();

var fs = require('fs');

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

var VIRTUAL_NUMBERS_FILE = 'virtual_numbers.json';
var virtual_numbers = {};

fs.readFile(VIRTUAL_NUMBERS_FILE, function (err, data) {
  if (err) {
    console.log('Unable to read %s: %s', VIRTUAL_NUMBERS_FILE, err);
    console.log('No Virtual Numbers are available in the system...');
  } else {
    virtual_numbers = JSON.parse(data);
    console.log('Read Virtual Numbers: %j', virtual_numbers);
  }
});

/**
 * TODO: Just a template. Real stuff comes later...
 *
 *
 * @param {String} password to hash
 * @param {String} optional salt
 * @param {Function} callback
 * @api public
 */

function onlyAuthenticatedAdmin(req, res, next) {

  // TODO: Re-plug after testing...
  /***
    if (req.session.admin) {
    next();
    } else {
    req.session.error = 'Access denied!';
    res.redirect('/alogin');
    }
   ***/
  next();
}

router.all('/*', onlyAuthenticatedAdmin);

router.get('/users', function (req, res){
  console.log('Sending all users');
  res.send(200, users);
});


/**
 * TODO: Just a template. Real stuff comes later...
 *
 *
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.delete('/users/:id', function (req, res) {
  var user_name = req.params.id;

  console.log('Input parameter values...');
  console.log('user_name %s', user_name);

  if (!users[user_name]) {
    console.log('Not found: %s', user_name);
    res.send(404, 'User ' + user_name + ' not found');
    return;
  }

  console.log('All good. Attempting to delete...');
  delete users[user_name];

  fs.writeFile(USERS_FILE, JSON.stringify(users), function (error) {
    if (error) {
      console.log('Problem updating user database');

      res.send(424, 'Problem updating user database. Try again after sometime.');
      return;

    } else {

      var virtual_number_for_user = getVirtualNumberByUsername(user_name);
      console.log('Unassigning virtual number...');
      virtual_numbers[virtual_number_for_user] = null;

      fs.writeFile(VIRTUAL_NUMBERS_FILE, JSON.stringify(virtual_numbers), function (error) {
        if (error) {
          console.log('Failure. Error updating virtual number database');
          res.send(424, 'Problem updating virtual number database for this user');
        } else {
          console.log('Success. Deleted user: %s', user_name);
          res.send(201, 'Success. Deleted user: ' + user_name);
        }
      });
    }
  });
});

/**
 * TODO: Just a template. Real stuff comes later...
 *
 *
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.delete('/users', function (req, res) {
  var users = {};
  fs.writeFile(USERS_FILE, JSON.stringify(users), function (error) {
    if (error) {
      console.log('Problem clearing user database');

      res.send(424, 'Problem clearing user database. Try again after sometime.');
      return;

    } else {

      for(var prop in virtual_numbers) {
        if (virtual_numbers.hasOwnProperty(prop)) {

          console.log('Clearing virtual number assignment %s -> %s', prop, virtual_numbers[prop]);
          virtual_numbers[prop] = null;

        }
      }

      fs.writeFile(VIRTUAL_NUMBERS_FILE, JSON.stringify(virtual_numbers), function (error) {
        if (error) {
          console.log('Failure. Error clearing virtual number assignments');
          res.send(424, 'Problem Clearing virtual number assignments');
        } else {
          console.log('Success. Cleared Virtual Numbers database');
          res.send(201, 'Success. Deleted all users and cleared virtual number assignments');
        }
      });
    }
  });
});

/**
 * TODO: Just a template. Real stuff comes later...
 *
 *
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.delete('/virtualnumbersassigns/:id', function (req, res) {

  var virtual_number_to_unassign = req.params.id;

  console.log('Input parameter values...');
  console.log('virtual number to unassign: %s', virtual_number_to_unassign);

  for(var prop in virtual_numbers) {
    if (virtual_numbers.hasOwnProperty(prop)) {
      if (virtual_numbers[prop] === virtual_number_to_unassign) {
        console.log('Clearing virtual number assignment %s -> %s', prop, virtual_numbers[prop]);
        virtual_numbers[prop] = null;
      }
    }
  }

  fs.writeFile(VIRTUAL_NUMBERS_FILE, JSON.stringify(virtual_numbers), function (error) {
    if (error) {
      console.log('Failure. Error unassigning virtual number');
      res.send(424, 'Problem unassigning virtual number');
    } else {
      console.log('Success. Unassigned virtual number');
      res.send(201, 'Success. Unassigned virtual number');
    }
  });
});

/**
 * TODO: Just a template. Real stuff comes later...
 *
 *
 * @param {String} Some input
 * @param {String} Some other input
 * @param {Function} A callback
 * @api public
 */

router.delete('/virtualnumbersassigns', function (req, res) {

  console.log('Zapping all virtual number assignments...');

  for(var prop in virtual_numbers) {
    if (virtual_numbers.hasOwnProperty(prop)) {
      if (virtual_numbers[prop]) {
        console.log('Clearing virtual number assignment %s -> %s', prop, virtual_numbers[prop]);
        virtual_numbers[prop] = null;
      }
    }
  }

  fs.writeFile(VIRTUAL_NUMBERS_FILE, JSON.stringify(virtual_numbers), function (error) {
    if (error) {
      console.log('Failure. Error clearing virtual number assignments');
      res.send(424, 'Problem Clearing virtual number assignments');
    } else {
      console.log('Success. Cleared Virtual Numbers database');
      res.send(201, 'Success. Deleted all users and cleared virtual number assignments');
    }
  });
});

module.exports = router;

//-----------------------------------------------------------
// END: routes/admin.js
//-----------------------------------------------------------

