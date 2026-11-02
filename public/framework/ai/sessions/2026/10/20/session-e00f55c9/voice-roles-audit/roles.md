# Voice roles: who the voice agents are

Week: not measured here (read `node Server/usage-now.mjs` before any spawn).

Short answer: a voice session has two seats today. The **fast seat** is the `voice-assistant` role (Haiku), on by default. The **smart seat** is `session-smart` (Sonnet), always on. The Claude app's voice call is a third thing, the cloud voice agent, and it is not one of these seats.

## The table

Counts are registry rows in `%LOCALAPPDATA%/lew42/servex/registry.json`, by id prefix, started in the last 2 days (2026-10-31 to 2026-11-02). A row is one spawn, not one turn.

| Role id | Model | Who spawns it, and when | Reads | Writes | Ran (2 days) |
|---|---|---|---|---|---|
| `voice-assistant` (fast seat) | `claude-haiku-5-5` (tier `fast`), effort low | `Sessions.js:1358`, when `session-assistant.txt` says `voice` (the default). Woken per released thought, with the whole prompt so far | `.claude/skills/voice-assistant/SKILL.md` (`roles.js:98`, `Sessions.js:1326`) | one `place` line per sentence, `Question` tasks for "?" sentences, via the item tool | 11 |
| `session-smart` (smart seat) | `claude-sonnet-5-5` (tier `voice_smart`, `tiers.js:12`); Sonnet too when over pace (`Sessions.js:1341`) | `Sessions.js:1378`, from the wake gate `feed_smart` (`Sessions.js:323`). Once per session, on the first say | `Servex/agents/session-smart.md` (`roles.js:99`), the polished prompt, the session record | refined titles and text, replies, tasks, `dir_log`, `session_summary` | 10 |
| `session-fast` | `claude-haiku-5-5` (tier `fast`), effort low | `Sessions.js:1364`, only when the seat is `fast` (the old chatter). Not on by default | `Servex/agents/session-fast.md` | chat bubbles | 0 |
| `assistant` (every-prompt) | Haiku, effort low | not a voice seat. Its row says retired to `voice-assistant` (`roles.js:56`) | `.claude/skills/every-prompt/` | prompt tasks | 1 row, not checked further |
| `voice-mastermind` | not in `roles.js` | the Claude app's mastermind behind `ask_mastermind`; named in `Servex/agents/tools.js` and `.claude/skills/voice-mastermind/` | the cloud voice guide, `Servex/ext/remote/doc/cloud-voice-agent.md` | the answers the cloud agent speaks | 0 rows (no registry prefix) |
| cloud voice agent | Claude app model, not Servex | the owner's phone call; its session is `cloud-voice-<name>` | `Servex/ext/remote/doc/cloud-voice-agent.md` | `ask_mastermind`, `/live/` | not a Servex row |

Where the switch lives: `Servex/agents/Sessions.js:70-85` reads `session-assistant.txt` (first), then `SERVEX_SESSION_ASSISTANT`, then the default `voice`. The file currently says `voice`.

## What does not agree

1. **Two names for the fast seat.** The owner calls it "fast assistant", "voice assistant", and the code calls it `voice-assistant`, `session-fast`, `assistant`, and `every-prompt`. The `every-prompt` skill is the old name, kept as a skill folder.
2. **Two names for the smart seat.** "smart assistant", "smart seat", `session-smart`, `voice_smart` (the tier), and "master assistant" (a retired word, `roles.js:79`). The cloud side says "voice agent" and "voice-mastermind". One job, four words.
3. **A retired note that now points the wrong way.** `roles.js:92` says "drop the fast assistant for now" (2026-10-17). The seat was turned back on as the default on 2026-11-01 (`Sessions.js:71-72`, `fast-and-smart.md`). The row and comment should say the seat is on.
4. **A brief that contradicts the code.** `session-smart.md:1` says "You run on Opus 5.5". `tiers.js:11-12` and `Sessions.js:1341` run Sonnet. The owner's Opus night (2026-10-25) was reverted.
5. **A comment that contradicts the code.** `Sessions.js:154` says "fast on Sonnet". `tiers.js:6` and `roles.js:98` say Haiku.
6. **`voice-mastermind` has no row.** It is spawned by the cloud path and named in `tools.js`, but `roles.js` has no entry, so no policy or model applies to it.

## The single-agent option

- **It already exists as a value.** `session-assistant.txt` = `off` runs only the smart seat (`Sessions.js:73-75`). Nothing new is needed to try it. `off` also makes code file one Question per "?" sentence (`Sessions.js:1082`).
- **The one-line switch the owner asked for:** rename the file's words to `seats: "single" | "dual"`, with `single` = `off` and `dual` = `voice`. The rename is cosmetic; the behaviour is already there. A restart of Servex is needed (`Sessions.js:71-76`), never during a call.
- **What the fast seat does today that single loses:**
  - the `place` line per sentence: paragraph breaks and card placement. Without it the chat stays one bubble until the smart seat replies;
  - per-sentence cleaning (punctuation, fillers, capital letters): the smart seat cleans only the Prompt's refined text, later;
  - the quick best guess when the owner names it ("fast, …"), and the fix of a mis-heard known word, which the voice brief does not carry anyway;
  - a Question task for each question as it is said, rather than code's "?" rule (`Sessions.js:1082`).
- **Name for the single role:** keep the id `session-smart` (renaming it touches `roles.js:99`, `Sessions.js` prefixes and the registry), and call it "voice agent" on the page. Owner's words: "single voice agent". Going back to dual later is the same switch with `voice`.

## Decisions I made

- Counted rows, not turns, because the registry does not keep turn counts.
- Did not open `ext/Chat` or the cloud guide beyond the lines named; `cloud-voice-agent.md` was read by grep only.
- Did not check whether `assistant` (1 row) was a voice seat; it is not in the voice spawn path.
