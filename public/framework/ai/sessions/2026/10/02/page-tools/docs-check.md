# Docs check: the five page tools, readme chain only

Loaded via `load_module core/Page` — no direct file reads.

**(a) What each tool does — clear.** `doc/jsonl.md`'s "Agent tools" section gives all five
(`page_add`, `page_set`, `page_log`, `page_read`, `page_note`) a one-line job each. The
readme.md "storage" line names the same five and points into that section — docs-point-don't-
explain, working as intended.

**(b) Where the live proof is — clear.** Both readme.md ("live at `jsonl/live/`") and
`doc/jsonl.md` ("built with these tools while a headless tab watched it grow") name
`core/Page/jsonl/live/` directly.

**(c) `page_note` vs. `drop`/`inbox:` — clear, but only from readme.md + doc/jsonl.md, not
from ext/Inbox itself.** readme.md's "ext" line states it head-on: Inbox lets an agent leave
an `{"inbox": …}` message (`drop`, Servex) *or* a `{"note": …}` one (`page_note`, no Servex
dependency) — contrast is explicit. `doc/jsonl.md` repeats "no Servex dependency" and links
`ext/Inbox`.

**Gap found:** `load_module core/Page` never surfaced `ext/Inbox/readme.md`'s own text —
only two links *to* it. Its "The newer way in" section (where the task said it lives) is
invisible to an agent that only loads the module and doesn't follow the link. The chain
answers (a)(b)(c) fine without it, but that section is currently orphaned from this read path.
