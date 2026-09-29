# One collaboration system: rounds, votes with caveats, staged design votes

Design: [/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md](/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md), the "Added" section. Owner's words: `2026/09/28/agent-work-on-every-page-sanity-checks-c/owner-words-2.md` (read it all). Also read minion-research-process-review's report on today's harness research if it has landed (it goes to mastermind-servex-3; look in `ai/2026-09-28/harness-research/`).

1. **The objects:** `Collab`, `Member`, `Phase` and `Vote`, as classes in a new `ext/Collab/` (house style: the `code` skill), stored as one `collab.jsonl` in the task dir. A page draws a live run: members, phases, votes, winner.
2. **The runner:** `node Server/collab.mjs <taskdir>` starts the members through Servex (`spawn_agent`, each fresh, each told its own `collab/<id>/` dir), runs the phases in order, and writes the tally. The mastermind reads only the tally, the winner and the caveats.
3. **The staged design vote:** names first, then implement, then cross-review, then vote. Prove it on one small real class.
4. **The skill:** one short section in `sub-mastermind` (and a pointer in `mastermind`): when to run a collab (research, planning, a design choice) and how, with a rough web search by default.
5. **Cost:** a 3-member run in dollars. Use cheap models (Haiku or Sonnet now, OpenRouter models once harness step 2 lands; keep the model a field).

**Proof:** one research run and one design run on real questions from today; the page showing them; the cost of each. **Fence:** `ext/Collab/`, `Server/collab.mjs`, the two skill sections. Your own worktree. Check-consensus owns `check`/`consensus`; share the `Vote` shape with it, and don't take over its files.
