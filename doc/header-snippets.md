Header Snippets are small pieces of JavaScript code that can be injected into a Page's HTML so that even before Boomerang loads, components of the page load experience (such as JavaScript errors) are still fully measured.

These Header Snippets should be added as inline `<script>` tags within the `<head>` of a document, ideally right before the {@tutorial loader-snippet} is included.

## JavaScript Errors (for {@link BOOMR.plugins.Errors})

Boomerang listens for JavaScript errors via the {@link BOOMR.plugins.Errors} plugin by monitoring the [`onerror`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror)
global event handler.  However, JavaScript errors that occur prior to Boomerang being loaded will be missed.

This Errors Snippet monitors for JavaScript Errors via the [`onerror`](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror)
event and will "hand off" the errors to Boomerang once it has loaded.

Source:

```javascript
<script>
%errors_snippet%</script>
```

Minified:

```javascript
<script>%minified_errors_snippet%</script>
```


## Frame Rate (for {@link BOOMR.plugins.Continuity})

The {@link BOOMR.plugins.Continuity} plugin measures performance and user experience metrics beyond just the
traditional Page Load timings.

One of the metrics that the {@link BOOMR.plugins.Continuity} plugin measures is Frame Rate (FSP) data via
[`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).  However,
FPS data is "real-time" and is not available for scripts like Boomerang that may load later in the page load process.

This Header Snippet will start monitoring
[`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) and hand the
FPS data off to Boomerang once it has loaded.

Source:

```javascript
<script>
%continuity_snippet%</script>
```

Minified:

```javascript
<script>%minified_continuity_snippet%</script>
```

## Instrumenting XMLHttpRequests (for {@link BOOMR.plugins.AutoXHR})

The {@link BOOMR.plugins.AutoXHR} plugin monitors `XMLHttpRequests` on the page.

The performance data of `XMLHttpRequests` that start before Boomerang is loaded may not be monitored.

This Header Snippet will start monitoring `XMLHttpRequests` and hand the performance data off to Boomerang once it
has loaded.

Source:

```javascript
<script>
%autoxhr_snippet%</script>
```

Minified:

```javascript
<script>%minified_autoxhr_snippet%</script>
```
