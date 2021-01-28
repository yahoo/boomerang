<div style="border: 1px solid #ccc; padding: 0 10px 10px; margin-bottom: 20px">
<h3 style="margin-top:10px;">Disclaimer:</h3>

<p style="margin-bottom: 0">This tutorial does not constitute legal advice or a legal opinion on any matter discussed. This tutorial is for educational purposes only. If you have a specific legal question, please consult with an attorney of your own choice.</p>
</div>

Boomerang is an open source JavaScript library that measures a web site’s performance. As such it is considered in some countries in the EU and Asia as **“cookie technology”** and triggers certain data protection requirements. Such requirements vary depending on the categorization of cookie technology used for website performance measurement by local authorities. Some authorities require consent by end users to the cookie technology prior to its placement on a website (**"opt-in"**). According to **GDPR** and other applicable laws, such consent must be freely given, specific, informed and unambiguous. Some authorities accept the placement of cookie technology on a website without consent and require the implementation of a mechanism to stop the cookie usage once the end user requests so (**"opt-out"**). Such setup is e.g. accepted under **CCPA**, the California Consumer Privacy Act that entered into force January 1, 2020.

This tutorial describes techniques and configurations that help Boomerang users to instrument opt-out and opt-in scenarios. In addition the tutorial describes how to instrument 3 different consent management techniques via special [Consent Inlined Plugin](./BOOMR.plugins.ConsentInlinedPlugin.html), a Boomerang Loader Wrapper and the Osano Cookies Consent library.

