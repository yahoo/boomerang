/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/29-opt-out-opt-in/06-opt-out-before-page-ready", function() {

	var tf = BOOMR.plugins.TestFramework;

	it("[Opt-out before Boomerang loaded] Should have 0 beacons sent", function() {
		assert.isTrue(tf.beaconCount() === 0);
	});

	it("[Opt-out before Boomerang loaded] Should have set BOOMR_CONSENT=\"opted-out\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("BOOMR_CONSENT=\"opted-out\"") !== -1);
	});

	it("[Opt-out before Boomerang loaded] Should not have BOOMR_CONSENT=\"opted-in\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("BOOMR_CONSENT=\"opted-in\"") === -1);
	});

});
