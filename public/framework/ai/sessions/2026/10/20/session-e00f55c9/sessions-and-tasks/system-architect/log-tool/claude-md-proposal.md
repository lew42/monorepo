# Proposed CLAUDE.md wording (the owner applies it)

Under "Memory, history, safety", add one rule:

> **Log lines go through the `log` tool** (the owner, 2026-10-20): an agent never appends JSONL through Bash. `log({path, line})` (Servex MCP) writes one line stamped by node with the time, `by` (the agent), `session` and `origin`; a hook or script without MCP uses `node .claude/hooks/append.mjs`. Doc: `Server/doc/log-line.md`.

## Skills (2026-10-20, round three)

Under "Readmes and docs", add one line:

> **Laws here, procedures in skills** (the owner, 2026-10-20): this file holds only what every agent needs on every turn. A procedure tied to a moment is a trigger skill (loaded at that moment, so it is fresh when used); domain knowledge is a reference skill that names its sub-skills (`code` → `css`). The index and verdicts: `.claude/skills/readme.md`.
