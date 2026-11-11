# Step 6b: LivePage's file list and settings rows onto the kit

- Budget: $4, hard stop, review fixes included. Stop and report at $4 even if unfinished.
- Load the `minion` skill first, then `css`.
- Card (the owner's words): `public/framework/ai/sessions/2026/11/09/cards/ui-kit-one-small-set-of-parts-every-page/`. Plan: [/live/plan/ui-kit/](/live/plan/ui-kit/), card 6.
- You own `public/live/LivePage.css`, `public/live/LivePage.js` and `public/live/readme.md` for this step.
- Model: step 6a (merged 1aacf05c1, brief and log in `../step-6a/`) did the same for the card: added the kit's class beside LivePage's, deleted what the kit already gives. Read its diff first: `git show 1aacf05c1 --stat` then `git diff 1aacf05c1^1 1aacf05c1 -- public/live/`.

Rules:
- Work in a worktree (`take_worktree`, use its `path` and `url`). Commit by exact path after each working piece.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash` (diff, don't stash).
- Log as you go on this folder's `session.jsonl` with `mcp__servex__log` (hand appends to .jsonl are blocked).

## The change

Two parts of `/live/` still draw their own boxes and rows:

1. **The file list** (`LivePage.css:94-107`, `.live-files-body`, `.live-files-row`; drawn by `LivePage.Files` in `LivePage.js`, grep `live-files`). The body becomes the kit's `.card` (the box); each row also gets the kit's `.ui-row` (`public/framework/ui/row/`, readme there: padding, gap, hover ground; it never draws a border). Delete from LivePage.css what `.card` / `.ui-row` already give. LivePage keeps only what the kit doesn't: the divider between rows, the bold dir row, the `is-file` case (a code file shown edge to edge, no box).
2. **The settings rows** (`LivePage.css:86-92`, `.live-settings-row`, `.live-settings-class`; drawn by `LivePage.Settings`). Same move: the row box becomes `.card`, or the rows sit in one `.card` as `.ui-row`s — pick whichever keeps the settings page (`/live/done/settings/`) looking like one list, and log which and why.

After both, if `--live-card` is used only by `DesignPage.css`, leave it (DesignPage is a later step) and say so in your log. The number of CSS **declarations** removed and added is a deliverable (not lines; comments don't count).

Any spot the kit can't cover: one `ui-kit gap: ...` log line, no new kit words.

## Proof

- `node Server/LayoutCheck.mjs <worktree url> /live/done/settings/ /live/files/ --widths 400,1200 --json` (if `/live/files/` doesn't exist, use any /live/ page that shows the file list; find it from `LivePage.Files` and say which): BROKEN before (`http://monorepo.localhost`) and after. After must be no higher.
- Headless shots of the same two pages at 400 and 1200, before and after, into the MAIN tree's `step-6b/shots/`. Read them yourself.
- `node public/live/LivePage.test.mjs` passes.
- `node Server/smoke.mjs <worktree path> /live/done/settings/` shows no FAIL. Known pre-existing: `/live/plan/mentions/` "text touching its box" on a mention pill (present on compliance/dev); ignore it.
- Update `public/live/readme.md` where it describes the file list or settings boxes, same commit.

Stop with one reply: branch, commits, declarations removed/added, BROKEN before/after, shot paths, gap lines. Do not merge; the mastermind reviews and merges.
