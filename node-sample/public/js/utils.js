/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150*/
/*global ATT, RESTClient, console, log, phone, holder, eWebRTCDomain,
  sessionData, defaultHeaders, deleteSession, onError,
  getAccessToken, hideParticipants, showParticipants, loginEnhancedWebRTC*/

'use strict';

var buttons,
  defaultHeaders;

defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

function unsupportedBrowserError() {
  var viewDiv = document.getElementById('view'),
    errorText = 'The web browser does not support Enhanced WebRTC. Please use latest Chrome or Firefox';

  if (viewDiv) {
    viewDiv.innerHTML = errorText;
  } else {
    alert(errorText);
  }
  return new Error(errorText);
}

// all the ajax request passes via this method it sets Callbacks and other parameters
// it takes args as a parameter it contains end url details
/**
 * @param args
 * ajax Call for UI change and for DHS  all
 */
function ajaxRequest(args) {
  var rc = new ATT.RESTClient({
    method : args.method || 'GET',
    url : args.url,
    data: args.data,
    headers : args.headers || defaultHeaders,
    success : args.success,
    error: args.error
  });
  rc.ajax();
}

function clearSessionData() {
  if (!sessionData) {
    return;
  }
  var key;
  for (key in sessionData) {
    if (sessionData.hasOwnProperty(key)) {
      sessionData[key] = null;
    }
  }
}

function clearError() {
  var errMsgDiv = document.getElementById("errormessage");
  if (!errMsgDiv) {
    return;
  }
  errMsgDiv.innerHTML = "";
}

function clearMessage() {
  var messageDiv = document.getElementById('message');

  if (!messageDiv) {
    return;
  }
  messageDiv.innerHTML = "";
}

function setError(errText) {
  var errMsgDiv = document.getElementById("errormessage"),
    closeMessage =  '<button id="btn-msg-close" type="button" class="btn btn-default btn-xs" onclick="clearError()">x</button>';
  if (!errMsgDiv) {
    return;
  }
  clearMessage();
  errMsgDiv.innerHTML = errText + closeMessage;
}

function setMessage(msg, cls) {
  var messageDiv = document.getElementById('message'),
    closeMessage =  '<button id="btn-msg-close" type="button"'
      + 'class="btn btn-default btn-xs" onclick="clearMessage()">x</button>',
    oldMsgs = '<div class="old-msgs">' + messageDiv.innerHTML + '</div>';

  cls = cls || '';

  if (!messageDiv) {
    return;
  }
  clearError();
  messageDiv.innerHTML = '';
  messageDiv.innerHTML = '<div class="clearfix msg ' + cls + '">' + msg + '</div><hr>' + oldMsgs + closeMessage;
}

function setupHomeView() {
  var videoWrap = document.getElementById('video-wrap'),
    callActions = document.getElementById('call-actions');

  videoWrap.addEventListener('mouseenter', function () {
    callActions.style.opacity = '1';
  });

  videoWrap.addEventListener('mouseleave', function () {
    callActions.style.opacity = '0';
  });

  document.getElementById('callee').value =  '@' + eWebRTCDomain;
}

function formatError(errObj) {
  var formattedError;

  if (undefined === errObj) {
    return '';
  }

  if (undefined !== errObj.getJson) {
    if (errObj.getJson()) {
      errObj = errObj.getJson();
    } else {
      errObj = errObj.responseText;
    }
  }
  if (undefined !== errObj.error) {
    errObj = errObj.error;
  }
  if (undefined !== errObj.message) {
    errObj = errObj.message;
  }

  if (undefined !== errObj.JSObject
      || undefined !== errObj.APIError) {
    formattedError = (errObj ? (
      (errObj.JSObject ? "<br/>JSObject: " + errObj.JSObject : "") +
      (errObj.JSMethod ? "<br/>JSMethod: " + errObj.JSMethod : "") +
      (errObj.Resolution ? "<br/>Resolution: " + errObj.Resolution : "") +
      (errObj.ErrorCode ? "<br/>Error Code: " + errObj.ErrorCode : "") +
      (errObj.Cause ? "<br/>Cause: " + errObj.Cause : "") +
      (errObj.ErrorMessage ? "<br/>Error Message: " + errObj.ErrorMessage : "") +
      (errObj.PossibleCauses ? "<br/>Possible Causes: " + errObj.PossibleCauses : "") +
      (errObj.PossibleResolution ? "<br/>Possible Resolution: " + errObj.PossibleResolution : "") +
      (errObj.APIError ? "<br/>API Error: " + errObj.APIError : "") +
      (errObj.ResourceMethod ? "<br/>Resource Method: " + errObj.ResourceMethod : "") +
      (errObj.HttpStatusCode ? "<br/>Http Status Code: " + errObj.HttpStatusCode : "") +
      (errObj.MessageId ? "<br/>MessageId: " + errObj.MessageId : "")
    ) : '');
  } else {
    formattedError = errObj.toString();
  }

  return formattedError;
}

