# Card sessions: an AI 2 card as a voice session's home

Load the `minion` and `code` skills. Your parent is task-mastermind-voice-sessions-2. Worktree `C:/Code/lew42/worktrees/voice-card` (branch `worktree/voice-card`, current michael/dev, site http://localhost:61311/). Commit by exact path. Never stash, never restart Servex, and stop every process you start. **Every proof POST is stubbed**, or runs on a private harness with `SERVEX_HOME` in your scratchpad, as `../e-fixes/proof/` did. Budget: $3.

## What the owner asked (relayed by mastermind-servex-8)

"On AI 2 pages, the drawer's chat still goes to the OLD card assistant and manager, not the per-session fast and smart pair the ✦ sheet uses. Route AI 2 card pages through the same voice or chat session pair (the card being the session's home page, or its context)." task-mastermind-audio-consolidate builds the page side (its Widget calls `Session.start({path, card})` on card pages and draws the session file with `watch()`). You build ONLY the Servex side it calls.

**Fence:** `Servex/agents/Sessions.js`, `Servex/agents/session-smart.md`, `Servex/agents/session-fast.md`, `public/framework/ext/Session/Session.js` (pass `card` through `start()`; add no other change to its signatures), `public/framework/ext/Session/doc/sessions.md` and `readme.md`. Nothing in `ai2/`, `ext/drawer/`, `ux/Dictate/`.

## The shape (already promised to audio-consolidate, so build exactly this)

1. `POST /api/session/new {path, card?, fresh?}`. With `card` (a card id such as `2026/09/29/audio-a-library-of-audio-parts-transcrip`, validated: no `..`, and `public/framework/ai/<card>/page.jsonl` must exist), the session's `home` = `/framework/ai/<card>/`, so `file` = `/framework/ai/<card>/ai/<session>.jsonl`, beside the card's page.jsonl. `path` is kept as where the owner stood. Store `card` in the session's first line and in `sessions.json`. A bad or unknown card: 400 with the reason.
2. **Resume within an hour is per card:** a `/new` with a card continues that card's session from the last hour (same rule as a page), unless `fresh`. `/api/sessions?card=<id>` lists that card's sessions (and `previous` works the same).
3. **The pair gets the card as context:** the fast one gets one line ("This session is about card <id>"). The smart one's opening says the card id and the path of its page.jsonl, and tells it to read that file first for the card's history. `session-smart.md` says, in one line, that a card session's decisions and handoffs follow the card's own log.
4. **Index lines:** `started`/`ended` go into the card folder's `ai/log.jsonl` (`/framework/ai/<card>/ai/log.jsonl`), through the same code path as a page. **Nothing is copied into page.jsonl.**
5. `Session.start({path, card, fresh})` passes `card` through. Document the card form in sessions.md and one line in the readme.

## Proof (each one an `experiment` line in your task.jsonl)

- `/new {path:"/framework/ai2/<card>/", card:"<a real card id>"}` returns `home` = `/framework/ai/<card>/`, and the file is created there. A second `/new` within the hour resumes it. A bad card gets a 400.
- One say reaches both agents with the card context (the harness shows the opening lines), and the card's `ai/log.jsonl` has a `started` line, while page.jsonl is byte-identical before and after.
- `node --check` on every JS file. Delete every proof file you wrote in real card folders. Commit, then message me.
