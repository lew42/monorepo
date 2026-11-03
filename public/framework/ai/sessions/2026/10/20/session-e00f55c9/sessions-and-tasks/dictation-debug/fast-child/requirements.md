# Dictation: the fast assistant's cost counts under the smart one, and one live proof

Budget: $3. Load the `minion` skill first. Card: `public/framework/ai/2026/10/25/dictation-that-never-fails-in-the-browse/` (the owner's words). Parent brief: [../requirements.md](../requirements.md), Part 8 bullet 3 and Part 10. Log in `session.jsonl` beside this file (`log` lines, never a findings.md).

## What is left of Part 8

Most of Part 8 has landed: Chat v2 (`ext/Chat/v2/`), the fast seat writing Prompts and the smart seat writing replies (fd32ba0f4), the page's errors logged into the voice session (`ext/Chat/v2/report.js`), and the smart seat woken in batches (`Servex/agents/WakePolicy.js`, 12 s). Two things are not done:

1. **The fast assistant's cost is not counted under the smart one.** In `Servex/agents/Sessions.js` (~line 1199–1230) both seats are spawned with `parent: "sessions", parent_session: s.id`. The owner asked that the fast assistant be a child of the smart one so its cost is counted there.
2. **Nobody has seen a voice session with Prompts in Chat v2 yet** (`chat-v2/requirements.md`, the one unticked box).

## Deliverables

1. **Answer first, one log line:** where does an agent's cost roll up to its parent today (`Servex/agents/Agents.js`, the agent cards, `list_agents`), and does anything show a voice session's total (fast + smart)? File:line for each claim.
2. **The smallest change that makes the smart seat's cost include its fast sibling**, wherever the owner sees cost for a voice session (the agent card / `list_agents` / the session page, whichever exists). ⚠ Keep `parent: "sessions"` on both seats: `Sessions.hire()` (~line 303) and the automatic fallback depend on every seat's turn-end reaching the "sessions" fake parent. Add a separate field (for example `cost_parent: <smart seat id>`) or sum by `parent_session`; your call, write the alternative in one line. A unit test beside the existing `Servex/agents/Sessions.test.mjs` or `session-*.test.mjs`. Doc: one sentence in `Servex/agents/session-fast.md` (or the doc that already describes seat parents).
3. **One live proof, only if Servex has restarted since 07:46 today** (check its start time; `node Servex/sustain.mjs --status` or the `/api/` health route; do NOT restart it yourself). If it has: headless, create one voice session (POST `/api/session/new`, as `ux/Dictate/chat.js` does) and send two short sentences (POST `/api/session/say`), wait for the fast seat, then shoot Chat v2 drawing that session (the ✦ sheet's v2 chip, see `chat-v2/sheet/probe.mjs`) at 400 and 1920 px into `fast-child/shots/`. Report the Prompt count and that its cleaned paragraph shows. If Servex has not restarted, log that in one line and skip; that is not a failure.

## Rules

- Work in your worktree (you were started in it); commit by exact path after each working step. Never push, never stash (diff instead), never kill or restart the dev server or Servex, never drive the owner's tabs (headless only).
- Servex code only goes live on a restart, so prove (2) with the unit test, not on the live Servex.
- `node --check` every file you touch; run the Sessions tests that exist and paste the pass counts.
- Done = the change committed on your branch, tests passing, the log line from (1) and a closing log line with the commit hashes. Then say "done" to your parent.
