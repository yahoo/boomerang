/*eslint-env mocha*/
/*global chai*/

describe("BOOMR.utils exports", function() {
	var assert = chai.assert;

	it("Should have an existing BOOMR.utils object", function() {
		assert.isObject(BOOMR.utils);
	});

	it("Should have an existing Function BOOMR.utils.cleanUpURL()", function() {
		assert.isFunction(BOOMR.utils.cleanupURL);
	});

	it("Should have an existing Function BOOMR.utils.hashQueryString()", function() {
		assert.isFunction(BOOMR.utils.hashQueryString);
	});

	it("Should have an existing Function BOOMR.utils.pluginConfig()", function() {
		assert.isFunction(BOOMR.utils.pluginConfig);
	});

	it("Should have an existing Function BOOMR.utils.hashString()", function() {
		assert.isFunction(BOOMR.utils.hashString);
	});

	describe("isObjectEmpty()", function() {
		it("Should return false for non-empty objects", function() {
			assert.isFalse(BOOMR.utils.isObjectEmpty({ a: 1 }));

			assert.isFalse(BOOMR.utils.isObjectEmpty({ a: 1, b: 2 }));
		});

		it("Should return true for empty objects", function() {
			assert.isTrue(BOOMR.utils.isObjectEmpty({}));

			assert.isTrue(BOOMR.utils.isObjectEmpty());
		});
	});
});
