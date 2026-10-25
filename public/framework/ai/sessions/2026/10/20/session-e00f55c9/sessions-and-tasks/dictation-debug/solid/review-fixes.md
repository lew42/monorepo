# Solid step 2: the review's fixes

Budget: $3. Load the `minion` skill first. Work ONLY in the worktree `C:\Code\lew42\worktrees\dictation-solid` (branch worktree/dictation-solid). Read `review.md` in this folder (same directory as this brief): findings 1, 2, 3, 5 and 6 are yours. Do not touch steps 3–4 (finding 4); the parent handles those.

1. `ux/Dictate/doc/debug-tab.md`: add the section `## Refresh then dictate` (the anchor `#refresh-then-dictate`) — causes the test found, the fix for each, the proof `test/refresh.mjs` and `solid/proof/refresh-5-runs.txt`. Short.
2. `dev/Socket/readme.md`: say the pill reloads by itself after `QUIET_MS` (30 s) of quiet; name `QUIET_MS`, the `stash` event and `socket.restored` (Socket.js:19, :263, :276).
3. Index `test/refresh.mjs` in `ux/Dictate/readme.md` (the proof list) and `ux/Dictate/test/files.jsonl` (copy an existing row's shape).
4. `test/refresh.mjs:117`: reword the `deferred` line to "not within 6 s, the pill waits for the owner" (no behaviour change).
5. `Dictate.js`: `this.again = false` at the start of `start_now()`.

Check: `node --check` every changed .js/.mjs; `node Server/doc-check.mjs` on this folder if it runs. Commit by path in the worktree. Then log one line in this folder's `session.jsonl` (`node .claude/hooks/append.mjs <file> <json file>` with `{"log":{"at":"NOW","msg":"…"}}`) and stop. Don't merge.

Never: kill the dev server, stash, push, or drive the owner's tabs.
