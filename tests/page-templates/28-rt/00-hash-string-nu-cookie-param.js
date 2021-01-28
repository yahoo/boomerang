/*eslint-env mocha*/
/*global chai*/

describe("e2e/28-rt/00-hash-string-nu-cookie-param", function() {
	var assert = chai.assert;
	var tf = BOOMR.plugins.TestFramework;
	var t = BOOMR_test;

	it("Should return hashed url", function() {
		var subcookies = BOOMR.plugins.RT.getCookie();
		assert.equal(subcookies.nu, "3z8grme7" /* FNV hashed: https://www.example.com/test-click.html */);
	});
});
