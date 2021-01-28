/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/21-continuity/36-cls", function() {
	var tf = BOOMR.plugins.TestFramework;
	var t = BOOMR_test;

	it("Should have sent a beacon", function() {
		// ensure we fired a beacon ('beacon')
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have set c.cls (if PerformanceObserver is supported)", function(done) {
		if (!typeof BOOMR.window.PerformanceObserver === "function" || !BOOMR.window.LayoutShift) {
			return this.skip();
		}

		assert.isNumber(tf.lastBeacon()["c.cls"]);
		assert.equal(tf.lastBeacon()["c.cls"], clsScoreOnBeaconSend);
		done();
	});
});
