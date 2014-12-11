/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150*/
/*global ATT, console, log, phone, ajaxRequest, setMessage, clearMessage, clearError, switchView, resetUI,
  updateAddress, loginEnhancedWebRTC, loginSuccessCallback, onError, clearSessionData, phoneLogout,
  appendDomainToAccountIDCallee, dialCall, answer, answer2ndCall, hold, resume, startConference,
  joinConference, addParticipants, getParticipants, removeParticipant, move, switchCall, cleanPhoneNumber*/

'use strict';

var sessionData = {},
  participantsVisible = false,
  holder;

// Register a new user (Account ID/Virtual Number) on DHS
function register(event) {
// ### Register new Virtual Number and Account ID users
// ---------------------------------
  if (event) {
    event.preventDefault();
  }
  var i,
    key,
    form = document.getElementById("registerForm"),
    data = {},
    dataFormat = {
      user_name : {
        display: 'Name',
        required: true
      },
      user_id : {
        display: 'User Id',
        required: true
      },
      user_type : {
        display: 'User Type',
        required: true
      },
      password : {
        display: 'Password',
        required: true
      },
      confpassword: {
        display: 'Confirm Password',
        required: true
      }
    };

  if (!form) {
    return;
  }

  clearError();

  // validates the user inputs
  try {
    for (key in dataFormat) {
      if (dataFormat.hasOwnProperty(key)) {
        if (dataFormat[key].required) {
          if (undefined === form[key]) {
            throw dataFormat[key].display + ' is missing from the form';
          }
        }
        if (undefined !== form[key].length) {
          data[key] = null;
          for (i = 0; i < form[key].length; i = i + 1) {
            if (form[key][i].checked) {
              data[key] = form[key][i].value;
              break;
            }
          }
          if (!data[key]) {
            throw dataFormat[key].display + ' is a required field';
          }
        } else {
          if (!form[key].value) {
            throw dataFormat[key].display + ' is a required field';
          }
          data[key] = form[key].value;
        }
      }
    }

    if (data.password !== data.confpassword) {
      throw 'The passwords do not match';
    }

    delete data.confpassword;
    // ## On success, switches the view to login
    // ---------------------------------
    ajaxRequest({
      url: '/users',
      method: 'POST',
      data: data,
      success: function (response) {
        var user = response.getJson();
        switchView('login');
        setMessage('User ' + user.user_id + ' created successfully. Please login.');
      },
      //On error, error callback is called
      error: onError
    });
  } catch (err) {
    onError(err);
  }
}

// ## Creating an e911 id for Mobile Number/Virtual Number users
// --------------
function setAddress(event) {
  event.preventDefault();

  clearError();

  if (!sessionData.access_token) {
    switchView('logout');
    onError('No access token available to login to Enhanced WebRTC. Please login first to get an access token');
    return;
  }

  var form = document.getElementById("addressForm"),
    i,
    e,
    address = {
    },
    addressFormat = {
      'first_name': {
        display: 'First Name',
        required: true
      },
      'last_name' : {
        display: 'Last Name',
        required: true
      },
      'house_number': {
        display: 'House Number',
        required: true
      },
      'street': {
        display: 'Street',
        required: true
      },
      'unit': {
        display: 'Unit/Apt/Suite',
        required: false
      },
      'city': {
        display: 'City',
        required: true
      },
      'state': {
        display: 'State',
        required: true
      },
      'zip': {
        display: 'Zip Code',
        required: true
      }
    };

  try {
    if (!form) {
      return;
    }

    // Gather all the fields from the address form.
    for (i = 0; i < form.elements.length; i = i + 1) {
      e = form.elements[i];
      if (e.type !== 'button' && e.type !== 'submit') {
        if (addressFormat.hasOwnProperty(e.name)) {
          if (addressFormat[e.name].required === true && !e.value) {
            throw addressFormat[e.name].display + ' is a required field';
          }
          address[e.name] = e.value;
        } else if (e.type === 'checkbox') {
          address[e.name] = (e.checked).toString();
        }
      }
    }

    ATT.rtc.dhs.createAccessToken({
      app_scope: 'E911',
      success: function (data) {

        ATT.rtc.dhs.createE911Id({
          token: data.access_token,
          address: address,
          // On successful E911 Id creation
          success: function (e911Id) {
            // If already logged in to Enhanced WebRTC
            if (sessionData.sessionId) {
              updateAddress(e911Id.e911Locations.addressIdentifier);
            } else {
              // try to create a Enhanced WebRTC session otherwise.
              loginEnhancedWebRTC(sessionData.access_token, e911Id);
            }
          },
          error: onError
        });
      },
      error: onError
    });
  } catch (err) {
    onError(err);
  }
}

// # Login to DHS: Authorize your mobile number to be used to make Enhanced WebRTC calls.
// -----------------
//  This will presents the OAuth consent flow

