verdict: fix
1. [fix] The token half of renewal can never fire: the role row has `compact_after: MASTERMIND_COMPACT` ({tokens: 150000}, `Servex/agents/roles.js:32`) next to `renew: {tokens: 300000}` (`roles.js:52`), so the session is compacted long before its context reaches 300k and `renew_why` never returns "tokens". Pick one: drop `compact_after` for this role, or set the renew line below 150k, so "renewed at a context limit" (ask 2) is a fresh session, not a compaction.
2. [fix] The role readme still carries sections that contradict the singleton: "When you take over from a predecessor" (`Servex/agents/roles/ai-system-mastermind.md:107`) tells a fresh session to announce "the Servex mastermind is now <your id>" and stop its predecessor, which now has the same id as itself; "Where you write" (line 115) still says `ai/<date>/servex-mastermind/`, and the 2026-10-09 status line and "VS Code tab" section name retired ids. Cut or rewrite those for the one-id, renew-on-wake model.
3. [note] Every feedback line from the third repeat on wakes the mastermind again (`ModuleInbox.wake_for`, `n >= FEEDBACK_WAKE`), including repeats after it already recorded an outcome; probably right, but say so in `Servex/doc/module-inbox.md` or wake only on `=== 3` and on repeats after an outcome.
4. [note] A singleton spawn of a stopped `ai-system-mastermind` goes straight to a fresh spawn (`Servex/agents/Agents.js` spawn, the `single` branch) and skips the revive guard (`blocked`, `stopped_by`) that `send` applies, so a mastermind the owner stopped on purpose is restarted by the next third-repeat feedback line.
5. [note] Ask 1 asked for the docs in `public/framework/ai/`; the role readme stays in `Servex/agents/roles/` (reason and alternative stated in requirements.md), and `ai/readme.md` links it. Reasonable; just confirm that is what the owner meant.
6. [note] `Server/role-spend.mjs:31` keeps its own `ALIASES` list of old ids, a second place to update besides `roles.js`'s `alias`; fine as is since the old agent ids (`mastermind-servex-N`, `mastermind-system-architect`) are not role words, but a comment pointing each at the other would keep them in step.

Given: no shots (no page changed), so Requirements and Words only. `node Servex/agents/singleton.test.mjs` run: 23 checks passed.

## Requirements
- 1 "Rename it the AI system mastermind, docs in public/framework/ai/" — yes, mostly — scripted move with manifest and pointer (`move.mjs`, `manifest.jsonl`), alias `servex-mastermind` in `roles.js:52`; the readme itself stays in Servex (finding 5) and still has stale old-name sections (finding 2)
- 2 "Exactly one live session, renewed after a day or at a context limit, never kept alive when unused, no slug collisions" — partly — singleton id and send-to-live in `Agents.spawn`, day renewal on wake in `Agent.renew_due`/`Agents.wake`, `Respawn.AGENTS` emptied; the token renewal is shadowed by compaction at 150k (finding 1)
- 3 "It owns sessions and tasks" — yes — readme top rules, `roles/readme.md` table, `ai/readme.md` line, `roles/mastermind.md` pointer
- 4 "A feedback inbox that counts repeats" — yes — `module_inbox` on `ai` gains `fix`, `repeat_of`, `obvious`; `repeats()` counts; the tool wakes via spawn; tested
- 5 "Spend per week and month" — yes — `Server/role-spend.mjs` reads `turn_cost` from Servex logs, own vs spawned, by ISO week and month
- 6 "Big, simple fixes; available for questions on roles, readmes, docs, review, planning" — yes — readme top rules
- Class question (diff changes `ModuleInbox`, `Agent`) — n/a for a live-instances page: no new class; the agent's state shows on its existing session page
## Words
- content 1 (plain, clear sentences) — yes — new readme top and `ai/readme.md` line read plainly
- content 2 (no stale or contradictory text) — no — the readme's predecessor, "Where you write" and status sections (finding 2)
- content 3 (one takeaway per section, short) — yes — each new paragraph states one rule