function createView(view, data, response) {
  var viewDiv,
    div,
    message,
    profile,
    userName,
    userId,
    updateAddressDiv,
    userType,
    virtualNumberPara,
    virtualNumber,
    accountIdPara,
    accountId,
    updateAddress,
    deleteProfile,
    logout;

  viewDiv = document.getElementById('view');
  if (!viewDiv) {
    return;
  }

  div = document.createElement('div');
  div.innerHTML = response.responseText;

  viewDiv.innerHTML = '';
  viewDiv.appendChild(div);

  // message
  message = document.getElementById("message");
  // profile
  profile = document.getElementById("profile");
  // name
  userName = document.getElementById("user_name");
  // userid
  userId = document.getElementById("user_id");
  // type
  userType = document.getElementById("user_type");
  // virtual number
  virtualNumberPara = document.getElementById('virtual_number_para');
  virtualNumber = document.getElementById("virtual_number");
  // type
  accountIdPara = document.getElementById('account_id_para');
  accountId = document.getElementById("account_id");
  // delete
  deleteProfile = document.getElementById("delete");
  // updateAddress
  updateAddress = document.getElementById("update_address");
  // logout
  logout = document.getElementById("logout");
  // address div for update address
  updateAddressDiv =  document.getElementById("address-box");

  switch (view) {
  case 'home':
    setupHomeView();

    if (profile && data.user_name) {
      profile.style.display = 'block';
      profile.innerHTML = data.user_name;
    }

    if (updateAddress) {
      updateAddress.style.display = 'block';
    }
    if (logout) {
      logout.style.display = 'block';
    }
    break;
  case 'profile':
    if (data) {
      if (profile && data.user_name) {
        profile.style.display = 'block';
        profile.innerHTML = data.user_name;
      }

      if (userName && data.user_name) {
        userName.innerHTML = data.user_name;
      }

      if (userId && data.user_id) {
        userId.innerHTML = data.user_id;
      }

      if (userType && data.user_type) {
        userType.innerHTML = data.user_type;
      }

      if (virtualNumber && data.virtual_number) {
        virtualNumberPara.style.display = 'block';
        virtualNumber.innerHTML = data.virtual_number;
        if (accountIdPara) {
          accountIdPara.style.display = 'none';
        }
      }

      if (accountId && data.account_id) {
        accountIdPara.style.display = 'block';
        accountId.innerHTML = data.account_id;
        if (virtualNumberPara) {
          virtualNumberPara.style.display = 'none';
        }
      }

      if (deleteProfile) {
        deleteProfile.style.display = 'block';
      }

      if (sessionData) {
        if (updateAddress) {
          updateAddress.style.display = 'block';
        }
      }

      if (logout) {
        logout.style.display = 'block';
      }
    }
    break;
  case 'logout':
    if (profile) {
      profile.innerHTML = "Guest";
      profile.style.display = 'none';
    }

    if (updateAddress) {
      updateAddress.style.display = 'none';
    }

    if (updateAddressDiv) {
      updateAddressDiv.style.display = 'none';
    }
    if (logout) {
      logout.style.display = 'none';
    }

    if (message && data && data.message) {
      message.innerHTML = data.message;
    }
    break;
  }
}

function loadView(view, data) {
  log('Loading ' + view + ' page');

  // The ajaxRequest method takes url and the callback to be called on success error
  ajaxRequest({
    url: 'views/' + view + '.html',
    success: createView.bind(this, view, data)
  });
}

