Budget: $12.

# Servex: one standing voice pair, recycled like fixer-1

The owner's direction (2026-10-02; vscode-mastermind decided the shape). Owner: `mastermind-servex`.

**Today:** every ✦ press is a voice session with its own pair of agents, for example `session-fast-v-gck9buj` and `session-smart-v-gck9buj` (`Servex/agents/Sessions.js`, `spawn()` and `wake()`). Each new pair pays for a fresh start. A pair stops after 5 idle minutes, and at most 2 pairs are live.

**Wanted:**
1. **ONE standing, site-wide pair**, kept like `fixer-1` (`Servex/agents/Fixer.js`): `voice-fast-1` and `voice-smart-1`, started at Servex boot, held open with no prompt (no tokens until the first line), `dormant_after: "session"`, `urgent: true`. It is ready on every page.
2. **A voice session stays a record, not a pair.** A ✦ press still makes a session file (`public<home>ai/<session>.jsonl`), its folder presence lines and its title. Every owner line goes to the standing pair, carrying its session id and current page. Each reply goes back to the session of the line it answers (`re`). Two tabs talking at once share the pair, and each reply still lands in the right file. Drop `max_pairs`, `room()` and the 5-minute idle stop for the pair; keep the 1-hour `/new` resume of a session record.
3. **Page-aware through the page tools.** The smart assistant reads the page a line came from with `page_read` (it already has the Servex door). The fast one stays tool-less and lean, and gets the page path in the line.
4. **Recycle on a large context.** After each turn, read the agent's context size (the SDK's usage on its last result). Past a threshold (`SERVEX_VOICE_RECYCLE_TOKENS`: fast 40k, smart 120k to start; tune from the logged numbers), the old session writes a short handover: at most 15 lines, covering open threads, decisions and what the owner is in the middle of. Through a tool the code stamps, it never retypes owner lines: they are already in the session files. The fresh session for the same id starts with that summary as its context. Never recycle mid-turn or while the owner is speaking (the floor).
5. **Every session is tagged with its role.** Each Claude session the pair ever starts gets one line `{type:"voice-session", role: "voice-fast"|"voice-smart", id, session_id, started_at, ended_at, why: "boot"|"recycle"|"crash", tokens_at_end, cost_usd}` in Servex's system log, written by code. The Sessions page totals cost per role across all of them. Keep `role` on the registry row too.
6. **Separate from the VS Code mastermind, but able to read it.** The smart assistant may `page_read` the owner's VS Code session page (`/framework/ai/<day>/session-<id8>/`, written by `.claude/hooks/prompt-relay.mjs`). It finds the newest one by listing today's folder. That gives it awareness across contexts; it never writes there, and never messages that session unless the owner asks.
7. **One of everything (law 6).** Reuse `Sessions.js` (the session records, `say()`, `gather()`, `release_thought()`, `hold_fast()`), `Fixer.js`'s `ensure()` shape, `Usage.pick("smart")` for the smart model, and `Global.keep_on()`'s idea for crash restarts (one restart per minute at most, 3 per 30 minutes). The old per-session ids become aliases of the standing ones, so old callers don't break.
8. **Write it down.** `Servex/readme.md`'s "The voice pair" section already says when a pair starts, when it recycles and what that costs. Correct its numbers from your measurements: the start size of each role, and the context size and cost at the first real recycle.

## Tests
- Two ✦ presses on two pages make two session records and one pair, and each reply lands in its own file.
- A line from `/framework/servex/` reaches the smart assistant with that path, and it can `page_read` it.
- Context past the threshold: the next idle moment recycles, the new session has the handover, and both `voice-session` lines are written.
- No recycle mid-turn or while the floor is "speaking".
- A killed claude process for the pair comes back within a minute.
- The Sessions page sums cost per role over recycled sessions.

## Rules
Sonnet, high effort. A pool worktree. The voice path is live for the owner: run `Servex/agents/Sessions.test.mjs` and a real ✦ round trip on a private Servex port before `merge.mjs`, then `sustain.mjs --restart`. Never wait on the owner.
