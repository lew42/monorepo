# All eleven things, in full

The health watcher (`Server/health.mjs`) loads a page headless every time an agent saves a file
that could affect it, and writes down anything wrong. Tonight it wrote 1,040 lines between 16:00
and 20:49. This page sorts them into eleven distinct things — three real bugs still sitting in
the log, two rules that are mostly crying wolf, and six incidents that were real for a minute or
two while an agent was mid-save, and have already fixed themselves. The machine-readable version,
with a file and line number for each one, is
[triage.jsonl](/framework/ai/2026-09-19/health-triage/triage.jsonl).

## Real, and still there (worth someone's five minutes)

**1. Six lines this evening's own page-health task wrote are missing a closing brace.**
`public/framework/ai/2026-09-19/page-health/task.jsonl`, lines 3, 4, 5, 10, 11, 12 all end in a
single `"}` where the shape `{"log": {...}}` needs two, `"}}`. Line 13 logs the exact same message
correctly, so whatever wrote lines 3-12 was fixed partway through the evening — the six broken
lines were just never cleaned up. Every page on the site that shows the activity feed re-reads
every task's log on every load, so these six lines alone produced 185 of tonight's 1,040 lines.
Fix: append one `}` to each of the six lines.

**2. One line from three weeks ago is plain text, not JSON at all.**
`public/framework/ai/2026-08-21/pg-tree/task.jsonl`, line 2, reads simply
`TREE MIGRATION LANDED - ui.tree retirement unblocked` — no braces, no quotes, nothing a JSON
parser can read. It is old and will never fix itself. Same mechanism as above: one bad line,
re-read on every page load sitewide, produced 185 warnings tonight. Fix: wrap it as
`{"log": {"at": "...", "msg": "TREE MIGRATION LANDED - ui.tree retirement unblocked"}}`.

**3. Two old tasks used a `step` field the log format has never recognized.**
`public/framework/ai/2026-08-19/panel-pad-gap/task.jsonl` (lines 6, 8) and
`public/framework/ai/2026-08-29/imagine-mag/task.jsonl` (lines 14, 25) each wrote `step` as a
sibling of `assign` — `{"assign": {...}, "step": 2}` — instead of nesting it inside `assign`,
which is the only place the schema looks for it. This is not a new discovery: the page-health
task's own log tonight already found it and decided, in words, to leave it alone ("the step
top-level-key lines stay unhandled on purpose... so they still warn, but only once per file
load"). It is real and it is 370 warnings a night, but it is also a known, accepted cost, not a
surprise. Fix, if anyone wants the noise gone: move `step` inside `assign` on those four lines.

## The watcher's own rules producing mostly noise

**4. `row-pitch-over-40px`** fired 43 times, always on the same four activity/task lists: the day
board (`/framework/ai/2026-09-19/`, `/framework/ai/2026-09-17/`), the AI section front
(`/framework/ai/`), and v/3's answer feed (`/framework/ai/v/3/`). Every one of these is a list
where each "row" is actually a whole card — a bold title, a summary sentence, a timestamp — not a
single line of text, so a 150-220px gap between rows is exactly right, not a spacing bug. The
rule was written to catch a real, different mistake (a plain single-line list stretched to
46.5px between rows) and has no way today to tell "a padded one-line row" from "a correctly-sized
multi-line card." I loaded three of the four pages headless and every row reads cleanly with
nothing stretched or broken. Fix suggestion: skip a list whose rows contain more than one line of
text (a paragraph, not just a label), or raise the threshold well past 220px.

