# smoke-gate: state

**Result:** `node Server/smoke.mjs . /framework/core/ …` goes from 6 FAIL / 54 ok to 0 FAIL / 39 ok on the core pages (core, Session, Shell, List and their link hops).

## Causes found and fixed (no allow-list change)
- `core/Session` was linked from `core/` but had no `page.js` (Page Load Error): added [page.js](/framework/core/Session/page.js).
- Doc's API/Files tabs fetch one `.md` note per member; missing ones 404: added `core/List/doc/property/items.md`, and notes for every listed member and file of `core/Shell` and `core/Session`.
- `core/Shell` dark regions had text touching the box edge: `padding-inline` on `.core-shell-dark` in Shell.css.
- The weight/settings 404 allow-list entries from the brief were already gone. The two lapsed ones (`Doc: has no member`, `files.jsonl` torn line) were already renewed to 2026-10-19 by another agent; not extended further.

## Still open
- Those two renewals lapse 2026-10-19: fix the stale Doc member lists and the torn `ai/files.jsonl` line.
- Root cause of the Doc 404 class: a Doc with no note for a member fetches a missing file. Fix by letting Doc skip undeclared notes.
- A transient `ai/page.js` SyntaxError appeared once while another agent was mid-edit; gone on rerun.
