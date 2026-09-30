# AI 2 404: a voice-session dir has no task.jsonl

Budget: $3

`/framework/ai2/` fetches `ai/2026-09-30/voice-session-v-2joydc7/task.jsonl` and gets a 404. Voice-session dirs are created with only `files.jsonl` and `owner-words.md` (find the creator: grep `owner-words` across `public/framework/ext/Session`, `Servex/`, `Server/`).

Two fixes, both:
1. The creator writes `task.jsonl` line 1 when it makes the dir: `{"assign":{"now":"session","agent":"<session agent id>","at":"<iso>","brief":"owner-words.md"}}`, the shape every other task dir has. Add the same line to the existing dirs that lack it (today's voice-session-* dirs).
2. `public/framework/ai2/groups.js` `day()`: a dir whose listing has no `task.jsonl` is skipped without a fetch, in the case that reaches the 404 today (the `loaded_listing` is not in yet, so `no_task` is false and the fetch fires). Make the fetch tolerant: a 404 on task.jsonl marks the dir as no task and logs nothing.

Proof: a headless shot (`mcp__site__shot`, never an owner tab) of /framework/ai2/ with 0 console errors, and `ls` of a fresh voice-session dir showing task.jsonl. Main tree, no worktree (two files); commit with a clear message, send the commit id to mastermind-servex-9 in one line. Load `minion` and `code` first.
