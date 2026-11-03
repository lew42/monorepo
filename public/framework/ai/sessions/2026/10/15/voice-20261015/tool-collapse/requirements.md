# AI: tool context bloat, and a plan to collapse the tools (plan only)

Owner standing concern: voice dfa4d219, logged in [../task.jsonl](../task.jsonl). **Record it and propose a plan. Don't break what works.**

> Context bloat: 75+ tools with descriptions are loaded in every session, and most are never called. Collapse the tools into a few generic ones (ideally the single app(path, delta) tool; see ../page-instance/requirements.md) plus skills that load per domain. Monitor whether agents reliably choose to use the skills, and note the MCP workflow cost of adding tools (a restart, a reconnect, a new session).

## Do
1. **Measure, with a node script, not by eye:** the total characters/tokens of the servex tool descriptions and schemas (from the registry in `Servex/MCP.js` and `Servex/agents/tools.js`), plus per-tool call counts from whatever logs exist (search Servex logs and the session jsonl for tool names). Put the script in the doc's folder. Stay well under 100k tokens of reading.
2. **Write `public/framework/ai/doc/tool-collapse.md`:**
   - The concern in the owner's words (a link to the ask).
   - The numbers.
   - Proposed tiers: a small always-loaded core, and the rest behind per-domain skills or one generic tool.
   - How to verify agents actually load the skills (the Skill hook already logs skill calls; see the skills docs).
   - The cost of each tool change: a Servex restart, a connector reconnect, a new session.
   - A staged migration that keeps everything working.
   - Note that the tunnel now serves the same registry (786ea8aad), so a collapse shrinks local and remote together.
   Link it from `public/framework/ai/doc/` (its index or readme) and from the skills docs index if there is one.
3. Sonnet. Docs plus one scratch script, so commit straight to michael/dev. Build nothing in Servex; no restart.
4. Report to mastermind-voice-20261015 in about 5 sentences (the numbers and the plan's first step). Post one card on /live/ (page_add path "/live/").
