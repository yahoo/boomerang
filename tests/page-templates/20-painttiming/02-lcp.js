/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/20-painttiming/02-lcp", function() {
	var tf = BOOMR.plugins.TestFramework;
	var t = BOOMR_test;

	it("Should have sent a beacon", function() {
		// ensure we fired a beacon ('beacon')
		assert.isTrue(tf.fired_onbeacon);
	});

	it("Should have set pt.lcp (if LargestContentfulPaint is supported and happened by load)", function(done) {
		var observerWait, that = this;

		if (!t.isLargestContentfulPaintSupported()) {
			return this.skip();
		}

		if (typeof tf.lastBeacon()["pt.fp"] === "undefined") {
			// No paint
			return this.skip();
		}

		var observer = new window.PerformanceObserver(function(list) {
			clearTimeout(observerWait);

			var entries = list.getEntries();
			if (entries.length === 0) {
				return that.skip();
			}

			var lcp = entries[entries.length - 1];
			var lcpTime = lcp.renderTime || lcp.loadTime;

			// validation of First Paint
			assert.isNumber(tf.lastBeacon()["pt.lcp"]);
			assert.operator(parseInt(tf.lastBeacon()["pt.lcp"], 10), ">=", 0);
			assert.equal(tf.lastBeacon()["pt.lcp"], Math.floor(lcpTime));

			observer.disconnect();

			done();
		});

		observer.observe({ type: "largest-contentful-paint", buffered: true });

		// wait for the LCP observer to fire, if not, skip the test
		observerWait = setTimeout(function() {
			// no LCP before load
			return this.skip();
		}.bind(this), 1000);
	});

	it("Should have exposed LCP metric (if LargestContentfulPaint is supported and happened by load)", function() {
		var observerWait, that = this;

		if (!t.isLargestContentfulPaintSupported()) {
			return this.skip();
		}

		if (typeof tf.lastBeacon()["pt.fp"] === "undefined") {
			// No paint
			return this.skip();
		}

		assert.equal(tf.lastBeacon()["pt.lcp"], BOOMR.plugins.PaintTiming.metrics.lcp());
	});
});
