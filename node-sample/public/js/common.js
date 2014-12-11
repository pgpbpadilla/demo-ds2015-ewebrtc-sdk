// # AT&T's Enhanced WebRTC Javascript SDK tutorial
// ---------------------------------

// ## JSLint configuration
// --------------

/*jslint browser: true, devel: true, node: true, debug: true, todo: true, indent: 2, maxlen: 150*/

// Make JSLint aware of variables and functions that are defined in other files.
/*global ATT, unsupportedBrowserError, loadView, checkEnhancedWebRTCSession, loadDefaultView, addCall,
  onSessionReady, onSessionDisconnected, onAddressUpdated, onError, onWarning,
  onDialing, onIncomingCall, onConnecting, onCallConnected, onMediaEstablished, onEarlyMedia,
  onAnswering, onCallMuted, onCallUnmuted, onCallHold, onCallResume,
  onCallDisconnecting, onCallDisconnected, onCallCanceled, onCallRejected,
  onConferenceConnected, onConferenceDisconnected, onConferenceInvite, onConferenceCanceled, onConferenceEnded,
  onJoiningConference, onInvitationSent, onInviteAccepted, onInviteRejected, onParticipantRemoved,
  onConferenceDisconnecting, onConferenceHold, onConferenceResumed,
  onNotification, onCallSwitched, onCallRingbackProvided, onTransferring, onTransferred*/

'use strict';

var phone,
  eWebRTCDomain,
  bWebRTCSupportExists;

// ### Check if the current browser has WebRTC capability
// ---------------------------------
//Check to see whether browser [**has WebRTC**](../../lib/webrtc-sdk/doc/ATT.browser.html#hasWebRTC) support using Media Service API
bWebRTCSupportExists = ('Not Supported' !== ATT.browser.hasWebRTC());

if (!bWebRTCSupportExists) {
  throw unsupportedBrowserError();
}

// ## SDK Setup
// -----------
// In order to make calls, you first need to
// setup the environment that the library will use and also
// make sure the browser supports Enhanced WebRTC.

// ### Configure the SDK
// ---------------------------------
// The purpose of [**ATT.rtc.configure**](../../lib/webrtc-sdk/doc/ATT.rtc.html#configure) is to configure the Enhanced
// WebRTC Domain and Enhanced WebRTC API endpoint.
// There are two ways in which this method can be used:
//
// * Using the Node DHS provided together with the sample application. To do this
// just pass the `success` callback and optionally an `error` callback. The library will
// query the DHS to obtain the correct configuration options: Enhanced WebRTC Domain and Enhanced WebRTC API Endpoint.
//```javascript
//  ATT.rtc.configure(function () { // success callback
// ...}, function () { // optional error callback
// ... });
//```
// * Using configuration options obtained using your own DHS. To do this just pass an object containing
// the Enhanced WebRTC Domain and optionally the Enhanced WebRTC API Endpoint (see API Documentation for usage examples).
//```javascript
//ATT.rtc.configure({
//  ewebrtc_domain: 'my.domain.com',
//  api_endpoint: 'https://api.att.com' // optional Enhanced WebRTC API endpoint
//});
//```
//-------

ATT.rtc.configure(function () {

  // On successfully obtaining the configuration we will get the [**Enhanced WebRTC Domain**](../../lib/webrtc-sdk/doc/ATT.rtc.html#getEWebRTCDomain)
  eWebRTCDomain = ATT.rtc.getEWebRTCDomain();

  // and load the default view into the browser
  loadDefaultView();

}, onError);

// ## The Phone Object
// -----------
// Every action for Call & Conference Management is done
// via the Phone's interface.

// ### Getting the phone object
// ---------------------------------
// Phone object is the main interface for making a call.
// This will be our instance of the Phone object.
phone = ATT.rtc.Phone.getPhone();

// ## Error Handling
// -----------------
// All errors during the usage of the Phone object are published
// via the [**error**](../../lib/webrtc-sdk/doc/Phone.html#event:error) event.

