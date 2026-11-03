verdict: fix
1. [fix] Pressing Merge freezes all of Servex until merge.mjs finishes, which can take up to 15 minutes (Requirements 2). `mergeBranch` runs merge.mjs with `spawnSync` and `timeout: 9e5`, inside Servex's own process. Until it returns, every other Servex route, log append and agent supervision waits. The `this.merging` guard can never fire, because no second request is handled while the first one blocks. Fix: run merge.mjs with async `spawn`, or in a child process (diff.patch, Server/ReadyToMerge.mjs `mergeBranch`).
2. [note] There are no shots: `shots/` is empty, and the last `shots` line in session.jsonl lists four widths but `bands: []`. So the page's look is judged from the CSS and code only; nobody has seen a card or the Merge button drawn. The earlier review's shots showed only the error state.
3. [note] A card's title can be a bare folder name. If a record's first line has no title, the row falls back to `path.basename(dir)`. `node Server/ReadyToMerge.mjs` today shows the row for `worktree/qf-1` titled "process-system" (Words).
4. [note] `dayDirs` only walks date folders from the last 14 days. A session folder older than that which logs a fresh `ready:` line is never scanned, even though the file mtime check (`recordFiles`) would accept it. The task folder here is dated 10/20, so it is safe for now.
5. [note] The branch under review, `task/merge-approvals` (head 8689eeccf), has no `ready:` line of its own yet. The only listed row is `worktree/qf-1 0769cf76e`, so the "own row appears in your list" check from the Land step is still to be done for this branch.

Widths given: none (shots/ is empty). Page systems are answered from the code and marked not measured.

## Requirements
- 1 "Server/ReadyToMerge.mjs … scans … for `ready:` … latest per branch; drops landed or gone; worktree; row fields; CLI table and --json; test" — yes — diff.patch Server/ReadyToMerge.mjs `readyRows` and the CLI; `node Server/ReadyToMerge.test.mjs` → "16 checks pass", and it covers the three parse forms (at sha;, sha (worktree …), at sha.)
- 2 "Servex routes, loopback only … POST refuses unlisted or moved, runs merge.mjs one at a time, answers {ok, out}, appends merged: through append.mjs" — partly — the guard, the refusals and the append.mjs line are all there (Servex.js `local_only`; the `mergeBranch` refusals are tested). But "one at a time" works only by blocking the whole Servex process (finding 1)
- 3 "Page /framework/ai/merge/: one card per row, newest first: title link, what, review phrase, branch and sha, Merge button showing merge.mjs's answer; empty says 'Nothing waiting to merge.'; linked from dashboard head and ai/readme.md" — yes — ReadyToMerge.js `card()`/`paint()`; rows are sorted by `at` descending; AIDashboard.js line 52 puts the link at the top of `ad-main`; ai/readme.md has a new line
- Rule "Merge only ever runs Server/merge.mjs; a refusal is shown, not retried" — yes — the only command is `node Server/merge.mjs <worktree>` (an args array, no shell); after a refusal the button stays disabled and reads "Refused"
- Rule "do NOT restart Servex; log 'needs restart'" — yes — session.jsonl has `needs restart: Servex.js gained …`
- Rule "test the route handler as a plain function" — yes — `mergeBranch` takes `run`/`rows`/`log` stubs in the test
- Rule "check_page at 400 and 1200" — not measured — the answers in session.jsonl point to scratchpad shots of stubbed rows, which are not in this task folder
- Rule "Docs: ai/merge/readme.md, one line in ai/readme.md, one line in Server/readme.md" — yes — all three are in the diff; the readme gives what it is, the on-disk layout, who writes and who reads

## Page structure
- page 1 — yes — page.js: the title "Ready to merge" and the description say what the page is (not measured; no shots)
- one takeaway — yes — one card per branch, each with one button

## Navigation
- techniques — none beyond page links (the dashboard link in, task links out)
- tabs, rail, sidebar, sheet, modal — n/a

## Layout
- the page sits in a 44em measure; cards go in an auto-fit grid of 24em minimum — yes, from ReadyToMerge.css (not measured)

## Sizing
- cards take `min(100%, 24em)`, so they fit at 400 — yes, from the CSS (not measured)

## Wrapping
- long branch names, the "what" text and merge.mjs output wrap with `overflow-wrap: anywhere` — yes, from the CSS (not measured)

## Spacing and padding
- list padding is `clamp(0.6em, 3cqi, 1.5em)`, card padding 0.8em 1em, gap 0.8em — yes, from the CSS (not measured)

## Colour and contrast
- result colours use the `--ok` and `--error` tokens, and the border uses `--line` — yes; the meta line at `opacity: 0.75` and 0.82em is the faintest text, not measured

## Flow
- order inside a card: title → what → review and branch → output → button — yes; the result appears just above the button the reader pressed

## Words
- the empty state reads "Nothing waiting to merge." — yes — exactly the brief's words
- the error text says what to do ("Servex needs a restart") — yes
- the stale and no-worktree notes tell the reader why the button is disabled — yes
- card titles — no for a record with no title: it falls back to the folder name ("process-system", finding 3)
