# Roles as objects: plan and the look

## Name and home
`Role`, at `public/framework/core/Role/` (beside `core/Session`; no node or DOM imports, so Servex and the pages load the same file). Readme: [core/Role/readme.md](/framework/core/Role/readme.md) (in the worktree branch `worktree/roles-class`).

## One source
The rows stay in `ROLES` (roles.js). `roles.js` builds `ROLE_LIST = Role.from_rows(ROLES)`. The browser cannot import roles.js, so `node Servex/agents/roles-json.mjs` writes `core/Role/roles.json` from the same rows (`--check` finds it stale). Alternative rejected: moving the rows into Role.js, which would change every caller of `ROLES`.

## Recording the role
- `open_task()` writes `role` into the `assign` line (Agents.js: one parameter, one field).
- The SessionStart hook writes `role: "vscode mastermind"` (the word the sessions list already uses) into a tab's line 1.
- Older sessions: the registry's role, else `Role.from_agent_id` (longest id prefix).

## Pages
- **Roles page** `/framework/servex/roles/` (`servex/roles/page.js`, linked from the Servex page's children and its text): every role's properties and its live agents (id, state, cost).
- **Session page:** `AISessionDetail.show_role()` fills a `.session-role` block at the top of the *Models and tokens* tab, drawn by `RoleView`, linked to the roles page. Lines touched in `AISessionDetail.js`: the two imports, `show_role()` before `open_log`, `let $role`, the `panels.models` line, and the `show_role` call after the row loads. Nothing in the head or the Work tab.

## The look (headless, worktree server, 400 / 1200 / 1920)
- Roles page: [400](shots/roles-page-400.png) · [1200](shots/roles-page-1200.png) · [1920](shots/roles-page-1920.png)
- Role on a session (`mastermind-deputy`): [400](shots/session-role-400.png) · [1200](shots/session-role-1200.png) · [1920](shots/session-role-1920.png)

## Left
No test yet for `roles.json` freshness (`--check` exists); the roles page uses one column of cards at every width (wasted space at 1920) until the owner picks a look.

## After the deputy's review (commit a37778fc5)
- Session panel titled "Role: mastermind (its defaults)"; when the session's real model or effort differs, a line "this session: claude-opus-5-5 · xhigh" sits above it (AISessionDetail.js `show_role`).
- Roles page is a grid (auto-fill, 20em) in a `.wide` block: two columns at 1920, one at 400. "Live now" now sits tight over its agents.
- A live agent line shows its real model and effort when they differ from the role's (`RoleView.differs`). The registry card had no `effort`, so `Agents.card()` now returns it (one field, `Servex/agents/Agents.js`): effort on the roles page appears after the next Servex restart; model shows now.
- michael/dev merged in first (31c646bdc); no conflicts in Agents.js.

## Review answers (shots refreshed at 400 and 1920 only; the 1200 shots are from the commit before)
- Left: nothing runs `roles-json.mjs --check` yet (a smoke or merge step could); the roles page keeps the Doc's Overview / Tasks / Inbox sub-nav (no Doc option turns it off).
- `Role.from_agent_id` takes the longest prefix, then the non-retired row, since `assistant` and `page-assistant` share the prefix `assistant`; it is still labelled a guess on the page.
