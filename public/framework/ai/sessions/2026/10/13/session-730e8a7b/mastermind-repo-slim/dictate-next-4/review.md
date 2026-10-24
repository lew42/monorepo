verdict: pass
1. [note] The fast gate is only proven in one direction: every replay sentence is "Smart assistant, …" or a statement, so nothing shows that "Fast assistant, …" still gets a reply (Servex/agents/Sessions.js:1196, replay.mjs SENT). One named sentence in the replay would prove the gate does not also silence the case the owner wants.
2. [note] `s.fast_heard` is one slot per session (Sessions.js:818, :960), overwritten by each new line; if the fast agent answers an older, named line after a newer unnamed one arrived, its reply is dropped (and the reverse lets one through). Rare at voice speed; keeping the heard text per turn would close it.
3. [note] `setting_sources: []` (Sessions.js:1051) also drops the project `.mcp.json`, so the smart assistant loses the `site` tools; Servex's own door is still injected by `Agents.door()` (Agents.js:1075), so `spawn_agent` and `quick_fix` keep working. Fine for a voice assistant, but dictate-backend.md's new section could say "no site tools" too.
4. [note] The spec's top-level `env` (Sessions.js:1051) is not kept in `recipe()` (Agents.js:949-951), so a smart agent reopened from its registry row after a Servex restart comes back with claude.ai connectors on and a larger context. The fast spec already has the same gap; worth one check after the live restart.
5. [note] Ask 2 is partly met, as next.md:533 says: context 68k to 44k (-35 percent, not half) and cold first reply 6.8 s against the 6 s target (replay-step2a.json). The 46 s "before" (replay-step1.json) is far above the 11.4 s desktop figure recorded earlier, so the size of the speed-up is overstated.
6. [note] shots/after-sheet.png shows the 60dvh sheet (about 480 of 800 px) but with an empty thread, so "four bubbles show" is a measured height, not a picture of four bubbles; the pngs are also not committed (next.md:541).
7. [note] Ask 6: no `check_page` result at 400/1200/1920/3440 is in the diff or task.jsonl; `merge.mjs` and the live Servex restart are still the mastermind's to do.

## Requirements
- 1 "fast never replies unless addressed by name" — yes — session-fast.md prompt + `FAST_NAMED` gate (Sessions.js:62, :1196); anchored to a line start or "fast assistant" not possessive, so "the fast assistant's prompt" no longer counts; replay-step1.json 0 of 8
- 2 "halve the prompt, under 6 s cold" — partly — 68k to 44k, 6.8 s (replay-step2a.json), stated honestly in next.md
- 3 "no task from a statement" — yes — session-smart.md:36 rule; replay-step3.json task_masterminds 0 (baseline 1)
- 4 "page.jsonl 404 on every open" — yes — Inbox.js:51-54 checks the parent's `PageLog.listing` first (import exists, Inbox.js:4); cost and the stale-listing case recorded in Inbox doc/next.md
- 5 "stale Mic: on line, taller half sheet" — yes — Dictate.js:374 and :418 (late level tick ignored); rail.js:248 `size_to("60dvh")` adds `drawer-rail-sheet-sized` so it is a real height; shots/before-sheet.png and after-sheet.png at 400
- 6 "next.md marked, check_page, card, landing line, merge" — partly — next.md marked per item, landing line in task.jsonl; check_page and merge not shown
## Words
- content — yes — next.md and doc entries are plain, one line per item, link the replay files; the earlier review's stray files.jsonl lines are gone from the diff