// ## Virtual Number/Account ID Login
// ---------
// Allow the Virtual Number/Account ID user to login to DHS, if DHS login successful the success callback
// function invokes the SDK method to perform Enhanced WebRTC login
function login(event) {
  if (event) {
    event.preventDefault();
  }

  var data = {
  }, form, i, e;

  clearError();

  form = document.getElementById("loginForm");

  if (form) {
    for (i = 0; i < form.elements.length; i = i + 1) {
      e = form.elements[i];
      if (e.type !== 'button' && e.type !== 'submit') {
        data[e.name] = e.value;
      }
    }
  }

  // ## Attempt logging in to the DHS
  //---------
  ajaxRequest({
    url: '/login',
    method: 'POST',
    data : data,
    // Try to login to Enhanced WebRTC, i.e., create a Enhanced WebRTC Session.
    success : function (response) {
      var user = response.getJson();

      ATT.rtc.dhs.createAccessToken({
        app_scope: user.user_type,
        success: function (data) {

          var userId,
            virtualNumber = user.virtual_number || '';

          if (virtualNumber.length === 11 && virtualNumber.charAt(0).localeCompare('1') === 0) {
            virtualNumber = virtualNumber.substr(1);
          }

          userId = (user.user_type === 'VIRTUAL_NUMBER') ? ('vtn:' + virtualNumber) : user.user_id;

          ATT.rtc.associateAccessToken({
            userId: userId,
            token: data.access_token,
            success: function () {
              ATT.utils.extend(data, user);// store user data for Virtual Number/Account ID user
              loginSuccessCallback(data);
            },
            error: onError
          });
        },
        error: onError
      });

    },
    error: onError
  });
}


// get authorize URL from DHS for Mobile Number user
function loginMobileNumberUser() {
// ## Login Mobile Number user using oAuth/User consent model
// ---------

  // Attempt to authorize your mobile to make Enhanced WebRTC calls
  window.location.href = '/oauth/authorize';
}

// # Getting an Access Token
// --------
//    Use the authcode obtained from consent flow
//
// For Mobile Number user we obtain new access token every time the user goes through consent flow and authenticated
// calls dhs to get access token on successful return it will call address page
function getAccessToken(args) {
  args = JSON.parse(decodeURI(args));

  if (!args || !args.code) {
    throw new Error('Failed to retrieve the user consent code.');
  }

  if (args.error) {
    throw args.error;
  }
  // Attempt to retrieve an Access Token
  ATT.rtc.dhs.createAccessToken({
    app_scope: 'MOBILE_NUMBER',
    auth_code: args.code,
    success: function (data) {
      try {
        if (!data) {
          throw 'Failed to retrieve the access token';
        }
        ATT.utils.extend(sessionData, data); // store the access token and other data
        // On success we'll present the Address Form
        switchView('address');
      } catch (err) {
        onError(err);
      }
    },
    error: onError
  });
}

// ## Logout from DHS session
function deleteSession(callback) {
  ajaxRequest({
    url: '/logout',
    method: 'DELETE',
    success: function (response) {
      clearSessionData();
      if (callback) {
        callback(response.getJson());
      }
    },
    error: onError
  });
}

//Logs out the user from DHS, if successful invokes SDK logout so that Enhanced WebRTC session can be deleted
// session is cleared on logout on success change view to logout
function logout() {
  if (sessionData.sessionId) {
    phoneLogout(function () {
      resetUI();
      if (sessionData.user_id) {
        deleteSession(function (response) {
          switchView('logout', response);
        });
      } else {
        clearSessionData();
        switchView('logout');
        setMessage('Enhanced WebRTC session ended');
      }
    });
  } else if (sessionData.user_id) { // if there is a http session delete that first
    deleteSession(function (response) {
      resetUI();
      switchView('logout', response);
    });
  }
}

// ## Delete User
function deleteUser() {
  var name = sessionData.user_name;
  ajaxRequest({
    url: '/users/' + sessionData.user_id,
    method: 'DELETE',
    success: function () {
      deleteSession(function (data) {
        data.message = 'User ' + name + ' deleted successfully';
        switchView('logout', data);
      });
    },
    error: onError
  });
}

function deleteProfile() {
  var result = confirm('Are you sure that you want to delete your DHS profile?\n'
    + 'This operation will log you out and delete your user.\n'
    + 'You can no longer make Enhanced WebRTC calls with this user.');

  if (!result) {
    return;
  }

  if (sessionData.sessionId) {
    phoneLogout(function () {
      deleteUser();
    });
  } else if (sessionData.user_id) { // if there is a http session delete that first
    deleteUser();
  } else {
    clearSessionData();
    switchView('logout');
  }
}

