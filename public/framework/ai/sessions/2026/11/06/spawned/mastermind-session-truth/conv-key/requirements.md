# Cloud voice record keyed by the conversation id (t16)

Ask (voice-app, 2026-11-08, small and additive): the 2-hour gap rule split one cloud conversation again (11-08 record).
1. Link the 11-08 record into the 11-06 one (done: ChildLinks.link, Session entry on the 11-06 record).
2. Explain the stray `session-cloud-vo` folder; move it aside only if junk, never delete.
3. If small: `register_session` takes the claude.ai conversation id so the record is keyed by it and never splits.

Built (worktree session-truth-conv, commit 4c9cd2b40):
- `Servex/ext/remote/RemoteMCP.js` voice_session: `conversation` binds `conv:<id>` -> record; a bound record ignores the gap; a title + id adopts an existing record.
- `public/framework/ai/AISession/AISessionIndex.mjs` dir_of: a non-uuid (record-only) id is written to its own folder, not `session-<id8>`.
- Tests: RemoteMCP.test.mjs (new block), AISessionIndex.test.mjs (two asserts; fails on the old code).
- Docs: Servex/ext/remote/doc/cloud-voice-agent.md, voice-logging.md.
