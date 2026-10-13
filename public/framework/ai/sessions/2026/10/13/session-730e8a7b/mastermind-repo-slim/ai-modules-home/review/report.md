verdict: fix
1. [fix] The census leaves 100 of its 125 modules "unjudged" (requirements 1 asks for strictly AI / uses AI / not AI on every module) — `ai/doc/module-homes.md`, the census line "Strictly AI: 15 · uses AI: 6 · not AI: 4 · unjudged: 100". Judge them, or write down the default (for example: not in judgments.json = not AI) so the column is complete.
2. [note] There is no `send_to_agent` to `one-store` in task.jsonl (the fence says to coordinate so the two moves under `ai/` do not cross). The `dictate-check` sibling is covered: it had landed by 17:37 and Dictate is proposed, not moved.
3. [note] The owner note (requirements 5) and the card report (requirements 6) are not written yet. Both belong at landing, after this review, so make sure they happen there.
4. [note] The new `/framework/ai/AITask/` page is linked from `ai/readme.md` and from the old address's pointer page, but not from the AI tab bar or sidebar (shots/framework-ai-AITask/1200.png: the sidebar's "AI" row is not expanded and there is no AITask tab). That is reachable enough for now; consider a `children:` entry.
5. [note] Every shot, including pages this move does not touch (`styles/system/studies/themes`, `ui/decision`), logs one 404 resource error in layout.json `errors`. It is shared by all pages and existed before this change, but worth tracing once.
6. [note] The diff carries files outside the fence (`.claude/skills/*`, `Servex/agents/Agents.js`, `Server/health.mjs`, `Server/task-cost.mjs`…). These are probably other merges in the base range, but confirm that nothing of yours outside the fence rides along before `merge.mjs`.
7. [note] In the census table, `ai/AISession` has an empty "readme says" cell (`module-homes.md`): its readme has no title line the script could read.

Widths given: 1200 and 1920, for 51 pages (the moved module, its importers, and the dated session pages whose imports were relinked).

## Requirements
- 1 "The census, by script" — partly — `Server/ModuleHomes.mjs` exists (read-only), table in `ai/doc/module-homes.md`, full list in the task dir's `module-homes.md`; 100 of 125 unjudged (finding 1)
- 2 "The decision per candidate… the rule once at the top of ai/readme.md and ext/readme.md" — yes — four `decision` lines in task.jsonl (d-aitask, d-voice, d-ext-ai, d-session-shims), each with its alternative; the rule paragraph sits at the top of both readmes (diff)
- 3 "Move the obvious ones with a script… ext/AITask first" — yes — `Server/ModuleMove.mjs`: 223 files, 399 paths, a manifest, and the undo proven twice on the worktree (task.jsonl `experiment`); the old URL is a pointer page (shots/framework-ext-AITask/1200.png); check_page ran clean on 5 pages; Dictate was correctly not moved
- 4 "The two session-page module sets" — yes — `module-homes.md` "The two session-page module sets": AISession is live, `ai/sessions/Session*.js` are shims; retirement proposed with the importer list, and nothing of them moved
- 5 "Owner note (kind decision)" — not yet — expected at landing (finding 3)
- 6 "Report on your card" — not yet — expected at landing (finding 3)
- Fence "coordinate with one-store" — no evidence — finding 2
## Page structure
- page 1 (title says what it is) — yes — shots/framework-ai-AITask/1920.png: "AITask" with the Overview / Task tree / API / Docs / Files tabs; the pointer page's title is "AITask (moved)"
- page 2 (one takeaway) — yes — shots/framework-ext-AITask/1200.png: one paragraph says where it moved and why, with links
- page 3 (detail nested) — yes — the AITask page is unchanged apart from paths; detail stays in its tabs
- page 4 (reachable by a visible link) — yes, weakly — reached from the ai/readme index and the pointer page (finding 4)
## Navigation
- page 13 — the techniques used: tabs, a sidebar, and Miller columns on the sessions pages
- page 14 (tabs in one row) — yes — layout.json tab_rows 1 on every tabbed page, at both widths
- columns (Sessions) — yes — shots/framework-ai-sessions-2026-09-24/1200.png: the breadcrumb 2026 › 09 › 24 matches the columns; the first column's left edge is clipped ("2026", "08/12/…"), which is the existing column scroll and not this diff
- back/reload — n/a
## Layout
- layout fits the page's kind — yes — the AI pages keep their rail plus content; the pointer page is plain prose
- no horizontal overflow — yes — layout.json overflow_x false on every page at 1200 and 1920
## Sizing
- content width — yes — the widest text is 569/631px on AITask and 557/597px on the pointer (measure-capped)
- empty share — yes — the pointer page is 81–86% empty, as a three-line pointer should be; AITask is 49%/67%
## Wrapping
- unwanted wraps — no new ones — layout.json wraps list only `mode-btn` (an icon name, 1.7 lines) and `drawer-menu`, present on every page and existing before this change; the two-line `h2`s on AITask are long headings
## Spacing and padding
- left stack — yes — layout.json left_stack h1 19/33px and p 38/67px on the AITask pages, the same as before
- band shares — yes — AITask has its tab bar at 7.2% share, then the tab panel; nothing marked big_empty
## Colour and contrast
- contrast — yes — no colour changes in the diff; the shots show the standard theme
## Flow
- reading order — yes — shots/framework-ai/1920.png: Live, then Running now, Processes, Working on, Just landed, Worktree pool, all as before
## Words
- content 1 (plain sentences) — yes — the pointer page: "AITask moved to ai/AITask on 2026-10-13. It renders an agent task's log…, so it lives with the AI system now"
- content 2 (the rule said once, with the name and its scope) — yes — `ai/readme.md` and `ext/readme.md` each open with the same rule plus what goes next door, and both link `module-homes.md`
- content 3 (short) — yes — `module-homes.md` is 51 lines: the rule, the table, the proposals in order, a watch-out
- links — yes — module names in `module-homes.md` are links (`/framework/ai/AITask/`, `/framework/ai/cards/`, `/framework/ai/AISession/`)
