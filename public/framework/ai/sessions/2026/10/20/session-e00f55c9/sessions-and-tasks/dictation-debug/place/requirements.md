# Dictation: the placement assistant never writes a placement

Budget: $5. Load the `minion` skill first. The owner's ask is in `../requirements.md` (each sentence lands as same paragraph, new paragraph or its own card).

## The bug
- **Seen in:** `public/framework/ai/sessions/2026/10/25/v-xhx7fmx/session.jsonl`: 118 lines, 58 `chat`, and **0 `place`** lines.
- **The seat was there:** line 2 is a `backing` line with `fast: 18c7fa74-3111-4857-b5d2-be5a906b0680`. That is the voice-assistant session, woken once per sentence by `Sessions.voice_say` (`Servex/agents/Sessions.js:439`). It should write one `{"place":…}` line per sentence with the item tool (`.claude/skills/voice-assistant/SKILL.md`).
- So it was started, but either it was never sent the sentences, or it answered without writing, or its write failed.

## Do
1. **Find the cause first, from the record.** Read that seat's transcript: `C:\Users\mike\.claude\projects\` (find `18c7fa74-3111-4857-b5d2-be5a906b0680.jsonl` with Glob in that folder only). Look at what it was sent, what it answered and any tool errors. Also grep Servex's log for that session (`%LOCALAPPDATA%\lew42\servex\logs\`). Write the cause as one `log` line in this folder's `session.jsonl`, with evidence (line numbers, the error text).
2. **Fix at the cause** in a worktree: `node Server/worktree-up.mjs dictation-place`, then work only there. If it is the skill text, fix the skill. If it is Servex code, fix it there; Servex code goes live only after a restart, which you do NOT do.
3. **Prove** it writes placements. Prefer a test that runs without the real Servex (look in `Servex/agents/` for an existing `*.test.mjs` around `voice_say` or `Sessions`, and extend it). If only a live check proves it, boot a private Servex from the worktree on another port (`Servex/readme.md` says how) and say exactly what you ran. Never feed the real Servex a test prompt: it spawns real agents.
4. Docs: `ux/Dictate/doc/voice-assistant.md` says what the code does now, in a sentence or two.
5. Commit by path in the worktree. Log each finding as a `log` line (`node .claude/hooks/append.mjs <file> <json file>`). Then message the parent (`mastermind-dictation-2`) two sentences and stop. If you cannot reach it, the log line is enough. Don't merge.

Fence: `Servex/agents/Sessions.js` (the voice seat only), `.claude/skills/voice-assistant/`, the test you extend, `ux/Dictate/doc/voice-assistant.md`.

Never: kill or restart the dev server or Servex, stash, push, drive the owner's tabs, or `git add -A` (files.jsonl rows are auto-written noise: add by path).
