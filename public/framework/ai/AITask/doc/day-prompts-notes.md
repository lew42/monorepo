# day-prompts.js notes

## WHERE THE WORDS LIVE

Every owner prompt is one `Prompt` item on its own session page — `/framework/ai/<Y>/<M>/<D>/session-<id>/page.jsonl` ("a session is a page", Echo.js's own doc comment). Echo.js already refines a LIVE prompt the moment it lands (clean() -> structure() -> a `sentences`/`sections`/`flags` delta written onto that same item, through `page_set`). This file reads that same shape back — it never recomputes a cost or a sentence itself (law 7) — and is silent about `sections`/`sentences` a prompt doesn't have yet. `node Server/day-prompts-refine.mjs <date>` is the retroactive half, run once for old days, same pipeline, same wire line.

## TWO VIEWS

BY TIME (default, `prompts_section`) lists every prompt in the order it was said, each prompt's own sections nested under it.

BY SYSTEM (`system_view`, `/<date>/by-system/`) regroups the SAME sections under the module they are mostly about — a cheap, code-only bucket (GLOSSARY keyword count, law 7: computed, never a second model call) — biggest group first. Not a model re-classification: that would be a second paid pass over the same words `structure()` already read once; this is good enough to answer "what did I say about the page system today", and never silently drops a point (anything matching no module lands in "General", not nowhere).

## YESTERDAY'S FOLDER

A SESSION's folder is named for the day it started, but a long-lived session can log a prompt a day or more later into that same file (found in review, 2026-10-04: 66 of one day's prompts were filed under the PRIOR day's folder). Searching yesterday's folder too, then filtering every item by its own `ts`, is what actually finds them all; searching by folder name alone silently drops any prompt that crossed midnight.

## REPLAY PAGE.JSONL

Review, 2026-10-04: a session can log dozens of Prompt items — the first version kept only the LAST one, silently dropping the rest. Both wire shapes are handled: the old `{"at":"content", add:{...}}` and the current `{"content":{"add":{...}}}`, plus a bare `{[id]: {...}}` page_set line.

## A PROMPT'S READING

Its sections (heading + bullets) when `structure()` succeeded, else its plain numbered sentences, else — not refined yet — the first 200 characters of what was actually said, so the day is never missing a prompt just because nothing has refined it yet. `mentions()` (ext/Mention) turns any #Page, @agent or /path already in the owner's own words into a real link in place — the owner's own ask (2026-10-04): "show the concrete IDs and links first", the cheapest version of that is never hiding the ones already said, rather than inventing new ones with a model call this retroactive pass doesn't make.

## CONFIDENCE CHECKS

Two DIFFERENT checks, both shown, each named for what it actually measures:
- `coverage.confidence` (structure.js) is how sure the PLACEMENT is — a sentence `structure()` dropped (0.2) or filed under two headings at once (0.4)
- `flags` (engine.js's `clean()`) is how sure the WORDING is — a mishearing clean() could not confidently resolve

Silent when there are none of either. The owner's own ask (deliverable 3): "a weighting or a confidence interval... lower confidence would trigger part of the review."

## DOMINANT TOPIC

The SAME GLOSSARY bucket `bySystem()` groups by (reused, not a second idea of "topic": law 6), just read per-prompt instead of across the whole day. Used only for the context marker, never to reorder.

## BY TIME VIEW

The default reading (the owner, 2026-10-04: "never put events out of order" — one row per prompt, at the ONE timestamp it was actually sent, never reordered or merged across a topic switch). When the dominant topic changes from the prompt before it, a quiet one-line marker sits between them instead — "→ Dictate" the first time, "← back to Page system" if that topic was already open earlier in the day.

## CONDENSED/DETAILED TOGGLE

A condensed/detailed toggle (owner's own ask) collapses each prompt to its first line; nothing is ever hidden, only folded. Only the FIRST bullet of each prompt stays visible — nothing is deleted or re-fetched, so flipping back to Detailed is instant.

## DOM AND AWAIT

"no DOM after an await" (CLAUDE.md): The fetch used to run straight off the outer async captor, which does NOT survive the await (a bug, caught in review — the "No prompts logged" line was landing in whatever captor happened to be active by the time the fetch resolved, not inside this section at all). The fix is dashboard.js's own idiom: `div.c(..., async $d => { const data = await …; $d.append(() => draw(data)); })` — fetch inside the async captor callback, but every actual draw call happens inside a NESTED `.append()`, which re-opens `$d` as the captor synchronously before drawing.

## CONDENSED/DETAILED STYLING

A plain `<button>`, stripped to read as a muted link inline (no new CSS class for one toggle — review, 2026-10-04, found the browser's default button chrome left it a boxy grey rectangle beside two plain links).

## BY SYSTEM BUCKETING

Plain word matching, same `GLOSSARY` engine.js already keeps for the mishearing check — reused, not a second list (law 6). Bucket every section/sentence by the first GLOSSARY name (module or class) its own words mention; biggest bucket first, "General" last.

## IMPORT DUPLICATION

Functions like `sessionDirs`, `addDays`, etc. are duplicated rather than imported to avoid circular dependencies (dashboard.js imports this file).