//Invokes SDK dial method to make outgoing call
//-----
function call(event) {
  clearError();

  // dial takes destination, mediaType, local and remote media HTML elements

  var callForm = document.getElementById('callForm'),
    confForm = document.getElementById('confForm'),
    that = event.currentTarget,
    callee,
    audioOnly,
    btnConf = document.getElementById('btn-start-conference'),
    btnDial = document.getElementById('btn-dial'),
    localVideo = document.getElementById('localVideo'),
    remoteVideo = document.getElementById('remoteVideo');

  callForm.classList.remove('hidden');
  callForm.classList.add('shown');

  confForm.classList.remove('shown');
  confForm.classList.add('hidden');

  btnConf.classList.remove('active');
  that.classList.add('active');

  btnDial.onclick = function () {
    audioOnly = document.getElementById('callAudioOnly').checked;
    callee = document.getElementById('callee').value;
    //util method to clean phone number
//    callee = appendDomainToAccountIDCallee(callee);
    callee = cleanPhoneNumber(callee);

    if (phone.isCallInProgress()) {
      //showCallAlert('HOLDING...');
    }

    dialCall(callee, (audioOnly ? 'audio' : 'video'), localVideo, remoteVideo);
  };
}

function answerCall(action) {
  document.getElementById('ringtone').pause();
  clearMessage();

  var localVideo = document.getElementById('localVideo'),
    remoteVideo = document.getElementById('remoteVideo');

  if (undefined !== action) {
    answer2ndCall(localVideo, remoteVideo, action);
  } else {
    answer(localVideo, remoteVideo);
  }
}

function holdAndAnswer() {
  answerCall('hold');
}

function endAndAnswer() {
  answerCall('end');
}

function holdCall() {
  holder = true;
  hold();
}

function resumeCall() {
  holder = false;
  resume();
}

//Invokes SDK startConference method to begin conference
//-----
function conference(event) {
  clearError();

  var callForm = document.getElementById('callForm'),
    confForm = document.getElementById('confForm'),
    confAudioOnly,
    btnCreateConference = document.getElementById('btn-create-conference'),
    that = event.currentTarget,
    btnCall = document.getElementById('btn-make-call'),
    localVideo = document.getElementById('localVideo'),
    remoteVideo = document.getElementById('remoteVideo');

  callForm.classList.remove('shown');
  callForm.classList.add('hidden');

  confForm.classList.remove('hidden');
  confForm.classList.add('shown');

  that.classList.add('active');
  btnCall.classList.remove('active');

  btnCreateConference.onclick = function () {
    confAudioOnly = document.getElementById('confAudioOnly').checked;
    startConference((confAudioOnly ? 'audio' : 'video'), localVideo, remoteVideo);
  };
}

function join() {
  document.getElementById('ringtone').pause();
  clearMessage();

  var localVideo = document.getElementById('localVideo'),
    remoteVideo = document.getElementById('remoteVideo');

  joinConference(localVideo, remoteVideo);
}

function getListOfInvitees(partcpnts) {
  var noSpacesString = partcpnts.replace(/ +?/g, '');
  partcpnts = noSpacesString.split(',');
  return partcpnts;
}

function participant() {
  var partcpnts,
    listOfInvitees;
//    partcpnt,
//    counter;

  partcpnts = document.getElementById('participant').value;
  listOfInvitees = getListOfInvitees(partcpnts);

//  for (counter = 0; counter < listOfInvitees.length; counter += 1) {
//    partcpnt = appendDomainToAccountIDCallee(listOfInvitees[counter]);
//
//    listOfInvitees[counter] = partcpnt;
//  }

  addParticipants(listOfInvitees);
}

function showParticipants() {
  var participantsPanel,
    partcpnts,
    expandParticipants,
    participantsList,
    key,
    html;

  participantsPanel = document.getElementById('panel-participants');
  participantsList = document.getElementById('participants-list');
  expandParticipants = document.getElementById('expand-participants');

  partcpnts = getParticipants();

  html = '';

  for (key in partcpnts) {
    if (partcpnts.hasOwnProperty(key)) {
      html += '<div class="row"></div><div class="participant glyphicon glyphicon-user"> ' + key +
        ' &nbsp; <span class="remove-participant glyphicon glyphicon-remove" onclick="removeUser()" id="' + key +
        '"></span></div></div>';
    }
  }

  if (participantsPanel
      && participantsList
      && expandParticipants
      && partcpnts) {
    participantsPanel.style.display = 'block';

    expandParticipants.innerHTML = '<span class="glyphicon glyphicon-chevron-up"> </span>';
    participantsList.innerHTML = html;
    participantsVisible = true;
  }
}

function hideParticipants() {
  var participantsPanel,
    expandParticipants;

  participantsPanel = document.getElementById('panel-participants');
  expandParticipants = document.getElementById('expand-participants');

  if (participantsPanel) {
    participantsPanel.style.display = 'none';
    expandParticipants.innerHTML = '<span class="glyphicon glyphicon-chevron-down"> </span>';
    participantsVisible = false;
  }
}

function toggleParticipants() {
  if (participantsVisible) {
    hideParticipants();
  } else {
    showParticipants();
  }
}

function removeUser() {
  var user = event.currentTarget.id;

  removeParticipant(user);
}

function showAddressView() {
  var updateAddressDiv =  document.getElementById("address-box");

  if (updateAddressDiv) {
    updateAddressDiv.style.display = 'block';
  }
}

function hideAddressView() {
  var updateAddressDiv = document.getElementById("address-box");
  updateAddressDiv.style.display = 'none';
}

function moveCall() {
  move();
}

function switchCalls() {
  switchCall();
}