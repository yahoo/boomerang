/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/30-same-site-cookie/09-none-secure-attribute-in-current-window", function() {

	it("Created RT Cookie with SameSite=None", function() {
		var cookie = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie("RT"));
		assert.isDefined(cookie.si, "Session id read");
	});

});
