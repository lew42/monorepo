# The registry gate — removed, and it cannot come back

**The question.** How does a click know whether a url is a real page *before*
navigating? The old Router asked `Page.registry`.

**Why that's unanswerable.** A registry can only contain pages that have been
imported, and the set of real urls is larger than that by construction: `route()`
mints urls from data, and `child()` probes the filesystem for names nobody declared.
Neither can be enumerated in advance. The gate worked only because the old tier
eagerly imported the whole tree.

**Verdict: optimistic interception.** Try the walk; hand the url to the browser
only if it genuinely doesn't resolve.

```js
if (await this.load(url)) history.pushState({}, "", url);
else                      location.assign(url);
```

**Load first, push second**, so a failed navigation leaves no history entry. The
cost is honest: an unresolvable in-app link does a full page load instead of
being ignored, which is the correct fallback anyway.
