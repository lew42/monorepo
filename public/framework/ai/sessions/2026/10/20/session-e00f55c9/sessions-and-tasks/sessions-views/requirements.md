# Sessions views: study what exists, then propose the day view, the URLs and the columns. PLANNING ONLY.

Budget: $10. Opus, medium effort. Parent: `vscode-mastermind`. **No changes to the real pages**: docs, screenshots, decisions, and the one prototype page in deliverable 6. One doc, screenshots, proposals; the owner approves the URL shape and the layout before anything is built, and may design the layout in Figma first.

## The owner (2026-10-20, 22:05; words in the tab prompt log)

- A **day view** of the sessions. The store is already `ai/sessions/YYYY/MM/DD/`, and each level should have a precomputed index (`2026/index…`, `2026/10/index…`) so a view renders straight from that file, with no recomputation and no reload of what the parent page already loaded. The "today" button should simply link to today's folder.
- The URLs are fine; nothing moves. Query strings may suit filtering (reducing a data set); subpaths may suit real places. The owner wants to **see** the options and choose.
- The session **detail** page shows little that helps (a stray one-file file box, wrong height at 3440). Revamp the views, not the data.
- The **sub-navigation** (the left sidebar on the sessions page: Sessions, Docs, Readme, Dashboard v2, All versions): how are those pages made (page.js, page.jsonl, dynamic route)? The owner does not know and should.
- **Columns**: the preview rail that opens a column, the column paging and its `display: contents` nesting, filling and using the space: study how it works and say whether to use it. "Most of the time we configure columns improperly and get blank spaces or cramped things." Maybe full screen.
- No new pages under `/framework/ai/<date>/` ("the worst thing you could do"). The 2026-10-20 build that made one (`ai/AIDay`, commit 4792d3494) is to be proposed for removal, its route restored to what it was or redirected to the day folder.

## Deliverable: `ai/sessions/doc/views-plan.md`, linked from `ai/sessions/readme.md`

1. **What exists, with file:line**: the index files at each level (which exist, which tool writes them, what is in a row), the sub-navigation's pages and how each is routed, the grid (`AISessionsPage`, `ext/DataGrid`), the preview rail and column system (`core/Page` columns, `ext/drawer`), the detail page (`AISessionDetail`). Screenshots at 400, 1920, 3440 of the sessions page, a day folder, and two session detail pages.
2. **URL options** for year, month, day, a session, and a filter, as a table of real example URLs, each option ranked, with what each costs.
3. **The day view and the detail view** as rough wireframes (ASCII or a quick Figma frame), what data each row shows and from which index file.
4. **Columns**: use the existing system, simplify it, or not at all; ranked, with the evidence.
5. Proposals only, through `node Server/Decide.mjs`; committed docs and shots; `finish-task`.

## Added 2026-10-20 22:25: the session detail view shows its tasks and projects (the owner; words in the tab prompt log)

The point: **see what was done on any day** by looking at each session's tasks.

- **The session detail page** shows, top to bottom: the session's name (the slug, plus a nickname, below), its completion as a progress bar ("33% complete"), then the essentials (duration, total cost including child sessions, model), then its **tasks**: every task and project created in the session, nested. A project looks like a project, a simple task like a task. Each task opens its own view with the same bar, duration and details.
- **Segmented progress bars**: N steps = N equal segments that light up as each completes. Nested: a parent's bar reflects its children, and the parent is itself one segment of its own parent's bar (composite; maybe shown with transparency). Must work for short and long titles (where the bar sits beside or below the title is a layout question to answer with real data).
- **A session completes like a task**: its completion is the share of its tasks complete. Today `Session extends Item` and `Task extends Item` (`Project extends Task`); `Session` already has a `tasks` list and `progress()`. Propose whether `Session extends Task` (one API for completion), ranked with the alternative.
- **A session nickname**: a few words refreshed whenever a task or the session is finalised, from an overview of everything done; plus bullet points summarising what was done in a long session. The path never changes. Who writes it (a tool at finish-task, from the record; never hand-typed).
- **The chat view** may be another view of the same session data. Dictation is part of any chat: plain voice-to-text (types for you, you press send, batch) vs a real-time AI voice assistant (interprets every sentence, updates the view). Any session could have a chat; how you navigate to it (a tab costs navigation space; a link; a drop-down) is part of the navigation question.
- **Navigation**: fewer layers. Every new layer costs space and clutters; multi-column needs a sophisticated system we do not have or need yet. Tasks may open inside the session area. Consider a drop-down that shows one thing and switches (it looks like what it is).

### Added deliverable 6: three layout variants, real data, for the owner to pick

Three variants of the session detail view (and the task view inside it), differing in navigation scheme (inline expansion, a drop-down switcher, a two-pane), each rendered with **real** sessions from 2026-10-20 (this tab's session `session-e00f55c9`, the voice mastermind `voice-20261020`, one small agent session) read from their records, side by side on one page at `ai/sessions/doc/variants/` (a page.js under the doc folder, linked from `views-plan.md`). The segmented and nested progress bar is one shared view used by all three. Shots at 400, 1920 and 3440. These are prototypes for choosing; the real pages are not changed.
