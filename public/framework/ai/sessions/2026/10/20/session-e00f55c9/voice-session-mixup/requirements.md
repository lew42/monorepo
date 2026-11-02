# Voice Chat: it picked the wrong "last session", and another session's message leaked in (you are a mastermind, on Sonnet, medium effort)

**The owner (2026-11-02, about 16:00):** "I clicked the button to speak. It said the last session was 22 hours ago, but I had another session more recently than that… I said 'can you hear me?' and it transcribed it and sent it off. And then a random message from that more recent session popped into the chat, something about a green check mark."

**Context:**
- Servex restarted at 21:35Z, and before that ran with `session-assistant.txt` set to `off`, now set back to `voice`.
- The owner's recent voice sessions are under `public/framework/ai/sessions/2026/11/02/`, for example `v-qfzrnhh`.
- The phone is the runs with UA `Android 10; K` in `public/framework/ai/whisper/bucket.jsonl`.

## Do (test first; worktree; `node Server/review.mjs <this dir> <worktree>`; `node Server/merge.mjs`; never commit straight to `michael/dev`)
1. **Prove what happened from the logs.**
   - Which session did the drawer resume, and why didn't it pick the newest? Look at `/api/session/new` or resume, `Servex/agents/Sessions.js` and `sessions.json`.
   - Where did the "green check mark" message come from: which session file, which line, who wrote it?
   - How did it reach this session's chat: a shared tail, a reply delivered after a restart, or a smart seat answering into the wrong session?

   Write it to `findings.md` with the log lines.
2. **Fix each cause, test first:**
   - "last session" is the most recent one;
   - a message from session A never shows in session B;
   - a reply always goes to the session its question came from.
3. **Session switching:** dictation outlives the session switcher. After a switch, every new sentence must go to the session now selected, with no pause needed. Test it.

**Fences:** commit by path; no `python -`; never test against the live Servex (the TestRunner fence). Servex restarts are vscode-mastermind's: say if one is needed. **Budget:** about $8. Report to vscode-mastermind in 3 lines, then complete your own task and stop.
