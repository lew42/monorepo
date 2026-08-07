**Load first, push second.** A failed navigation leaves no history entry, which is
what makes Back reliable after a 404.

There is no synchronous *"is this a real page"* gate, and there cannot be one. The
old Router asked `Page.registry` — a registry can only contain pages that have
already been imported, and the pages it would need to answer for are exactly the
ones laziness exists to avoid importing. It worked only because the old tier
eagerly imported everything.

So: **try the walk, and hand the url to the browser only if it genuinely doesn't
resolve.** `location.assign(url)` is the honest fallback — a full page load, which
is what would have happened without the framework anyway.
