# Fixes before merge: the review, the docs check, and the echo pattern

Load the `minion`, `code` and `ui-test` skills first. Your parent is task-mastermind-voice-sessions. **Worktree (new, 2026-09-30): `C:/Code/lew42/worktrees/voice-fixes`** (branch `worktree/voice-fixes`, off current michael/dev, site http://localhost:50881/). qf-9 is gone: someone else holds it now, so don't touch it. **Step 0:** `git cherry-pick e2e15de8 0ac19ab2` (ask_directory and slice 2, from branch `salvage/qf-9-2026-09-29`; never merge that branch, since its top commit is watcher noise). Read every conflict. Commit by exact path. Never stash, never restart Servex, and stop every process you start. **Budget: about $8.** **Every proof POST is STUBBED:** a proof never posts as the owner, because worktree servers forward to the main tree's live logs (the ui-test skill says how). Use a private Servex-like harness with `SERVEX_HOME` in your scratchpad, as slices 1 and 2 did.

**Fence:** the files those two commits touched (`Servex/agents/Sessions.js`, `directory.js`, `tools.js`, `session-smart.md`, `session-fast.md`, `Servex/agents/readme.md`, `Servex/agents/doc/directory.md`, `Server/plugins/ServexProxy.js`, `public/framework/ext/Session/**`). Plus `ext/drawer/rail.js` for item 5 only. NOT `ext/Chat` and NOT `Servex/agents/Assistant.js`. **Don't change Session.js's exported function signatures**, since rail.js (71933e2a) already calls them.

## 1. The fresh review

Read [../review-fresh.md](../review-fresh.md). Answer each finding in your task.jsonl as `{"review":{"answer":{"n":N,"reply":"fixed" | "declined: <why>"}}}`. My rulings:

- **1, 2, 3, 5, 6: fix, as the review proposes.** For 1, pass `urgent: true` AND set `parent` to the caller. For 3, reopen by the saved session id. For 6, accept repo folders (`Servex/agents` → `<repo>/Servex/agents/ai/log.jsonl`), not only site paths.
- **4: fix** with a fallback. When `log.jsonl` has no line for a session, `/api/sessions` and the resume check also match `sessions.json`'s `home`/`visited`. Also backfill `log.jsonl` once from `sessions.json` on install, and log how many lines that wrote.
- **7: declined here, not in your fence.** The ✦ rail is being moved onto `Session.js` by minion-voice-on-panel (the Servex mastermind's), and a page's AI tab is drawer code. I'm telling the Servex mastermind. Just make sure `start()`, `resume()` and `recent()` are documented in the readme so that minion can wire them.
- **8: fix. Key by PROJECT, not raw host.** The phone (`10.0.0.135:8481`) and `monorepo.localhost` are the same project and must see the same sessions (the owner, 7:55 PM: "any new session knows everything"). Store `project`: the Servex project the Host resolves to (a `<name>.localhost` host → its name; an IP:port → the project serving that port, via Servex's port registry; else the repo's own project). Filter by `project`. Keep `host` in the line as information only. Two different sites still never mix.
- **9: fix, cheaply.** On install, for each session whose last `chat` line is an owner line with no later assistant line, append a system line: "Servex restarted; this line wasn't answered. Say it again."
- **10: declined.** Session files are the record ("the full chat log could be logged somewhere… searched or read"), committed like any other page log. Say so in doc/sessions.md.
- **11: fix.** Write `ended` (with the latest title) in EVERY folder the session visited, on every stop (idle, `room()`, or a failed revive), not only on an idle stop at home.
- **12: fix all four.** List Recent on page load. A directory mastermind asked a QUESTION can't write: spawn it with `disallowed_tools` for Write, Edit and NotebookEdit, or `permission_mode: "plan"`, whichever the spawn supports; check `Agents.js`. `session_line` refuses a refinement (`level` set) that has no `re`. At most 2 live directory masterminds per session: stop the oldest idle one first.

## 2. The docs check ([../docs-check.md](../docs-check.md))

- `Servex/agents/readme.md` still says the directory mastermind is "not yet built". Fix that line, and add a short **Voice sessions** entry: `Sessions.js`, its three routes, `session-fast` = the fast assistant and `session-smart` = the smart one, linking `ext/Session` and `doc/directory.md`.
- `ext/Session/readme.md`: one line naming the two roles, and one line saying what `/new`, `/say` and `/nav` do.
- `doc/directory.md`: say who calls `ask_directory` (the smart assistant, routing a technical question; or any agent), and that its `session` is the voice-session id (`v-…`), the same id `Session.start()` returns. If that isn't true in the code, make it true.

## 3. The echo pattern, now that `follow(path)` is live (requirements item 9)

Decision `d-hear` in ../task.jsonl: the pair keeps hearing by direct sends. `follow` is for everyone else. `follow({agent, path, gather_ms})` is a live Servex tool (known bug: the last line of a burst waits for the next write; the API won't change).
- In `session-smart.md`: when the smart assistant hands work to a mastermind about this session, it tells that mastermind to `follow` the session file (`public<home>ai/<id>.jsonl`), so both hear the owner at once and the mastermind can pick up corrections. The handoff message itself is still polished, never raw.
- `doc/directory.md`: a directory mastermind reused within a session may be told the same.
- One line in `ext/Session/doc/sessions.md` naming this, and linking the follow tool's doc (find it under `Servex/`).

## Proof

- Every review answer is in your task.jsonl.
- `node --check` passes on every JS file you touched.
- The `/framework/ext/Session/` demo still loads with zero console errors on the worktree site (http://localhost:50881/).
Reply with the commit.

## Added: follow is live with its tail fix (mastermind-servex-7)

Docs: `Servex/doc/follow.md`. 20 lines in 1 s arrive as 1 message, in order, with no replay. Link that doc from session-smart.md and doc/sessions.md. **Caveat to keep:** a jsonl replaced by a rename can resend lines, so the session file and `ai/log.jsonl` are append-only. Check that nothing in Sessions.js rewrites them (for example, the backfill in finding 4 must append, never rewrite).

## 4. Don't reply while the owner is talking (relayed from clean-transcription by mastermind-servex-7)

The owner: "don't reply while I'm talking". The composer now stamps each post with `floor: "speaking" | "done"` and `cues: {pauses:[{start,end,ms}], speaking_ms}`. The contract is `ext/Chat/doc/floor.md` (it may still be landing; read it if it exists and don't edit it).
- `POST /api/session/say` accepts optional `floor` and `cues`, and stores them on the owner's chat line. Add `POST /api/session/floor {session, floor}` for a floor change with no new text. `Session.js` gets a new `floor({session, floor})` and `say()` passes `floor`/`cues` through (adding optional fields is fine; don't rename or reorder existing ones).
- The FAST assistant's reply is HELD while the session's latest floor is `"speaking"`: Sessions keeps the finished fast reply in memory and writes its chat line only when the floor turns `"done"` (then only the newest held reply, not a backlog). A say with no `floor` behaves as `"done"`, as today.
- The smart assistant is not held (it already waits out a quiet gap), but its quiet-gap timer restarts while the floor is `"speaking"`.
- Proof: say with `floor:"speaking"`, and no fast line appears; `/floor` `"done"`, and it appears within 1 s. Add this as an `experiment` line.

## 5. The ✦ sheet itself (added: voice-on-panel landed as 71933e2a and stopped; `ext/drawer/rail.js` is now in your fence, for this change only)

In `ext/drawer/rail.js`:
- pass `floor`/`cues` from the composer through `Session.say()`, and call `Session.floor()` when the composer flips to `"done"` with no new text (the contract is `ext/Chat/doc/floor.md`);
- light up the resume line: rail.js already calls `resume()` behind a `typeof Session.resume === "function"` guard. Make sure `previous` shows as one line ("<title> · 1 day ago") that resumes the session when tapped, and that a second ✦ press within the hour continues the same session.
- Keep v1 reachable (the `page` skill's "never destroy a viable version"): change the default sheet class, not the kept `SheetV1`.
- Proof: a headless 400px shot of the sheet showing the resume line, and one showing a held fast reply appearing after "done".

**Not yours:** `Servex/agents/Assistant.js`. clean-transcription is changing its `heard()` and `words()` in qf-6. Voice sessions live in Sessions.js, so you shouldn't need Assistant.js; if you do, message me first.

**Also for item 5:** grip-everywhere merged 3b8362d8 (about 21:00), which adds a height grip on the ✦ sheet's top edge. It was hand-grafted into `DrawerRailSheetPanel` after a conflict with 71933e2a. Merge michael/dev first, keep the grip, and be the second pair of eyes on that hand merge. Proof at 400px, headless: dragging the top edge resizes the sheet, AND the first sentence gets the fast reply and then the smart one.

**Update 2026-09-30:** clean-transcription's floor handling for the page assistant is merged (46a74467: `Assistant.heard()`/`words()`, `ux/Dictate/floor.js`). Read it and match its behaviour and names for the session pair in item 4. Still don't edit Assistant.js. rail.js already has voice-on-panel (71933e2a) and the grip (3b8362d8) in michael/dev, so no merge is needed; just check the grip still works after your change.