function switchView(view, data) {
  if (!view) {
    return;
  }

  clearError();
  clearMessage();

  if (view === 'home' || view === 'profile') {
    if (!data) {
      data = sessionData;
    }
    if (data) {
      if (!data.sessionId) {
        deleteSession(function (data) {
          data.message = '';
          switchView('logout', data);
        });
        return;
      }
      loadView(view, data);
      return;
    }
    loadView('logout');
    return;
  }
  loadView(view, data);
}

// ### loads the default view into the landing page
function loadDefaultView() {
  var url = window.location.href,
    args;

  //initially checks the sessionStorage and gets AccessToken or switches to home page
  try {
    if (sessionStorage !== undefined) {
      args = sessionStorage.userConsentResult;
      sessionStorage.removeItem('userConsentResult');
    } else if (url.indexOf('?userConsentResult=') >= 0) {
      args = url.slice(url.indexOf('?userConsentResult=') + 19);
    }
    if (args) {
      getAccessToken(args);
    } else {
      switchView('logout');
    }
  } catch (err) {
    onError(err);
  }
}

function resetUI() {
  document.getElementById('ringtone').pause();
  document.getElementById('calling-tone').pause();

  if (0 === phone.getCalls().length) {
    document.getElementById('btn-hold').disabled = true;
    document.getElementById('btn-resume').disabled = true;
    document.getElementById('btn-move').disabled = true;
    document.getElementById('btn-switch').disabled = true;
    document.getElementById('btn-mute').disabled = true;
    document.getElementById('btn-unmute').disabled = true;
    document.getElementById('btn-hangup').disabled = true;
    document.getElementById('participant').disabled = true;
    document.getElementById('btn-add-participant').disabled = true;
    document.getElementById('btn-end-conference').disabled = true;
    document.getElementById('btn-participants-list').disabled = true;
  }
}

function enableUI() {
  document.getElementById('btn-hold').disabled = false;
  document.getElementById('btn-resume').disabled = false;
  document.getElementById('btn-move').disabled = false;
  document.getElementById('btn-mute').disabled = false;
  document.getElementById('btn-unmute').disabled = false;
  document.getElementById('btn-hangup').disabled = false;
}

function removeClass(element) {
  element.className.replace(/(?:^|\s)MyClass(?!\S)/g, '');
}

function addClass(element, className) {
  element.className += ' ' + className;
}

function onError(err) {
  var errObj = err;

  if ('object' === typeof errObj) {
    if (errObj.error &&
        (errObj.error.HttpStatusCode === 403 ||
        errObj.error.HttpStatusCode === 404)) {
      switchView('logout');
      setMessage('Enhanced WebRTC session expired');
      return;
    }
    errObj = formatError(errObj);
  }
  errObj = errObj.toString();

  setError(errObj);
}

function onWarning(data) {
  if (undefined !== data.message) {
    setMessage(data.message, 'warning');
  }
}

function onSessionReady(data) {
  ATT.utils.extend(sessionData, data);
  switchView('home', sessionData);
}

function onNotification(data) {
  if (!phone.isCallInProgress()) {
    resetUI();
  }
  setMessage('Notification: ' + data.message, 'warning');
}

function onSessionDisconnected() {
  setMessage('WebRTC session has ended');
}

function checkEnhancedWebRTCSession() {
  return sessionData.sessionId;
}

