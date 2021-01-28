/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/11-restiming/17-service-worker-rs", function() {
	var t = BOOMR_test;
	var tf = BOOMR.plugins.TestFramework;

	var beaconData;

	it("Should have sent an unload beacon", function(done) {
		var unloadBeaconHandler = function(data) {
			beaconData = data;
			assert.isString(beaconData["rt.quit"]);
			done();
		};

		var testFrame = document.getElementById("boomer_test_frame");
		testFrame.contentWindow.BOOMR.subscribe("beacon", unloadBeaconHandler, null, this);
		testFrame.src = "about:blank";
	});

	it("Should have run all unload plugins for the unload beacon", function() {
		assert.equal(beaconData.onunloadtest, 1);
	});

	it("Should have sent a load beacon for the iFrame on reload", function(done) {
		var testFrame = document.getElementById("boomer_test_frame");

		var onBeaconHandler = function(data) {
			done();
		};

		var onLoadHandler = function(data) {

			if (testFrame.contentWindow.BOOMR.hasSentPageLoadBeacon()) {
				// We already have beacon array ready for next step. continue
				done();
			}
			else {
				// Page load hasnt happened. So let wait for that before proceeeding to
				// next step.
				testFrame.contentWindow.BOOMR.subscribe("beacon", onBeaconHandler, null, this);
			}
		};

		// reloading the iFrame via "src" attribute kills the current Boomerang context
		// and so we cant register for on_beacon event directly. Instead we need to
		// register for load event on the iFrame's context object from where we can
		// register for the on_beacon Boomerang event. This is need to ensure we wait for
		// the beacon to be sent from the iFrame before proceeding to the next part where
		// check the Beacons res timing.

		testFrame.onload = onLoadHandler;
		testFrame.src = "support/17-iframe-sw.html";
	});

	it("Should pass basic beacon validation", function(){
		var testFrame = document.getElementById("boomer_test_frame");
		assert.equal(testFrame.contentWindow.BOOMR.plugins.TestFramework.beacons.length, 1);
	});

	it("Should have Service worker start time for the IMG on the page (if ResourceTiming is supported)", function() {
		var testFrame = document.getElementById("boomer_test_frame");
		if (testFrame && testFrame.contentWindow &&
			testFrame.contentWindow.BOOMR_test.isResourceTimingSupported() &&
			testFrame.contentWindow.BOOMR_test.isServiceWorkerSupported()) {
			var b = testFrame.contentWindow.BOOMR.plugins.TestFramework.beacons[0];

			var resTimingEntries = testFrame.contentWindow.performance.getEntriesByType("resource");

			var imgEntry = resTimingEntries.filter(function(e) {
				return e.initiatorType === "img";
			})[0];

			if (imgEntry.workerStart && typeof imgEntry.workerStart === "number" && imgEntry.workerStart !== 0) {
				// We have a non-zero service worker server resource timing. Lets proceed.
				var workerStartRoundup = Math.ceil(imgEntry.workerStart ? imgEntry.workerStart : 0);
				var startTime = Math.round(imgEntry.startTime ? imgEntry.startTime : 0);
				var workerStartOffsetStartTime = (workerStartRoundup === 0 ? 0 : (workerStartRoundup - startTime));

				var base36ConvertedWs = workerStartOffsetStartTime.toString(36);
				var compressedWorkerStartVal = "*6" + (base36ConvertedWs ===  "0" ? "" : base36ConvertedWs);

				assert.include(b.restiming, compressedWorkerStartVal);
			}
			else {
				// looks like Service worker isnt really supported even though the api is. We dont have
				// service worker timestamps. So just skip this test.
				this.skip();
			}
		}
		else {
			// Service worker not supported by the browser.
			this.skip();
		}
	});
});
