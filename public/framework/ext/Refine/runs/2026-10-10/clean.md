S1. [sessions/2026/10/10/session-30be6115/server-perf/requirements.md]
S2. Server perf: stop the site stalling (task mastermind brief)
S3. Owner's ask (2026-10-09/10): the site "crashes a lot": whisper threw an error, then the page would not reload.
S4. Do a quick performance look and fix the cheap, obvious causes.
S5. Already measured (`Server/doc/perf-2026-10-09.md`, read it first):
S6. `Server/plugins/Directory.js` logs "Rebuilding Framework Directories" on ~36% of all requests (19,697 of 54,330): every `/framework/` page hit re-walks the tree.
S7. The main server (`Server/run.js`) is the hottest node process.
S8. `monorepo.out` is 36 MB: every socket message and RPC is `console.log`ged synchronously.
S9. 41 dev-server node processes (one per worktree/pool slot, started and stopped within seconds); free RAM ~7.7 of 32 GB.
S10. Whisper reloaded its 1.6 GB model onto the GPU at 16:23 with no error line in `whisper.jsonl`; why it restarts is unknown.
S11. Do, in order (each a small commit, smoke-tested):
S12. Directory rebuild: rebuild only when a file under the walked tree actually changed (use the existing watcher/event, or mtime of the tree), not per request.
S13. Measure before/after (count rebuild log lines over N requests; request latency of `/framework/`).
S14. Logging: drop the per-message `Socket message` / `RPC:` console lines (or gate them behind an env flag, default off).
S15. Keep errors.
S16. Pool dev servers: find why qf-N worktrees each boot a dev server and churn; if a slot's dev server can start on demand (first request) instead of at checkout, do it; if that is `Servex/` code owned by another agent, write the finding and stop (do not edit `Servex/Pool.js` semantics).
S17. Whisper: find who supervises whisper-server (Servex) and make its exit code and reason a log line; if a restart loop exists, say why.
S18. Record results in `Server/doc/perf-2026-10-09.md` (update, do not duplicate).
S19. Fences
S20. Work in a worktree; never run `node server.js` directly (server-guard).
S21. A `Server/` change needs a restart: batch it into one, then `node Server/worktree-restart.mjs <name>` proves it boots on a private port BEFORE merging; `Server/merge.mjs` must pass.
S22. No new npm dependency; no OpenRouter.
S23. Sonnet 5.5; `node Server/usage-now.mjs` before any spawn; Haiku only for reading, under 60k tokens.
S24. One-sentence chat replies.
S25. Write `STATE.md` here so a fresh session can resume.
S26. Land with `finish-task`, commit with attribution, leave no worktree behind.
S27. [sessions/2026/10/10/session-41240bd9/tasks-into-sessions/requirements.md]
S28. Move task folders into their session folders (task mastermind brief)
S29. Owner's ask (2026-10-10): convert the old session and task directory structures to the new one, provided nothing is mangled, deleted or lost.
S30. Port things over and condense where it makes sense.
S31. If tasks belong to sessions, put them within the session folder.
S32. "Get it done."
S33. This reverses the earlier hold on `--tasks` (handover note 2026-10-10): the hold was only "a moved task has no route yet"; solve that, then move.
S34. Where things stand
S35. `Server/session-migrate.mjs` already moved session folders and cards to `public/framework/ai/sessions/YYYY/MM/DD/<slug>/`.
S36. It is a dry run by default, has `--apply` and `--undo`, deletes nothing, and records every move in `ai/sessions/migration-manifest.json` (header and `Server/session-migrate.test.mjs` explain more).
S37. Its `--tasks` flag is off.
S38. When on, it also moves each task folder `ai/YYYY-MM-DD/<task>/` to `<session slug>/task/`, matched by the `session_id` in `task.jsonl`.
S39. The blocker: a page exists only while its parent's `children:` declares it (CLAUDE.md "Nothing crawls"; `ai/sessions/doc/data/layout.md`), so a moved task has no route and every old link and card to it would 404.
S40. Read first: `ai/sessions/doc/data/` (layout and data architecture), `ai/doc/` indexes for the date layout, `core/Page/doc/indexing-2026-10-08.md`.
S41. Do, in order (tick each when proven)
S42. Dry run `--tasks` and report counts: tasks with a session (move), tasks without one (stay; list them), name clashes, tasks whose `task.jsonl` has several sessions (pick the first/owning one, list the rest), and the total bytes.
S43. Make routes resolve before moving anything.
S44. Choose the simplest working approach and record the alternative: e.g. a resolver that maps an old `/framework/ai/<date>/<task>/` URL through the manifest to its new path (a redirect or an alias in the dev server's router), AND the AI board/card links that name task dirs.
S45. Prove with a handful of real old URLs that they still load after a move.
S46. If this needs `core/Page` semantics, add it beside it as a resolver; do not change Page behaviour (note what you need).
S47. Integrity proof: a script that, before and after `--apply`, lists every file under the moved trees with size and sha1 and proves each old file exists at its new path with identical content (`migration-verify`): zero missing, zero changed.
S48. Condensing (merging duplicate folders, dropping empty ones) is allowed only as move-aside to an archive path with an entry in the manifest; never delete.
S49. Apply in a worktree, in batches if large, committing each batch after a smoke test (`node Server/merge.mjs <worktree> --dry-run` must pass; zero same-origin 404s).
S50. Keep `--undo` working; test it on a dry copy.
S51. Update `ai/sessions/readme.md`, the data-layout doc, the handover (remove the hold note I left: "Decision 2026-10-10 ... --tasks stays OFF"), and the AI board/dashboard readers that list tasks, so the board still shows every task.
S52. Everything stays linked from the site.
S53. Fences
S54. Never destructive: move, link, archive; `git mv` for tracked files; manifest of every old to new path; reversible.
S55. The live working tree has machine-written session files; commit rule: `git add -A -- . ':!public/framework/ai/sessions/2026'` for agent logs, and add `ai/sessions/2026/` composites in their own commit once the move is verified.
S56. Sonnet 5.5; `node Server/usage-now.mjs` before any spawn; Haiku minions only for cheap reading under 60k tokens; no OpenRouter.
S57. Do not touch `Servex/Pool.js`.
S58. One-sentence chat replies; `STATE.md` in this dir so a fresh session resumes; land with `finish-task`, commit with attribution, no worktree left behind.
S59. If a decision needs the owner, make it, record the alternative, and keep going.
S60. [sessions/2026/10/10/session-62419663/figma-system/requirements.md]
S61. Figma system: track, browse and reproduce Figma designs (task mastermind brief)
S62. Owner's ask (2026-10-10, dictated; the essence, details are the owner's best guess):
S63. Build a system, most likely an extension (`ext/Figma`), that tracks Figma files through the Figma MCP and lets the owner browse them on our own site: each page previewed, each document shown as a larger preview built from its pages.
S64. Keep notes of every observation about how the Figma system works while you do it.
S65. Then pull the Sept-2026 file in and reproduce as many of its designs as possible within reason, as real framework pages.
S66. What is already known (verified 2026-10-10, no need to redo)
S67. The Figma MCP is connected (`mcp__figma__*`); `whoami` works: plans lew42 (`team::846709509681843175`, admin), Test Team, UI, Test, Michael's Starter team.
S68. No tool lists a user's files: every call needs a file key from a URL.
S69. Keys known: Sept-2026 `QYN0G2URSBHYH5I06MOjxU`, July-2026 `0rZv3Z6Hnqkxa2UQJ5xOOG` (already converted into `styles/layouts`; see `ai/sessions/2026/08/18/figma/`), scratch file `T5PuB8EhKhfyh0xtpIT1L0` ("Claude layout test", lew42 drafts).
S70. Tools: read = `get_metadata` (no nodeId lists the pages; with a nodeId an XML tree), `get_screenshot` (short-lived PNG URL, download with curl), `get_design_context` (4x the price; the 2026-08-18 run skipped it, see memory `figma-workflow-2026-08-18`), `get_variable_defs`; write = `use_figma` (Plugin API JS; load skill `skill://figma/figma-use/SKILL.md` through `ReadMcpResourceTool` server `figma` first), `create_new_file`, `generate_figma_design` (captures a live web page into a file), `html_to_figma`.
S71. A new page was added to Sept-2026 (id `124:1062`, "Claude test page", empty) and may be deleted.
S72. Sept-2026 pages: Page 1 `0:1`, Page 2 `7:1148`, Page 6 `69:4759`, Page 3 `11:1467`, Page 7 `112:10252`, Page 8 `119:15240`, Vector Design `19:5982`, Paragraph Design `24:5995`.
S73. Page 7 is the one the owner values.
S74. Frame `Color Schemes` (`112:11362`): nested color-scheme cards.
S75. White card with a ~10% grey card inside; the primary light blue card with a 10-20% darken so white text keeps contrast; a dark card with many lighten/darken steps (10%, 50%, nested).
S76. The owner's observation: dark mode nests more levels while keeping contrast; unknown whether light mode can.
S77. They read as transparency overlays (probably black/white at 10/25/50%), not fixed greys; verify via `get_design_context` on one card or `use_figma` reading fills/opacity.
S78. Frame `The Palette` (`112:12899`, 1920 x 11219) is a long style sheet: Palette, Typography, Controls, Feature Cards & Lists, Pricing & Dashboard, Task Management, Timeline & Task Detail, AI Collaboration, Hero Layouts.
S79. Screenshots are in the earlier session scratchpad; re-take them cheaply.
S80. Embeds: the owner thinks Figma embeds are not responsive; if so, re-render them (screenshots) and lay them out in our own responsive grids.
S81. Check current Figma embed behaviour (a quick web check or test) and record the result.
S82. Deliverables (smallest working slice first; ship, then widen)
S83. Observations note (`ext/Figma/doc/observations.md`): how the MCP behaves (limits, costs in tokens, rate limits, what failed), updated as you go.
S84. This is the memory for the next agent.
S85. `ext/Figma` extension, per CLAUDE.md "Write classes": e.g. `FigmaFile`, `FigmaPage` (names: design them first, put the class architecture on its readme, show the class).
S86. It stores a tracked file as JSONL data beside the extension (file key, name, pages, node ids, screenshot paths, fetched-at); a node script fetches/refreshes it (compute, don't recall).
S87. Screenshots are downloaded to the repo (size-capped) so the site works without Figma.
S88. Browse page on the site: files list, then a file's pages as a preview grid (responsive grid of screenshots), then a page's frames.
S89. Everything linked from the site (`ext` readme + framework index).
S90. Live via the `live()` tail where data changes.
S91. Reproduce designs from Page 7: start with `Color Schemes` as a framework demo (nested cards that use alpha-overlay darken/lighten tokens, dark and light), then the Palette sections one at a time.
S92. Reuse existing framework CSS/classes first (CLAUDE.md law 6; check `styles/` and `ux/` before writing anything).
S93. A cheap pattern: you (Sonnet) read the Figma file and write a minimal spec per section (node ids, the screenshot, the exact tokens); then a Haiku 5.5 minion under 60k tokens gets only that spec and builds the page.
S94. Record what Haiku got right and wrong per section.
S95. Open design question to decide and write down (do not wait on the owner): how page content should be stored.
S96. Owner's thinking: a page's content as a list of views serialized into the page's JSONL (first line may hold a snapshot, later lines are deltas, so playback and the live tail come free; condense/snapshot when large), the same way chat messages and session files already render as lists.
S97. Find out what exists today (`core/Page/doc/indexing-2026-10-08.md`, `ext/Refine`, the streaming list/Page classes, `page.js` vs `page.jsonl`), decide whether the first slice should use that or plain `page.js`, take the simpler working path, and record the alternative.
S98. If the page-as-JSONL-views idea is not built yet, do not build it here: write a short `doc/` note with what you learned and what the smallest slice would be.
S99. Fences
S100. Work in a worktree; commit each working step after a smoke test; merge via `Server/merge.mjs` after reviewing the diff.
S101. Linked from the site (CLAUDE.md "Everything is linked").
S102. Figma writes: only the scratch file `T5PuB8EhKhfyh0xtpIT1L0` or new files in lew42 drafts.
S103. Never modify or delete anything in Sept-2026 or July-2026 (read only).
S104. Do not touch `ai/sessions/`, `Servex/`, `core/Page` semantics (note what you need instead).
S105. Model: you are Sonnet 5.5.
S106. Run `node Server/usage-now.mjs` before each spawn; Haiku minions only for cheap reading/building, under 60k tokens; no OpenRouter.
S107. Chat replies one sentence; progress as short log lines at least every 5 minutes; write `STATE.md` in this dir so a fresh session can resume.
S108. Land with `finish-task`; commit with attribution; leave no worktree behind.