function onIncomingCall(data) {
  var from,
    answerBtn,
    rejectBtn,
    endAnswerBtn,
    holdAnswerBtn;

  if (isNaN(data.from)) {
    from = data.from;
  } else {
    from = phone.formatNumber(data.from);
  }

  if (phone.isCallInProgress()) {

    endAnswerBtn = '<button type="button" id="end-answer-button" class="btn btn-success btn-sm" onclick="endAndAnswer()">'
      + '<span class="glyphicon glyphicon-remove"></span></button>';
    holdAnswerBtn = '<button type="button" id="hold-answer-button" class="btn btn-success btn-sm" onclick="holdAndAnswer()">'
      + '<span class="glyphicon glyphicon-pause"></span></button>';
    rejectBtn = '<button type="button" id="reject-button" class="btn btn-danger btn-sm" onclick="reject()">' +
      '<span class="glyphicon glyphicon-thumbs-down"></span></button>';
    setMessage('<h6>Call from: ' + from + (data.mediaType ? '. Media type: '
      + data.mediaType : '') + '. Time: ' + data.timestamp + '</h6>' + holdAnswerBtn + endAnswerBtn + rejectBtn, 'call:incoming');

  } else {
    answerBtn = '<button type="button" id="answer-button" class="btn btn-success btn-sm" onclick="answerCall()">'
      + '<span class="glyphicon glyphicon-thumbs-up"></span></button>';
    rejectBtn = '<button type="button" id="reject-button" class="btn btn-danger btn-sm" onclick="reject()">' +
      '<span class="glyphicon glyphicon-thumbs-down"></span></button>';

    setMessage('<h6>Call from: ' + from + (data.mediaType ? '. Media type: '
      + data.mediaType : '') + '. Time: ' + data.timestamp + '</h6>' + answerBtn + rejectBtn, 'call:incoming');
  }

  document.getElementById('ringtone').play();
}

function onConferenceInvite(data) {
  var from,
    answerBtn,
    rejectBtn;

  if (isNaN(data.from)) {
    from = data.from;
  } else {
    from = phone.formatNumber(data.from);
  }

  answerBtn = '<button type="button" id="answer-button" class="btn btn-success btn-sm" onclick="join()">'
    + '<span class="glyphicon glyphicon-thumbs-up"></span></button>';
  rejectBtn = '<button type="button" id="reject-button" class="btn btn-danger btn-sm" onclick="rejectConference()">' +
    '<span class="glyphicon glyphicon-thumbs-down"></span></button>';

  setMessage('<h6>Invitation to join conference from: ' + from + (data.mediaType ? '. Media type: '
    + data.mediaType : '') + '. Time: ' + data.timestamp + '</h6>' +  answerBtn + rejectBtn, 'call:incoming');

  document.getElementById('ringtone').play();
}

// Timestamp and the 'to' parameter is passed
function onDialing(data) {
  var to, cancelBtn;

  if (isNaN(data.to)) {
    to = data.to;
  } else {
    to = phone.formatNumber(data.to);
  }

  if (to.indexOf('@') > 0) {
    to = to.split('@')[0];
  }

  cancelBtn = '<button type="button" id="cancel-button" '
    + 'class="btn btn-danger btn-sm" onclick="cancel()">'
    + '<span class="glyphicon glyphicon-thumbs-down"></span></button>';

  setMessage('<h6>Dialing: ' + to
    + (data.mediaType ? '. Media type: ' + data.mediaType : '')
    + '. Time: ' + data.timestamp + '</h6>'
    +  cancelBtn, 'call-dialing');
}

function onInvitationSent() {
  setMessage('Invitation sent...');
}

function onInviteAccepted() {
  setMessage('Invite accepted.');
}

function onInviteRejected() {
  setMessage('Invite rejected.');
  resetUI();
}

function onParticipantRemoved() {
  hideParticipants();
  showParticipants();
}

// This event callback gets invoked when an outgoing call flow is initiated and the call state is changed to connecting state
function onConnecting(data) {
  var peer, cancelBtn;

  if (undefined !== data.from) {
    peer = data.from;
  } else if (undefined !== data.to) {
    peer = data.to;
  }

  if (!isNaN(peer)) {
    peer = phone.formatNumber(peer);
  }

  if (peer.indexOf('@') > 0) {
    peer = peer.split('@')[0];
  }

  if (undefined !== data.to) {
    cancelBtn = '<button type="button" id="cancel-button" '
      + 'class="btn btn-danger btn-sm" onclick="cancel()">'
      + '<span class="glyphicon glyphicon-thumbs-down"></span></button>';
  }

  setMessage('<h6>Connecting to: ' + peer
    + (data.mediaType ? '. Media type: ' + data.mediaType : '')
    + '. Time: ' + data.timestamp + '</h6>'
    +  (cancelBtn || ''), 'call:connecting');

  document.getElementById('calling-tone').play();
}

function onCallRingbackProvided() {
  document.getElementById('calling-tone').pause();
}

