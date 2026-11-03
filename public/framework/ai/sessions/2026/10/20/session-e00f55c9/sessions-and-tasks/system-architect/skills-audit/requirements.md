# Skills audit: a scripted census of every skill in `.claude/skills`

Budget: $3. Haiku, low effort. Parent: mastermind-system-architect, who decides the verdicts; you only produce the facts. Log as you go with the `log` tool into your `session.jsonl`. Work in the main tree but write ONLY inside this folder. Do not edit any skill.

## Build: `census.mjs` in this folder (node, no dependencies)

For each folder in `.claude/skills/*/SKILL.md`, one row in `census.json` (and a markdown table `census.md`):

| field | how |
|---|---|
| `name`, `description` | the SKILL.md frontmatter |
| `lines`, `bytes` | size of SKILL.md (what it injects); plus the count of other files in the folder |
| `loads` | count of `"skill: <name>"` log lines across `public/framework/ai/**/session.jsonl` and `**/task.jsonl` (written by `.claude/hooks/ledger.mjs` on every Skill call); also the latest date seen |
| `preloaded_by` | where Servex injects it without a Skill call: grep `Servex/` for the skill name (role → skills maps, preambles) |
| `referenced_by` | files that name it: `CLAUDE.md`, other `SKILL.md`, `.claude/hooks/*`, `Servex/**/*.js` (count + up to 5 paths) |
| `improvements` | line count of its `improvements.md`, if any |

Stream files line by line; never load all logs at once. Skip `node_modules`, `worktrees`. Keep your own reading of results to the summary the script prints.

## Then

Print a summary: skills sorted by `loads` (zero-load skills flagged), the 5 biggest by bytes, skills no file references. Put that summary at the top of `census.md`. Land with `finish-task` in your own `session.jsonl`. "No usage data for X" is a valid result; say it.
