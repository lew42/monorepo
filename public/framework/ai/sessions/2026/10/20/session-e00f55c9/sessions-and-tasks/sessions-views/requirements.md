# Sessions views: study what exists, then propose the day view, the URLs and the columns. PLANNING ONLY. QUEUED: start after the dictation map lands.

Budget: $6. Opus, medium effort. Parent: `vscode-mastermind`. **No code.** One doc, screenshots, proposals; the owner approves the URL shape and the layout before anything is built, and may design the layout in Figma first.

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
