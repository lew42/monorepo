# Record-only sessions (cloud voice) show on the sessions pages

Budget: $8. Sonnet, medium effort. Owner, 2026-10-20 17:57 (to the cloud voice agent): "I don't see it showing up in my AI sessions page … it does seem to show most of these sessions, but yours didn't."

## The bug, verified

`ai/sessions/2026/10/20/cloud-voice-task-system-and-voice-agent-exploration/session.jsonl` exists (line 1 `{"session":{"id","kind":"cloud-voice-agent","caller":"voice-app","at"}}`, made by `register_session` through `Servex/ext/remote/RemoteMCP.js`), but today's day `index.json` holds 52 snapshots and none for it; the 10-19 day index has no `cloud-voice` entry either. The sessions grid (`/framework/ai/sessions/`, `ai/AISession/AISessionsPage.js`) is built from the day `index.json` snapshots, which only `ai/AISession/AISessionIndex.mjs` writes, and it writes one per **Claude transcript** it tails under `~/.claude/projects`. A session with no transcript on this machine (a cloud voice call, any record-only folder) is invisible there. The new index stream did see it (`sessions/2026/10/20/index.jsonl` has 1 line for it), so the data path exists; the snapshot does not.

## Build

1. `AISessionIndex.mjs` (or the writer you judge right after reading `Server/AIIndexStream.mjs` and `ai/sessions/readme.md`): a session folder whose record starts with a `{"session":{…}}` line and has no transcript gets a snapshot in the day `index.json` (id = folder name, kind from line 1, first_at/last_at from its lines, cost from a `cost` line if any, else 0, the title from `register_session`). Written when the folder appears and when its record grows (the same watch that follows transcripts, or the index stream's hook), never by an agent.
2. The sessions grid shows it with its kind chip (`cloud voice`), nested under nothing; the detail page opens its `session.jsonl` instead of a transcript (check `AISessionDetail.js` ~line 237 already handles `session.jsonl`).
3. Check `/framework/ai/` (the dashboard, "sessions by origin") also lists it; fix if not.
4. Proof: `check_page` on `/framework/ai/sessions/` and `/framework/ai/` show the cloud session of today; `node ai/AISession/*.test.mjs` (whatever tests exist) green; one test for a record-only folder.
5. Update `ai/sessions/readme.md` "How data gets in" (one row: record-only sessions get their snapshot from the same writer). Merge with `node Server/merge.mjs`, land with `finish-task`.
