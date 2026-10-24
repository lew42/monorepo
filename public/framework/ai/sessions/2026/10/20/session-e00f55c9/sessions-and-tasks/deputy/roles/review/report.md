verdict: pass
1. [note] On a session page the comparison line is drawn as an uppercase h4, "THIS SESSION: CLAUDE-OPUS-5-5 · XHIGH". It reads like a heading, not "this session runs a different model from its role" (content 1, ui) — shots/session-role-1200.png, Models tab, band 2.
2. [note] A VS Code tab records `role: "vscode mastermind"`, which is not a row in roles.js, so the owner's own tabs (the most common session) show only "Role: vscode mastermind (not a row in roles.js)" and no properties (req 2, "Recording the role") — AISessionDetail.js `show_role`, `Role.find` misses.
3. [note] Each role card has about two lines of empty space between its name and its first property (spacing) — shots/…-servex-roles/1920.png, every card's top band.
4. [note] The roles page inherits the Doc's Overview / Tasks / Inbox sub-nav, a second navigation level on a one-screen page that has no tasks or inbox of its own (navigation) — shots/…-servex-roles/1920.png, left column; 400.png, under the tab bar.
5. [note] Small code notes for the next slice: `Role.agents()`'s comment says "the page's own host first" but the code tries `127.0.0.1:8090` first; core/Role/readme.md links `/Servex/agents/roles.js`, which the site does not serve (the roles page uses `/framework/servex/fs/agents/roles.js`); `Role.from_agent_id` can't tell `assistant` from `page-assistant`, which share the prefix `assistant`.
6. [note] roles.json is a generated copy of the rows. It is fresh today (`roles-json.mjs --check` exits 0 in worktree/roles-class), but nothing runs `--check` yet, which plan.md admits under "Left".

Widths given: 400, 1200, 1920 and 3440 for /framework/servex/ and /framework/servex/roles/, plus the builder's own session-role shots at 400, 1200 and 1920.

## Requirements
- 1 "Find what exists (what-exists.md, one screen)" — yes — what-exists.md lists ROLES, the readmes, the assign line, the tab's line 1, role_label and the registry, and says where the role is lost
- 2 "The class sketch (plan.md)… one source for the role rows" — yes — plan.md: Role at core/Role, roles.js builds `ROLE_LIST`, roles.json is generated from it (rejected alternative stated); `open_task()` writes `role`, session-page.mjs writes it on a tab's line 1
- 2 "Its properties are every field a row has… plus singleton and renew" — yes — RoleView.FIELDS covers all of them; 3440.png shows singleton and renew on ai-system-mastermind
- 3.1 "A roles page at /framework/servex/roles/, linked from the Servex page's navigation… properties, live instances (agent id, state, cost)" — yes — Servex tab bar has ROLES (servex/1200.png); each card ends "Live now" with id · state · cost (roles/1920.png)
- 3.2 "The role on a session's page… head or Models tab, linked to the roles page" — yes — session-role-1200.png: the Models tab opens with "Role: mastermind (its defaults)", linked; plan.md lists the lines changed
- 3.3 "Shots at 400, 1200 and 1920. Commit." — yes — shots/roles-page-*.png and session-role-*.png; commits 864650b4a, a37778fc5
- 3.4 "Log, then stop" — yes — session.jsonl has the "show: …" line; plan.md links the shots
- Class page: can you open a page that shows Role's live instances and their properties? — yes — /framework/servex/roles/ is that page

## Page structure
- page 1 (title says what it is) — yes — roles/1920.png: "Servex", the ROLES tab active, intro "A role is a row in roles.js…"
- page 2 (one takeaway) — yes — one card per role, its properties, its live agents
- page 3 (home/parent) — yes — a child of Servex, in the sidebar under Servex
## Navigation
- identify — tabs (Servex tab bar), a sidebar (site tree), a sub-nav column (Doc's Overview / Tasks / Inbox), tabs inside the session panel
- tabs fit one row — yes — screenshots show one row at 1200, 1920 and 3440. layout.json reports tab_rows 3 on the roles page but 1 on /servex/, so the 3 is the vertical sub-nav being counted
- tabs at 400 — yes — the tab bar scrolls sideways (roles/400.png, "RCE" cut off at the left); this was already so before the diff
- the active item is marked — yes — ROLES underlined in orange; Roles highlighted in the sidebar
- sub-nav needed — no — see note 4
## Layout
- the layout fits the content — yes — the auto-fill grid gives 1 column at 400, 2 at 1920 and 5 at 3440 (roles/sheet.png)
- columns earn their space — yes — the cards fill the `.wide` block; there is no lone column at 1920 any more
## Sizing
- reading width — yes — layout.json widest_text 308 / 567 / 608 / 684 px
- card width — yes — min 20em; the label/value grid never squeezes (roles/400.png)
- overflow — yes — overflow_x false at all four widths
## Wrapping
- unwanted wraps — no new ones — layout.json wraps lists only the drawer rail and mode buttons, which this diff did not touch
- long values (bypassPermissions, "150k tokens (sleep 100k)") — yes, they stay on one line at 400 (roles/400.png)
## Spacing and padding
- card padding — yes — `surface pad` (roles/1920.png)
- gap between the cards — yes — 1em
- space inside a card — no — the gap between name and properties is too big (note 3)
- left_stack — yes — h1 and p share the same left edge at 400 (28 px)
## Colour and contrast
- text contrast — yes — dark values and muted labels on white cards (roles/1920.png)
- link colour — yes — the framework's orange underline, same as the rest of the site
- the "retired" mark — yes — muted, beside the name (roles/3440.png, ASSISTANT)
## Flow
- order — yes — the intro, then the roles in roles.js order, each with properties before its live agents
- session panel — yes — the role comes first in the Models tab, then the cost tree (session-role-1200.png)
## Words
- plain and clear — yes — the intro says what a role is and where it is also shown
- labels — yes — "tier", "model", "permission", "id prefix", "Live now (n):"
- the session panel's words — no — "Role (recorded when the session started, else from the Servex registry):" explains where the data came from more than what it means, and the uppercase comparison line is unclear (note 1)
- "singleton: yes: one id" — note — a new reader can't tell what it means; "only one agent at a time" would say it