function onCallConnected(data) {
  var peer = data.from || data.to;

  if (!isNaN(peer)) {
    peer = phone.formatNumber(peer);
  }

  setMessage('<h6>Connected to call ' + (data.from ? 'from ' : 'to ') + peer +
    (data.mediaType ? ". Media type: " + data.mediaType : '') +
    (data.downgrade ? '. (Downgraded from video)' : '') +
    '. Time: ' + data.timestamp + '<h6>');

  document.getElementById('calling-tone').pause();
  document.getElementById('btn-hangup').disabled = false;

  //TODO: Remove this after fixing this defect.
  //media established is not being fired the first time call is connected
  document.getElementById('btn-hold').disabled = false;
  document.getElementById('btn-resume').disabled = false;
  document.getElementById('btn-mute').disabled = false;
  document.getElementById('btn-unmute').disabled = false;
  document.getElementById('btn-resume').disabled = false;
  document.getElementById('btn-move').disabled = false;
}

function onCallSwitched(data) {
  setMessage('<h6>Switched call: from ' + data.from + ' to ' + data.to +
    '. Time: ' + data.timestamp + '<h6>');
  document.getElementById('btn-switch').disabled = false;
  document.getElementById('btn-transfer').disabled = false;
}

function onConferenceConnected(data) {
  setMessage('In conference. ' +
    (data.mediaType ? ". Media type: " + data.mediaType : '') +
    '. Time: ' + data.timestamp + '<h6>');

  document.getElementById('calling-tone').pause();
  document.getElementById('participant').disabled = false;
  document.getElementById('btn-add-participant').disabled = false;
  document.getElementById('btn-end-conference').disabled = false;
  document.getElementById('btn-participants-list').disabled = false;
}

// This event callback gets invoked when an outgoing call flow is initiated and the call state is changed to call established state
function onMediaEstablished() {
  document.getElementById('btn-hold').disabled = false;
  document.getElementById('btn-resume').disabled = false;
  document.getElementById('btn-mute').disabled = false;
  document.getElementById('btn-unmute').disabled = false;
  document.getElementById('btn-resume').disabled = false;
  document.getElementById('btn-move').disabled = false;
}

function onAnswering(data) {
  var from;

  if (isNaN(data.from)) {
    from = data.from;
  } else {
    from = phone.formatNumber(data.from);
  }

  setMessage('<h6>Answering: ' + from +
    (data.mediaType ? ". Media type: " + data.mediaType : '') +
    '. Time: ' + data.timestamp + '<h6>');

  document.getElementById('ringtone').pause();
}

function onJoiningConference(data) {
  var from;

  if (isNaN(data.from)) {
    from = data.from;
  } else {
    from = phone.formatNumber(data.from);
  }

  setMessage('<h6>Joining conference initiated by: ' + from +
    (data.mediaType ? ". Media type: " + data.mediaType : '') +
    '. Time: ' + data.timestamp + '<h6>');

  document.getElementById('ringtone').pause();
}

function onCallMuted() {
  document.getElementById('btn-mute').disabled = true;
  document.getElementById('btn-unmute').disabled = false;
}

function onCallUnmuted() {
  document.getElementById('btn-unmute').disabled = true;
  document.getElementById('btn-mute').disabled = false;
}


// This event callback gets invoked when a call is put on hold
function onCallHold(data) {
  setMessage('Call on hold. Time: ' + data.timestamp);
  resetUI();
  if (true === holder) {
    document.getElementById('btn-resume').disabled = false;
  }
}

// This event callback gets invoked when a call is in resumed state.
function onCallResume(data) {
  setMessage('Call resumed. Time: ' + data.timestamp);
  enableUI();
}

function onConferenceHold(data) {
  setMessage('Conference on hold. Time: ' + data.timestamp);
  document.getElementById('btn-hold').disabled = true;
  document.getElementById('btn-resume').disabled = false;
}

function onConferenceResumed(data) {
  setMessage('Conference resumed. Time: ' + data.timestamp);
  enableUI();
}

function onCallDisconnecting(data) {
  setMessage('Disconnecting. Time: ' + data.timestamp);
}

function onConferenceDisconnecting(data) {
  setMessage('Disconnecting conference. Time: ' + data.timestamp);
}

function onTransferring(data) {
  setMessage('Call Transfer Initiated Successfully' + '.' + ' Time: ' + data.timestamp);
}