// ### Registering for _error_ event
// ---------------------------------
// Here the [**error**](../../lib/webrtc-sdk/doc/Phone.html#event:error) event is published after receiving an error
//
// **Callback function example:**
//
// <pre>
// function onError(data) {
//   error = data.error
// }
// </pre>
phone.on('error', onError);

// ## Warning Handling
// -----------------
// All warnings during the usage of the Phone object are published
// via the [**warning**](../../lib/webrtc-sdk/doc/Phone.html#event:warning) event.

// ### Registering for _warning_ event
// ---------------------------------
// Here the [**warning**](../../lib/webrtc-sdk/doc/Phone.html#event:warning) event is published after receiving a warning
//
// **Callback function example:**
//
// <pre>
// function onWarning(data) {
//   var message = data.message;
// }
// </pre>
phone.on('warning', onWarning);

// # Session Management

// ## Login to Enhanced WebRTC
// ### Register for _address updated_ event
// ---------------------------------
// The [**address-updated**](../../lib/webrtc-sdk/doc/Phone.html#event:address-updated) event is published after successfully updating your E911 ID.
//
// **Callback function example:**
//
// <pre>
// function onAddressUpdated(data) {
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('address-updated', onAddressUpdated);

// ### Register for _session:ready_ event
// ---------------------------------
// The [**session:ready**](../../lib/webrtc-sdk/doc/Phone.html#event:session:ready) event is published after
// successfully logged in to the Enhanced WebRTC.
// This event indicates that the SDK is ready to make or receive calls.
//
// **Callback function example:**
//
// <pre>
// function onSessionReady(data) {
//   sessionId = data.sessionId;
//   profile = data.name;
//   userid = data.userid;
//   type = data.type;
//   message = data.message;
// }
// </pre>
phone.on('session:ready', onSessionReady);

// ### Register for _notification_ event
// ---------------------------------
// The [**notification**](../../lib/webrtc-sdk/doc/Phone.html#event:notification) event publishes SDK notifications
// about the unhandled SDK behavior that is not an error.
//
// **Callback function example:**
//
// <pre>
// function onNotification(data) {
//   message = data.message;
// }
// </pre>
phone.on('notification', onNotification);

// ### Create Enhanced WebRTC Session
// ---------------------------------
function loginEnhancedWebRTC(token, e911Id) {
//[**phone.login**](../../lib/webrtc-sdk/doc/Phone.html#login) establishes Enhanced WebRTC session so that the user can
// start making Enhanced WebRTC calls.
//
// - `token` is the oAuth token you get from the consent
//
// - `[e911Id]` is e911 address identifier
  phone.login({
    token: token,
    e911Id: e911Id ? e911Id.e911Locations.addressIdentifier : null
  });
}

// ### Updating the address
// ---------------------------------
function updateAddress(e911Id) {
//Given that the user is logged in, you can use the [**phone.associateE911Id**](../../lib/webrtc-sdk/doc/Phone.html#associateE911Id)
//method to update the user's e911 linked address like:

  phone.associateE911Id({
    // you can get the E911 ID using the [**phone.createE911Id**](../../lib/webrtc-sdk/doc/ATT.rtc.dhs.html#createE911Id)
    e911Id: e911Id
  });
}

// ## Logout from Enhanced WebRTC
// ### Register for _session:disconnected_ event
// ---------------------------------
// The [**session:disconnected**](../../lib/webrtc-sdk/doc/Phone.html#event:session:disconnected) event is published
// after logging out from Enhanced WebRTC session.
// This event is published to indicate that the session was successfully deleted.
phone.on('session:disconnected', onSessionDisconnected);

// ### Clear the current Enhanced WebRTC session
// ---------------------------------
function phoneLogout(callback) {
  if (checkEnhancedWebRTCSession()) {
    phone.on('error', function (data) {
      if (data.error && data.error.JSMethod === 'logout') {
        callback();
      }
    });
    phone.on('session:disconnected', function () {
      callback();
    });
//[**phone.logout**](../../lib/webrtc-sdk/doc/Phone.html#logout) logs out the user from Enhanced WebRTC session.
    phone.logout();
  }
}


