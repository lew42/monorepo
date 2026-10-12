**Six weeks of work, checked: nothing is stuck waiting on you anymore, except five things only you can do.**

Fourteen census minions read every task since 2026-08-08 (about 900), the memory notes, and both handover files. Almost everything landed. About sixty items had been parked "for the owner". Twenty-two of those had already been settled by later work. The rest are decided below, each with the choice made and the other option that would also have worked.

## Only you can do these (five)

These stay with you by rule: anything destructive, credentials, or a change to CLAUDE.md.

1. **Say "prune"** — delete 739 dead files (14,354 lines) left behind when /imagine/ pages moved. Recommendation: yes. The list is in [reuse-audit](/framework/ai/2026-09-22/reuse-audit/). About 1 minute.
2. **Keep `stash@{0}` for now.** It holds the full working tree from the 2026-09-19 reset, and it already rescued nine study pages once. Recommendation: drop it after the prune lands. [stash-restore](/framework/ai/2026-09-20/stash-restore/).
3. **Cloudflare login** — `npx wrangler login` (or an API token) before any real D1 database can exist; the same for the Cloudflare MCP connector. About 5 minutes. [sqlite-scout](/framework/ai/2026-09-17/sqlite-scout/).
4. **The tab rule for CLAUDE.md** — "multi-file work goes to a task mastermind; small edits stay in the tab." The concurrency mastermind is writing it today; it needs your yes to go into CLAUDE.md.
5. **Gmail connector** needs authorising in your claude.ai connector settings; a non-interactive session can't do it.

## Decided now

Each line: what was waiting, the decision, and the viable alternative.

**Already settled by later work (closed, nothing to do):**
- Hooks paste and MCP site-tool approval (08-15) — both live; the Stop hook and the `site` tools work today.
- Every "restart the dev server" item (08-18 to 09-22) — Servex restarted it on 2026-09-24 at 17:09, after the last change to `Server/` (09-23).
- Task-queue decisions (08-15) — replaced by the Servex dispatcher and card-to-task.
- Spacing ceiling 1x / 1.5x / 2x (09-05) — settled at a 2.5em ceiling on 09-13.
- A `card` class that carries its own padding (09-19) — shipped: `.card { padding: var(--pad-card) }` in framework.css.
- The lew42 button-padding one-liner (08-21) — the theme's button rule was removed 09-06; buttons follow the control grammar.
- Blog `Post.js` missing `return` (08-30) — fixed, with the trap written beside it.
- `/notes/auth/` "build after await" sketch (09-06) — corrected.
- Commit Panel/editor, and "commit michael/dev regularly" (08-15, 09-19) — committed; worktrees and auto-merge now run daily.
- The six unapplied system-eval skill changes (09-19) — overtaken by the 09-22 skills shrink and tier design.
- v3 versus v2 dashboard sizing (09-19) — overtaken by AI 2.
- Auditor versus master assistant (09-22) — merged: the master-assistant skill is the auditor between questions.
- The idle pm2 daemon (09-22) — no longer running.

