"use strict";

const jwt = require("jsonwebtoken"),
	{HttpError} = require("serviceberry"),
	{promisify} = require("util"),
	verify = promisify(jwt.verify),
	bearer = /^Bearer /;

class Jwt {
	constructor (verifyOptions = {}, options = {scheme: "Bearer"}) {
		this.verify = {...verifyOptions};
		this.options = {...options};

		if (this.options.scheme === "Token" && !this.options.param) {
			this.options.param = "token";
		}
	}

	async use (request) {
		var token = this.getToken(request);

		if (!token) {
			throw this.unauthorized("Please provide token.");
		}

		request.jwt = jwt.decode(token, {
			complete: true
		});
		request.jwt.raw = token;
		request.token = request.jwt.payload;

		return this.validate(request);
	}

	async validate (request) {
		const key = await this.getKey(request.jwt.header.kid);

		try {
			await verify(request.jwt.raw, key, this.verify);
		} catch (error) {
			throw this.unauthorized(error.message);
		}
	}

	getToken (request) {
		var token;

		if (this.options.scheme === "Bearer") {
			token = request.getHeader("Authorization") || "";
			token = token.replace(bearer, "");
		} else if (this.options.scheme === "Token") {
			token = request.getParam(this.options.param);
		}

		return token;
	}

	async getKey () {
		throw new Error("serviceberry-jwt plugin exports an abstract " +
			"class (Jwt). Consumers of the plugin must extend" +
			"this class and at least implement the getKey(id) method.");
	}

	unauthorized (message) {
		return new HttpError(message, "Unauthorized", {
			"WWW-Authenticate": this.options.scheme
		});
	}
}

module.exports = Jwt;
