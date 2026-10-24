verdict: pass
1. [note] The shots show only the error state, because Servex has not been restarted, so a ready card and its Merge button were never drawn at any width. The card layout (`.rm-body` grid, `.rm-card`, `.rm-merge`) is judged from the CSS alone. Shoot it once after the restart (Requirements 3) — shots/…/1200.png, band 2.
2. [note] The error text in the shots ("Servex has no merge list yet: it needs a restart") is not the text in diff.patch ("Servex did not answer (…). If this change is new, Servex needs a restart."). The qf-1 worktree holds an uncommitted edit that the diff does not include. Also, the shot's wording names a restart as the cause, but the same message shows for any failure (a timeout, or a 500). The diff's wording is the more honest one (Words 1).
3. [note] The plan says the page is "linked from the AI dashboard head". The diff puts the link in the dashboard foot (`ad-foot`), beside "Old Inbox →". It works, but it sits below the fold of a long list (Requirements 3).
4. [note] `mergeBranch` does not check whether `append.mjs` succeeded, and it leaves its temp `merge-log-*.json` file behind. If the append fails, the "merged:" line is lost without any error (Requirements 2).
5. [note] At 1920 and 3440 the error line uses about 30% of a centred 44em column, and roughly 80% of the screen is empty (`empty 0.79/0.86`). That is acceptable for a one-line state, but it is worth re-checking once cards fill the grid (Layout 1).

Widths given: 400, 1200, 1920, 3440 (one page, `/framework/ai/merge/`), plus sheet.png and layout.json.

## Requirements
- 1 "Server/ReadyToMerge.mjs (compute, never recall)" — yes — the diff scans session.jsonl/task.jsonl from the last 14 days; the latest line per branch wins; it drops branches already in michael/dev or deleted; it adds the worktree, the review phrase and `stale`. It has a CLI with `--json`. ReadyToMerge.test.mjs covers the three parse forms plus the landed, gone and stale cases on a scratch repo.
- 2 "Servex routes, loopback only, one at a time, append the merged line" — yes — `local_only` guard; GET /api/ready-to-merge; POST /api/merge re-reads the rows and refuses branches that are off the list, stale, or have no worktree; it runs only `node Server/merge.mjs <worktree>`; a `this.merging` lock; the merged line goes through append.mjs (the `at: "NOW"` value is handled by LogLine.mjs:26). Note 4 applies.
- 2a "Merge only ever runs merge.mjs; a refusal is shown, not retried" — yes — mergeBranch spawns only merge.mjs (the test asserts it); the page writes `why` and `out` into `.rm-out` and makes no retry.
- 2b "Do NOT restart Servex; log needs restart" — yes — the shots show the route is not live yet (Failed to fetch), which is consistent with no restart.
- 3 "The page: one card per row, newest first, title link, what, review phrase, branch and sha, Merge button; empty list says 'Nothing waiting to merge.'" — yes (from the code) — ReadyToMerge.js `card()` draws each of these; the rows are sorted by `at`, newest first; the empty text matches word for word. Not shown in any shot (note 1).
- 3a "Linked from the AI dashboard head and ai/readme.md" — yes, with a caveat — ai/readme.md has the line; the dashboard link is in the foot, not the head (note 3).
- Docs "merge/readme.md, a line in ai/readme.md, a line in Server/readme.md" — yes — all three are in the diff; the merge readme covers what it is, the on-disk structure, who writes and who reads.

## Page structure
- page 1 (the title says what it is) — yes — shots/…/1200.png, top band: "Ready to merge"
- page 2 (one takeaway) — yes — a single list with a single action
- page 3 (it lives where a reader expects it) — yes — under AI, at /framework/ai/merge/
- page 4 (description) — yes — page.js `description` says what the page is
## Navigation
- page 13 — tabs (the AI tabs), a sidebar, a bottom rail at 400
- page 14 — yes — layout.json tab_rows 1 at 400 and at 1200
- active tab — no (note) — INBOX is highlighted on /merge/ (shots/…/1200.png, top band). The AI tab set has no merge entry; this is acceptable for a page reached from a link.
- persistent navigation is stable — yes — the sidebar and rail are the same at every width (sheet.png)
## Layout
- layout 1 (the layout fits the content) — yes — a measured column (44em), an auto-fit card grid for the rows (CSS); see note 5
- overflow_x — yes (none) — layout.json overflow_x false at every width
## Sizing
- the measure — yes — `--measure: 44em`; widest_text 472px at 1200 and 569px at 3440
- cards get a minimum width — yes — `minmax(min(100%, 24em), 1fr)`, so one column at 400
## Wrapping
- unwanted wraps — yes (none in the new code) — layout.json `wraps` lists only the shell's own buttons (drawer-rail-ai/menu, mode-btn), not rm-*
- long branch names and output — yes — overflow-wrap: anywhere on title, what, branch and output
## Spacing and padding
- text away from the edges — yes — layout.json left_stack p 40px at 400 and 61px at 1200 (rm-list 12/22 + page)
- the padding scales — yes — `clamp(0.6em, 3cqi, 1.5em)`
- band sizes — yes — title share 0.04–0.049, list 0.069–0.09; nothing is cramped
## Colour and contrast
- tokens only — yes — var(--line), var(--ok), var(--error); no raw colours
- the muted text is readable — yes — shots/…/1200.png, band 2: the grey error line reads clearly; `.rm-meta` uses opacity 0.75 at 0.82em, which is borderline but unseen in any shot (note 1)
## Flow
- read order — yes — each card runs title → what → meta → output → button, so the reader sees what they are merging before the action
- the button's states — yes — Merging… (disabled) → Merged/Refused, with the answer in the card; the button is disabled with a reason when the row is stale or has no worktree
## Words
- words 1 (plain, full sentences) — yes — "Nothing waiting to merge.", "No worktree holds this branch, so the button cannot merge it."; see note 2 for the error wording
- words 2 (no jargon without a gloss) — yes — "stale" is never shown; it is explained as "the branch moved after it was marked ready"
