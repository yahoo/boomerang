/*eslint-env mocha*/
/*global BOOMR_test*/

describe("e2e/02-snippet/01-script-removal", function() {
	var t = BOOMR_test;

	it("Should pass basic beacon validation", function(done) {
		t.validateBeaconWasSent(done);
	});
});
