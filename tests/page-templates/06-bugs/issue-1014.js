/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/06-bug/issue-1014", function() {
	var t = BOOMR_test;
	var tf = BOOMR.plugins.TestFramework;

	it("Should not log error if we get error with message that contains NS_ERROR_FAILURE", function() {
		var b = tf.lastBeacon();
		assert.isUndefined(b.errors);
	});
});
