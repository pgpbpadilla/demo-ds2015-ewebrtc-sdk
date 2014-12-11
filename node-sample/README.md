# Sample Web App for AT&T Enhanced WebRTC JavaScript SDK

This sample app is a Node.js Web application for demonstrating the features of AT&T Enhanced WebRTC, and includes the following functionality:

* User management
* OAuth endpoint for Mobile Number authorization and callback
* Login and logout functionality for Virtual Number and Account ID users


## System requirements

* Chrome v39 - Windows, OS X
* Firefox v33 - Windows, OS X

## Contents of this Package

This package contains the software necessary to run the sample app:

- `/package.json` - Configuration options
- `/app.js` - Main Node.js program

## Configuring the DHS

Sample app configuration options are located in the file `/package.json`:

```javascript
...
"dhs_https_host": "localhost",
"dhs_https_port" : 10011,

"sample_http_port": 9000,
"sample_https_port": 9001,
...
```

## Running the DHS

1. Install Node.js dependencies: `$ npm install`
2. Execute the NPM `start` script `$ npm start`.
**Note**: The `start` script uses the Production environment by default.

## Loading the Sample App

1. Open a Chrome browser window or new tab.
2. Enter the URL for the sample app in your browser. If you're running the sample app on the local computer, use the URL https://localhost:9001 to load the application.



# RESTful API Information

## Register User

Registers a new user for the sample app:

```
POST /users
```

### Parameters

``` javascript
{
  "user_id": "user_id",
  "user_name": "user_name",
  "password": "password",
  "user_type": "user_type"
}
```

### Response

**Virtual Number users**

``` javascript
{
  "user_id": "user_id",
  "user_name": "user_name",
  "user_type": "user_type",
  "virtual_number": "virtual_number"
}
```

**Account ID users**

``` javascript
{
  "user_id": "user_id",
  "user_name": "user_name",
  "user_type": "user_type",
  "account_id": "account_id"
}
```


## Delete User

Deletes an existing user from the sample app:

```
DELETE /users/:id
```

### Parameters
None

### Response
HTTP 201 Success. Deleted user: user_id


## Login
```
POST /login
```

### Parameters

```Javascript
{
  "user_id": "user_id",
  "password": "password"
}
```

### Response

``` javascript
{
  "user_id": "user_id",
  "user_name": "user_name",
  "user_type": "user_type",
  "role_type": "role_type"
}
```

## Logout
```
DELETE /logout
```

### Parameters
None

### Response

``` javascript
{
  message: 'User logged out successfully'
}
```

## Authorize

Endpoint for authorizing Mobile Number users using AT&T OAuth.


```
GET /oauth/authorize
```

### Parameters
None

### Response
`HTTP 302`


## Authorize Callback

Endpoint for the OAuth Authorize callback.

```
GET /oauth/callback
```

### Parameters

* `code=auth_code`

### Response

`HTTP 302`
