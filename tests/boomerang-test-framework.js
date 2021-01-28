/*eslint-env mocha*/
/*global _*/

//
// BOOMR.plugins.TestFramework
//
(function(window) {

	// set our namespace
	var BOOMR = window.BOOMR = window.BOOMR || {};
	BOOMR.plugins = BOOMR.plugins || {};
	if (BOOMR.plugins.TestFramework) {
		return;
	}

	BOOMR.plugins.TestFramework = {
		initialized: false,
		fired_page_ready: false,
		fired_onbeacon: false,
		fired_before_unload: false,
		beacons: [],
		sendBeacons: [],
		page_ready: function() {
			this.fired_page_ready = true;
		},
		onbeacon: function(data) {
			this.beacons.push(_.clone(data));
			this.fired_onbeacon = true;
		},
		lastBeacon: function() {
			if (this.beacons.length === 0) {
				return false;
			}

			return this.beacons[this.beacons.length - 1];
		},
		beaconCount: function() {
			return this.beacons.length;
		},
		before_unload: function() {
			this.fired_before_unload = true;
		},
		init: function() {
			if (this.initialized) {
				return this;
			}

			BOOMR.subscribe("page_ready", this.page_ready, null, this);
			BOOMR.subscribe("beacon", this.onbeacon, null, this);
			BOOMR.subscribe("before_unload", this.before_unload, null, this);

			this.initialized = true;

			return this;
		},
		is_complete: function() {
			return true;
		}
	};

	(function() {
		var savedSendBeacon;
		if (window.navigator && typeof window.navigator.sendBeacon === "function") {
			savedSendBeacon = window.navigator.sendBeacon;
			window.navigator.sendBeacon = function(url, data) {
				"[native code]";
				// ^ fool ourselves

				var result = savedSendBeacon.apply(window.navigator, arguments);
				if (result) {
					var reader = new FileReader();
					reader.addEventListener("loadend", function() {
						BOOMR.plugins.TestFramework.sendBeacons.push(reader.result);
					});
					reader.readAsText(data);
				}
				return result;
			};
		}
	})();
})(window);

