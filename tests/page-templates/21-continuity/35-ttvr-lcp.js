/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/21-continuity/35-ttvr-lcp", function() {
	var tf = BOOMR.plugins.TestFramework;
	var t = BOOMR_test;

	it("Should have sent a single beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});

	it("Should have set the Visually Ready to Largest Contentful Paint (c.tti.vr)", function() {
		var b = tf.lastBeacon();

		if (!t.isLargestContentfulPaintSupported()) {
			return this.skip();
		}

		assert.isDefined(b["c.tti.vr"]);
		var lcp = parseInt(b["pt.lcp"], 10);
		var vr = parseInt(b["c.tti.vr"], 10);
		assert.closeTo(vr, lcp, 20);
	});
});
