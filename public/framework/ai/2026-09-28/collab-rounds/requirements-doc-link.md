# Minion brief: the ⋯ link on doc pages, the naming nag, and runner fixes

Load the `minion` skill first, then `code` and `css`.

**The owner's words** (read the first half): `public/framework/ai/2026-09-28/file-explorer-fs/owner-words.md`. The core: *"for each method name … we go to the method page and we see the method name right after that … there could be a little menu button … then we could see the decision tree … we either need the AI to remember to wire up every decision that was made … I'm not sure if it could happen in more of a systematic way."* Also `public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words-3.md`.
Task: `public/framework/ai/2026-09-28/collab-rounds/`. The contract: `collab-format.md` there, the section "Added 14:25".

**Work in the worktree `C:\Code\lew42\worktrees\collab-rounds`** (branch `worktree/collab-rounds`, server http://localhost:64519/). Commit there. Do not merge. `ext/Collab/` (Collab.js, view.js, page.js) and `Server/collab.mjs` are already built and committed there: read them first.

## Deliverables, in this order

1. **Runner fixes in `Server/collab.mjs`:**
   a. `spawn_agent` can answer `{"id": null, "queued": true, "reason": "only 4006 MB of memory is free…"}`. Treat that as "wait": poll `list_agents` until the queued agent appears (up to the phase timeout), never as an error.
   b. If every member of a phase errors, stop the run: write `{"winner": {… "status": "failed", "why": …}}` and exit non-zero. Never march on through empty votes.
   c. `--mock` must write NOTHING to the shared `public/framework/ai/collab/scoreboard.jsonl` or `decisions.jsonl`; it writes its own copies inside its own taskdir. Then remove every line from those two shared files whose `collab` starts with `2026-09-28/collab-rounds/test-mock` (that is a one-time clean of our own fake lines; keep every other line).
   d. In `research/collab.jsonl`, haiku-c's phase-4 cost is 0 although it voted. Find out why (cumulative cost read before the turn's cost landed?) and fix it for future runs.
2. **The ⋯ button in ext/Doc.** On the API tab (and a member's own page), right after each member's name: a small ⋯ button, shown ONLY when `Collab.Decisions.for(module, member)` returns a record. Clicking it opens a small popover with the decision's ask, the winner, the vote count, and a link to the full decision (`/framework/ext/Collab/?src=…#d-1`). Doc finds the module from its own page url. Keep it small, about 20 to 30 lines, loaded lazily so a Doc page without records pays one fetch of `decisions.jsonl` and nothing more. A new class name goes through `new-css-class`.
3. **The naming nag:** `.claude/hooks/naming-guard.mjs`, imported by `.claude/hooks/ledger.mjs` beside `syntax-guard.mjs` (same pattern: its own file, imported inside a try, never throws). After a Write/Edit of a `.js` file under `public/` that ADDS a `class X` declaration, if `decisions.jsonl` has no `named` line for that module, append one `{"log": {"at", "msg": "naming: class X in <module> has no decision record — run a design collab with target, or add a named line with decision: \"owner\""}}` to the current task's task.jsonl (find it the way ledger.mjs finds it). It never blocks or prints a PostToolUse block.
4. **View polish in `ext/Collab/view.js`:** show each option's vote count ON the option card itself (for example "2 votes"), not only inside the disclosure. The owner asked to see "the number of votes and the winner" at a glance. In each member's card, the vote row shows who that member picked, not "—".
5. **ext/Collab's page gets an API tab** through ext/Doc, so the Scoreboard's members are listed like any other class (look at how `ext/Saver/page.js` declares `methods:` and `properties:`), with the live run view staying as the Overview.

**Fence (the only files you may write):** `Server/collab.mjs`, `Server/doc/collab.md`, `public/framework/ext/Doc/**`, `public/framework/ext/Collab/**`, `.claude/hooks/naming-guard.mjs`, one import and call in `.claude/hooks/ledger.mjs`, and the two shared files in `public/framework/ai/collab/` (the clean in 1c only).

**Proof before you stop:**
- `--mock` design run with a target: the shared files unchanged (show `wc -l` before and after).
- Headless Playwright shots at 1920, saved in the MAIN tree's `public/framework/ai/2026-09-28/collab-rounds/shots/`: `doc-no-record.png` (an ext/Doc API tab of a class with no record, say ext/Saver: no ⋯), and the view with vote counts on the cards, `objects-1920-v2.png`. The shot WITH a record comes after your mastermind's real run writes one; leave a script `C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\2c074cef-dccf-4e86-8f2b-fb4cf072e115\scratchpad\collab-doc-shot.mjs <url> <out.png>` (headless, windowsHide) that your mastermind can rerun.
- Zero console errors on /framework/ext/Doc/, /framework/ext/Saver/, /framework/ext/Collab/.
- Test the nag by writing a throwaway class file in the scratchpad path above? No: the nag only watches `public/`. Write a temp file `public/framework/ext/Collab/_nagtest.js` with a class, check the log line appeared, delete the file, and don't commit it.

Every Node spawn sets `windowsHide: true`. Log to the main tree's `public/framework/ai/2026-09-28/collab-rounds/task.jsonl` with `node .claude/hooks/append.mjs`. Final message: what you built, the shot paths, the before/after line counts.
