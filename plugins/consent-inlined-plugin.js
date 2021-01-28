/**
 *
 * The **Consent Inlined Plugin** enables website visitors to allow or disallow Boomerang to send performance monitoring data to a remote server.
 * This plugin comes handy because Boomerang is considered in some countries in the EU and Asia as **“cookie technology”**
 * and triggers certain data protection requirements. In the [Boomerang opt-out/opt-in tutorial](./tutorial-howto-opt-out-or-opt-in.html)
 * we discuss various cases how this plugin could be instrumented.
 *
 * ## How it works?
 *
 * There are 2 popular scenarios:
 * * **Opt-out** allowed: Beacons will be sent until visitor does opt-out. This plugin exposes public
 * function `window.BOOMR_OPT_OUT()` and Boomerang will stop sending beacons after `window.BOOMR_OPT_OUT()` is  called.
 * Opt-out usually happens when a visitor doesn't agree with website's Cookie, Privacy and 3rd party policies.
 * * **Opt-in** required: No beacons wil be sent until visitor does opt-in. This plugin exposes public
 * function `window.BOOMR_OPT_IN()` and Boomerang will hold all beacons until `window.BOOMR_OPT_IN()` is not called.
 * `window.BOOMR_OPT_IN()` should be called after visitor accepts and agrees with website's Cookie, Privacy and 3rd party policies.
 *
 * ## Setup
 *
 * Currently this plugin and it's configuration are not part of Boomerang build and they must be included on the page
 * before Boomerang loader snippet.
 *
 * ### Order
 *
 * It's mandatory that we follow this order in order to include and configure the plugin properly:
 *
 * 1. Inject plugin configuration.
 * 2. Inject Consent Plugin code.
 * 3. Inject Boomerang loaded snippet.
 *
 * Example:
 *
 * ```html
 * <script>
 * // 1. Inject plugin configuration.
 * window.BOOMR_CONSENT_CONFIG = {
 *     enabled: true
 * };
 * </script>
 * <script>
 * // 2. Inject Consent Plugin code.
 * ...
 * </script>
 * <script>
 * // 3. Inject Boomerang loaded snippet.
 * ...
 * </script>
 * ```
 * ### Opt-out allowed
 *
 * In order to allow visitors to opt-out from Boomerang we need to follow 2 steps:
 *
 * 1. Inject the following following configuration before ConsentInlinedPlugin code:
 * ```html
 * <script>
 * window.BOOMR_CONSENT_CONFIG = {
 *     enabled: true
 * };
 * </script>
 * ```
 *
 * 2. Call `window.BOOMR_OPT_OUT()` when a visitor doesn't agree with website's Cookie, Privacy and 3rd party policies.
 *
 * ### Opt-in required
 *
 * 1. Inject the following following configuration before ConsentInlinedPlugin code:
 * ```html
 * <script>
 * window.BOOMR_CONSENT_CONFIG = {
 *     enabled: true,
 *     optInRequired: true
 * };
 * </script>
 * ```
 *
 * 2. Call `window.BOOMR_OPT_IN()` when a visitor agrees with website's Cookie, Privacy and 3rd party policies.
 *
 * ## Beacon Parameters:
 *
 * The following parameters are sent only on the first beacon when a visitor opts-in for first time.
 *
 * * `cip.in`: Equals `1` and indicates that visitor opted-in.
 * * `cip.v`: Indicates the version of ConsentInlinedPlugin. It's useful to track who is using which
 * version of the plugin because this plugin is not part of Boomerang build.
 *
 * @class BOOMR.plugins.ConsentInlinedPlugin
 */
