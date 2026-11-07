# Remove the legacy flat session route

Budget: $6. Load the `minion` skill first. Parent: mastermind-session-truth. Task id on the parent: t8-flat-route.

## The owner's ask (relayed by voice-app, 2026-11-06 21:50)
"Abandon old systems: remove the legacy flat sessions/<full uuid>/ route and every doc or prompt pointing agents at it." Every session has ONE dated folder (`sessions/YYYY/MM/DD/<folder>/`); `/framework/ai/sessions/<uuid>/` survives today only as a redirect, and docs, tool descriptions and hook messages still tell agents to use it.

## Deliverables
1. A list (task log `log` lines, not a findings file) of every place that serves, builds or advertises `sessions/<uuid>/`: start from `git grep -n -E "sessions/<(full )?uuid>|sessions/<id>|sessions/\$\{(id|uuid|session_id)\}/" -- ':!*.jsonl' ':!public/framework/ai/sessions/20*'` (dated task folders are history: leave them).
2. Code that builds a flat URL builds the dated one instead (SessionFolders `record_of(id)` / `of(id)` give the folder). The browser route that redirects a bare uuid may stay ONLY if an existing link in a committed page or the dashboard still depends on it; otherwise remove it. Say which in one `decision` line with the alternative.
3. Every doc, skill, role readme, MCP tool description (Servex/agents/page_tools.js descriptions, .claude/hooks/session-page.mjs message) stops pointing at the flat path. Live text only; archived/dated folders untouched.
4. `public/framework/ai/indexing-past-work.md` and `public/framework/ai/sessions/readme.md` say the one dated folder is the only address.
5. Tests: the ones that cover what you change (page_tools.test, handoff-route.test, session-route-tasks.test, SessionConsolidate.test) pass; run `node <file>` each.

## How
- Worktree: `node Server/worktree-up.mjs truth-flat-route`, work there, commit after each step.
- Servex code changes need a restart: do not restart; say so in your last line.
- Never git stash, never kill or restart servers, never drive the owner's tabs, never write the owner's name.
- Last reply, one line: ready + branch + commit.