// # Basic Call Management
// ## Making a call
// ---------------------------------

// A call object will publish various events as it progresses
// through its lifecycle. In order to handle those events you must
// register handlers as follows:

// ### Register for _call:connecting_ event
// ---------------------------------
// Here the [**call:connecting**](../../lib/webrtc-sdk/doc/Phone.html#event:call:connecting) event is published after successfully dialing out.
//
// **Callback function example:**
//
// <pre>
// function onConnecting(data) {
//   to = data.to;
//   mediaType = data.mediaType;
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('call:connecting', onConnecting);

// ### Register for _call:ringback-provided_ event
// ---------------------------------
// Here the [**call:ringback-provided**](../../lib/webrtc-sdk/doc/Phone.html#event:call:ringback-provided) event is
// published if early media (such as a ring-tone) becomes available during the initial call setup.
//
// **Callback function example:**
//
// <pre>
// function onCallRingbackProvided(data) {
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('call:ringback-provided', onCallRingbackProvided);

// ### Register for _call:connected_ event
// ---------------------------------
// The [**call:connected**](../../lib/webrtc-sdk/doc/Phone.html#event:call:connected) event is published when a connection is established
// between two parties.
//
// **Callback function example:**
//
// <pre>
// function onCallConnected(data) {
//   mediaType = data.mediaType;
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('call:connected', onCallConnected);

// ### Register for _media:established_ event
// ---------------------------------
// The [**media:established**](../../lib/webrtc-sdk/doc/Phone.html#event:media:established) event is published when media begins to play.
//
// **Callback function example:**
//
// <pre>
// function onMediaEstablished(data) {
//   to = data.to;
//   mediaType = data.mediaType;
//   timestamp = data.timestamp;
//   codec = data.codec;
// }
// </pre>
phone.on('media:established', onMediaEstablished);

// ### Register for _call:disconnected_ event
// ---------------------------------
// The [**call:disconnected**](../../lib/webrtc-sdk/doc/Phone.html#event:call:disconnected) event is published after
// successfully disconnecting the call.
phone.on('call:disconnected', onCallDisconnected);


// ### Register for _call:canceled_ event
// ---------------------------------
// The [**call:canceled**](../../lib/webrtc-sdƒk/doc/Phone.html#event:call:canceled) event is published after
// successfully canceling a call.
//
// **Callback function example:**
//
// <pre>
// function onCallCanceled(data) {
//   to = data.to;
//   mediaType = data.mediaType;
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('call:canceled', onCallCanceled);


// ### Register for _dialing_ event
// ---------------------------------
// The [**dialing**](../../lib/webrtc-sdk/doc/Phone.html#event:dialing) event is published immediately after dial method is invoked.
phone.on('dialing', onDialing);

// ### Dialing
// ---------------------------------

function dialCall(callee, mediaType, localMedia, remoteMedia) {

// Once you have registered handlers for all appropriate
// events you can use the [**phone.dial**](../../lib/webrtc-sdk/doc/Phone.html#dial) method on Phone to start a call.

  // If there's already a call in progress
  if (phone.isCallInProgress()) {
    // handle this call with the [**phone.addCall**](../../lib/webrtc-sdk/doc/Phone.html#addCall) method
    addCall(callee, mediaType, localMedia, remoteMedia);
  } else {
    // otherwise just the [**phone.dial**](../../lib/webrtc-sdk/doc/Phone.html#dial) method. You need to pass:
    phone.dial({
      // - a valid Mobile Number, Account ID, Virtual Number user identifier, e.g.:
      //   * `11231231234`,
      //   * `123*321-1234`
      //   * `user@domain.com`
      //   * `1800CALLFED`
      //   * `911`

      destination: callee,
      // - a valid call type:
      //   * `audio` for audio-only calls and
      //   * `video` for video calls
      mediaType: mediaType,
      // - the `HTMLVideoElement` to use for the local stream,
      localMedia: localMedia,
      // - and the `HTMLVideoElement` to use for the remote stream.
      remoteMedia: remoteMedia
    });
  }
}