// w is the window object
(function(w) {
	"use strict";

	// Basic check if configuration exists and if Opt-out/opt-in pligin is enabled.
	if (w.BOOMR_CONSENT_CONFIG === undefined || w.BOOMR_CONSENT_CONFIG.enabled !== true) {
		return;
	}

	w.BOOMR = (w.BOOMR !== undefined) ? w.BOOMR :  {};

	var b = w.BOOMR;

	b.plugins = (b.plugins !== undefined) ? b.plugins : {};

	if (b.plugins.ConsentInlinedPlugin) {
		return;
	}

	var impl = {

		/**
 		 * We would like to keep track of this plugin version because we may have new releases
		 * but it could be hard to keep track who is using which version of the plugin. We have
		 * to do it this way because the plugin is not part of the final Boomerang bundle.
		 */
		v: "1",

		OPT_COOKIE: "BOOMR_CONSENT",

		OPT_IN_COOKIE_VAL: "opted-in",

		OPT_OUT_COOKIE_VAL: "opted-out",

		// 1 year cookie expire period
		COOKIE_EXP: 365 * 86400,

		complete: false,

		enabled: true,

		firedPageReady: false,

		deferredOptIn: false,

		deferredOptOut: false,

		rtCookieFromConfig: false,

		bwCookieFromConfig: false,

		optOut: function() {
			if (!b.utils.setCookie(impl.OPT_COOKIE, impl.OPT_OUT_COOKIE_VAL, impl.COOKIE_EXP)) {
				b.error("Can not set Opt Out cookie", "ConsentInlinedPlugin");
				return false;
			}

			// Older versions of Boomerang do not have disable capability
			if (typeof b.disable === "function") {
				b.disable();
			}

			impl.complete = false;

			impl.removeBoomerangCookies();

			return true;
		},

		optIn: function() {
			if (impl.complete === true) {
				return true;
			}

			if (!b.utils.setCookie(impl.OPT_COOKIE, impl.OPT_IN_COOKIE_VAL, impl.COOKIE_EXP)) {
				b.error("Can not set Opt In value", "ConsentInlinedPlugin");
				return false;
			}

			// These days we do not have a way to wake up Boomerang but in newer versions we may implement such a function
			if (typeof b.wakeUp === "function") {
				b.wakeUp();
			}

			impl.complete = true;

			b.addVar("cip.in", "1", true);
			b.addVar("cip.v", impl.v, true);

			b.sendBeacon();

			return true;
		},

		removeBoomerangCookies: function() {
			var RT_COOKIE = impl.rtCookieFromConfig || "RT";
			var BW_COOKIE = impl.bwCookieFromConfig || "BA";

			b.utils.removeCookie(RT_COOKIE);
			b.utils.removeCookie(BW_COOKIE);
		},

		/**
		 * Callback when the page is ready
		 */
		onPageReady: function() {
			impl.firedPageReady = true;

			if (impl.deferredOptIn) {
				impl.optIn();
			}

			if (impl.deferredOptOut) {
				impl.optOut();
			}
		}
	};

	//
	// Exports
	//

	/**
	 * Boomerang will not send more beacons after this function is called.
	 *
	 * @name BOOMR_OPT_OUT()
	 * @memberof BOOMR.plugins.ConsentInlinedPlugin
	 */
	w.BOOMR_OPT_OUT = function() {
		if (impl.firedPageReady) {
			impl.optOut();
		}
		else {
			impl.deferredOptOut = true;
		}
	};

	/**
	 * If opt-in to Boomerang was required and this functions is called then Boomerang will
	 * start sending beacons.
	 *
	 * @name BOOMR_OPT_IN()
	 * @memberof BOOMR.plugins.ConsentInlinedPlugin
	 */
	w.BOOMR_OPT_IN = function() {
		if (impl.firedPageReady) {
			impl.optIn();
		}
		else {
			impl.deferredOptIn = true;
		}
	};

	b.plugins.ConsentInlinedPlugin = {
		init: function(config) {
			if (config.RT !== undefined && config.RT.cookie !== undefined) {
				impl.rtCookieFromConfig = config.RT.cookie;
			}

			if (config.BW !== undefined && config.BW.cookie !== undefined) {
				impl.bwCookieFromConfig = config.BW.cookie;
			}

			b.subscribe("page_ready", impl.onPageReady, null, impl);

			if (w.BOOMR_CONSENT_CONFIG.optInRequired) {
				if (b.utils.getCookie(impl.OPT_COOKIE) !== impl.OPT_IN_COOKIE_VAL) {
					impl.complete = false;
					return this;
				}
			}


			if (b.utils.getCookie(impl.OPT_COOKIE) === impl.OPT_OUT_COOKIE_VAL) {
				/**
				 * BOOMR.init() is being called periodically. Usually every 5 minutes. This triggers
				 * logic that creates Boomerang cookies. We use a workaround that sets the cookie names
				 * to empty string which prevents Boomerang from creating Cookies.
				 */
				if (config.RT === undefined) {
					config.RT = {};
				}

				config.RT.cookie = "";

				if (config.BW === undefined) {
					config.BW = {};
				}

				config.BW.cookie = "";

				impl.complete = false;
				return this;
			}

			impl.complete = true;

			return this;
		},

		is_complete: function() {
			return impl.complete;
		}
	};

}(window));
