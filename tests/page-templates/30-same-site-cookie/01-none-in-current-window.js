/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/30-same-site-cookie/01-none-in-current-window", function() {

	it("Created RT Cookie with SameSite=None", function() {
		/* Note:
		 * Over NOT SECURE connection/HTTP a cookie will be created but:
		 *  1. with SameSite=Lax because SameSite=None can't be created on NOT SECURE CONNECTION
		 *  2. Secure flag will be absent because this flag is valid only on SECURE CONNECTION
		 */
		var cookie = BOOMR.utils.getSubCookies(BOOMR.utils.getCookie("RT"));
		assert.isDefined(cookie.si, "Session id read");
	});

	it("Should have cookie attributes SameSite=None; Secure", function() {
		if (window.location.protocol !== "https:") {
			this.skip();
		}

		var SameSiteAttributeParts = BOOMR.utils.getSameSiteAttributeParts();

		assert.equal(SameSiteAttributeParts.length, 2);
		assert.equal(SameSiteAttributeParts[0], "SameSite=None");
		assert.equal(SameSiteAttributeParts[1], "Secure");
	});

});
