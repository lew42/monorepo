The outline itself — call order, not content. Full design record, including
why a task's own `page.js` overrides one of the parts below rather than
this method: [template](/framework/ext/AITask/docs/template/).

`head()` first; then the `.ai-live` box, whose three parts (`checklist`,
`extra`, `figures`) are drawn by [`refresh()`](/framework/ext/AITask/api/refresh/)
and redrawn there on every streamed append; then `chat()` and `log()`, which own
state a redraw would wipe and therefore sit outside the box.

Overriding this method directly is legal (nothing enforces the
shape) but means reordering or skipping a part outright — the doc comment's
own warning: "override a part, not this — unless you mean to reorder them."
**⚠ An override that drops `this.$live` also drops the streaming**: `refresh()`
is guarded on the box existing, so the page renders once and then stops
following its log, silently.
