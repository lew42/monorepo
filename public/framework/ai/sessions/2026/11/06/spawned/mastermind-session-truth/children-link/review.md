verdict: fix
1. [fix] Ask 4 is not done: no `log` line lists tonight's misfiled children (agent id, current parent_session) anywhere. The `children-link` task in `cloud-voice-app-20261106/session.jsonl` holds only voice-app's own root-cause log (line 539), and this folder's `session.jsonl` has no log at all. Fix: list the registry rows whose `parent_session` is `voice-20261019-live-page` with a script and append them as one log line on that task.
2. [fix] A fresh agent could not continue from this folder alone. `session.jsonl` holds only the assign, the pid and commit `a3f5c0d04`: there is no record that `RemoteMCP.test.mjs` passed, that asks 1–3 are met, or that ask 4 is still open. Log each step's outcome on the task. (I ran the test in the worktree: `ok 7 calls`, exit 0.)
3. [note] The test copies the parent rule instead of calling it (`RemoteMCP.test.mjs`, the block added around line 172): `session_of` and the `child.parent_session` assignment are written out again because importing Agents needs the SDK. So a later change to `Agents.register` or `session_of` (`Agents.js:66`, `:92`) would not fail this test. The comment explains why, and that is acceptable for a lean test.
4. [note] The brief says "live and registry". `voice-app` is never in `agents.live`: only `Agents.js:276`, `Dispatcher.js` and `Sessions.js` put agents there. So `session_of` falls through to the registry row, and writing only the registry is enough. One clause in `voice-logging.md` saying so would stop the next reader from looking for a live entry.
5. [note] `point_caller` (`RemoteMCP.js:215`) runs on every voice tool call and reads `registry.json` each time. It writes only when the id changes, so this is cheap and correct. `External.register` also bumps `last_at`, which the brief's "nothing else changes" tolerates.

## Requirements
- 1 "When RemoteMCP opens (or reuses) today's cloud voice session, it points voice-app's live and registry session_id at that session's id. Nothing else in the registry row changes." — yes. `voice_session()` calls `point_caller(id)` (`RemoteMCP.js:210`), which calls `External.register({id, session_id})`; that keeps the rest of the row (`...rows[id]`, `External.js:86`). Only the registry is written, which is enough (note 4). The test asserts `keep: "me"` survives.
- 2 "Say in the doc … how a SECOND cloud voice session on the same day gets its own id … propose (do not build) the change in one paragraph with its alternative" — yes. `voice-logging.md`'s new section describes today's behaviour (an untitled call shares `cloud-voice-app-<YYYYMMDD>`; a titled call gets its own folder; the row flips between them), then gives one paragraph with a proposal and an alternative. It matches `cloud-voice-agent.md:14`. The readme line was updated (`readme.md:10`).
- 3 "A test beside RemoteMCP's existing tests: open today's session, then session_of("voice-app") returns its id; a child spawned after gets that parent_session" — yes, with a copied rule (note 3). The test passes: `ok 7 calls`.
- 4 "Do NOT re-parent existing children or edit old records. List tonight's misfiled children in a log line" — partly. Nothing was re-parented and no old record was edited, but there is no log line (finding 1).
- Class page — n/a (no class added; one method on RemoteMCP).
- Simpler way? — no. A method of 10 lines that reuses `External.register` is about as small as this fix can be.
- Indexing and stale docs — yes for the docs: `readme.md` points at the new section. No for the task record (finding 2).

## Words
- content: plain sentences — yes. The voice-logging.md section names the function, the field and the effect, and says a Servex restart is needed.
- content: the takeaway comes first — yes. The section's opening sentence says what changed, before any detail.
- content: no jargon left unexplained — yes. `parent_session` and `session_of` both come with what they do.
