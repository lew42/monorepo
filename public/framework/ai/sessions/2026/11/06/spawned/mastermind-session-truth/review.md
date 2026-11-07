verdict: fix
1. [fix] Ask t15 ("cloud voice record: one per conversation, not per date", session.jsonl:646) is missing from requirements.md: it has no checkbox, no merge and no proof line. A fresh agent reading the task folder cannot see this work exists. Add it under "Added 2026-11-07" with branch `voice-sticky` (commit 94213e899) and its state.
2. [fix] Servex/ext/remote/doc/cloud-voice-agent.md:19 still says the untitled record is "Made by `RemoteMCP.voice_session()` on the first call of the day". Servex/ext/remote/doc/voice-logging.md:3 still says "one folder per cloud voice agent per day". Both are now stale: the code continues the record in use across midnight. Point both lines at the new paragraph at voice-logging.md:29.
3. [fix] The comment block at Servex/ext/remote/RemoteMCP.js:196-197 still opens with "One folder per cloud voice agent per day … <name> is … else the caller + date". The new paragraph below it contradicts that first sentence. Reword the first sentence so the block says one thing.
4. [note] voice-logging.md:29 says "a longer gap opens another", but that is not always true. After a gap of more than 2 hours, an untitled call goes to `cloud-voice-app-<today>`. If that record already exists today, it is reused, so two separate untitled chats on the same day still share one record (RemoteMCP.js:212). Either say so in the doc, or add a suffix after a gap.
5. [note] The task t15 record has only the `add` line: no log and no close with an outcome. The brief also asks for parts (1)–(3), the proposal, the 11-06/11-07 link and the count of midnight crossings. Only the doc paragraph shows they were done. Close t15 with evidence once it is merged.
6. [note] Simpler-way check: the "save at most once a minute" branch (RemoteMCP.js:217-218) adds a third field and an else branch just to throttle a small JSON write. Saving only when `moved`, and writing `last` on the existing per-connection save at line 366, would be enough. The current version is correct, though.
7. [note] The code looks right. `live` requires the store row to exist, a known id keeps its own folder (`store.map[id]?.file`), and the `caller:voice-app` key is safe in remote.sessions.json, because nothing iterates that map (git grep: only RemoteMCP.js reads it). `node Servex/ext/remote/RemoteMCP.test.mjs` in the voice-sticky worktree prints `ok 7 calls`. It goes live only after a Servex restart.

## Requirements
- t15 (1) "proposal on what keys a cloud record": yes. voice-logging.md:29 explains why the connection id is not the conversation id, and what an exact key would need.
- t15 (2) "link the 11-06 and 11-07 records, additive": yes, per voice-logging.md:29 (a Session entry and a `continues` note). Not verified in the diff, because those records are outside it.
- t15 (3) "count other midnight crossings": yes. voice-logging.md:29 records one crossing, and gaps of 64 min, then 206 min and up.
- t15 (4) "the real fix only if small (worktree, test)": yes. It is in the voice-sticky worktree, with a test block at RemoteMCP.test.mjs:156-170 that passes.
- Class with live instances: n/a. No class was added; RemoteMCP gained two statics only.
- Stated widths: none. The diff changes no page; the shots/ folder is from earlier tasks.
## Words
- Doc paragraph is plain, with full sentences: yes, voice-logging.md:29. It runs long, but it is a deep doc.
- The new code comments match the file's style: yes. They contradict the older sentence above them (finding 3).
