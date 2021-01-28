/*eslint-env mocha*/
/*global chai*/

describe("BOOMR.utils.isUASameSiteNoneCompatible()", function() {
	var assert = chai.assert;

	// Incompatible Chrome
	it("Should return false if a Chrome browser can't create safely cookies with SameSite=None", function() {
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Linux; Android 7.1.1; Moto E (4) Build/NCQS26.69-64-3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Mobile Safari/537.36"));
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (X11; CrOS i686 9334.72.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.140 Safari/537.36"));
	});

	// Incompatible Chromium
	it("Should return false if a Chromium browser can't create safely cookies with SameSite=None", function() {
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/65.0.3325.181 Chrome/65.0.3325.181 Safari/537.36"));
	});

	// Incompatible UCBrowser
	it("Should return false if an UC browser can't create safely cookies with SameSite=None", function() {
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Linux; U; Android 8.0.0; en-US; SM-G930F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.12.8.1206 Mobile Safari/537.36"));
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X; en-US) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/17F80 UCBrowser/11.3.5.1203 Mobile"));
	});

	// Incompatible Safari on Mac OS 10.4.*
	it("Should return false if Safari on Mac OS 10.4.* can't create safely cookies with SameSite=None", function() {
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Safari/605.1.15"));
	});

	// Incompatible embeded browser on Mac OS 10.4.*
	it("Should return false if embeded browser on Mac OS 10.4.* can't create safely cookies with SameSite=None", function() {
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko)"));
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko)"));
	});

	// Incompatible all browsers on iOS and iPad OS 12
	it("Should return false if iOS and iPad OS 12 for all browsers can't create safely cookies with SameSite=None", function() {
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1"));
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1"));
		assert.isFalse(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1"));
	});

	// Compatible Chromium
	it("Should return true if a Chromium browser can create safely cookies with SameSite=None", function() {
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/81.0.4044.138 Chrome/81.0.4044.138 Safari/537.36"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/81.0.4044.138 Chrome/81.0.4044.138 Safari/537.36"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/78.0.3904.108 Chrome/78.0.3904.108 Safari/537.36"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/77.0.3865.90 Chrome/77.0.3865.90 Safari/537.36"));
	});

	// Compatible Chrome
	it("Should return true if a Chrome browser can create safely cookies with SameSite=None", function() {
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Linux; Android 5.1; QTAIR7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Linux; Android 6.0; VFD 500 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.89 Mobile Safari/537.36"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Linux; Android 10; SAMSUNG SM-G975U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/11.0 Chrome/75.0.3770.143 Mobile Safari/537.36"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Linux; Android 9; moto g(7) supra) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36"));
	});

	// Compatible iOS and iPad OS
	it("Should return true if iOS and iPad OS is not 12 and all browsers can create safely cookies with SameSite=None", function() {
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (iPad; CPU OS 9_0_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13A404 Safari/601.1"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (iPad; CPU OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/89.2.287201133 Mobile/15E148 Safari/604.1"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (iPad; CPU OS 11_2_6 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) CriOS/76.0.3809.123 Mobile/15D100 Safari/604.1"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (iPad; CPU OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/79.0.3945.73 Mobile/15E148 Safari/604.1"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (iPad; CPU OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (iPhone; CPU OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/27.0 Mobile/15E148 Safari/605.1.15"));
	});

	// Compatible UCBrowser
	it("Should return true if an UC browser can create safely cookies with SameSite=None", function() {
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Linux; U; Android 7.0; en-US; QMobile Q Infinity E Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/13.1.8.1295 Mobile Safari/537.36"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Linux; U; Android 10; en-US; SM-A505F Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/13.2.0.1296 Mobile Safari/537.36"));
	});

	// Compatible for Safari not on Mac OS 10.4.*
	it("Should return true if Safari not on Mac OS 10.4.* can create safely cookies with SameSite=None", function() {
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Safari/605.1.15"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15"));
	});

	// Compatible embeded browser on different from Mac OS 10.4.*
	it("Should return true if embeded browser on Mac OS different from 10.4.* can create safely cookies with SameSite=None", function() {
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko)"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko)"));
		assert.isTrue(BOOMR.utils.isUASameSiteNoneCompatible("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.8 (KHTML, like Gecko)"));
	});

});
