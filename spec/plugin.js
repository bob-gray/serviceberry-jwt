"use strict";

const jwt = require("../plugin"),
	Request = require("serviceberry/src/Request"),
	{HttpError} = require("serviceberry"),
	httpMocks = require("node-mocks-http");

describe("serviceberry-jwt", () => {
	var handler,
		request,
		response;

	beforeEach(() => {
		handler = jwt();
		request = createRequest();
		response = createResponse();
	});

	it("should create a handler instance with a use() method", () => {

	});
});

function createRequest () {
	// return request;
}

function createResponse () {
	var response = jasmine.createSpyObj("Response", [
		"setHeader",
		"getHeader"
	]);

	return response;
}
