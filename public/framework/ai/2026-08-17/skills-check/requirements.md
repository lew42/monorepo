# skills-check — are the revamped skills wired in, and what do the improvements say

Laws: less is more (ASAP) · clarity is the one exception · prioritize. **Length budget: `proposal.md` ≤ 50 lines; final message to the mastermind ≤ 25 lines.**

Mike (2026-08-17), verbatim: *"We just created a revamped skill system. Hopefully minions will log improvements. Maybe have an Opus check them out. Be careful running away with new rules. It's hard to improve these AI systems with additional restrictions."* And: *"Make skill improvements (add that to the mastermind skill, if it's not already) in skill/improvements.md."*

## Answer these

1. **Wiring** — `.claude/settings.json` hooks → `.claude/hooks/ledger.mjs`: which events fire, what each writes, into which task.jsonl (how does it pick the task?). Prove from today's task logs that the `Skill` hook is recording skill calls (`grep -l "skill:" public/framework/ai/2026-08-17/*/task.jsonl`). Are the renamed skills (`code`, `layout`, `css`) referenced anywhere by their old names (`code-architecture`, `layout-design`, `css-strategy`) — CLAUDE.md, readmes, other skills, memory-style docs? List the stale references (path:line).
2. **Improvements** — read every `.claude/skills/*/improvements.md`. Table: skill · #entries · the one entry worth acting on (or "none"). Which entries are **restrictions** (new rules) vs **clarifications/deletions**? Mike's bias: fewer rules, not more.
3. **The mastermind skill** — does it already say "improve skills via improvements.md"? Does it need anything else from Mike's ask (e.g. minions log improvements after each skill use)? Propose the smallest wording change, if any, as a diff block — do **not** edit the skill.
4. **Skill health** — for each skill: lines, does it point (link) rather than explain (CLAUDE.md law), any rule that duplicates CLAUDE.md or another skill (candidates to delete). ≤ 12 lines total.
5. **Recommend** ≤ 8 lines: what to change, what to delete, what to leave alone.

## Rules

- Read-only outside this dir. Write `proposal.md` here; log findings as `{"log": {"at","msg"}}` lines in `task.jsonl` (bash `printf`, never `Out-File`). Land with `{"assign": {"step": 5, "landed_at": "<ISO>", "outcome": "**…** — …", "links": [{"url": "/framework/ai/2026-08-17/skills-check/proposal.md", "label": "proposal"}], "tokens": null}}` and a `landed —` line in `../day.jsonl`.
