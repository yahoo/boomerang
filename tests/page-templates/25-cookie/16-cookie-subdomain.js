/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/25-cookie/16-cookie-subdomain", function() {
	var tf = BOOMR.plugins.TestFramework;

	it("Should have sent a beacon", function() {
		// ensure we fired a beacon ('beacon')
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have only set a single cookie", function() {
		assert.equal(document.cookie.split("; ").length, 1);
	});

	it("Should have set the cookie on the www domain (if running from www)", function() {
		if (document.location.host.indexOf("www.") === -1) {
			return this.skip();
		}

		assert.isTrue(BOOMR.utils.getCookie("RT").indexOf("www.") !== -1);
	});
});