function onTransferred(data) {
  setMessage('Call Transfer Successfully' + '.' + ' Time: ' + data.timestamp);
}

function onCallDisconnected(data) {

  var peer = data.from || data.to, allCalls;

  buttons = {
    hangup: document.getElementById('btn-hangup'),
    resume: document.getElementById('btn-resume'),
    switch: document.getElementById('btn-switch')
  };

  if (!isNaN(peer)) {
    peer = phone.formatNumber(peer);
  }

  setMessage('Call ' + (data.from ? ('from ' + peer) : ('to '  + peer)) + ' disconnected' +
    (data.message ? '. ' + data.message : '') + '. Time: ' + data.timestamp);
  resetUI();

  allCalls = phone.getCalls();
  if (1 === allCalls.length && 'held' === allCalls[0].state) {
    buttons.hangup.disabled = false;
    buttons.resume.disabled = false;
    buttons.switch.disabled = true;
  }
}

function onConferenceCanceled(data) {
  setMessage('Conference canceled. Time: ' + data.timestamp);
  resetUI();
}

function onConferenceEnded(data) {
  setMessage('Conference ended. Time: ' + data.timestamp);
  resetUI();
}

function onCallCanceled(data) {
  var peer = data.from || data.to, allCalls;

  if (!isNaN(peer)) {
    peer = phone.formatNumber(peer);
  }

  setMessage('Call ' + (data.from ? ('from ' + peer) : ('to '  + peer)) + ' canceled.' + ' Time: ' + data.timestamp);
  resetUI();

  buttons = {
    resume: document.getElementById('btn-resume')
  };

  allCalls = phone.getCalls();
  if (1 === allCalls.length && 'held' === allCalls[0].state) {
    buttons.resume.disabled = false;
  }
}

function onCallRejected(data) {
  var peer = data.from || data.to;

  if (!isNaN(peer)) {
    peer = phone.formatNumber(peer);
  }

  setMessage('Call ' + (data.from ? ('from ' + peer) : ('to '  + peer)) + ' rejected.' + ' Time: ' + data.timestamp);
  document.getElementById('ringtone').pause();
  document.getElementById('calling-tone').pause();
}

function onAddressUpdated() {
  document.getElementById("address-box").style.display = 'none';
  setMessage('Updated E911 address successfully');
}

//Callback function which invokes SDK login method once the user successfully logged into DHS
function loginSuccessCallback(data) {
  try {
    if (!data) {
      throw 'No login response data received';
    }

    log(JSON.stringify(data));

    ATT.utils.extend(sessionData, data); // store user data and token for Virtual Number/Account ID

    if (data.user_type === 'VIRTUAL_NUMBER') {// Virtual Number response
      switchView('address');
    } else { // Account ID response
      // if no error after login to dhs, create web rtc session
      loginEnhancedWebRTC(sessionData.access_token);
    }
  } catch (err) {
    onError(err);
  }
}

// Checks if the passed email address is valid
function isValidEmail(input) {
  var atPos = input.indexOf('@'),
    dotPos = input.lastIndexOf('.');
  if (atPos < 1 || dotPos < atPos + 2 || dotPos + 2 >= input.length) {
    return false;
  }
  return true;
}

//Can get a formatted phone number from the public API
function cleanupCallee(callee) {

  if (isValidEmail(callee)) {
    return callee;
  }

  return phone.cleanPhoneNumber(callee);
}

function appendDomainToAccountIDCallee(callee) {
  // check if it's a number or has a domain
  if (undefined === callee) {
    return callee;
  }
  if (!isNaN(callee)) {
    return ATT.phoneNumber.translate(callee.replace(/ /g, ''));
  }
  if (isValidEmail(callee)) {
    return callee;
  }
  return callee + '@' + eWebRTCDomain;
}


function cleanupNumber() {
  var callee = document.forms.callForm.callee.value,
    cleanNumber;

  if (isValidEmail(callee)) {
    setMessage(callee + ' is a valid e-mail address');
    return;
  }

  cleanNumber = cleanupCallee(callee);

  //for invalid number  it will go inside the If loop
  if (!cleanNumber) {
    setError("The number " + callee + " cannot be recognised ");
    return;
  }

  setMessage(phone.formatNumber(cleanNumber));
}

