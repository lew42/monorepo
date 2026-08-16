`fetch(this.url)`, then `parse()` + `read()` the body — the one method that talks to the network, everything else in the class works on text or entries already in hand.

**⚠ The SPA fallback answers a miss with `index.html`**, so a 404 arrives as a 200 whose body is a whole HTML document. `load()` guards this the same way every other fetch in this framework does: `res.headers.get("content-type")?.includes("html")` treats that response as absent. A network failure (`fetch` rejects) is caught to `null` and treated the same way. Either way `load()` **resolves**, it never rejects — `this.loaded` is the only signal, covered in [its own page](../property/loaded.md).

`this.url` comes from the constructor's `assign()` — `new TaskJSONL({ url: "…/task.jsonl" })` — there is no setter and no default.