// ## Receiving calls
// ### Register for _call:incoming_ event
// ---------------------------------

// In order to handle incoming calls, you need to register
// a handler for the [**call:incoming**](../../lib/webrtc-sdk/doc/Phone.html#event:call:incoming) event on the Phone object.

phone.on('call:incoming', onIncomingCall);

// You also need to register handlers for the other events that
// are published during the process of answering a call.

// ### Register for _answering_ event
// ---------------------------------
// The [**answering**](../../lib/webrtc-sdk/doc/Phone.html#event:answering) event is published immediately when the other party answers the call
phone.on('answering', onAnswering);

// ### Answer an incoming call
// --------------

function answer(localMedia, remoteMedia) {
  // Once you have registered to receive calls, you can use the
  // [**phone.answer**](../../lib/webrtc-sdk/doc/Phone.html#answer) method on the Phone object to answer an incoming call,
  // it receives:
  phone.answer({
    // - the `HTMLVideoElement` object to use for the local stream
    localMedia: localMedia,
    // - the `HTMLVideoElement` object to use for the remote stream.
    remoteMedia: remoteMedia
  });
}

// ## Managing a second call
// Once a call is in progress, you can make a second call or receive
// a second incoming call. Use [**phone.isCallInProgress**](../../lib/webrtc-sdk/doc/Phone.html#isCallInProgress) to
// check whether there is a call in progress.

// ### Making a second call
// --------------

// The second call will publish the same events that we have already covered in previous
// sections of the tutorial.

function addCall(callee, mediaType, localMedia, remoteMedia) {

  // Use the [**phone.addCall**](../../lib/webrtc-sdk/doc/Phone.html#addCall) method to make a second call when there is a first call in progress.
  // You need to pass:
  phone.addCall({
    // - a valid Mobile Number, Account ID, Virtual Number user identifier, e.g.:
    //   * `11231231234`,
    //   * `123*321-1234`
    //   * `user@domain.com`
    //   * `1800CALLFED`
    //   * `911`
    destination: callee,
    // - a valid call type:
    //   * `audio` for audio-only calls and
    //   * `video` for video calls
    mediaType: mediaType,
    // - the `HTMLVideoElement` to use for the local stream,
    localMedia: localMedia,
    // - and the `HTMLVideoElement` to use for the remote stream.
    remoteMedia: remoteMedia
  });
}

// ### Answering a second call
// --------------

// Once you have an active call, you can handle a second incoming call using the
// [**phone.answer**](../../lib/webrtc-sdk/doc/Phone.html#answer) method.

function answer2ndCall(localMedia, remoteMedia, action) {
  // The [**phone.answer**](../../lib/webrtc-sdk/doc/Phone.html#answer) method receives:
  phone.answer({
    // - the `HTMLVideoElement` object to use for the local stream
    localMedia: localMedia,
    // - the `HTMLVideoElement` object to use for the remote stream.
    remoteMedia: remoteMedia,
    // - an optional `action` (`hold` or `end`) to indicate whether to hold or end the current call.
    // Use [**phone.isCallInProgress**](../../lib/webrtc-sdk/doc/Phone.html#isCallInProgress) to check whether there is a call in progress.
    action: action
  });
}

//
// ## Operations for ongoing calls
// Once a call is ongoing, you can perform basic operations with
// them like muting, unmuting, holding, resuming, canceling and hanging up.

// ### Rejecting incoming calls
// ---------------------------------
// Register for [**call:rejected**](../../lib/webrtc-sdk/doc/Phone.html#event:call:rejected) event, it is published the call
// is rejected by the receiving party
phone.on('call:rejected', onCallRejected);

function reject() {
  // Use the [**phone.reject**](../../lib/webrtc-sdk/doc/Phone.html#reject) method to reject the incoming call
  phone.reject();
}

