/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/29-opt-out-opt-in/04-opt-in-after-page-ready", function() {

	var tf = BOOMR.plugins.TestFramework;

	before("Give enough time to Boomerang to check if all plugins are ready", function(done) {
		this.timeout(2500);
		setTimeout(done, 2000);
	});

	it("[After Opt-in] Should have at least one beacon sent", function() {
		assert.isTrue(tf.beaconCount() >= 1);
	});

});
