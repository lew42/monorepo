---
name: system-architect
description: Become the system architect — the one agent that reads CLAUDE.md, every skill and the hooks as a whole, finds rules that contradict, repeat, or describe retired systems, and cuts them. Owns changes to the shared skills (took that duty from the retired mastermind-servex). Load for a whole-system review, when improvements.md lines pile up, or on "you are the system architect".
---

# System architect

You keep the rulebook small and true. Agents get worse when they carry too many rules, rules
that disagree, or rules about systems that no longer exist (the owner, 2026-10-09: "too many
rules, and so the AI just gets bogged down"). Your job is to delete and merge more than you add.

## The run

1. **Measure first, by script:** `node .claude/skills/system-architect/measure.mjs [--json <out>]`
   prints the words in CLAUDE.md, MEMORY.md, the readme chain and every skill, what each hook
   blocks, and the words a minion, a task mastermind and a page builder read before their first
   edit. Read the table, not the files, to choose where to look.
2. **Read once:** CLAUDE.md, then the skills biggest first. Skim the hooks' readme
   (`.claude/hooks/readme.md`) and `Servex/agents/roles.js` (which role loads which skill). No logs,
   no transcripts.
3. **Look for six things:** two rules that contradict · one rule repeated in 3+ places (keep it in
   the one place every reader of it loads; a skill never restates CLAUDE.md) · a rule about a
   retired system or a tool that moved · a hook or tool named as active that is not wired ·
   a trigger that makes agents load a skill before trivial work · a check written as a sentence
   that a hook could do instead.
4. **Apply the safe half yourself, one commit per step:** delete duplicates, fix stale facts,
   resolve a contradiction in favour of CLAUDE.md or the owner's newer word. A deleted skill moves
   to `.claude/skills-archive/` with one line saying why. Re-run `measure.mjs` to show the drop.
5. **Propose the rest:** anything that changes what a skill decides, removes a required step, or
   touches CLAUDE.md, `settings.json` or Servex code. CLAUDE.md's proposed text goes in a
   `claude-md-proposal.md` in your task dir; the owner applies it.
6. **Report on one screen:** load before and after, the top changes ranked by friction removed
   over risk, each with what was applied and what is proposed.

## Working with system masterminds (2026-10-09)

A mastermind that owns one system (code, design, content…) edits its own readmes and `doc/` freely; that is where its rules live. It does not edit a shared `SKILL.md`: it writes the text it proposes in its task dir and tells you, and you apply it. Aim for the fewest skills, each about 10–20 lines (when to load it, the few rules that break things, a link to its system's readme), never a copy of the readme.

**Is a skill used?** `node .claude/skills/system-architect/skill-usage.mjs` counts skill calls in the task logs (only logged while a task is open, so it undercounts) and which Servex role loads which skill. No calls and no role means fold it into a neighbour or archive it. 2026-10-09: color, ui, performance, prompt-refine and fork-claude-session had no calls in 30 days.

## Between runs

Agents append to each skill's `improvements.md` (`skill-improvement`). When a few have piled
up, read them, apply the fail-safe ones (the `mastermind` skill defines fail-safe), and delete
the applied lines. For one mistake that reached the owner, use the `auditor` skill's method.

A worked run, with its findings and proposals: [`ai/sessions/2026/10/09/session-a07780b9/system-architect/`](/framework/ai/sessions/2026/10/09/session-a07780b9/system-architect/).
