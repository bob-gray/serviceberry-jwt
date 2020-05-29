"use strict";

const jwt = require("jsonwebtoken"),
	{promisify} = require("util"),
	verify = promisify(jwt.verify),
	bearer = "Bearer ",
	methodsWithBody = ["POST", "PUT", "PATCH"];

class Jwt {
	constructor ({...verifyOptions} = {}, {...options} = {scheme: "Bearer"}) {
		Object.assign(this, {verifyOptions, options});

		if (this.options.scheme === "Token" && !this.options.param) {
			this.options.param = "token";
		}
	}

	async use (request) {
		var token = this.getToken(request);

		if (!token) {
			this.unauthorized(request, "Please provide token.");
		}

		request.jwt = jwt.decode(token, {
			complete: true
		});

		if (!request.jwt) {
			this.unauthorized(request, "Token is malformed.");
		}

		Object.freeze(Object.assign(request.jwt, {
			string: token
		}));

		return this.validate(request);
	}

	async validate (request) {
		const key = await this.getKey(request.jwt.header.kid);

		try {
			await verify(request.jwt.string, key, this.verifyOptions);
		} catch (error) {
			this.unauthorized(request, error.message);
		}
	}

	getToken (request) {
		var {scheme, accessToken, param} = this.options,
			token;

		if (scheme === "Bearer" && accessToken) {
			token = this.getBearerToken(request);
		} else if (scheme === "Bearer") {
			token = this.getAuthHeaderToken(request);
		} else if (scheme === "Token") {
			token = request.getParam(param);
		}

		return token;
	}

	getBearerToken (request) {
		var token = this.getAuthHeaderToken(request);

		// Per [RFC 6750](https://tools.ietf.org/html/rfc6750) sections 2.2 & 2.3
		// bearer tokens can be passed as access_token in the body if body is form encoded and method has body
		if (!token && methodsWithBody.includes(request.getMethod()) &&
			request.getContentType() === "application/x-www-form-urlencoded") {
			token = request.getBodyParam("access_token");

		// or as access_token in the query string
		} else if (!token) {
			token = request.getQueryParam("access_token");
		}

		return  token;
	}

	getAuthHeaderToken (request) {
		var token = request.getHeader("Authorization") || "";

		if (token.startsWith(bearer)) {
			token = token.slice(bearer.length);
		}

		return token;
	}

	async getKey () {
		throw new Error(
			"serviceberry-jwt plugin exports an abstract class (Jwt). " +
			"Consumers of the plugin must extend this class and at least implement the getKey(id) method."
		);
	}

	unauthorized (request, message) {
		request.fail(message, "Unauthorized", {
			"WWW-Authenticate": this.options.scheme
		});
	}
}

module.exports = Jwt;
