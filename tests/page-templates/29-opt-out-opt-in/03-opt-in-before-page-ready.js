/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/29-opt-out-opt-in/03-opt-in-before-page-ready", function() {

	var tf = BOOMR.plugins.TestFramework;

	it("[After Opt-in] Should at least on beacon sent", function() {
		assert.isTrue(tf.beaconCount() >= 1);
	});

});
