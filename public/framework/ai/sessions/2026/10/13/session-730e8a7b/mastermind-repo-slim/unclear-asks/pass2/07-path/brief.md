# One question about 17 asks (path)

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files you need. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/07-path/results.json` and stop.

A first pass could not tell whether each ask below is done. For each ask answer ONE question:

> The first pass said this is built, but the path it cited does not exist. Find the real file. Does the thing exist and do what the ask says? done (the real path:line you opened and the quoted line), undone (the three places you looked) or unclear.

Be strict: "done" needs a file you opened; a related thing is not the thing. The site serves `public/` as `/`; modules live in `public/framework/<module>/`. Rules for agents are in `CLAUDE.md` and `public/framework/ai/handover.md`. Use Grep/Glob first; `git log` always with `-n 5` and a path.

## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/unclear-asks/pass2/07-path/results.json`

A JSON array, one object per ask, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command"],"owner_question":"only when unclear: one short yes/no question the owner can answer by voice"}]
```

## The 17 asks

1. `314eec080e` [ai] Remove the useless 'inbox one, one new' link at the bottom
   first pass said: (claimed done, but no path in the evidence exists in the repo) Absence: grep for "one, one new" and "inbox one" across public/framework returns no current match (only old commit hits)
2. `99f4432968` [ai] Log the backup location as a checkable AI inbox item.
   first pass said: (claimed done, but no path in the evidence exists in the repo) public/framework/ai/inbox.jsonl:58 - "Log the backup location as a checkable AI inbox item." (id i-mv8szpdl6k0)
3. `68832ac26e` [ai/sessions] Find out why the session count dropped from about 8,000 to 6,000 shown
   first pass said: (claimed done, but no path in the evidence exists in the repo) doc/live/grid-loading.md:27 - "8,000 became 6,000": the window opens on the 1st of the month; "show 30 more days" brings the rest back.
4. `ce71a7c92d` [ai/sessions] Check whether the top Now grid and the lower grid repeat entries and decide how to handle the overlap
   first pass said: (claimed done, but no path in the evidence exists in the repo) doc/live/grid-loading.md:38 - "The Now strip is gone. One list, newest activity first".
5. `e2b98497ed` [ai/sessions] Merge the two bottom grids into one grid sorted by recency.
   first pass said: (claimed done, but no path in the evidence exists in the repo) doc/live/grid-loading.md:38 - "One grid sorted by recency, not \"Now\" plus a full grid"; AISessionRows.sort_rows.
6. `04bdf28ba9` [ai/sessions] Fix the bottom grid header resize handles so they work and are not laggy.
   first pass said: (claimed done, but no path in the evidence exists in the repo) doc/live/grid-loading.md:40 - "the handle is always faintly visible with a wider grab strip... about 25 ms per drag step" (headless, 204 rows).
7. `3a72a31aa0` [ai/sessions] Remove the 'All sessions' back button on the detail page; the close button already returns to the sessions page.
   first pass said: (claimed done, but no path in the evidence exists in the repo) rg 'All sessions' finds no text in AISessionDetail.js; the only hit, AISessionsPage.js:113, is a comment on the grid's own breadcrumb trail.
8. `3a5903dc42` [ai/sessions] Remove the top line that repeats the session ID and links to 'AI session detail.js', keeping the ID as the page title.
   first pass said: (claimed done, but no path in the evidence exists in the repo) AISessionDetail.js:111 - "return `${name}-${session_id.slice(0, 8)}`;" is the title; no 'AI session detail' link text remains in AISession/ or sessions/page.js.
9. `35ca730e21` [ai/sessions] Maybe replace the multi-column detail layout with left navigation or top tabs.
   first pass said: (claimed done, but no path in the evidence exists in the repo) doc/ui/detail-layout.md:3 - "Chosen: tabs on top (Conversation, Cost, Models and tokens, Related)"; AISessionDetail.js:141 sessions-tabs.
10. `a35455a5f8` [core/Page] Let inbox items be read, then archived or cleared
   first pass said: (claimed done, but no path in the evidence exists in the repo) core/Page/ext/Inbox/Rail.js:159 - `this.$archived = button.c("inbox-word inbox-archived-word")`; Rail.js:161 has an `inbox-clear-all` button; Rail.js:12 stores `<key>-read-ids`.
11. `e07f48a20c` [core/Page] Add a resolutions array per layout, with mobile-only layouts captured at 400px and responsive layouts captured at all levels.
   first pass said: (claimed done, but no path in the evidence exists in the repo) ext/Shots/Shots.mjs:31 - "1. a template's own `resolutions` list wins outright." and Shots.mjs:34 `if (Array.isArray(resolutions) && resolutions.length) return`. Mobile-only 400px rule is at Shots.mjs:30-32 (partly: a W<=400 gets only 400).
12. `b59cec383b` [core/Page] Document the data-binding system and research outcome in the Page class docs
   first pass said: (claimed done, but no path in the evidence exists in the repo) core/Page/doc/binding.md:1 - "# Binding — draw a value once, and it keeps itself up to date"; research table at binding.md:20 ("How does a view subscribe, and unsubscribe?").
13. `75774baa20` [core/Page] Decide whether templates are cloned and how mock data gets rewired to real data
   first pass said: (claimed done, but no path in the evidence exists in the repo) Cloning decided and built: Template.js:49 clone(data) and Template.js:62 copy(data); mock-to-real rewire is the expand(data) step at Template.js:56. Remaining: no written decision in core/Page/doc/templates.md on mock rewiring.
14. `878f5feabb` [ext/Figma] Confirm whether you can access the September 2026 page.
   first pass said: (claimed done, but no path in the evidence exists in the repo) public/framework/ext/Figma/data/QYN0G2URSBHYH5I06MOjxU/built.jsonl and index.jsonl:1 - {"key":"QYN0G2URSBHYH5I06MOjxU","name":"Sept-2026"} (file is tracked and readable)
15. `7c99d3dafc` [ext/Refine] Build a class architecture view on the refine page showing how the prompt, refine and related classes fit together, with their names
   first pass said: (claimed done, but no path in the evidence exists in the repo) ext/Refine/page.js:27 - a("How it fits (architecture)").href("/framework/ext/Refine/md/doc/architecture/"); ext/Refine/RefineSystem.js:48 - architecture table (name, job, relation) drawn by the demo's class card
16. `a9fddccc0d` [ext/Refine] Add cleaned sentences into the existing structure rather than a wall of text, so everything is tracked
   first pass said: (claimed done, but no path in the evidence exists in the repo) ext/Refine/Placement.js:2-3 - "class Placement — decides where one cleaned sentence goes: onto the previous paragraph, or into a new one. Runs once per sentence"
17. `c0eca69ee6` [ext/Refine] Build a tree UI with icons from the Google material icons library
   first pass said: (claimed done, but no path in the evidence exists in the repo) ui/icon/icon.js:6 - "`icon()` from core/View/View.js (a span.material-icons.icon)"; ui/tree/tree.js exists as the tree component
