/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/30-same-site-cookie/03-strict-in-current-window", function() {

	it("Created RT Cookie with SameSite=Strict", function() {
		var cookie = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie("RT"));
		assert.isDefined(cookie.si, "Session id read");
	});

	it("Should have cookie attributes SameSite=Strict", function() {
		var SameSiteAttributeParts = BOOMR.utils.getSameSiteAttributeParts();

		assert.equal(SameSiteAttributeParts.length, 1);
		assert.equal(SameSiteAttributeParts[0], "SameSite=Strict");
	});

});
