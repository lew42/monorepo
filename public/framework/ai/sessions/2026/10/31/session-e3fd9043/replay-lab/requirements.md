# Brief: build the Replay Lab as a real framework page (Lew42 monorepo)

## Goal
The owner (Mike) wants to click through the replay examples using his REAL classes, not a mock. Build a framework page plus characterization tests on branch `claude/replay-tests`, worktree `/home/claude/build` (already branched off `integration/data-shapes-2` at 9ba46ee87, `npm install` done). He'll open it on his phone through a Cloudflare branch preview, which is STATIC (no server), so the page must keep its saved lines in memory and never write real files.

## Spec
The standalone mock is `/home/claude/research/design/replay-lab.html` (read it; it's the spec for the look and the four examples). Four examples: (1) start a task that spawns an agent, wait, reload; (2) show / hide / toggle and drag a layer, plus "another tab toggles at the same moment"; (3) +1 in two tabs at once; (4) summarize() asks an AI. Each example: a live object with buttons, two saved logs side by side, a Reload button that rebuilds from each log, a verdict (same as before reload, or the differences), and counters for side effects that happened again (agents spawned, AI calls and their cost). The lesson text in the mock is already approved by the owner's coordinator; reuse it, but correct it wherever the real classes behave differently.

What changes from the mock: use the real plumbing.
- Column "Saved as changes": buttons call the method directly (`task.start()`); the log holds whatever lines the real root `delta` event carries.
- Column "Saved as calls": buttons call the real `item.act("start")` (core/Item/Item.js `act`, about L105), which records `{start:{}}` and mutes the inner sets via `Store.muted`.
- Two live instances (one per column), each click goes to both. Capture lines from each root's `delta` event. Do NOT attach a Store that posts to `/api/item` or the dev server.
- Reload: build fresh instances from each captured log through the real replay path (`Item.replay(lines)` in Item.js about L462, or whatever a page load really uses; find out), then show and compare.
- Only the outside world is fake: subclasses for the demo (e.g. a LabTask extending the real `Task` in core/Task/Task.js, whose `start()` is at about L336) call a fake world object for `spawn_agent` / `ask_ai`, which counts calls. Concurrency ("another tab") = a second instance whose lines are appended to the same log.
- The interesting output is where the real classes differ from the mock: does `Item.replay` of an `act` line call the method, and does it spawn? Is any replaying flag set? Does Task keep anything in plain fields (like `_ran_since`) that is lost after reload? Show these honestly on the page and list them in your report.

## Tests (core/Test harness; see core/Item/act.test.mjs and delta-flow.test.mjs for the style; run with `node <file>`)
Add `public/framework/core/Item/replay.test.mjs`: characterization tests that pass today and name the behavior, e.g. "replaying change lines never calls the method", "today: replaying an act() line runs the method again (spawns again)", "two tabs toggling through act() cancel out; through set they agree", "two tabs incrementing: change lines lose a click, act() lines keep both", "a value kept in a plain field is lost after replay" (check what Task really does). Real components only; mock only the outside world (say so in a comment). If you find a real bug that should be fixed, write a FAILING test for it in its own commit and do not fix it (the owner hasn't approved fixes); say so in the report.

## Repo rules you must follow (read these files first; they are binding)
- `/home/claude/build/CLAUDE.md`, then `public/framework/readme.md` and the parts of `public/framework/doc/rules.md` about pages, readmes and classes.
- Skills, read as files: `/home/claude/build/.claude/skills/{new-task,make,page,code}/SKILL.md`. Open a task first per new-task (`node Server/TaskDirs.mjs --new replay-lab` from /home/claude/build); if the script fails in this environment, note it and continue.
- Name and home first: put the page under `public/framework/core/Item/replay/` (or the home the make/page skills point to; say why if different), with a short readme.md. Index it: link from `public/framework/core/Item/readme.md`.
- Vanilla JS, native ESM with real `.js` import URLs, no build step, no new npm dependency, snake_case names, classes not function bags (one class per file, named for the file; page templates extend Page). Plain-English UI text a new coder understands; conclusion first.
- Do not modify core classes (Item.js, Task.js, Store.js, List.js); only add files and the readme link.
- Never touch `/home/claude/lew42/data-shapes-2` or `/home/claude/monorepo`'s own checkout. Work only in `/home/claude/build`.
- Commit in small working steps on `claude/replay-tests` with `git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit`, ending every message with:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01SYB8YfTtTAXYu2Xot8ZWiF
  Do NOT push; the coordinator pushes.
- No WebFetch at all. No web searches needed.

## Verify before reporting
- Run the dev server on a spare port: `cd /home/claude/build && PORT=8097 node server.js` (run it in the background; it already works here). Open the page with Playwright (`require('playwright')` works from any directory; `chromium.launch()` needs no options). Click through all four examples, including Reload, at 400px and 1200px wide; screenshot into `/tmp/claude-0/-home-claude/e3fd9043-ad4b-5d36-9e28-17f46c3e0b52/scratchpad/build-shots/`; check for console errors (font loads from Google may fail in this sandbox; ignore those).
- Also open it with no server features: the page must not depend on `/api/item` or a socket.
- Run `node` on the new test file and on act.test.mjs and delta-flow.test.mjs.
- Stop the server when done.

## Report (final message, under 250 words)
What you built (paths, commit hashes), where the real classes behaved differently from the mock, test results, screenshot paths, anything left undone.
