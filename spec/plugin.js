/* eslint-env jasmine */
/* eslint max-nested-callbacks: ["error", 3], no-return-assign: "warn" */

"use strict";

const Jwt = require("../plugin");

describe("serviceberry-jwt", () => {
	var handler,
		request,
		token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
			"eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
			"XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o",
		errorHeaders = {
			"WWW-Authenticate": "Bearer"
		};

	beforeEach(() => {
		handler = new Jwt();
		handler.getKey = jasmine.createSpy("Jwt.getKey").and.returnValue("secret");
		request = createRequest("Bearer " + token);
	});

	it("should create a handler instance with a use() method", () => {
		expect(typeof handler.use).toBe("function");
	});

	it("should authenticate with a valid token", async () => {
		await handler.use(request);
	});

	it("should set request.jwt", async () => {
		await handler.use(request);

		expect(request.jwt).toEqual({
			string: request.getHeader("Authorization").replace("Bearer ", ""),
			header: {
				alg: "HS256",
				typ: "JWT"
			},
			payload: {
				sub: "1234567890",
				name: "John Doe",
				iat: 1516239022
			},
			signature: "XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o"
		});
	});

	it("should deep freeze request.jwt", async () => {
		await handler.use(request);

		expect(() => request.jwt.header = "evil").toThrow();
		expect(() => request.jwt.payload.sub = "evil").toThrow();
		expect(() => request.jwt.signature = "evil").toThrow();
	});

	it("should not authenticate without credentials", async () => {
		request = createRequest();

		try {
			await handler.use(request);
		} catch {
			// request fail will throw an error
		}

		expect(request.fail).toHaveBeenCalledWith("Please provide token.", "Unauthorized", errorHeaders);
	});

	it("should not authenticate with the wrong key", async () => {
		handler.getKey.and.returnValue("wrong key");

		try {
			await handler.use(request);
		} catch {
			// request.fail will throw an error
		}

		expect(request.fail).toHaveBeenCalledWith("invalid signature", "Unauthorized", errorHeaders);
	});

	it("should not authenticate with a malformed token", async () => {
		request = createRequest("Bearer malformed");

		try {
			await handler.use(request);
		} catch {
			// request.fail will throw an error
		}

		expect(request.fail).toHaveBeenCalledWith("Token is malformed.", "Unauthorized", errorHeaders);
	});

	it("should get the token from the request's params if scheme is `Token`", () => {
		request.getParam.and.returnValue(token);

		handler = new Jwt({}, {
			scheme: "Token"
		});

		expect(handler.getToken(request)).toBe(token);
	});

	it("should get the token from the request's query string when accessToken is true", () => {
		request = createRequest();
		request.getQueryParam.and.returnValue(token);

		handler = new Jwt({}, {
			scheme: "Bearer",
			accessToken: true
		});

		expect(handler.getToken(request)).toBe(token);
		expect(request.getQueryParam).toHaveBeenCalledWith("access_token");
	});

	it("should get the token from the request's query string when accessToken is true", () => {
		request = createRequest();
		request.getMethod.and.returnValue("POST");
		request.getContentType.and.returnValue("application/x-www-form-urlencoded");
		request.getBodyParam.and.returnValue(token);

		handler = new Jwt({}, {
			scheme: "Bearer",
			accessToken: true
		});

		expect(handler.getToken(request)).toBe(token);
		expect(request.getBodyParam).toHaveBeenCalledWith("access_token");
	});

	it("should get the token from the authorization header first when accessToken is true", () => {
		request = createRequest(token);

		handler = new Jwt({}, {
			scheme: "Bearer",
			accessToken: true
		});

		expect(handler.getToken(request)).toBe(token);
		expect(request.getBodyParam).not.toHaveBeenCalled();
		expect(request.getQueryParam).not.toHaveBeenCalled();
	});

	it("should not find a token when the scheme is unknown", () => {
		handler = new Jwt({}, {
			scheme: "Foo Baz"
		});

		expect(handler.getToken(request)).toBeUndefined();
	});

	it("should fail if abstract method getKey is not overridden with an implementation", async () => {
		handler = new Jwt();

		try {
			await handler.use(request);
			fail();
		} catch (error) {
			expect().nothing();
		}
	});
});

function createRequest (authorization) {
	var request = jasmine.createSpyObj("request", [
		"getHeader",
		"getMethod",
		"getContentType",
		"getParam",
		"getBodyParam",
		"getQueryParam",
		"fail"
	]);

	request.getHeader.and.returnValue(authorization);
	request.fail.and.throwError("request fail");

	return request;
}
