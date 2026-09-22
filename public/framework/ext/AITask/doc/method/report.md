The outline itself — call order, not content. Full design record, including
why a task's own `page.js` overrides one of the parts below rather than
this method: [template](/framework/ext/AITask/doc/template/).

**Asks · Requirements · Report · Session.** `asks()` is first and open by
default whenever the log carries any — what the owner asked for outranks what
a session did about it; without asks the page is what it always was, Report
open, the answer before the brief. Report is `outcome`, `links`, then the
`.ai-live` box that [`refresh()`](/framework/ext/AITask/api/refresh/) draws
(`status`, `checklist`, `extra`, `shots`, `figures`) and redraws on every
streamed append. Session is `chat()` (a fold) then `log()`, which own state a
redraw would wipe and therefore sit outside the box. Requirements is `head()`.

A url carrying `?m=<uuid>` or `#m-<uuid>` names one message of the transcript,
so it opens Session instead and scrolls there.

`tab_bar()` returns `{ select }` so one tab can send the reader to another —
that is how an ask card's "the prompt" link reaches the conversation.

Overriding this method directly is legal (nothing enforces the
shape) but means reordering or skipping a part outright — the doc comment's
own warning: "override a part, not this — unless you mean to reorder them."
**⚠ An override that drops `this.$live` also drops the streaming**: `refresh()`
is guarded on the box existing, so the page renders once and then stops
following its log, silently.
