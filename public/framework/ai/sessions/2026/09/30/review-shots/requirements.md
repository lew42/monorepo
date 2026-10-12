# Review by screenshot: requirements

The owner's words, verbatim: `ai/2026-09-30/page-audit/owner-words.md`, the section "Continued (about 12:35 PM)". Read them in full first; each ask below traces to a sentence there.

## What the owner asked
1. Every build that changes a page is **screenshotted at 400, 1200, 1920 and 3440** as part of its review ("from mobile up to mega", "twelve hundred and nineteen twenty is a very common resolution").
2. The reviewer reads each screenshot **in horizontal bands**, top to bottom: the share of the screen each band takes, whether it is the right size, its padding, wasted space, and unexpected wrapping ("treating any screenshot in kind of horizontal rows").
3. The **measurable parts run by themselves**, not by an AI remembering: how many rows the tab bar wraps to ("four or five rows of tabs"), stacked padding at the left edge (tab area padding + card padding + ...: "multiple levels of padding"), things wrapping to another line that shouldn't ("are things wrapping to another line when you didn't expect it").
4. The output is a quick pass/fail with the picture, not an essay: "at least just a quick test of did it lay out properly".

## Deliverables
- A. `node Server/layout-check.mjs` (or a sibling `review-shots.mjs` if cleaner) shoots the given urls at 400, 1200, 1920, 3440 and writes a contact sheet plus a `bands.json`: for each width, the horizontal bands (header, tab bar, each top-level section) with their height share of the viewport, left-edge stacked padding in px (sum of padding-left along the ancestor chain of the first text node), tab-bar row count, and a wrap count (elements whose height is more than one line-height where the text is one line at 3440).
- B. Thresholds, written once in the tool and named in the report: tab bar over 2 rows at 1200 or over 3 rows at 400; stacked left padding over 3em at 400; any wrap that appears only under 1920. Each is a FLAG with the band's crop attached; nothing blocks a merge yet.
- C. `Server/merge.mjs` runs it on the pages the branch touched (the files changed under public/ mapped to their page urls, the way smoke.mjs finds them) and refuses a merge that has no sheet; flags land in the task.jsonl as `{"review":{"shots":...,"flags":[...]}}` and on the task card as the sheet plus the flags.
- D. The `sub-mastermind` skill's review step already says "screenshot at the four widths and read the bands" (the architect wrote it 09-30); make the tool's report the thing that step reads, and send the architect one line if the skill's words no longer match the tool.
- E. mastermind-page is building layout measurements into the layout tools (core/Page); reuse its measurements when they land rather than writing a second set. Ask mastermind-servex-8 for the path; do not message mastermind-page directly.

## Fence
Server/layout-check.mjs (or a new Server/review-shots.mjs), Server/merge.mjs (only the call site, after node-reliability's jsonl-keep merge has landed; ask the architect), Server/doc/. Worktree required. Budget $15. Proof: run it on /framework/core/Page/ and /framework/ai2/ and attach the sheets.