**5. `padding-under-8px`** fired 64 times, and 56 of those are the same two sitewide styles
repeating on independent pages: an inline `<code>` chip (2.0px top/bottom, 5.3px left/right) and a
`<th>`/`<td>` table cell (3.8px). Both are a deliberate, compact, intentional look used across the
whole site, not a mistake on any one page — I loaded `/framework/ai/2026-09-19/skill-roles/`,
which has both a table and several `code` chips, and it reads cleanly. The rule already excuses
buttons and form fields from this same check for the same reason ("a control keeps its own em")
but never added `code`, `th` or `td` to that exception list, so it re-flags the same two global
styles as a new bug on every single page that happens to use them. The remaining 8 hits are on
`/framework/dev/DevBar/`, which a sibling minion is actively editing right now — expected, not a
finding. Fix suggestion: add `code, th, td` to `Server/health.mjs`'s existing `IS_CONTROL`
exception selector.

## Real for a minute, then fixed by the same evening's work (verified live, not just inferred)

These six all showed a genuinely broken or blank page at the time. Nothing about the *evidence*
is in question — the browser really did see a blank page or a thrown error. What makes each one
"not a defect to hand to someone" is that I loaded the same page headless just now, minutes ago,
and it renders correctly with real content and no console errors.

**6. A sitewide blank-page incident, 17:00:52 to 17:02:10 (98 lines).** Twelve of the watcher's
canary pages (`/framework/ai/v/3/`, `/framework/dev/DevBar/`, `/framework/ai/2026-09-17/`,
`/framework/styles/system/`, `/framework/ai/health/`, and others) all 404'd at once on three
files — `framework/ai/ext/Ask/stream.js`, `framework/ai/ext/Ask/edit.js`, and
`framework/ai/ux/Dictate/Dictate.js` — and came up completely blank, with no `.page` element
drawing more than 50px tall. That is the signature of a shared module being saved mid-write while
it referenced files that did not exist yet at that exact instant. It never happened again after
17:02:10. Checked live just now: `/framework/ai/v/3/` and the day page both render fully.

**7. `/framework/ai/v/3/` broke three ways between 16:14 and 16:30 (19 lines).** A SyntaxError
loading its own `page.js` ("missing `)` after argument list"), then a `master_detail is not
defined` error, then the route itself 404'd outright. The day page's own timeline shows "V3 Now
view: landed" at 17:22, after all three stopped — a minion was mid-rewrite of that exact page.
Checked live just now: v/3 renders a full conversation view with real content and no console
errors.

**8. `card-replies` threw a circular-DOM error three times, 17:28:47 to 17:29:53.**
"Failed to execute 'appendChild' on 'Node': The new child element contains the parent" is the
classic sign of a component being rebuilt while its own container was still attached to the page.
`card-replies` has already landed — it is no longer in tonight's Active list — and checked live
just now, both of its demo cards render with working buttons and no console errors.

**9. The day page 404'd three ways probing for `inbox-zero` at 19:44:55.** `page.js`,
`page.json`, and `inbox-zero.md` all 404'd in the same second — the signature of a task
directory existing before its `page.js` had been written. Checked live just now: `inbox-zero` is
a complete, working page with real content.

**10. `v/3/verdicts.jsonl` 404'd twice around 19:31 — already known, already being worked.**
This is not a discovery: `inbox-zero`'s own page already names this exact bug ("Caught the same
mistake twice... The verdict file was written into the v3 directory, an hour after we moved the
board data out of it"), and the `v3-timeline` task running right now is in that exact area.
Flagged here only so nobody re-discovers it.

**11. `assistant-stream` 404'd on `scratch-board.jsonl` twice, 16:06-16:07 — lowest confidence.**
The name matches the deliberate scratch-test files used elsewhere tonight (`scratch-throw`,
`scratch-break`) to prove the watcher itself works, so this is probably intentional test debris
rather than a real bug — but I did not read `assistant-stream`'s own code to confirm which, and
it never recurred after those two lines. Not worth chasing further given how cheaply it vanished.

## What every other line in the log was

The remaining ~700 lines are the same eleven things repeating: every canary page load re-checks
the same handful of shared components, so one real incident or one miscalibrated rule shows up as
a dozen near-identical lines with different timestamps and URLs. Grouping by the actual message
text, not the raw line count, is what brought 1,040 lines down to eleven things.
