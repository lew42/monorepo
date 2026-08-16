`src` — the manifest's url, for a task rendered by a **dynamic route** rather
than its own `page.js`.

Both `/framework/ai/page.js` and each day's `page.js` declare
`route(name){ return new AITask({ url, src: url + "session.json", … }); }`
for any task dir with no declared `page.js`. That instance has no
`import.meta` pointing at a real file on disk — `meta.url` is whatever the
router synthesized — so `base()` and `legacy()` both check `this.src` first
and fall back to resolving against `this.meta.url` only when it's absent.

A task with its own `page.js` (`export default new AITask({ meta: import.meta, … })`)
never sets `src` at all — `import.meta` is already the real thing.
