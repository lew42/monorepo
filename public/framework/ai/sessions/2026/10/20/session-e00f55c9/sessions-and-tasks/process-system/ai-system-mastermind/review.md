verdict: fix
1. [fix] `compact_after: null` on the `ai-system-mastermind` row (`Servex/agents/roles.js:53`) also turns off the 400k safety ceiling, because `Agent.oversized()` returns null for any role with `compact_after === null` (`Servex/agents/Agents.js:1515`). That contradicts the row's own comment ("only the 400k safety ceiling applies mid-work"). Renewal only happens on a wake from dormant, so a session that keeps itself awake with timers (its readme's "Don't fall asleep with work in flight") is never renewed and never compacted, and it grows toward the 1M window. Fix: keep the ceiling for this role, e.g. `compact_after: { tokens: Infinity }` or an `oversized()` check that skips only nudges for `renew` roles, plus one test.
2. [note] A singleton spawn looks only at `this.live` (`Agents.js:134`). After a Servex restart, a young session that exists only in the registry gets a brand-new session under the same id instead of being resumed, which loses its context for no reason. `Agents.wake()` already handles a registry-only agent; the singleton branch could route there when a registry row exists.
3. [note] Changing the generic `mastermind` row's readme from `servex-mastermind` to `mastermind` (`roles.js:55`) changes the system prompt of every live Servex-spawned mastermind (e.g. a deputy) on its next resume. It is probably right, but nobody asked for it; it is recorded in requirements.md, so just check that the deputy's role still fits.
4. [note] `Server/on-landing.mjs:23-24` still sends landing check failures to a `servex-mastermind` task folder, not to the new feedback inbox (`module_inbox`, module `ai`). The landing checks are the main source of "problem + fix" lines, so pointing them at the inbox would let the third-repeat wake actually fire.
5. [note] `Server/role-spend.mjs` is good, simple code. Its `ALIASES` (line 31) is a second list of old ids next to `roles.js`. The second review accepted that; it is noted here only so the two get updated together.

Given: no shots (no page changed), so this review covers Requirements and Words only. I ran these in the worktree: `node Servex/agents/singleton.test.mjs` passed 24 checks, `roles.test.mjs` passed 35. The second review's fixes are in: renewal fires once per wake, the predecessor and VS Code sections are rewritten, and the feedback inbox wakes on exactly the third repeat.

## Requirements
- 1 "Rename it the AI system mastermind, docs in public/framework/ai/" — yes — `move.mjs` + `manifest.jsonl`, pointer at `roles/servex-mastermind.md`, alias in `roles.js:53`; the readme names `ai/` as its docs home (the decision is stated in requirements.md)
- 2 "Exactly one live session, renewed after a day or at a context limit, never kept alive when unused, no slug collisions" — partly — singleton id and send-to-live in `Agents.spawn`, renewal on wake in `Agent.renew_due`, `Respawn.AGENTS` emptied; a session that stays awake has no context limit at all (finding 1)
- 3 "It owns sessions and tasks" — yes — readme top, `roles/readme.md` table, `ai/readme.md` line, `roles/mastermind.md`
- 4 "A feedback inbox that counts repeats" — yes — `ModuleInbox.repeats`/`wake_for`, wakes on the 3rd repeat, on `obvious`, or when a problem comes back after an outcome; tested
- 5 "Spend per week and month" — yes — `Server/role-spend.mjs`, own vs spawned, ISO week and month, from `turn_cost`
- 6 "Big, simple fixes; available for questions" — yes — the readme's top rules
- Class question (changes `Agent`, `ModuleInbox`) — n/a — no new class; the agent shows on its existing session page
## Words
- content 1 (plain, full sentences) — yes — the new readme top and the `ai/readme.md` line read plainly
- content 2 (no stale or contradictory text) — no — the roles.js comment says the 400k ceiling still applies, and the code says it does not (finding 1)
- content 3 (one takeaway per section) — yes — each new paragraph states one rule