Tutorial structure:
1. [Opt-out and Opt-in scenarios](#scenarios)
2. [Cookies and Local Storage](#cookies-and-local-storage)
3. [Consent Inline Plugin Overview](#consent-inline-plugin)
     1. [Opt-out example](#opt-out)
     2. [Opt-in example](#opt-in)
4. [Opt-in with Boomerang Loader Wrapper](#opt-in-loader-wrapper)
5. [Cookie Consent library and Consent Inline Plugin example](#cookie-consent-popup-examples)
     1. [Opt-out example](#popup-examples-opt-out)
     2. [Opt-in example](#popup-examples-opt-in)

<a name="scenarios"></a>
## 1. Opt-out and Opt-in scenarios

We identified 3 common scenarios how Boomerang could be loaded to comply with the applicable data protection requirements.

* **Opt-out from Boomerang**: By default Boomerang is loaded on the page and sends performance data. Boomerang will be disabled and the Boomerang cookies will be deleted if a visitor opts-out from Boomerang through Cookie Consent popup.

|                              | Before opt-out | After opt-out           |
|------------------------------|----------------|-------------------------|
| Boomerang Loaded             | Yes            | Yes                     |
| Beacons Sent                 | Yes            | No                      |
| RT Cookie exists             | Yes            | No                      |
| BA Cookie  exists            | Yes            | No                      |
| BOOMR_CONSENT Cookie  exists | No             | Yes (value `opted-out`) |
| Extra beacon params          | No             | No                      |
* **Opt-in to Boomerang (Boomerang loaded before opt-in)**: By default Boomerang is loaded on the page and does **NOT** send performance data. Performance data will be sent after a visitor opts-in to Boomerang through a Cookie Consent popup.

|                              | Before opt-in | After opt-in           |
|------------------------------|---------------|------------------------|
| Boomerang Loaded             | Yes           | Yes                    |
| Beacons Sent                 | No            | Yes                    |
| RT Cookie exists             | Yes           | Yes                    |
| BA Cookie  exists            | Yes           | Yes                    |
| BOOMR_CONSENT Cookie  exists | No            | Yes (value `opted-in`) |
| Extra beacon params          | No            | `cip.in`, `cip.v`      |
  \* `cip.in`, `cip.v` parameters are being sent on first beacon after opt-in and they indicate that visitor opted-in and Consent Inlined Plugin version.
* **Opt-in to Boomerang (Boomerang loaded after opt-in)**: Boomerang will be loaded and performance data sent after only after a visitor opts-in to Boomerang through the Cookie Consent popup.

|                     | Before opt-in | After opt-in |
|---------------------|---------------|--------------|
| Boomerang Loaded    | No            | Yes          |
| Beacons Sent        | No            | Yes          |
| RT Cookie exists    | No            | Yes          |
| BA Cookie  exists   | No            | Yes          |
| Extra beacon params | No            | No           |

<a name="cookies-and-local-storage"></a>
## 2. Cookies and Local Storage

## 2.1 Cookies
List of cookies created and used by Boomerang:

| Name            | <div style="width:120px">Expires</div> | <div style="width:120px">Type</div> | Description                                                                                                                                                                                    |
|-----------------|----------------------------------------|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `RT`            | 7 days                                 | First-party                         | Doesn't contain personal information but it contains various pieces of information about the visitor's session, such as number of visited pages, session start time, last visited url and etc. |
| `BA`            | 7 days                                 | First-party                         | Used by Bandwidth Boomerang plugin. Doesn't contain personal information.                                                                                                                      |
| `BOOMR_CONSENT` | 1 year                                 | First-party                         | Contains information about visitor's choice for opt-out or opt-in.                                                                                                                             |

For detailed information about what data is kept on the cookies listed above, please read the "Cookies" section of [Boomerang documentation page](https://developer.akamai.com/tools/boomerang/#Cookies).

## 2.2 Local Storage (mPulse users specific)
For mPulse customers, in some instances Boomerang will persist data in Browser's Local Storage. In these instances a Local Storage is used for performance optimization and reduction of network round trips.

List of local storage keys used by Boomerang:

| Key                     | <div style="width:120px">Plugin</div> | Description                                                                                                             |
|-------------------------|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `_boomr_LOGN`           | LOGN                                  | Persists Boomerang JSON configuration. Helps for faster Boomerang initialization. Doesn't contain personal information. |
| `_boomr_akamaiXhrRetry` | Akamai                                | Persists a flag that instructs the Akamai plugin when to perform requests. Doesn't contain personal information.        |

<a name="consent-inline-plugin"></a>
## 3. Consent Inline Plugin

The Consent Inline Plugin is not part of the Boomerang build but it could be easily injected before Boomerang code which will make the plugin available. The plugin provides 2 helper functions `window.BOOMR_OPT_OUT()` and `window.BOOMR_OPT_IN()` that can be used for instrumenting opt-out and opt-in.

When `window.BOOMR_OPT_OUT()` is called Boomerang will stop sending beacon data, `RT` and `BA` cookies will be deleted and the new special `BOOMR_CONSENT` cookie with value `opted-out` will be created.

Consent Inline Plugin has the capability to instruct Boomerang to hold beacon sending until `window.BOOMR_OPT_IN()` is called. When `window.BOOMR_OPT_IN()` is called a cookie `BOOMR_CONSENT` with value `opted-in` will be created.

The purpose of `BOOMR_CONSENT` cookie is to "tell" Boomerang what was the visitor's consent choice when a visitor navigates to a new page.

<a name="opt-out"></a>
## 3.1 Opt-out allowed example

In case we would like to allow website visitors to opt-out from Boomerang we must follow the steps in this order:

1. Inject Consent Inline Plugin configuration:
```html
<script>
window.BOOMR_CONSENT_CONFIG = {
     enabled: true
};
</script>
```
2. Inject Consent Inline Plugin code:
```html
<script>
%minified_consent_inline_plugin_code%
</script>
```
3. Load Boomerang via loader snippet.
4. Call `window.BOOMR_OPT_OUT()` when visitor opts-out via Cookie consent popup or other UI element.

<a name="opt-in"></a>
## 3.2 Opt-in required example

When we would like to not send Beacon data until visitor opts-in to Boomerang we must follow the steps in this order:

1. Inject Consent Inline Plugin configuration:
```html
<script>
window.BOOMR_CONSENT_CONFIG = {
     enabled: true,
     optInRequired: true
};
</script>
```
2. Inject Consent Inline Plugin code:
```html
<script>
%minified_consent_inline_plugin_code%
</script>
```
3. Load Boomerang via loader snippet.
4. Call `window.BOOMR_OPT_IN()` when a visitor opted in via Cookie consent popup or other UI element.

<a name="opt-in-loader-wrapper"></a>
## 4. Opt-in with Boomerang Loader Wrapper

Users of Boomerang open source and some mPulse customers have to manually inject Boomerang on the page. This opens a possibility of waiting for the Boomerang loader snippet to be executed until after a visitor opts-in to Boomerang through Cookie Consent popup. By doing so, Boomerang won't be loaded until after opt-in has been chosen.
 
This technique is simple and can be done in 2 steps:
1. Wrap Boomerang loader snippet in **BOOMERANG_LOADER_SNIPPET_WRAPPER()** function.
The example below doesn't include the full loader snippet source code but you can get the full code of the loader snippet from here: {@tutorial loader-snippet} 
```html
<script>
var BOOMERANG_LOADER_SNIPPET_WRAPPER = function() {
     (function() {
          // Boomerang Loader Snippet  
          if (window.BOOMR && (window.BOOMR.version || window.BOOMR.snippetExecuted)) {
               return;
          }
          // ...
          // ...
          // ...
     })();
}
</script>
```
2. Call **BOOMERANG_LOADER_SNIPPET_WRAPPER()** function when visitor opts-in.
Usually Cookie Consent popup libraries provide callback functions that help us to instrument opt-out and opt-in procedures. For simplicity we will define a callback function with example name **onOptIn()** where we will run the code needed for opt-in. In our case we have to place **BOOMERANG_LOADER_SNIPPET_WRAPPER()** in our callback function **onOptIn()**.
```html
<script>
function onOptIn() {
     BOOMERANG_LOADER_SNIPPET_WRAPPER();
}
</script>
```

<a name="cookie-consent-popup-examples"></a>
## 5. Cookie Consent library and Consent Inline Plugin example

We prepared Boomerang opt-out and opt-in examples with the popular open source project - [Osano Cookie Consent popup library](https://github.com/osano/cookieconsent). For the given examples below we assume that the needed Cookie Consent popup script and Boomerang Consent Inline Plugin are loaded on the page.

<a name="popup-examples-opt-out"></a>
## 5.1 Opt-out

```javascript
// Setup Osano Cookie popup
function onCookieConsentChange(consent) {
	if (consent === "deny") {
		window.BOOMR_OPT_OUT();
	}
}

window.addEventListener("load", function() {
	window.cookieconsent.initialise({
		"type": "opt-out",
		"content": {
			"href": "https://www.example.com/policies/"
		},
		onInitialise: onCookieConsentChange,
		onStatusChange: onCookieConsentChange,
		onRevokeChoice: onCookieConsentChange
	});
});
```

<a name="popup-examples-opt-in"></a>
## 5.2 Opt-in

```javascript
// Setup Osano Cookie popup
function onCookieConsentChange(consent) {
	if (consent === "allow") {
		window.BOOMR_OPT_IN();
	}
}

window.addEventListener("load", function() {
	window.cookieconsent.initialise({
		"type": "opt-in",
		"content": {
			"href": "https://www.example.com/policies/"
		},
		onInitialise: onCookieConsentChange,
		onStatusChange: onCookieConsentChange,
		onRevokeChoice: onCookieConsentChange
	});
});
```