// ### Muting the call
// ---------
// Register for [**call:muted**](../../lib/webrtc-sdk/doc/Phone.html#event:call:muted) event,
// it is published when [**phone.mute**](../../lib/webrtc-sdk/doc/Phone.html#mute) is invoked
phone.on('call:muted', onCallMuted);

function mute() {
  // Then use the [**phone.mute**](../../lib/webrtc-sdk/doc/Phone.html#mute) method to mute the current call.
  phone.mute();
}

// ### Unmute a call
// ---------------------------------

// Register for [**call:unmuted**](../../lib/webrtc-sdk/doc/Phone.html#event:call:unmuted) event, it is
// published when [**phone.unmute**](../../lib/webrtc-sdk/doc/Phone.html#unmute) is invoked.
phone.on('call:unmuted', onCallUnmuted);

function unmute() {
  // Use the [**phone.unmute**](../../lib/webrtc-sdk/doc/Phone.html#unmute) method to unmute the current call
  phone.unmute();
}

// ### Put a call on hold
// ---------------------------------
// Register for [**call:held**](../../lib/webrtc-sdk/doc/Phone.html#event:call:held) event, it is published when call is on hold.
phone.on('call:held', onCallHold);

function hold() {
  // Use the [**phone.hold**](../../lib/webrtc-sdk/doc/Phone.html#hold) method to put the current call or conference on hold.
  phone.hold();
}

// ### Resume a call that is on hold
// ---------------------------------
// Register for [**call:resumed**](../../lib/webrtc-sdk/doc/Phone.html#event:call:resumed) event, it is published when
// [**phone.resume**](../../lib/webrtc-sdk/doc/Phone.html#resume) is invoked
phone.on('call:resumed', onCallResume);

function resume() {
  // Use the [**phone.resume**](../../lib/webrtc-sdk/doc/Phone.html#resume) method to resume the current call or conference.
  phone.resume();
}

// ### Move a call to a different client
// -------------------------------------
// Use the [**phone.move**](../../lib/webrtc-sdk/doc/Phone.html#move) method to move the call to another client.
// All clients currently logged in with the same Id will receive a call.
// This method can also be used to move a call to a handheld device.
function move() {
  // The other devices will start ringing, i.e., the [**Phone**](../../lib/webrtc-sdk/doc/Phone.html) object in the other
  // clients will emit a [**call:incoming**](../../lib/webrtc-sdk/doc/Phone.html#event:call:incoming).
  // [**Phone**](../../lib/webrtc-sdk/doc/Phone.html) will emit the same events as if it was a regular call.
  phone.move();

}

// ### Register for _session:call-switched_ event
// ---------------------------------
// The [**session:call-switched**](../../lib/webrtc-sdk/doc/Phone.html#event:session:call-switched) event is published
// when the current active call is switched
//
// **Callback function example:**
//
// <pre>
// function onCallSwitched(data) {
//   from = data.from;
//   to = data.to;
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('session:call-switched', onCallSwitched);

// ### Switch between two calls or conferences.
// -------------------------------------
// Use the [**phone.switchCall**](../../lib/webrtc-sdk/doc/Phone.html#switchCall) method to switch between two ongoing calls/conferences.
function switchCalls() {
  // The foreground call/conference wil be put on hold and will be moved to background, 
  // and the background call/conference will be brought to foreground.
  phone.switchCall();
}


// ### Register for _call:transferring_ event
// ---------------------------------
// The `call:transferring` event is published when call transfer is initiated
//
// **Callback function example:**
//
// <pre>
// function onTransferring(data) {
//   from = data.from;
//   to = data.to;
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('call:transferring', onTransferring);

// ### Register for _call:transferred_ event
// ---------------------------------
// The `call:transferred` event is published after a call has been successfully transferred
//
// **Callback function example:**
//
// <pre>
// function onTransferred(data) {
//   from = data.from;
//   to = data.to;
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('call:transferred', onTransferred);

// ### Transfer one call to another
// -----------------------------------------
function transfer() {
  // Use the [**phone.transfer**](../../lib/webrtc-sdk/doc/Phone.html#transfer) method to transfer existing call to another
  phone.transfer();
}

