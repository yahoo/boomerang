/*eslint-env mocha*/
/*global BOOMR_test,assert*/
describe("e2e/29-opt-out-opt-in/01-opt-in-origin-injected-loader-wrapper", function() {
	var snippetStart = window.BOOMR.snippetStart;

	// We need to do this because BOOMR TF is not initialized yet
	var assert = window.chai.assert;

	it("[Before Opt-in] Should have loaded BOOMR", function() {
		assert.isUndefined(snippetStart);
	});

	BOOMERANG_LOADER_WRAPPER();

	it("[After Opt-in] Should not have loaded BOOMR", function() {
		assert.isDefined(window.BOOMR.snippetStart);
	});

});
