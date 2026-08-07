# The registry gate — removed, and it cannot come back

**The question.** How does a click know whether a url is a real page *before*
navigating? The old Router asked `Page.registry`.

**Why that's unanswerable.** A registry can only contain pages that have been
imported. The pages it would need to answer for are precisely the ones laziness
exists to avoid importing. The gate was structurally incapable of doing its job,
and it worked only because the old tier eagerly imported everything.

**Verdict: optimistic interception.** Try the walk; hand the url to the browser
only if it genuinely doesn't resolve.

```js
if (await this.load(url)) history.pushState({}, "", url);
else                      location.assign(url);
```

**Load first, push second**, so a failed navigation leaves no history entry. The
cost is honest: an unresolvable in-app link does a full page load instead of
being ignored, which is the correct fallback anyway.
