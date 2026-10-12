# Requirements — verbatim

Reviewer minion for realm **design** (`public/imagine/design/`, url `/imagine/design/`), private
port **8061**. Brief: `public/framework/ai/2026-09-04/imagine-review/reviewer-brief.md`.

Full brief text is at that path (read first, in full). Summary of the job:

1. Ten-second test: start private server, screenshot landing page at 1280x900 and 3440x1440,
   headless. Write stranger-sentence vs meant-sentence in task.jsonl as a log line.
2. Primary interaction: pick the first clickable thing on the 1280 shot, prove what it does with
   a ui-test plan (screenshot per step, watched rects before/after).
3. Layout at 3440: check three invariants (no x:0 content, no line over ~40em measure, no
   hard-coded spacing where a clamp exists) using the already-measured critique row at
   /imagine/paging/critique/ (source public/imagine/paging/critique/page.js REALMS array) for
   this realm.
4. Resolve, don't park: fix findings directly in realm files (page.js, css, readme.md, children).
   Missing takeaway sentence is highest priority. Anything needing core/ext is a proposal with a
   diff, not an edit. Re-shoot 1280 and 3440 after fixes; confirm zero console errors. Every fix
   gets a caveat line.
5. Land with finish-task; reply block with REALM/STRANGER/MEANT/VERDICT/FIXED/PROPOSED/SHOT/
   TASK/PATTERN.

Fences: public/imagine/design/ and its task dir only, plus the single shots/design.jpg file in
imagine-review/shots/. Never touch port 80, never git stash/checkout/reset/commit/push, never
spawn sub-agents, never find /.

## Steps
1. Read realm files (readme, page.js, children pages)
2. Start private server on 8061, screenshot landing at 1280x900 and 3440x1440
3. Write stranger/meant sentences
4. Test primary interaction with ui-test plan
5. Check 3440 layout invariants against critique row
6. Fix findings in realm files
7. Re-shoot after fixes, verify console clean
8. Copy final shot to imagine-review/shots/design.jpg, kill server
9. finish-task
