This task's own directory, as a url — the join point every other method reads
from (`legacy()`, `requirements()`, `chat()`'s `task` path).

Prefers `this.src` (stripped to its containing directory) over
`new URL(".", this.meta.url).pathname` — the escape hatch a dynamically-routed
task needs, since its `page.js` never existed and so has no `import.meta` of
its own to resolve against. See [`src`](/framework/ext/AITask/api/src/).