// ### Cancel an outgoing call
// ---------------------------------
function cancel() {
  // Use the [**phone.cancel**](../../lib/webrtc-sdk/doc/Phone.html#cancel) method to cancel the outgoing call.
  phone.cancel();
}

// ### Hangup a call
// ---------------------------------
// Register for [**call:disconnecting**](../../lib/webrtc-sdk/doc/Phone.html#event:call:disconnected) event, it is published
// immediately after invoking [**phone.hangup**](../../lib/webrtc-sdk/doc/Phone.html#hangup)
phone.on('call:disconnecting', onCallDisconnecting);

function hangup() {
  //  Use the [**phone.hangup**](../../lib/webrtc-sdk/doc/Phone.html#hangup) method to hang up the current call.
  phone.hangup();
}

// # Conference Management

// ## Creating a conference (Host)
// A conference will publish various events as it progresses its lifecycle.
// In order to handle those events you must register handlers as follows:

// ### Register for _conference:connecting_ event
// -----------------------------------------------
// Here the [**conference:connecting**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:connecting) event
// is published while starting a conference.
//
// **Callback function example:**
//
// <pre>
// function onConnecting(data) {
//   to = data.to;
//   mediaType = data.mediaType;
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('conference:connecting', onConnecting);

// ### Register for _conference:connected_ event
// ---------------------------------
// The [**conference:connected**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:connected) event is published
// when the conference has been created or joined.
//
// **Callback function example:**
//
// <pre>
// function onConferenceConnected(data) {
//   mediaType = data.mediaType;
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('conference:connected', onConferenceConnected);

// ### Register for _conference:canceled_ event
// ---------------------------------
// The [**conference:canceled**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:canceled) event is published after
// the conference is canceled.
//
// **Callback function example:**
//
// <pre>
// function onConferenceCanceled(data) {
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('conference:canceled', onConferenceCanceled);

// ### Register for _conference:ended_ event
// ---------------------------------
// The [**conference:ended**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:ended) event is published after
// successfully ending the conference.
//
// **Callback function example:**
//
// <pre>
// function onConferenceEnded(data) {
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('conference:ended', onConferenceEnded);

//  ### Register for _conference:held_ event
// ---------------------------------
// The [**conference:held**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:held) event is published after a
// conference is successfully put on hold.
//
// **Callback function example:**
//
// <pre>
// function onConferenceHold(data) {
//   mediaType = data.mediaType;
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('conference:held', onConferenceHold);

// ### Register for _conference:resumed_ event
// ---------------------------------
// The [**conference:resumed**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:resumed) event is published when
// a conference is successfully resumed.
//
// **Callback function example:**
//
// <pre>
// function onConferenceResumed(data) {
//   mediaType = data.mediaType;
//   timestamp = data.timestamp;
// }
// </pre>
phone.on('conference:resumed', onConferenceResumed);

// ## Starting the conference
// ---------------------------------

function startConference(mediaType, localMedia, remoteMedia) {
  // Once you have registered handlers for all appropriate
  // events you can use the [**phone.startConference**](../../lib/webrtc-sdk/doc/Phone.html#startConference) method to create
  // a conference. You must pass:

  phone.startConference({
    // a valid media type for this conference:
    // * `audio` for audio-only calls and
    // * `video` for video calls
    mediaType: mediaType,
    // the `HTMLVideoElement` to use for the local stream,
    localMedia: localMedia,
    // and the `HTMLVideoElement` to use for the remote stream.
    remoteMedia: remoteMedia
  });
}

// ## Receiving Conference Invites
// In order to handle conference invites, you must register for the
// following events on the Phone object:

// ### Register for _conference:invitation-received_ event
// ---------------------------------
// The [**conference:invitation-received**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:invitation-received)
// event is published when the other party receives invitation
//
phone.on('conference:invitation-received', onConferenceInvite);

