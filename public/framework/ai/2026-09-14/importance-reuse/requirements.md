# importance-reuse — the overlay the owner's brief listed fourth, with something to show

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). Group: `importance`. One Opus builder.

## The three laws, and your length budget

1. **Less is more.** One more topic, one shared caveat, one overlay. Nothing else changes.
2. **Clear beats brief.** A newcomer at the car topic sees, on the Carfax caveat, that it is also used somewhere else, and one click shows where. No paragraph explains it.
3. **Prioritize.** Data first (so the overlay has something to draw), the overlay second, docs third.

Budget: no new prose on the screens beyond a label. Landing report of one screen.

## The owner's brief, the part this closes (verbatim, 2026-09-13)

> 4. **Overlay / trace** (lower priority) — see where a caveat or question is reused across contexts; click a rank to see the judgments behind it.

> Edges are what let a caveat or question be reused across many topics.

> Bots are good at *generating* candidates and *pre-sorting*; humans are better at breaking ties on value questions.

The second half (click a rank → the judgments) landed on 2026-09-13. The first half was left because the car example has one topic, so nothing is reused. This closes it.

## Read first

- `public/imagine/importance/readme.md`, `doc/storage.md`, `doc/live.md`, `doc/decisions.md` — the format, the append-only rule, the live rules (controls never inside the streamed region; the writer does not apply its own line), and the round-two/three decisions.
- `Graph.js` (`up()` reads both edge directions since fix pass 1; `score()`), `views.js` (`ImpRank`, the attachment rows, the `Why?` toggle), `page.js` (the context view, the trail), `importance.mjs` (the CLI — use it to seed, so the rows are exactly what a bot would write).
- The owner's rule for every screen: self-evident, every part perfectly clear what it does; a control with no visible consequence is a defect.

## Deliverables

1. **A second topic, seeded by a bot.** `importance.mjs propose` as author `bot_seed`, so the rows carry a bot id like the owner's `bot_7`: a topic that shares the Carfax caveat's concern — **"Selling a used car"** is the natural one (the caveat `c1` "Carfax misses unreported accidents" qualifies a question there too, e.g. "Should I disclose the fender-bender?"). Three or four questions, the shared caveat attached by a new edge (`c1 qualifies <new question>` — the SAME node, no copy), and three judgments by `bot_seed` at weight 1 so the ranking is not all "unranked". Keep the owner's four nodes, three edges and three judgments byte-for-byte; you only APPEND. Log every id you add.
2. **The overlay.** On any node that is reached from more than one context, the context view shows a small mark beside it — "also in 1 other topic" (or the number) — and clicking it opens, in place, the list of the other contexts with a link to each (the same in-place pattern as the `Why?` toggle, so the two behave alike). On the new topic, the same caveat shows "also in Buying a used car". A node in one context shows nothing.
3. **The way in.** The context view's topic picker (if one exists) or the realm page lists both topics so a newcomer can get from one to the other without editing the url. The smallest thing that does this.
4. **The trail and the judge screen** keep working for the new topic: `judge/?at=<new id>` offers pairs, a pick lands in the shard, live update still 9 ms across two windows. Prove one pick headless; remove YOUR test pick by id afterwards (the seed judgments stay — they are the deliverable).
5. **Docs.** `readme.md` Use gains one line for the overlay; `doc/decisions.md` records the reuse rule (one node, many edges; never a copy) in three lines.

## Fences

- Own: `public/imagine/importance/**` and `public/framework/ai/2026-09-14/importance-reuse/**`. Nothing under `public/framework/` or the other realms.
- Data: hash the three files before you start; at landing the ONLY differences are your appended seed rows (list them by id in the log) — `git diff` is vacuous (the dir is untracked), so prove it with `importance.mjs check` (0 refused) and a line count: 4 + your nodes, 3 + your edges, 3 + your seed judgments, no test pick left.

## Rules every brief carries

- `new-task` first: `ai/2026-09-14/importance-reuse/task.jsonl` (group `importance`, the five deliverables as `steps`); `ai/2026-09-14/day.jsonl` exists — append one line. Skills: `code`, `css` / `new-css-class` for any style or class, `ui-test` before headless runs, `documentation`, `finish-task`; `skill-improvement` for anything that misled you.
- **Never kill or restart the dev server on port 80. Never drive the owner's tabs. Never `git stash`. Never commit.** Private server `PORT=8097 node server.js` from the repo root (another 809x if taken), killed by pid at landing. Pngs into your task dir: the car topic with the overlay open, the new topic, both at 1280.
- Resolve, don't park; findings as `log` lines.

## Landing report (to the mastermind)

One screen: the two urls, the seed ids in one line, the overlay proven (the mark's text on both topics, the click opening the list), the live pick proven with its latency, the line counts, and one sentence on what a critic should look at first.
