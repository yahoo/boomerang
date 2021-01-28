/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/29-opt-out-opt-in/08-opt-in-delayed-iframe-snippet", function() {

	var tf = BOOMR.plugins.TestFramework;

	var beaconCountBforeOptIn = tf.beaconCount();

	it("[After Opt-out] Should have not sent beacons before visitor Opted In", function() {
		assert.isTrue(beaconCountBforeOptIn === 0);
	});

	BOOMR_OPT_IN();

	before("Give enough time to Boomerang to check if all plugins are ready", function(done) {
		this.timeout(2500);
		setTimeout(done, 2000);
	});

	it("[After Opt-out] Should have have set BOOMR_CONSENT=\"opted-out\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("BOOMR_CONSENT=\"opted-out\"") === -1);
	});

	it("[Opt-out before Boomerang loaded] Should have set BOOMR_CONSENT=\"opted-in\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("BOOMR_CONSENT=\"opted-in\"") !== -1);
	});

	it("[After Opt-out] Should have sent exactly 1 beacon after visitor Opted In", function() {
		assert.isTrue(tf.beaconCount() === 1);
	});

});
