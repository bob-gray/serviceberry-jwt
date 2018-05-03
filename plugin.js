"use strict";

const jwt = require("jsonwebtoken"),
	{HttpError} = require("serviceberry"),
	{promisify} = require("util"),
	verify = promisify(jwt.verify),
	bearer = /^Bearer /;

class Jwt {
	constructor (options = {}, properties = {scheme: "Bearer"}) {
		this.options = {...options};
		Object.assign(this, properties);

		if (this.scheme === "Token" && !this.param) {
			this.param = "token";
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
			await verify(request.jwt.raw, key, this.options);
		} catch (error) {
			throw this.unauthorized(error.message);
		}
	}

	getToken (request) {
		var token;

		if (this.scheme === "Bearer") {
			token = request.getHeader("Authorization") || "";
			token = token.replace(bearer, "");
		} else if (this.scheme === "Token") {
			token = request.getParam(this.param);
		}

		return token;
	}

	async getKey () {
		throw new Error("serviceberry-jwt plugin exports an abstract " +
			"class (Jwt). Consumers of the plugin must extend" +
			"this class and at least implement the getKey(id) method.");
	}

	unauthorized (request, message) {
		return new HttpError(message, "Unauthorized", {
			"WWW-Authenticate": this.scheme
		});
	}
}

module.exports = Jwt;
