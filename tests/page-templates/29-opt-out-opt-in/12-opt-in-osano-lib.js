/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/29-opt-out-opt-in/12-opt-in-osano-lib", function() {

	it("[After Opt-out] Should not have set RT cookie", function() {
		assert.isTrue(document.cookie.indexOf("RT=") !== -1);
	});

	it("[After Opt-out] Should have set BOOMR_CONSENT=\"opted-in\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("BOOMR_CONSENT=\"opted-in\"") !== -1);
	});

});
