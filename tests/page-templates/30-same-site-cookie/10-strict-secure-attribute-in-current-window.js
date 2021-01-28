/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/30-same-site-cookie/10-strict-secure-attribute-in-current-window", function() {

	it("Created RT Cookie with SameSite=Strict", function() {
		var cookie = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie("RT"));
		assert.isDefined(cookie.si, "Session id read");
	});

});
