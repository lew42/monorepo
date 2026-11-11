verdict: fix
1. [fix] A task's full title can't be read anywhere at 400 (Requirements 2, "a simple overview of all the tasks"; layout: wrapping): all 8 visible rows end in "…" ("Owner back 11-09: decide the 10 open …"), and opening a row shows why, outcome and evidence but never repeats the title (`page.js` `task_detail`). shots/…/400.png, Tasks band. Fix: put `t.title` as the first line of `task_detail`, or let the summary wrap once it is open.
2. [fix] `probe.mjs` only works in the qf-3 worktree, so a fresh agent can't re-make the shots from this folder. It imports `file:///C:/Code/lew42/worktrees/qf-3/Server/Browser.mjs` and loads `http://qf-3.localhost/`. The task's closing log still says "re-run probe.mjs to regenerate". Fix: import `Server/Browser.mjs` by a path relative to the repo, and take the host from an argument.
3. [fix] The page's own shots aren't committed, though the brief's Proof asked for them. The minion logged why (`**/shots/` is gitignored, `.gitignore:213`), but because of finding 2 the regenerate route it offers is broken too. The review shots in `shots/127-0-0-1-55336-live-session/` cover 400 and 1200 for now; say so on the task.
4. [note] There is no session title (Requirements 1, "a title"; page 1). The h1 says only "Session". The file holds no title (`index.json` title = the id), so the page could say "Voice session · Nov 6" instead. Cost isn't shown because `index.json` has `usd: 0`, which matches "cost if the file has it".
5. [note] On wide screens the header card fills the whole width with three short lines (layout/sizing). `wide` stretches it to about 1800 px at 3440 (`layout.json` empty 0.779 at 3440, 0.658 at 1200). shots/…/3440.png, band 2.
6. [note] At 400 the "Tasks" and "Child sessions" h2s sit about 7 px under the card above them, much tighter than their gap to what follows (spacing). shots/…/400.png, the band at y≈245–260.
7. [note] The "Waiting on you" group is hidden when it's empty, because `draw` skips groups with no tasks. Showing "Waiting on you (0)" would tell the owner nothing is waiting on them, instead of leaving them unsure.
8. [note] Every page load logs a 404 (`layout.json` errors, all four widths). The minion says it's the long-standing `page-work.json` warning that also shows on /framework/, so it isn't caused by this diff.

Widths given: 400, 1200, 1920, 3440 (a page layout, so all four).

## Requirements
- 1 "What this is: icon, the session id linking to its folder, a title, start and last dates, cost if the file has it, completion" — partly: icon, id link to `/framework/ai/sessions/2026/11/06/cloud-voice-app-20261106/`, "Started Nov 6, 1:03 AM · last line Nov 9, 5:29 PM" and "21 of 29 tasks done" are there (shots/…/400.png, card); no title (note 4); no cost, and the file records $0
- 2 "Tasks, one line each, grouped by state… No strike-through, no dimmed paragraphs. A tap opens that task's detail" — mostly: grouped Working (4) / Open (4) / Done (21), one line each, icon each, nothing struck through or dimmed (shots/…/1200.png, Tasks band); `details`-style open via `ui.item` children; but at 400 the full title is never readable (fix 1)
- 3 "Child sessions… icon and agent id, each a link to its session folder if the line names one, else to nothing" — yes: 11 `spawned` lines, all with `task_dir: null`, drawn as plain rows with the smart_toy icon (shots/…/400.png, bottom band)
- 4 "The owner's prompts by number… if not in that folder, one line saying where they are missing and log the gap" — yes: one muted line in `page.js` `draw` (below the shot fold, so read from the code); gap logged on the task
- "One fetch, fold with the existing replay if fast, else a small fold and say why" — yes: one `fetch`; `SessionView.js` header comment says why core/Session is not used
- "No new CSS" — yes: `session.css` was added and then removed (`files.jsonl` "gone"); only `card`, `flex`, `gap-*`, `muted`, `wide` utilities and `ui.item`
- "Measure load time at 400, under 1 s" — yes: `console.log` in `page.js`; logged on the task
- "One lean test" — yes: `SessionView.test.mjs`, 12 checks, logged 12/12
- "One line in public/live/readme.md" — yes: diff, readme.md line 95
- "Headless shots at 400 and 1200, committed" — no: not committed (fix 3)
- "Smoke with no FAIL; don't merge" — yes: logged; branch worktree/qf-3, commit b6410a46d, not merged
- Class page: can you open a page that shows SessionView's live instances? — n/a in practice: SessionView is a static fold that holds no state, so there is nothing to watch (note-level, no finding)
- Indexing and docs: is anything new unindexed or stale? — the page is indexed in `public/live/readme.md`, and `files.jsonl` lists its files; the task folder is in its parent's session.jsonl (15 mentions). `public/live/session/` has no readme of its own, but the readme.md line covers a two-file prototype. Stale: the task's "re-run probe.mjs" route (fix 2)
- Could a fresh agent continue from this task folder alone? — mostly: requirements, past-work.md and a full log with branch, commit, test and smoke results are there; the one gap is that the shots can't be re-made (fixes 2 and 3)

## Page structure
- page 1 (title says what it is) — partly: the h1 "Session" is generic and the id sits in the card below it (note 4)
- context first, detail on demand — yes: the id card, then grouped rows, then detail on tap (shots/…/1200.png)
- one takeaway — yes: what this session has done and what is open

## Navigation
- techniques — expanding tree rows (`ui.item`) only; no tabs, rail, sheet or modal
- tree rows show they can open — yes: a disclosure triangle on every row (shots/…/400.png)
- a link's target is clear — yes: the id is an underlined link; child rows without links have no arrow
- url changes on open — n/a (details, not a route; the brief allows either)

## Layout
- standard layout fits the page — yes: `layout.json` layout "standard" at every width
- horizontal overflow — no: overflow_x false at every width
- wide screens — partly: the card and rows stretch to about 1800 px at 3440 (note 5)

## Sizing
- the title band is in proportion — yes: page-title share 0.04–0.059
- the header card is sized to its content — no at 1200+, a 3-line card spans the full width (note 5)
- touch targets at 400 — yes: rows about 34 px apart (shots/…/400.png)

## Wrapping
- tab rows — n/a
- titles stay on one line — yes, but cut short with no way to read them in full at 400 (fix 1)
- unwanted wraps — none from this diff; `drawer-rail-ai`/`drawer-rail-menu` 3.2 lines at 400 are site chrome (`layout.json` wraps)

## Spacing and padding
- left edges line up — yes: page 16 px, card text 35 px at 400 (`left_stack`)
- heading spacing — no, not quite: the h2s sit tight under the card above them (note 6)
- group spacing — yes: clear gaps between Working, Open and Done (shots/…/1200.png)

## Colour and contrast
- text contrast — yes: dark text on white or light grey; the muted date line is still readable (shots/…/400.png)
- colour carries meaning on its own — no: state is shown by an icon shape (play, circle, check), not by colour alone
- accent use — yes: only the id link uses the orange underline

## Flow
- top-to-bottom order matches the brief — yes: what this is, tasks, child sessions, prompts
- most important first — yes: Working and Open are expanded, Done (21) is collapsed (shots/…/1200.png)
- empty groups — hidden (note 7)

## Words
- plain words — yes: "21 of 29 tasks done", "Waiting on you", "Child sessions"
- the gap line — yes: one sentence saying where the prompts aren't and that the gap is logged
- jargon — "last line" (in the date line) is file-speak; "last activity" would be plainer (minor, no finding)
