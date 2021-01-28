/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/29-opt-out-opt-in/06-opt-out-after-previous-opt-in", function() {

	var tf = BOOMR.plugins.TestFramework;

	it("[After Opt-out] Should have set BOOMR_CONSENT=\"opted-out\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("BOOMR_CONSENT=\"opted-out\"") !== -1);
	});

	it("[Opt-out before Boomerang loaded] Should not have BOOMR_CONSENT=\"opted-in\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("BOOMR_CONSENT=\"opted-in\"") === -1);
	});

	it("[After Opt-out] Should have sent exactly 1 beacon because the rest were blocked because of Opt-out", function() {
		assert.isTrue(tf.beaconCount() === 1);
	});

});
