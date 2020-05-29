serviceberry-jwt
=================

[![CircleCI](https://circleci.com/gh/bob-gray/serviceberry-jwt.svg?style=svg)](https://circleci.com/gh/bob-gray/serviceberry-jwt)
[![Test Coverage](https://api.codeclimate.com/v1/badges/354149574b260178e1ce/test_coverage)](https://codeclimate.com/github/bob-gray/serviceberry-jwt/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/354149574b260178e1ce/maintainability)](https://codeclimate.com/github/bob-gray/serviceberry-jwt/maintainability)
[![npm version](https://badge.fury.io/js/serviceberry-jwt.svg)](https://badge.fury.io/js/serviceberry-jwt)

JSON Web Token plugin for [Serviceberry](https://serviceberry.js.org). For information
about JSON Web Tokens see [RFC 7519](https://tools.ietf.org/html/rfc7519).

Install
-------

```shell-script
npm install serviceberry-jwt
```

Usage
-----

Fails the request with a `401 Unauthorized` status if the token is not found, is not formatted correctly, or
if the key doesn't verify the signature.

This plugin exports an abstract class `Jwt` for extending by your authorization class that knows how to fetch your
token keys. To use this plugin extend `Jwt` and implement at least `getKey(id)`. The key is then used to verify
the request's token. You can extend the validation by overriding `validate(request)` or change the process of finding
a request's token by overriding `getToken(request)`.

```js
const Jwt = require("serviceberry-jwt");

class Auth extends Jwt {
	getKey (id) {
		return data.getKey(id); // can also return a promise or use async/await
	}

	async validate (request) { // you can override validate to go beyond just verifying the token signature
		await super.validate(...arguments); // will throw if token is not verified
		... // test scopes or other custom payload properties
	}
}

trunk.use(new Auth(verifyOptions, options));
```

verifyOptions *object*
----------------------

See [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken#user-content-jwtverifytoken-secretorpublickey-options-callback)
for verify options.

options *object*
----------------

  - **scheme** *string*

    The authentication scheme. Used to get the token from the request and to set the `WWW-Authenticate`
	response header scheme when responding with `401 Unauthorized`. Defaults to `Bearer`.

	  - *Bearer*

	    When the scheme is *Bearer* the plugin will look for the token in the request's
		`Authorization` header.

      - *Token*

	    When the scheme is *Token* the plugin will look for the token in the request's
		parameters by it's name (see *param* below). `request.getParam(options.param)`.

  - **accessToken** *boolean*

    When *scheme* is `Bearer` and `accessToken` is `true`, first look for the token in the `Authorization` header
    and if it isn't found look for `access_token` as described below. Defaults to `false`. This option has no
    purpose if *scheme* is `Token`. Per [RFC 6750](https://tools.ietf.org/html/rfc6750) sections 2.2 & 2.3.
    
      - Find bearer token in a form encoded body parameter named `access_token` for request methods with defined
        body semantics (*POST, PUT, and PATCH*).

      - Find bearer token in a query string parameter named `access_token` for request methods without defined
        body semantics (*not POST, PUT, or PATCH*).

  - **param** *string*

    When *scheme* is `Token`, *param* is the name of the request parameter where the token should be found.
    Defaults to `token`. This can be any type of request parameter - path, query string, or body. This option
    has no purpose if scheme is `Bearer`.

Jwt
---
Abstract class

### constructor([verifyOptions[, options]])

  - **verifyOptions** *object*

	Sets `this.verifyOptions`. Passed to `jwt.verify()`. See
	[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken#user-content-jwtverifytoken-secretorpublickey-options-callback)

  - **options**

    Sets `this.options`. See [options](#options) above.

### getKey(id)

**You must extend this class and at least implement this method.**

Called by the `validate` method for fetching a signing key used to verify a token.

  - **id** *string*

    The id which identifies the key to be used to verify the token.

### use(request, response)

The [handler](https://serviceberry.js.org/docs/handlers) method. This is the method called by Serviceberry.
Sets `request.jwt`. This is an `async` function.

  - **request** *object*

    Serviceberry [`request`](https://serviceberry.js.org/docs/request) object.

  - **response** *object*

    Serviceberry [`response`](https://serviceberry.js.org/docs/response) object.

### validate(request)

Called by the `use` method to validate the token. This is an `async` function and should return
or resolve to a boolean value or throw an error.

  - **request** *object*

    Serviceberry [`request`](https://serviceberry.js.org/docs/request) object.

### getToken(request)

Called by the `use` method to find the request's token.

  - **request** *object*

    Serviceberry [`request`](https://serviceberry.js.org/docs/request) object.
