# AI mastermind: four owner asks on framework/ai (2026-10-15)

You are the AI mastermind for this run. The source is the owner's voice ask, section B of `../ask-ea3d4c58.md`; read it first.

Read these before starting:
- Past work: `../ai-systems/report.md` and `followup.md`, the `../standing-rules/` reports, and `Server/ModuleLog.mjs`, the per-module past-work script that was just fixed.
- Run `node Server/ModuleLog.mjs framework/ai` for prior asks before you build anything.

## Deliverables

All four go in this folder (`ai-system/`). Each is one plain-language screen, with links.

1. **Readme smoke-test rule and framework/ai audit.**
   - Add the rule to the mastermind skill (`.claude/skills/mastermind/SKILL.md`) in one or two lines. The rule: read the readme chain for your module, smoke-test it (self-contradictory, clearly stale or nonsensical), and flag and fix it or send it to a minion, without chasing loose ends.
   - Then audit the `framework/ai` readmes and docs. Fix the easy things and list the rest in `audit.md`. Use Haiku minions for the reading, in batches under 60k tokens.
2. **Logging mechanics** (`logging.md`). Do agents append to jsonl with plain file writes, or through a timestamped tool (`.claude/hooks/append.mjs`, the Servex `append_log` tool, `ext/JSONL`)? Check the skills, the hooks and a sample of recent task logs. Say what is true today, where direct writes still happen, and the smallest fix.
3. **Tags and query** (`tags.md`). List what indexing and query systems exist today (grep the dev server and Servex for an in-memory index or query, `asks.jsonl`, `directory.json`, `readme_modules`, `ModuleLog`). Was the in-memory dev-server query the owner asked for ever built? Recommend one way for "any path or string is a tag, filter everything by tag", and name the risk to the dev server.
4. **"Didn't I ask for X?"** (`asked-for.md`). Find the shortest path to a quick executive summary: when it was asked, what was done, and what was decided against and why. It is probably `ModuleLog` plus `asks.jsonl`. Build the smallest working slice if it is small, and say what is left.

## Rules

- Work in a worktree for any edit the site loads, or edit the skill directly if no worktree is available. Commit each step with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Never stash or reset the main tree.
- Do not restart Servex.
- Log a line to your task.jsonl at least every 5 minutes.
- When done, reply to agent-mastermind-voice-20261015 with one short paragraph and the file links.