**Decided by this sweep:**
- **The `--measure` token (open since 08-16).** Decision: keep what shipped — `.measure` at 34em, and a page sets its own `--measure` when it needs more. The 09-01 size system took over this question. *Alternative:* a 52em site default (~100 characters a line).
- **Opt-in page grid, `.page` → `.page.standard` (08-19).** Decision: `.page` stays the default; 137 of 144 pages already carry `standard`, and core documents why. *Alternative:* move the five rules to `.page.standard` and fix seven call sites.
- **Panel, park or delete ~950 lines (08-18).** Decision: park — read-only, no new features; layout work goes to Playground. *Alternative:* delete (git keeps it) — that one would be yours, being destructive.
- **Hold-guard and prompt-relay hooks (09-21).** Decision: arm the hold-guard (one `Bash` matcher, done below); leave prompt-relay off, because cards and the fast assistant now carry your prompts. *Alternative:* arm both.
- **ext/Ask tool scoping (08-14).** Decision: closed — named presets set the tools, and `strict_mcp` shuts the MCP side. *Alternative:* a per-page allowlist.
- **`pack()` into `util/` (08-16).** Decision: no — only the masonry module imports it. *Alternative:* promote it when a second module does.
- **`.grid.auto` auto-fill everywhere (09-05, ~90 call sites).** Decision: keep it scoped to preview walls. A site-wide swap is shared CSS, and you asked not to clobber padding. *Alternative:* swap it, with before-and-after shots of three pages.
- **Raise the DesignTool audit depth (08-17).** Decision: yes, the next time DesignTool is touched — the sample found 16 of 16 findings real. *Alternative:* keep today's depth.
- **Page children as data, and Make's `children()` (09-13, 09-18).** Decision: fold both into today's page-jsonl work; no separate core seam. *Alternative:* `children` as a function returning a promise (~22 core lines).
- **Two dashboards, one datastore (09-19).** Decision: the ai2-dashboard mastermind owns it today.
- **Durable Objects: realtime versus Cloudflare research (09-04).** Decision: one Durable Object per topic (the Cloudflare verdict); realtime fans out from it. *Alternative:* one per page.
- **A sixth question in the layout ritual (09-19).** Decision: no — five stays five; the point becomes one trap line when the layout skill is next edited.
- **Six stale unlanded tasks (five from 08-12, one from 08-13).** Decision: each closed with a line saying what replaced it (done below). Three more (09-04/paging, 09-13/self-evident-fixes and -2) have no log to close; their work landed under later tasks.
- The layout and navigation calls — nav tuning, fill-yields, column-head padding, nested-Doc band, the /imagine/ rail moves, numbered layouts — are decided in the briefs below, because each one is real work.

## Small fixes, done now

- The reload hold-guard is armed: one `Bash` matcher in `.claude/settings.json`.
- The stale unlanded tasks are closed, each with an honest outcome line.
- The handover file points here for owner items.

## Bigger work — briefs, most useful first

Sent to the mastermind in your tab to dispatch.

1. ~~**Navigation that doesn't jump.**~~ **Done the same evening** by [core-columns](/framework/ai/2026-09-24/core-columns/) (commit 23b07fa3): columns freeze at a third of the row (34cqi).
2. ~~**Columns: fill yields, column-head padding.**~~ **Done** by core-columns: a fill parent gives the space back to an open child; the head padding was checked and was already right.
3. ~~**Layouts get names, not numbers.**~~ **Done** by layout-names (commit 24d1df92).  The shape labs already moved into /layouts/labs/ on 09-18 ([imagine-move-3](/framework/ai/2026-09-18/imagine-move-3/)). What's left is to retire `/imagine/layouts/`'s numbered eighteen (`number.js`, `LayoutsCard`) in favour of `core/Layout`'s names, following your 09-08 naming rule, and to put the verdict above the picture on item pages.
4. **Servex small items.** A `restart_servex` tool (exit, the keeper respawns it), re-attaching agents after a restart, pause/resume dispatch tools, and clearing stopped agents out of the list. From [servex-port-80](/framework/ai/2026-09-23/servex-port-80/) and handoff2's backburner.
5. **Names align.** Skill name = role = agent id, one table in `Servex/agents/roles.js`. The brief was never written; it came out of [mastermind-servex](/framework/ai/2026-09-22/mastermind-servex/).
6. ~~**Nested Doc renders as a section.**~~ **Checked by core-columns and already right.**
7. ~~**Make's leftovers.**~~ **Done** by layout-names (commit 24d1df92).  The Description field shows nowhere on screen, and drag has no keyboard path. Give the description a place under the title, and add arrow-key reordering to the tree.

*Every census row, with verbatim quotes, is in this task's `census/` folder. Every decision is also a `decision` line in task.jsonl.*