//
// BOOMR_test
//
(function(window) {
	"use strict";

	var t = {};

	var complete = false;
	var initialized = false;
	var testFailures = [];
	var testPasses = [];

	var beaconsSeen = 0;

	var doNotTestErrorsParam = false;
	var doNotTestSpaAbort = false;

	// test framework
	var assert;

	//
	// Constants
	//
	t.BEACON_URL = "/beacon";
	t.MAX_RESOURCE_WAIT = 500;

	//
	// Exports
	//
	t.templates = {};

	t.isComplete = function() {
		return complete;
	};

	t.isInitialized = function() {
		return initialized;
	};

	t.getTestFailures = function() {
		return complete ? testFailures : [];
	};

	t.getTestFailureMessages = function() {
		if (!complete) {
			return "";
		}

		var messages = "";
		for (var i = 0; i < testFailures.length; i++) {
			messages += i > 0 ? "\n" : "";
			messages += testFailures[i].titles + ": " + testFailures[i].name + " | " + testFailures[i].message;
		}

		return messages;
	};

	t.getTestPasses = function() {
		return complete ? testPasses : [];
	};

	t.CONFIG_DEFAULTS = {
		beacon_url: t.BEACON_URL,
		site_domain: null,
		ResourceTiming: {
			enabled: false,
			splitAtPath: true
		},
		Angular: {
			enabled: false
		},
		Ember: {
			enabled: false
		},
		Backbone: {
			enabled: false
		},
		History: {
			enabled: false
		},
		Errors: {
			enabled: false
		},
		TPAnalytics: {
			enabled: false
		},
		UserTiming: {
			enabled: false
		},
		Continuity: {
			enabled: false
		},
		IFrameDelay: {
			enabled: false
		},
		Early: {
			enabled: false
		},
		doNotTestErrorsParam: false,
		doNotTestSpaAbort: false
	};

	t.flattenTestTitles = function(test) {
		var titles = [];
		while (test.parent.title) {
			titles.push(test.parent.title);
			test = test.parent;
		}
		return titles.reverse();
	};

	t.runTests = function() {
		var runner = window.mocha.run();

		runner.on("pass", function(test){
			testPasses.push({
				test: test
			});
		})
		.on("fail", function(test, err){
			testFailures.push({
				name: test.title,
				result: false,
				message: err.message,
				// stack: err.stack,
				titles: t.flattenTestTitles(test)
			});
		})
		.on("end", function() {
			complete = true;

			// for saucelabs-mocha
			window.mochaResults = runner.stats;
			window.mochaResults.reports = testFailures;

			// convenient way for selenium to wait
			var competeDiv = document.createElement("div");
			competeDiv.id = "BOOMR_test_complete";
			document.body.appendChild(competeDiv);
		});
	};

	t.init = function(config) {
		if (initialized) {
			return;
		}

		if (!window.BOOMR || !window.BOOMR.version) {
			window.BOOMR_test_config = config;
			return;
		}

		config = _.merge({}, t.CONFIG_DEFAULTS, config);

		if (config.testAfterOnBeacon) {
			// default to waiting until one beacon was sent, otherwise use
			// the number passed in
			if (typeof config.testAfterOnBeacon !== "number") {
				config.testAfterOnBeacon = 1;
			}

			BOOMR.subscribe("beacon", function() {
				if (++beaconsSeen === config.testAfterOnBeacon) {
					// wait a few more ms so the beacon fires
					// TODO: Trim this timing down if we can make it more reliable
					setTimeout(t.runTests, 1000);
				}
			});
		}

		t.doNotTestErrorsParam = config.doNotTestErrorsParam;
		t.doNotTestSpaAbort = config.doNotTestSpaAbort;

		if (config.afterFirstBeacon) {
			var xhrSent = false;
			BOOMR.subscribe(
				"beacon",
				function() {
					if (xhrSent) {
						return;
					}
					xhrSent = true;

					setTimeout(function() {
						config.afterFirstBeacon();
					}, 0);
				});
		}

		t.configureTestEnvironment(config);

		// Initialize if waiting for LOGN plugin or if the plugin doesn't exist
		if (window.BOOMR_LOGN_always !== true || !BOOMR.plugins.LOGN) {
			// fake session details so beacons send
			BOOMR.addVar({
				"h.key": window.BOOMR_API_key ? window.BOOMR_API_key : "aaaaa-bbbbb-ccccc-ddddd-eeeee",
				"h.d": window.location.hostname,
				"h.t": new Date().getTime(),
				"h.cr": "abc"
			});

			BOOMR.init(config);
			BOOMR.fireEvent("config", config);  // this might unblock a waiting beacon
		}

		if (config.onBoomerangLoaded) {
			config.onBoomerangLoaded();
		}

		if (!config.testAfterOnBeacon && config.testAfterOnBeacon !== false) {
			BOOMR.setImmediate(t.runTests);
		}

		initialized = true;
	};

	t.configureTestEnvironment = function(config) {
		// setup Mocha
		var globals = ["BOOMR", "PageGroupVariable", "mochaResults", "BOOMR_configt", "_bmrEvents"];
		if (config && config.ignoreGlobals) {
			Array.prototype.push.apply(globals, config.ignoreGlobals);
		}
		window.mocha.globals(globals);
		window.mocha.checkLeaks();

		// set globals
		assert = window.assert = window.chai.assert;
	};

	t.findResourceTimingBeacon = function() {
		if (!t.isResourceTimingSupported()) {
			return null;
		}

		// if included statically, it'll be on the main window
		var entries = BOOMR.window.performance.getEntriesByType("resource");
		for (var i = 0; i < entries.length; i++) {
			var e = entries[i];
			if (e.name && e.name.indexOf(t.BEACON_URL) !== -1) {
				return e;
			}
		}

		// if included via snippet, it'll be in the IFRAME
		var entries = BOOMR.boomerang_frame.performance.getEntriesByType("resource");
		for (var i = 0; i < entries.length; i++) {
			var e = entries[i];
			if (e.name && e.name.indexOf(t.BEACON_URL) !== -1) {
				return e;
			}
		}

		return null;
	};

	t.isResourceTimingSupported = function() {
		return (window.performance &&
		    typeof window.performance.getEntriesByType === "function" &&
		    typeof window.PerformanceResourceTiming !== "undefined");
	};

	t.isServiceWorkerSupported = function() {
		return (window.navigator && "serviceWorker" in window.navigator);
	};

	t.isServerTimingSupported = function() {
		return this.isResourceTimingSupported() && typeof PerformanceServerTiming !== "undefined";
	};

	t.isQuerySelectorSupported = function() {
		return typeof window.document.querySelector === "function" ||
		    typeof window.document.querySelector === "object";  // old IE
	};

	t.isNavigationTimingSupported = function() {
		return typeof BOOMR.plugins.RT.navigationStart() !== "undefined";
	};

	t.isNavigationTiming2Supported = function() {
		// check for NavTiming1 first
		if (!t.isNavigationTimingSupported()) {
			return false;
		}

		return window.performance &&
		    typeof window.performance.getEntriesByType === "function" &&
		    window.performance.getEntriesByType("navigation").length > 0;
	};

	t.isNavigationTiming2WithNextHopProtocolSupported = function() {
		// check for NavTiming1 first
		if (!t.isNavigationTimingSupported()) {
			return false;
		}

		return window.performance &&
		    typeof window.performance.getEntriesByType === "function" &&
		    window.performance.getEntriesByType("navigation").length > 0 &&
		    window.performance.getEntriesByType("navigation")[0].nextHopProtocol;
	};

	t.isChromeLoadTimesSupported = function() {
		var pt;
		if (window.chrome && window.chrome.loadTimes) {
			pt = window.chrome.loadTimes();
		}

		if (!pt) {
			// Not supported
			return false;
		}

		return true;
	};

	t.removeNavigationTimingSupport = function() {
		// fake a non-NavigationTiming browser even if it is one
		delete window.performance;

		if (window.chrome) {
			delete window.chrome.csi;
		}
	};

	t.isPaintTimingSupported = function() {
		return window.performance &&
		    typeof window.PerformancePaintTiming !== "undefined" &&
		    typeof window.performance.getEntriesByType === "function";
	};

	t.isLargestContentfulPaintSupported = function() {
		return window.performance &&
		    typeof window.LargestContentfulPaint === "function" &&
		    typeof window.PerformanceObserver === "function";
	};

	t.isLongTasksSupported = function() {
		return window.PerformanceObserver && window.PerformanceLongTaskTiming;
	};

	t.isUserTimingSupported = function() {
		// don't check for PerformanceMark or PerformanceMeasure, they aren't polyfilled in usertiming.js
		return (window.performance &&
		    typeof window.performance.getEntriesByType === "function" &&
		    typeof window.performance.mark === "function" &&
		    typeof window.performance.measure === "function");
	};

	t.isNetworkAPISupported = function() {
		return (navigator && typeof navigator === "object" &&
		    navigator.connection ||
		    navigator.mozConnection ||
		    navigator.webkitConnection ||
		    navigator.msConnection);
	};

	t.isErrorObjInOnErrorSupported = function() {
		var ua = navigator.userAgent.toLowerCase();
		return (ua.indexOf("phantomjs") === -1);  // this should be extended to include older IE and Safari
	};

	t.isLocalStorageSupported = function() {
		var result = false, name = "_boomr_ilss";
		try {
			window.localStorage.setItem(name, name);
			result = (window.localStorage.getItem(name) === name);
			window.localStorage.removeItem(name);
		}
		catch (ignore) {
			result = false;
		}
		return result;
	};

	t.isJSONSupported = function() {
		return (typeof window.JSON === "object" &&
		    typeof window.JSON.stringify === "function" &&
		    typeof window.JSON.parse === "function");
	};

	t.isFetchApiSupported = function() {
		return (typeof window.fetch === "function" &&
		    typeof window.Request === "function" &&
		    typeof window.Response === "function");
	};

	t.validateBeaconWasImg = function(done) {
		if (!t.isResourceTimingSupported()) {
			// need RT to validate
			return done();
		}

		// the presence of h.t on the URL means it was a GET beacon, so not an IMG
		var res = this.findResourceTimingBeacon();
		assert.isTrue(res.name.indexOf("h.t") !== -1);

		done();
	};

	t.isMutationObserverSupported = function() {
		var w = window;
		// Use the same logic as BOOM.utils.isMutationObserverSupported.
		// Boomerang will not use MO in IE 11 due to browser bugs
		var ie11 = (w && w.navigator && w.navigator.userAgent && w.navigator.userAgent.match(/Trident.*rv[ :]*11\./));
		return (!ie11 && w && w.MutationObserver && typeof w.MutationObserver === "function");
	};

	t.validateBeaconWasXhr = function(done) {
		if (!t.isResourceTimingSupported()) {
			// need RT to validate
			return done();
		}

		// the presence of h.t on the URL means it was a GET beacon, so not an XHR
		var res = this.findResourceTimingBeacon();
		assert.isTrue(res.name.indexOf("h.t") === -1);

		done();
	};

	t.validateBeaconWasSent = function(done) {
		var tf = BOOMR.plugins.TestFramework;

		assert.isTrue(tf.fired_onbeacon, "ensure we fired a beacon ('beacon')");

		assert.isObject(tf.lastBeacon(), "ensure the data was sent to 'beacon'");

		assert.equal(tf.lastBeacon().v, BOOMR.version, "ensure the beacon has the boomerang version");

		if (BOOMR.snippetVersion) {
			assert.equal(tf.lastBeacon().sv, BOOMR.snippetVersion, "ensure the beacon has the boomerang snippet version");
		}

		if (BOOMR.snippetMethod) {
			assert.equal(tf.lastBeacon().sm, BOOMR.snippetMethod, "ensure the beacon has the boomerang snippet method");
		}

		done();
	};

	t.canSetCookies = function() {
		var testCookieName = "test_cookie";

		// set a cookie
		document.cookie = [testCookieName + "=true", "path=/", "domain=" + location.hostname].join("; ");

		// determine if it was set OK
		return (" " + document.cookie + ";").indexOf(" " + testCookieName + "=") !== -1;
	};

	t.clearCookies = function(domain) {
		var date = new Date();
		date.setTime(date.getTime() - (24 * 60 * 60 * 1000));
		var cookies = document.cookie.split(";");
		for (var i = 0; i < cookies.length; i++) {
			var name = cookies[i].split("=")[0].replace(/^\s+|\s+$/g, "");  // trim spaces
			document.cookie = [name + "=", "expires=" + date.toGMTString(), "path=/", "domain=" + (domain || location.hostname)].join("; ");
		}
	};

	t.setCookie = function(data) {
		var cookieValue = "";

		// add all components
		for (var name in data) {
			if (data.hasOwnProperty(name)) {
				if (cookieValue !== "") {
					cookieValue += "&";
				}

				cookieValue += name + "=" + encodeURIComponent(data[name]);
			}
		}

		// format for setting the cookie
		var nameval = "RT" + "=\"" + cookieValue + "\"";

		// cookie components
		var c = [nameval, "path=/", "domain=" + document.domain];

		// set the cookie
		document.cookie = c.join("; ");
	};

	t.clearLocalStorage = function() {
		// Clear localStorage
		if (typeof window.localStorage === "object" && typeof window.localStorage.clear === "function") {
			window.localStorage.clear();
		}
	};

	t.clearSessionStorage = function() {
		// Clear sessionStorage
		if (typeof window.sessionStorage === "object" && typeof window.sessionStorage.clear === "function") {
			window.sessionStorage.clear();
		}
	};

	t.parseTimers = function(timers) {
		var timerValues = {};

		if (timers) {
			var timersSplit = timers.split(",");
			for (var i = 0; i < timersSplit.length; i++) {
				var timerSplit = timersSplit[i].split("|");
				timerValues[timerSplit[0]] = parseInt(timerSplit[1], 10);
			}
		}

		return timerValues;
	};

	/**
	* Finds the first load of the specified resource.
	* @param {string} url Partial URL match
	* @return {PerformanceResourceTiming} Last resource to load for that URL
	*/
	t.findFirstResource = function(url) {
		if ("performance" in window &&
			window.performance &&
			window.performance.getEntriesByType) {
			var entries = window.performance.getEntriesByType("resource");

			for (var i = 0; i < entries.length; i++) {
				if (entries[i].name.indexOf(url) !== -1) {
					return entries[i];
				}
			}
		}

		return null;
	};

	/**
	 * Finds the first beacon with the specified parameter
	 *
	 * @param {string} prop Property name
	 * @param {string} val Property value
	 *
	 * @returns {object} Matching beacon
	 */
	t.findMatchingBeacon = function(prop, val) {
		var tf = BOOMR.plugins.TestFramework;

		for (var i = 0; i < tf.beacons.length; i++) {
			if (tf.beacons[i][prop] === val) {
				return tf.beacons[i];
			}
		}
	};

	/**
	 * Finds the first XHR beacon
	 *
	 * @returns {object} XHR beacon
	 */
	t.findXhrBeacon = function() {
		return t.findMatchingBeacon("http.initiator", "xhr");
	};

	/**
	 * Finds the first navigation beacon
	 *
	 * @returns {object} navigation beacon
	 */
	t.findNavBeacon = function() {
		return t.isNavigationTimingSupported() ?
		    t.findMatchingBeacon("rt.start", "navigation") :
		    t.findMatchingBeacon("rt.start", "none");
	};

	/**
	* Finds the last load of the specified resource.
	* @param {string} url Partial URL match
	* @return {PerformanceResourceTiming} Last resource to load for that URL
	*/
	t.findLastResource = function(url) {
		if ("performance" in window &&
			window.performance &&
			window.performance.getEntriesByType) {
			var entries = window.performance.getEntriesByType("resource");

			var res = null;
			for (var i = 0; i < entries.length; i++) {
				if (entries[i].name.indexOf(url) !== -1) {
					if (res === null || entries[i].responseEnd > res.responseEnd) {
						res = entries[i];
					}
				}
			}

			return res;
		}
		else {
			return null;
		}
	};

	/**
	* Finds the nth load of the specified resource.
	* @param {string} url Partial URL match
	* @param {number} n Nth resource
	* @return {PerformanceResourceTiming} Last resource to load for that URL
	*/
	t.findNthResource = function(url, n) {
		if ("performance" in window &&
			window.performance &&
			window.performance.getEntriesByType) {
			var entries = window.performance.getEntriesByType("resource");
			var res = null;
			var matches = 0;

			for (var i = 0; i < entries.length; i++) {
				if (entries[i].name.indexOf(url) !== -1) {
					if (res === null || entries[i].responseEnd > res.responseEnd) {
						if (matches === n) {
							res = entries[i];
							break;
						}

						matches++;
					}
				}
			}

			return res;
		}
		else {
			return null;
		}
	};

	/**
	 * Validates the beacon was sent with a load time equal to when the specified resource
	 * loaded.
	 *
	 * @param {number} beaconIndex Which beacon
	 * @param {string} urlMatch URL to match
	 * @param {number} closeTo Range that the load time can be off by
	 * @param {number} fallbackMin If RT is not supported, the minimum time
	 * @param {number} fallbackMax If RT is not supported, the maximum time
	 * @param {boolean|number} useLastMatch Use the last match of the resource instead of the first, or, if a number, that resource
	 * @param {number} n Check the nth resource
	 */
	t.validateBeaconWasSentAfter = function(beaconIndex, urlMatch, closeTo, fallbackMin, fallbackMax, useLastMatch) {
		var tf = BOOMR.plugins.TestFramework;

		var res;
		if (typeof useLastMatch === "number") {
			res = t.findNthResource(urlMatch, useLastMatch);
		}
		else {
			res = useLastMatch ? t.findLastResource(urlMatch) : t.findFirstResource(urlMatch);
		}

		if (res !== null) {
			assert.closeTo(tf.beacons[beaconIndex].t_done, res.responseEnd, closeTo);
		}
		else {
			// we don't have ResourceTiming, use the fallback times
			assert.operator(tf.beacons[beaconIndex].t_done, ">=", fallbackMin);
			assert.operator(tf.beacons[beaconIndex].t_done, "<=", fallbackMax);
		}
	};

	/**
	 * Ensures the number of beacons specified were sent.
	 *
	 * Also waits a second after the beacon count was hit to ensure no additional
	 * beacons were sent.
	 *
	 * @param {function} done Callback
	 * @param {number} beaconCount Expected beacon count
	 */
	t.ensureBeaconCount = function(done, beaconCount) {
		function compareBeaconCount() {
			return BOOMR.plugins.TestFramework.beaconCount() === beaconCount;
		}
		function testBeaconCount() {
			if (compareBeaconCount()) {
				setTimeout(
					function() {
						done(compareBeaconCount() ? undefined : new Error("beaconCount: " + BOOMR.plugins.TestFramework.beaconCount() + " !== " + beaconCount));
					}, 1000);
			}
			else {
				if (BOOMR.plugins.TestFramework.beaconCount() > beaconCount) {
					done(new Error("Too many beacons!  Expected " + beaconCount + " but got " + BOOMR.plugins.TestFramework.beaconCount()));
				}
				else {
					setTimeout(testBeaconCount, 100);
				}
			}
		}

		testBeaconCount();
	};

	/**
	 * Runs the specified callback if AutoXHR is enabled
	 *
	 * @param {function} done Test done callback
	 * @param {function} testXhr Test to run if AutoXHR is enabled
	 * @param {function} testDegenerate Test if AutoXHR is not enabled
	 */
	t.ifAutoXHR = function(done, testXhr, testDegenerate) {
		if (BOOMR.plugins.AutoXHR) {
			return (testXhr || done || function(){})();
		}
		(testDegenerate || done || function(){})();
	};


	/**
	 * Determines how many elements on the page match the attribute
	 *
	 * @param {string} tagName Tag name
	 * @param {string} attr Attribute name
	 * @param {RegExp} regex Regular expression matching the attribute
	 * @returns {number} Number of elements matching
	 */
	t.elementsWithAttribute = function(tagName, attr, regex) {
		var nodes = document.getElementsByTagName("script");

		var matching = 0;

		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node[attr] && node[attr].match(regex)) {
				matching++;
			}
		}

		return matching;
	};

	/**
	 * Runs a function repeatedly the specified number of times with the
	 * specified delay.
	 *
	 * @param {function} run Function to run
	 * @param {number} times How many times to run it
	 * @param {number} delay How often to delay between runs
	 * @param {function} done What to run when done
	 */
	t.runRepeatedly = function(run, times, delay, done) {
		var runTimes = 0;

		function repeat() {
			if (++runTimes === times) {
				return done();
			}

			run();

			setTimeout(repeat, delay);
		}

		repeat();
	};

	/**
	 * Shows a countdown clock on the page
	 *
	 * @param {Object} test Mocha test case
	 * @param {number} maxTime Maximum timeout
	 * @param {number} expectedTime How many expected seconds
	 *
	 * @returns {string} Timer ID you can use to clearTimeout later
	 */
	t.timeout = function(test, maxTime, expectedTime) {
		test.timeout(maxTime);

		var stats = document.getElementById("mocha-stats");

		var el = document.createElement("li");

		stats.appendChild(el);

		var startTime = +(new Date());
		var endTimeExpected = startTime + expectedTime;
		var endTimeMax = startTime + maxTime;

		var timerID = setInterval(function(){
			var now = +(new Date());
			if (now > endTimeMax) {
				clearInterval(timerID);

				el.parentNode.removeChild(el);

				return;
			}
			else if (now > endTimeExpected) {
				el.style["font-color"] = "red";
			}

			var timeLeft = endTimeMax - now;

			el.innerHTML = "timeout: <em>" + (Math.floor(timeLeft / 100) / 10).toFixed(1) + "</em>s";
		}, 100);

		el.id = "mocha-timer" + timerID;

		return timerID;
	};

	/**
	 * Clears a previously set timer ID
	 *
	 * @param {string} timerID TimerID
	 */
	t.clearTimeout = function(timerID) {
		clearInterval(timerID);

		var el = document.getElementById("mocha-timer" + timerID);
		if (el) {
			el.parentNode.removeChild(el);
		}
	};

	/**
	 * Filters list of strings for number of strings containing a string
	 *
	 * @param {string} string - String to search for
	 * @param {string[]} list - array of strings to test for string
	 *
	 * @returns {string[]} list of strings matching
	 */
	t.checkStringInArray = function(string, list) {
		return list.filter(function(content) {
			return content.indexOf(string) > -1;
		});
	};

	/**
	 * Creates a copy of window.performance that can be modified by the caller.
	 */
	t.getPerformanceCopy = function() {
		if (!("performance" in window)) {
			return;
		}

		var copy = {};

		// copy over all values
		var objs = ["timing", "navigation"];
		for (var i = 0; i < objs.length; i++) {
			var objName = objs[i];
			var subObj = window.performance[objName];

			if (subObj) {
				if (typeof subObj === "function") {
					copy[objName] = window.performance[objName];
					continue;
				}
				copy[objName] = {};
				for (var subObjAttr in subObj) {
					copy[objName][subObjAttr] = subObj[subObjAttr];
				}
			}
		}

		return copy;
	};

	/**
	 * Gets the latest of First Paint or First Contentful Paint
	 *
	 * @returns {number} FP or FCP
	 */
	t.getFirstOrContentfulPaint = function() {
		var fp = 0;
		var p = window.performance;

		// use First Paint (if available)
		if (BOOMR.plugins.PaintTiming &&
			BOOMR.plugins.PaintTiming.is_supported() &&
			p &&
			p.timeOrigin) {
			// LCP - get the largest one that happened by the beacon
			var lb = BOOMR.plugins.TestFramework.lastBeacon();
			if (lb["pt.lcp"]) {
				fp = lb["pt.lcp"];
			}

			if (!fp) {
				// or FCP
				fp = BOOMR.plugins.PaintTiming.getTimingFor("first-contentful-paint");
			}
			if (!fp) {
				// or get First Paint directly from PaintTiming
				fp = BOOMR.plugins.PaintTiming.getTimingFor("first-paint");
			}

			if (fp) {
				// convert to epoch
				fp = Math.round(fp + p.timeOrigin);
			}
		}
		else if (p && p.timing && p.timing.msFirstPaint) {
			fp = p.timing.msFirstPaint;
		}
		else if (window.chrome &&
			typeof window.chrome.loadTimes === "function") {
			var loadTimes = window.chrome.loadTimes();
			if (loadTimes && loadTimes.firstPaintTime) {
				fp = loadTimes.firstPaintTime * 1000;
			}
		}

		return fp;
	};

	/**
	 * Do busy work for the specified number of ms
	 */
	t.busy = function(ms) {
		var startTime = (new Date()).getTime();
		var now = startTime;
		var endTime = startTime + ms;
		var math = 1;

		while (now < endTime) {
			now = (new Date()).getTime();
			math *= 2;
			math *= 0.5;
		}
	};

	/**
	 * Validates an early beacon against the load beacon
	 */
	t.validateEarlyBeacon = function(early, normal) {
		var i, field, timer, timers, early_timers = {}, normal_timers = {};

		// Don't test h.pg, we'll do some magic in the tests to make sure page params runs twice

		// Not yet tested:
		// "vis.st",
		// "dom.res",
		// "dom.doms",
		// "mem.total",
		// "mem.limit",
		// "mem.used",
		// "scr.xyv",
		// "scr.bpp",
		// "scr.orn",
		// "scr.dpx",
		// "cpu.cnc",
		// "bat.lvl",
		// "dom.ln",
		// "dom.sz",
		// "dom.img",
		// "dom.script",
		// "dom.script.ext",
		// "dom.iframe",
		// "dom.iframe.ext",
		// "dom.link",

		// fields that should be the same on both beacons
		var fieldsEqual = [
			"h.key",
			"rt.start",
			"rt.bmr",
			"rt.tstart",
			"rt.nstart",
			"rt.bstart",
			"rt.blstart",
			"rt.si",
			"rt.ss",
			"rt.sstr_dur",
			"rt.sstr_to",
			"v",
			"pid",
			"ua.plt",
			"ua.vnd",
			"u",
			"nt_red_cnt",
			"nt_nav_type",
			"nt_nav_st",
			"nt_red_st",
			"nt_red_end",
			"nt_fet_st",
			"nt_dns_st",
			"nt_dns_end",
			"nt_con_st",
			"nt_con_end",
			"nt_req_st",
			"nt_res_st",
			"nt_res_end",
			"nt_domloading",
			"nt_domint",
			"nt_domcontloaded_st",
			"nt_domcontloaded_end",
			"nt_unload_st",
			"nt_unload_end",
			"nt_domcomp",
			"nt_load_st",
			"nt_load_end",  // load could have ended in the case of SPA hard
			"nt_first_paint",
			"nt_spdy",
			"nt_cinf",
			"if",
			"vis.pre",
			"t_configls",
			"t_domloaded",
			"t_load",
			"t_prerender",
			"t_postrender"
		];

		// fields that should not be on early beacon
		var fieldsUndefined = [
			// no page load timing available yet
			"t_resp",
			"t_page",
			"t_done",
			"restiming"  // no restiming on early beacons
		];

		// fields that should be the same on both beacons if available
		var fieldsEqualIfExists = [
			"rt.cnf",  // may not be there if config loaded from localStorage
			"t_configfb",
			"t_configjs"
		];

		// fields that must be on the early beacon
		var fieldsMustExist = [
			"rt.end",
			"rt.tt",
			"early"
		];

		for (i = 0; i < fieldsEqual.length; i++) {
			field = fieldsEqual[i];
			if (field.indexOf("nt_") === 0 && (!(field in early) || early[field] === 0)) {
				// nav timing fields may be 0 or missing on the early beacon
				continue;
			}
			if (typeof normal[field] === "undefined") {
				assert.isUndefined(early[field], field + " must not be on early beacon if not on the load beacon");
			}
			else {
				assert.equal(normal[field], early[field], field + " " + normal[field] + " === " +  early[field]);
			}
		}

		for (i = 0; i < fieldsUndefined.length; i++) {
			field = fieldsUndefined[i];
			assert.isUndefined(early[field], field + " must not be on early beacon");
		}

		for (i = 0; i < fieldsEqualIfExists.length; i++) {
			field = fieldsEqualIfExists[i];
			if (typeof early[field] !== "undefined") {
				assert.equal(normal[field], early[field], field + " " + normal[field] + " === " +  early[field]);
			}
		}

		for (i = 0; i < fieldsMustExist.length; i++) {
			field = fieldsMustExist[i];
			assert.isDefined(early[field], field + " must exist");
		}

		// rt.sl should be 1 less on the early beacon
		assert.equal(parseInt(normal["rt.sl"], 10), parseInt(early["rt.sl"], 10) + 1,
		    "session length " + normal["rt.sl"] + " === " +  early["rt.sl"] + " + 1");

		// rt.obo should be equal or 1 more on the normal beacon (if navtiming not supported)
		if (early["rt.obo"] !== normal["rt.obo"] && (parseInt(early["rt.obo"], 10) + 1) !== parseInt(normal["rt.obo"], 10)) {
			assert.fail("rt.obo must be equal or 1 more on normal beacon");
		}

		// t_other, if a timer is on the early beacon then it must be on the normal beacon
		if (early.t_other) {
			if (normal.t_other) {
				normal_timers = this.parseTimers(normal.t_other);
				early_timers = this.parseTimers(early.t_other);

				for (timer in early_timers) {
					if (early_timers.hasOwnProperty(timer)) {
						if (timer.indexOf("custom") === 0) {
							//custom timers may get longer (eg. ResourceGroups matching several resources)
							assert.operator(normal_timers[timer], ">=", early_timers[timer],
						    "t_other  " + timer + " " + normal_timers[timer] + " >= " +  early_timers[timer]);
						}
						else {
							assert.equal(normal_timers[timer], early_timers[timer],
							    "t_other  " + timer + " " + normal_timers[timer] + " === " +  early_timers[timer]);
						}
					}
				}
			}
			else {
				assert.fail("t_other on early beacon but missing on the normal beacon");
			}
		}
	};

	/**
	 * Determines the user agent is Internet Explorer or not
	 *
	 * @returns {boolean} True if the user agent is Internet Explorer
	 */
	t.isIE = function() {
		return window.navigator &&
			(window.navigator.userAgent.indexOf("MSIE") !== -1 ||
			window.navigator.appVersion.indexOf("Trident/") > 0);
	};

	/**
	 * Determines the user agent is Edge or not
	 *
	 * @returns {boolean} True if the user agent is Edge
	 */
	t.isEdge = function() {
		return window.navigator &&
			(window.navigator.userAgent.indexOf("Edge") !== -1);
	};

	/**
	 * Determines the user agent is Firefox or not
	 *
	 * @returns {boolean} True if the user agent is Firefox
	 */
	t.isFirefox = function() {
		return window.navigator &&
			(window.navigator.userAgent.indexOf("Firefox") !== -1);
	};

	/**
	 * Determines the user agent is Chrome or not
	 *
	 * @returns {boolean} True if the user agent is Chrome
	 */
	t.isChrome = function() {
		return window.navigator &&
			(window.navigator.userAgent.indexOf("Chrome") !== -1);
	};

	/**
	 * Determines the user agent is Safari or not
	 *
	 * @returns {boolean} True if the user agent is Safari
	 */
	t.isSafari = function() {
		return window.navigator && window.navigator.vendor &&
			(window.navigator.vendor.indexOf("Apple") !== -1);
	};

	/**
	 * Whether or not the browser supports IFRAME loading method.
	 *
	 * i.e. not IE 6 / 7
	 *
	 * @returns {boolean} True if the browser supports IFRAME loading method
	 */
	t.supportsLoaderIframe = function() {
		// Not IE 6 / 7
		if (t.isIE() && navigator.userAgent.match(/MSIE [67]\./)) {
			return false;
		}

		return true;
	};

	/**
	 * Whether or not the browser supports link rel="preload"
	 *
	 * @returns {boolean} True if the browser supports Preload
	 */
	t.supportsPreload = function() {
		// See if Preload is supported or not
		var link = document.createElement("link");

		return (link.relList &&
			typeof link.relList.supports === "function" &&
			link.relList.supports("preload") &&
			("as" in link));
	};

	/**
	 * Whether or not the snippet was loaded in Preload mode
	 *
	 * @returns {boolean} True if the snippet loaded in Preload mode
	 */
	t.snippetWasLoadedPreload = function() {
		return BOOMR.utils.arrayFilter(
			document.getElementsByTagName("link"),
			function(l) {
				return l.rel === "preload" &&
					l.as === "script" &&
					l.href.indexOf("boomerang-latest") !== -1;
			}
		).length === 1;
	};

	/**
	 * Whether or not the snippet was loaded in IFRAME mode
	 *
	 * @returns {boolean} True if the snippet loaded in IFRAME mode
	 */
	t.snippetWasLoadedIframe = function() {
		return BOOMR.utils.arrayFilter(
			document.getElementsByTagName("iframe"),
			function(l) {
				return l.src === "about:blank";
			}
		).length === 1;
	};

	/**
	 * Finds the Boomerang Loader Frame
	 *
	 * @returns {Element} Boomerang Loader Frame
	 */
	t.findBoomerangLoaderFrame = function() {
		return BOOMR.utils.arrayFilter(
			document.getElementsByTagName("iframe"),
			function(l) {
				return l.src === "about:blank";
			}
		)[0];
	};

	/**
	 * Finds the Boomerang Loader LINK rel='preload'
	 *
	 * @returns {Element} Boomerang Loader LINK
	 */
	t.findBoomerangLoaderLinkPreload = function() {
		return BOOMR.utils.arrayFilter(
			document.getElementsByTagName("link"),
			function(l) {
				return l.rel === "preload";
			}
		)[0];
	};

	/**
	 * Finds the Boomerang Loader SCRIPT (for SCRIPT or IFRAME mode)
	 *
	 * @returns {Element} Boomerang Loader SCRIPT
	 */
	t.findBoomerangLoaderScript = function() {
		return document.getElementById("boomr-async") || document.getElementById("boomr-if-as");
	};

	/**
	 * Finds the Boomerang Loader SCRIPT (for Preload mode)
	 *
	 * @returns {Element} Boomerang Loader SCRIPT
	 */
	t.findBoomerangLoaderScriptPreload = function() {
		return document.getElementById("boomr-scr-as");
	};

	/**
	 * Whether or not the snippet was loaded in SCRIPT mode
	 *
	 * @returns {boolean} True if the snippet loaded in SCRIPT mode
	 */
	t.snippetWasLoadedScript = function() {
		return BOOMR.utils.arrayFilter(
			document.getElementsByTagName("script"),
			function(l) {
				return l.id === "boomr-async";
			}
		).length === 1;
	};

	/**
	 * Forces the Boomerang Loader Snippet to use the SCRIPT fallback
	 * (by trying to overwrite navigator.userAgent and overwriting aEL/attachEvent)
	 *
	 * @returns {boolean} True if we were able to force SCRIPT mode
	 */
	t.forceSnippetScript = function() {
		// If we're already IE6/7, leave as-is
		if (t.isIE() && navigator.userAgent.match(/MSIE [67]\./)) {
			return true;
		}

		//
		// force IFRAME first
		//
		t.forceSnippetIframe();

		//
		// then force SCRIPT
		//

		// remove aEL
		var oldAEL = window.addEventListener;
		if (window.addEventListener) {
			window.addEventListener = undefined;
		}

		// fake attachEvent
		if (!window.attachEvent) {
			window.attachEvent = function() {
				// remove "on" and forward to aEL
				arguments[0] = arguments[0].substr(2);

				oldAEL.apply(window, arguments);
			};
		}

		// change the UA
		var USER_AGENT = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)";

		// Works on Firefox, Chrome, Opera and IE9+
		if (navigator.__defineGetter__) {
			navigator.__defineGetter__("userAgent", function() {
				return USER_AGENT;
			});
		}
		else if (Object.defineProperty) {
			try {
				Object.defineProperty(navigator, "userAgent", {
					get: function() {
						return USER_AGENT;
					}
				});
			}
			catch (e) {
				// IE8 is not able to overwrite native properties
				return false;
			}
		}
		// Works on Safari
		else if (window.navigator.userAgent !== USER_AGENT) {
			var userAgentProp = {
				get: function() {
					return USER_AGENT;
				}
			};

			try {
				Object.defineProperty(window.navigator, "userAgent", userAgentProp);
			}
			catch (e) {
				window.navigator = Object.create(navigator, {
					userAgent: userAgentProp
				});
			}
		}

		return true;
	};

	/**
	 * Forces the Boomerang Loader Snippet to use the IFRAME fallback
	 */
	t.forceSnippetIframe = function() {
		if (!t.supportsPreload()) {
			return;
		}

		// destroy link relList for preload
		t.createElementOrig = document.createElement;

		document.createElement = function() {
			var ret = t.createElementOrig.apply(document, arguments);
			if (ret.relList) {
				ret.relList.supports = undefined;
			}
			return ret;
		};
	};

	/*
	 * Finds Marks from Boomerang with the specified name
	 *
	 * @param {string} name Mark name
	 */
	t.findBoomerangMarks = function(name) {
		if (!t.isUserTimingSupported()) {
			return [];
		}

		return BOOMR.utils.arrayFilter(performance.getEntriesByType("mark"), function(m) {
			return m.name === "boomr:" + name;
		});
	};

	/**
	 * Finds Marks from Boomerang between the specified time frame
	 *
	 * @param {string} name Mark name
	 * @param {number} start Start time
	 * @param {number} end End tiem
	 */
	t.findBoomerangMarksBetween = function(name, start, end) {
		if (!t.isUserTimingSupported()) {
			return [];
		}

		// cast a marks to times if needed
		start = (start && start.startTime) || start;
		end = (end && end.startTime) || end;

		return BOOMR.utils.arrayFilter(performance.getEntriesByType("mark"), function(m) {
			return m.name === "boomr:" + name &&
				m.startTime >= start &&
				m.startTime <= end;
		});
	};

	t.siteDomain = function() {
		return window.location.hostname.replace(/.*?([^.]+\.[^.]+)\.?$/, "$1").toLowerCase();
	};

	window.BOOMR_test = t;

	// force LOGN plugin not to run. Individual tests will override this if needed.
	// This only works if the test framework is loaded before boomerang
	window.BOOMR_LOGN_always = false;

	/*eslint-disable no-extend-native*/
	// Polyfill via https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
	if (!Function.prototype.bind) {
		Function.prototype.bind = function(oThis) {
			if (typeof this !== "function") {
				// closest thing possible to the ECMAScript 5
				// internal IsCallable function
				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}

			var aArgs   = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP    = function() {},
			fBound  = function() {
				return fToBind.apply(this instanceof fNOP ? this : oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};

			if (this.prototype) {
				// Function.prototype doesn't have a prototype property
				fNOP.prototype = this.prototype;
			}
			fBound.prototype = new fNOP();

			return fBound;
		};
	}
	/*eslint-enable no-extend-native*/

}(window));

/**
 * Adds support for FNV hashing algorithm (slightly modified) to Boomerang Test Framework.
 */
window.BOOMR_test.hashString = (function() {
	/*jslint bitwise: true */
	/*global unescape*/

	"use strict";
	function fnv(string) {
		string = encodeURIComponent(string);
		var hval = 0x811c9dc5;

		for (var i = 0; i < string.length; i++) {
			hval = hval ^ (string.charCodeAt(i) & 0xFF);
			hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
		}

		var hash = (hval >>> 0).toString() + string.length;

		return parseInt(hash).toString(36);
	}

	return fnv;
}());
