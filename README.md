serviceberry-jwt
=================

[![CircleCI](https://circleci.com/gh/bob-gray/serviceberry-jwt.svg?style=svg)](https://circleci.com/gh/bob-gray/serviceberry-jwt)
[![Test Coverage](https://api.codeclimate.com/v1/badges/5a4fc498c6e90455f103/test_coverage)](https://codeclimate.com/github/bob-gray/serviceberry-jwt/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/5a4fc498c6e90455f103/maintainability)](https://codeclimate.com/github/bob-gray/serviceberry-jwt/maintainability)
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

This plugin exports an abstract class `Jwt` for extending by your
authorization class that knows how to fetch your token keys. To use this
plugin extend `Jwt` and implement at least `getKey(id)`. The key is then used
to verify the request's token. You can extend the validation by overriding
`validate(request)` or change the process of finding a request's token by
overriding `getToken(request)`.

```js
const Jwt = require("serviceberry-jwt");

class Auth extends Jwt {
	getKey (id) {
		return data.getKey(id); // can also return a promise or use async/await
	}

	async validate (request) { // you can override validate to go beyond just verifying the token signature
		super.validate(...arguments); // will throw if token is not verified
		... // test scopes or other custom payload properties
	}
}

trunk.use(new Auth());
```

Options
-------

See [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken#user-content-jwtverifytoken-secretorpublickey-options-callback)
for verify options.

Properties
----------

  - **scheme** *string*

    The authentication scheme. Used to get the token from the request and to set the `WWW-Authenticate`
	response header scheme when responding with `401 Unauthorized`. Defaults to `Bearer`.

	  - *Bearer*

	    When the scheme is *Bearer* the plugin will look for the token in the request's
		`Authorization` header.

      - *Token*

	    When the scheme is *Token* the plugin will look for the token in the request's
		parameters by it's name (see *param* below). `request.getParam(plugin.param)`.

  - **param** *string*

    The name of the request parameter where the token should be found. Defaults
	to `token`. This can be any type of request parameter - path, query string,
	or body. This property has no purpose if scheme is *Bearer*.

Jwt
---
Abstract class

### constructor([options[, properties]])

  - **options** *object*

	Sets `this.options`. Passed to `jwt.verify()`. See
	[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken#user-content-jwtverifytoken-secretorpublickey-options-callback)

  - **properties**

    Set as properties of instance. See [properties](#properties) above.

### getKey(id)

**You must extend this class and at least implement this method.**

Called by the `validate` method for fetching a signing key used to verify a token.

  - **id** *string*

    The id which identifies the key to be used to verify the token.

### use(request, response)

The handler method. This is the method called by Serviceberry. Sets `request.jwt`
and `request.token`. This is an `async` function.

  - **request** *object*

    Serviceberry [`request`](https://serviceberry.js.org/docs/request.html) object.

  - **response** *object*

    Serviceberry [`response`](https://serviceberry.js.org/docs/response.html) object.

### validate(request)

Called by the `use` method to validate the token. This is an `async`
function and should return or resolve to a boolean value or throw an error.

  - **request** *object*

    Serviceberry [`request`](https://serviceberry.js.org/docs/request.html) object.

### getToken(request)

Called by the `use` method to find the request's token.

  - **request** *object*

    Serviceberry [`request`](https://serviceberry.js.org/docs/request.html) object.
