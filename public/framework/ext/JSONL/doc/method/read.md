`entries.forEach(entry => this.apply(entry))`, then returns `this` — the seam between "I already have parsed entries" and "I have text." `load()` calls `parse()` then this; a caller with entries in hand already (a test, an inline demo) calls this directly, as `page.js`'s own demos do: `new JSONL().read(JSONL.parse(text))`.

Chainable by design — every method here returns `this` so `new JSONL().read(...)` reads as one expression.
