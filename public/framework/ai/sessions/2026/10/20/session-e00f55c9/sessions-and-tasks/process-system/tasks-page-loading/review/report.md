verdict: fix
1. [fix] The shot of /tasks/ shows the "AI" sessions inbox (sessions, Voice/Servex groups, $ costs), not tasks. The saved filter says `preset: all-tasks` with "Tasks and Home chips on", yet no task rows and no Tasks/Home chips are visible (shots/monorepo-localhost-tasks/1920.png, main column). Either the shot hit the main checkout rather than the worktree, or the forward lands on a page that does not show tasks. Confirm in the worktree that /tasks/ really lists tasks.
2. [fix] The cause is not recorded in the diff (requirements step "record what the cause was"). The diff only updates the test's expectations and the readme to say /tasks/ forwards to the Inbox. The readme says it forwards, but it never says that the old "Loading" hang was a stale test or a stale `page.jsonl` class line, and the commit message was not provided. State the cause in the task log or the readme.
3. [note] `TasksPage.into` starts a 30 s `setTimeout` that is never cleared. It is harmless, but the timer keeps running after a fast load and rejects a settled race. Add a `clearTimeout` in `finally`.
4. [note] The 30 s `LOAD_MS` is longer than the test's own 20 s wait. A hang therefore still fails the test before the error text shows. This is fine for users but the test cannot exercise the new error path.
5. [note] Widths given: 400 and 1920. At 400 the `.drawer-rail-ai` and `.drawer-rail-menu` buttons wrap to 3.2 lines (layout.json wraps). These are existing chrome, not part of this diff.

## Requirements
- 1 "Find the cause, fix it, and record what the cause was" — no — the fix is present (the test follows the forward, the timeout is added), but no cause is written down (finding 2)
- 2 "If the page can fail silently, make it show an error instead of Loading forever" — yes — `TasksPage.into` races `groups()` against `LOAD_MS` and the catch draws "Could not read tasks: …"
- 3 "The test passes" — not measured — no test output is in the task folder
- 4 "/tasks/ shows tasks" — no — shots/monorepo-localhost-tasks/1920.png shows sessions (finding 1)
## Page structure
- page title says what it is — no — the title reads "AI", not Tasks (1920.png, top band)
- one clear purpose — yes — one inbox list
## Navigation
- techniques: a sidebar (1920), a bottom rail and a menu (400), a right drawer
- sidebar current item — yes — "AI" is highlighted at 1920
- drawer rail buttons — no — wrap to 3.2 lines at 400 (layout.json wraps); existing, not in this diff
## Layout
- n/a — the diff changes no layout; the shot is the existing inbox
## Sizing
- overflow_x — yes — false at 400 and 1920
- widest text — yes — 316 px at 400, inside the 400 px width
## Wrapping
- tab_rows 0 at 400 and 1920 — yes
- drawer rail buttons wrap — no — see Navigation
## Spacing and padding
- bands — yes — 400: title share 0.04, list share 0.758; 1920: title 0.053, list 0.8
- empty space at 1920 — no — empty 0.597, mostly the side gutters of the existing inbox page; a note, not caused by this diff
## Colour and contrast
- yes — shots/monorepo-localhost-tasks/sheet.png: the orange selected chip, dark text on a light ground
## Flow
- n/a — the diff changes no flow; the page was not changed
## Words
- "Could not read tasks: …" and "no answer from <url> after 30 s" — yes — plain and say what went wrong
- readme TasksPage paragraph — no — one very long paragraph; split the forwarding facts from the old description
