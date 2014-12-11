# Node.js DHS for the AT&T Enhanced WebRTC JavaScript SDK

This Node.js Developer Hosted Server (DHS) is a node application that enables you to manage the following:

* Configuration options for the SDK's sample application
* App configuration (app key, app secret, redirect_uri, etc.)
* AT&T OAuth token creation using credentials and scope
* E911 ID creation

# v1.0.0

December 7, 2014

* **Features:**
  * Configuration file for AT&T Developer Program enrollment assets (application key and secret, redirect_uri).
  * RESTful API:
    * `/config` - Environment options necessary to configure the SDK.
    * `/tokens` - AT&T's OAuth use to generate Access Tokens
    * `/e911ids` - Create E911 Ids
  * **Documentation:**
    * Instructions for DHS setup and configuration for different environments
    * Description of the RESTful API calls made by the DHS


### Known Issues

* DHS Configuration: Virtual Numbers must be valid 10-digit phone numbers.
