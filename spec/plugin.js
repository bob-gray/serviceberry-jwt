"use strict";

const Jwt = require("../plugin"),
	Request = require("serviceberry/src/Request"),
	{HttpError} = require("serviceberry"),
	httpMocks = require("node-mocks-http");

describe("serviceberry-jwt", () => {
	var handler,
		request,
		token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o";

	beforeEach(() => {
		handler = new Jwt();
		handler.getKey = jasmine.createSpy("Jwt.getKey")
			.and.returnValue("secret");
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
			raw: request.getHeader("Authorization").replace("Bearer ", ""),
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

	it("should set request.token", async () => {
		await handler.use(request);

		expect(request.token).toEqual({
			sub: "1234567890",
			name: "John Doe",
			iat: 1516239022
		});
	});

	it("should not authenticate without credentials", async () => {
		request = createRequest();

		try {
			await handler.use(request);
			fail();
		} catch (error) {
			expect().nothing();
		}
	});

	it("should not authenticate with the wrong key", async () => {
		handler.getKey.and.returnValue("wrong key");

		try {
			await handler.use(request);
			fail();
		} catch (error) {
			expect().nothing();
		}
	});

	it("should not authenticate with a malformed token", async () => {
		request = createRequest("Bearer malformed");

		try {
			await handler.use(request);
			fail();
		} catch (error) {
			expect().nothing();
		}
	});

	it("should get the token from the request's params if scheme is `Token`", () => {
		request.getParam = jasmine.createSpy("request.getParam")
			.and.returnValue(token);

		handler = new Jwt({}, {
			scheme: "Token"
		});

		;
		expect(handler.getToken(request)).toBe(token);
	});

	it("should not find a token when the scheme is unknown", () => {
		handler = new Jwt({}, {
			scheme: "Foo Baz"
		});

		;
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
	var incomingMessage = httpMocks.createRequest({
			url: "/",
			headers: {
				Authorization: authorization
			}
		}),
		request;

	incomingMessage.setEncoding = Function.prototype;
	request = new Request(incomingMessage);

	return request;
}
