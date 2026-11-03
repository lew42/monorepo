# How an agent learns its own page (decided 2026-10-09)

Asked by the owner in VS Code tab 7efd07d5 (brief: `public/framework/core/Page/doc/page-tool-2026-10-09.md`, gap 3). Partner: `mastermind-page-system`.

## The rule
Every session's page is **`/framework/ai/sessions/<session_id>/`**, the same folder `.claude/hooks/prompt-relay.mjs` already writes an owner tab's `page.jsonl` into. One convention for a Servex agent and a VS Code tab, keyed on the Claude session id (it exists at spawn, and a resume keeps it).

## Two doors, one line of text
| Who | Where the line comes from | Class / file |
|---|---|---|
| Servex-spawned agent | first turn, beside `[You are Servex agent <id>.]` | `Agents.whoami(id, session_id)` in `Servex/agents/Agents.js` |
| VS Code or CLI tab | `SessionStart` hook output goes into context | `.claude/hooks/session-page.mjs` |

Both print: *Your own page is /framework/ai/sessions/<id>/ — pass it as `path` to the page tools.* The tools themselves need no injection: every Servex agent already has `page_set / page_add / page_call / page_read` through its HTTP door (`Agents.door()` → `MCP.js`, `?as=<id>`), and a tab gets them from the same Servex MCP.

## Decisions
- **Inject the path, not a default.** `path` stays required in the tools. Alternative: default to the caller's page from `ctx.caller`; not done because a tab has no `?as=` identity and the explicit path is the same for both.
- **Fresh spawns mint the session id in `spawn()`** (was only for task spawns) so the first-turn line can name it. The constructor would have minted the same thing a moment later.
- **Names (slugs) are still open**: a session page is addressed by uuid until sessions get a name; the page mastermind owns the slug, and when it lands only the string in these two places changes.
- A `SessionStart` hook runs once per session start; a very long tab loses the line only on compaction, where the hook re-fires.

## Not done / needs a restart
Servex reads `Agents.js` at start: the line appears for agents spawned after the next Servex restart. The hook works from the next new VS Code session.
