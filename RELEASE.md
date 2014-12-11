# AT&T Enhanced WebRTC JS SDK

This SDK includes the following components:

* JavaScript library - a client library to consume the AT&T Enhanced WebRTC API.
* Node.js sample application - a Web app demonstrating the features
of the JavaScript library.   **Please refer to `node-sample/RELEASE.md` for sample app-specific notes**.
* DHS - a Node.js server for managing application assets such as app key and app secret, and generating OAuth access tokens and E911 IDs. **Please refer to [node-dhs/RELEASE.md](node-dhs/RELEASE.md) for DHS-specific notes**.

## Features of the JavaScript library

The following features and functionality are available in the current SDK release for all three supported calling types (AT&T Mobile Number, Virtual Number, and Account ID):

### Chrome v39

*	**Basic audio and video call management** – make, receive, answer, end, mute, unmute, hold, resume, cancel, and reject calls.
*	**Basic audio and video conferencing** – create a conference, add and remove participants, hold, resume, mute, unmute and end conference.
  *	Supports dialing out to add participants.
*	**Advanced call management** – move, transfer, add a second call, switch between two calls.
  *	Audio and video calls can be moved Web-to-Web
  *	Audio calls can be moved from the Web to an AT&T mobile phone


### Firefox v33

*	**Basic audio and video call management** – make, receive, answer, end, mute, unmute, hold, resume, cancel, and reject calls.
*	**Basic audio and video conferencing** – create a conference, add and remove participants, hold, resume, mute, unmute and end conference.
  *	Supports dialing out to add participants.

### Upcoming features

The following features will be added soon:

*	Move a Web video call to an audio call on an AT&T mobile phone
*	DTMF (dialing) tones
*	Upgrade or downgrade between audio and video
*	Firefox browser support

# v1.0.0-rc.9

December 31, 2014

* Enhancement: improves call establishment time.
* Change: less verbose logging.
* Change: provide full user name on event data for all phone events.

## Known Issues

* Canceling to give consent to a Mobile Number results in redirecting the user to an access denied error page. 
* Resuming a video conference from the participant side results in no video on both host and participant sides. 
* Transferring a call between Mobile Number and Account ID to a Virtual Number, the Virtual Number user will not get the video of the Account ID. 
* Transfer doesn't work if the transferer switched to the first call before transferring the call. 
* A background call will auto resume if the user moves his call to another device. 
* Switching to the background call on Chrome Windows results in no media in the call. 
* Transferring a call fails with HTTP error code `409` when an Account ID user transfers to a Mobile Device. 
* Moving a call from a Mobile Number to a Mobile Device will fail when the call is between Mobile Number and a (non-provisioned) Mobile Device. 
* Adding (non-provisioned) Mobile Device as a participant to a conference results in one way audio with the notification `Media conference forbidden for this recipient`. 
* Adding Account ID participant to a conference when the host is Virtual Number fails with message: `User Not Found`. 
* List of participants is not cleared when ending a conference. 
* `Phone.transfer` fails with error `Transfer terminated by Network` when the transfer target is an Account ID or Virtual Number user.
* `call:move-terminated` event is not fired when successfully completing `phone.move`.
* After successfully adding a Mobile Device to a Conference it will be disconnected after ~24s.
* Adding multiple participants at once using `Phone.addParticipants` method fails with error: `SVC8501:MediaConference ongoing update participant operation.,Variables=`. Use `Phone.addParticipants`
with a single participant ID (Mobile Number, Account ID, Virtual Number) and wait for that participant to
successfully join (i.e., event `conference:invitation-accepted`), then invite the next participant.
* When a participant leaves a conference by using the `endConference` method, the platform does not generate
the necessary event to inform the host.
* When an Mobile Number user rejects an invitation for a conference, sometimes the event `conference:ended` will not
be published due to a bug at the platform level.
* When adding a participant to a conference, sometimes the error: `The requested conference ID <id> was not found.`
is shown.
* Video switching between participants is sometimes inconsistent. Turn off your microphone while the other participant speaks, that will switch the video to the speaking participant.

## Notes

* Establishing calls with Firefox is notably slower than doing so with Chrome.

## Tested Environments

* Chrome Version 39.0 for OSX v10.8.5 and Windows 8
* Firefox Version 33.1 for OSX v10.8.5 and Windows 8

**_The SDK may also work for other Operating Systems, other Browsers but is not tested or supported._**


# Changelog

## v1.0.0-rc.7

### Features

#### Chrome v39

*	Basic audio and video call management – make, receive, answer, end, mute, unmute, hold, resume, cancel, and reject calls
*	Basic audio and video conferencing – create a conference, add and remove participants, hold, resume, mute, unmute and end conference
*	Advanced call management – move, transfer, add a second call, switch between two calls
*	Audio and video calls can be moved browser-to-browser
*	Audio calls can be moved from the browser to an AT&T mobile phone.


#### Firefox v33

*	Basic audio and video call management – make, receive, answer, end, mute, unmute, hold, resume, cancel, and reject calls
*	Basic audio and video conferencing – create a conference, add and remove participants, hold, resume, mute, unmute and end conference