// ### Register for _conference:joining_ event
// ---------------------------------
// The [**conference:joining**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:joining) event is published
// immediately when the other party accepts to join the conference
phone.on('conference:joining', onJoiningConference);

// ### Joining the conference

function joinConference(localMedia, remoteMedia) {
  // Use the [**phone.joinConference**](../../lib/webrtc-sdk/doc/Phone.html#joinConference) method to join a conference by accepting the invite.
  // You must pass in:
  phone.joinConference({
    // a valid `HTMLVideoElement` for the local media stream and
    localMedia: localMedia,
    // a valid `HTMLVideoElement` for the remote media stream.
    remoteMedia: remoteMedia
  });
}

// ## Operations during an ongoing Conference
// As the host of a Conference you can perform basic operations with
// them like:
// * adding/removing participants
// * getting the list of participants
// * holding the conference
// * resuming the conference
// * ending the conference

// ### Adding participants to a conference
// ---------------

// First you must register handlers for the events published
// during the process of adding a participant:

// The [**conference:invitation-sent**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:invitation-sent) event
// is published when the invitation was sent successfully.
phone.on('conference:invitation-sent', onInvitationSent);
// The [**conference:invitation-accepted**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:invitation-accepted)
// event is published when the invitation is accepted by the other party.
phone.on('conference:invitation-accepted', onInviteAccepted);
// The [**conference:invitation-rejected**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:invitation-rejected)
// event is published when the invitation is rejected by the other party.
phone.on('conference:invitation-rejected', onInviteRejected);

// Then use the [**phone.addParticipants**](../../lib/webrtc-sdk/doc/Phone.html#addParticipants) method to adds a list of participants, e.g.,
function addParticipants(participants) {
  // ```
  //   phone.addParticipants(['11231231234', 'john@domain.com']);
  // ```
  phone.addParticipants(participants);
}

// ### Removing Participants
// ---------------------------------

// First register for [**conference:participant-removed**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:participant-removed) event, which
// is published when the participant is successfully removed from the current conference.
phone.on('conference:participant-removed', onParticipantRemoved);

function removeParticipant(participant) {
  // Use the [**phone.removeParticipant**](../../lib/webrtc-sdk/doc/Phone.html#removeParticipant) method with the participant's ID
  // to remove a participant from the current conference, e.g.,
  phone.removeParticipant(participant);
  // ```
  // phone.removeParticipant('john@domain.com');
  // ```
}

// ### Get the list of active participants
// ---------------------------------
function getParticipants() {
  // Use the [**phone.getParticipants**](../../lib/webrtc-sdk/doc/Phone.html#getParticipants) method to get the list of active participants.
  return phone.getParticipants();
}

// ### Rejecting conference invites
// ---------------------------------
function rejectConference() {
  // Use the [**phone.rejectConference**](../../lib/webrtc-sdk/doc/Phone.html#rejectConference) method to reject the incoming conference invite.
  phone.rejectConference();
}

// ### Ending a conference
// ---------------------------------

// Register for [**conference:disconnecting**](../../lib/webrtc-sdk/doc/Phone.html#event:conference:disconnecting) event; it is published
// immediately after invoking [**phone.endConference**](../../lib/webrtc-sdk/doc/Phone.html#endConference).
phone.on('conference:disconnecting', onConferenceDisconnecting);

function endConference() {
  // Use the [**phone.endConference**](../../lib/webrtc-sdk/doc/Phone.html#endConference) method to end the current conference.
  phone.endConference();
}

// # Phone utilities

// The phone object provides utility methods for common tasks related phone number
// parsing and formatting.

// ## Parsing phone numbers
// ---------------------------------
function cleanPhoneNumber(phoneNum) {

  // In order to get the phone number in a format that the library can use to
  // dial, use the [**phone.cleanPhoneNumber**](../../lib/webrtc-sdk/doc/Phone.html#cleanPhoneNumber) method, it will convert numbers like
  // `+1 (123) 123 1234` to `11231231234`,
  // and `1800CALFEDX` to `18002253339`.
  return phone.cleanPhoneNumber(phoneNum);
}
