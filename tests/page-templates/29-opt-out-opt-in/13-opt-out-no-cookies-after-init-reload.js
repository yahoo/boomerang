/*eslint-env mocha*/
/*global BOOMR_test,assert*/

describe("e2e/29-opt-out-opt-in/13-opt-out-no-cookies-after-init-reload", function() {

	it("[After Opt-out] Should not have set RT cookie", function() {
		assert.isFalse(document.cookie.indexOf("RT=") !== -1);
	});

	it("[After Opt-out] Should have set BOOMR_CONSENT=\"opted-out\" cookie", function() {
		assert.isTrue(document.cookie.indexOf("BOOMR_CONSENT=\"opted-out\"") !== -1);
	});

});

