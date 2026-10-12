# The laws — said more than once today

Fifteen rules below. Twelve were said two or more times today (the bar the owner set); three
(marked *once*) were said only once but are included because the owner listed them by name in the
closing brief, or because one clear sentence produced a whole afternoon's work. Four are not yet
written anywhere as a rule — only built as a feature, or still queued. Two are written in more
than one place; the "keep" column says which copy should survive.

| law, in the owner's words (shortest form) | said (today) | written now at | keep |
| --- | --- | --- | --- |
| "The layout should never jump." | 18:30, 18:47 (×2) | `.claude/skills/layout/SKILL.md` — "The layout never jumps" section | one copy |
| "click one, it stays selected, and a persistent page on the right" | 18:30, 18:47, and the owner's own opening line today | **not written** — only built (AI 2's per-card page, the board's URL-per-view) | needs a line in `layout/SKILL.md` beside "never jumps" |
| "iceberg content: primary things first... then links into the detail" | 15:10, 18:35, 19:01 (×3) | root `CLAUDE.md` ("Presentation" section) **and** this run's `common.md` | keep `CLAUDE.md`; `common.md` should link it, not restate it |
| "a lot of the reporting has been linked readme's... very hard to read" | 15:10 (*once* today; a standing rule before that) | `common.md` for this run; the general form lives in `documentation` and `finish-task` skills | keep the skills' copy; a run's `common.md` can link it |
| "make me little notes in this log here... I don't like you responding in the chat" | 17:44 (*once* — but every "Note:" card since follows it) | **not written** as a rule — only practiced, ~15 times since | write it into `common.md` or the mastermind skill |
| "I'm not going to actually click through approve on everything... a way to red flag" | 17:41, 17:44 (×2; a standing rule since 09-17) | `.claude/skills/mastermind/SKILL.md` — "Decide, don't ask" | one copy |
| "why aren't minions working on separate work trees" / "asking for worktrees for like a week" | 17:52, 17:56 (×2) | `common.md` for this run **and** `.claude/skills/minion/SKILL.md` — "Work in a worktree first" | keep `minion/SKILL.md`; `common.md` echoes it correctly (it names the same file) |
| "block reload, do the quick edit, turn it back on — reloads at most once" | 17:52, 17:56 (×2) | `minion/SKILL.md` — "The reload hold — seconds, never minutes", in these words | one copy |
| "my page didn't live reload... this is crazy and bad" (a hold blocked the owner's own save) | 17:52 (*once*) | `minion/SKILL.md` — "A hold names its fence" | one copy |
| "if it doesn't help me it shouldn't be there" (proof cards on the live board) | 19:57 (*once*; the mastermind found the same problem itself at 19:50) | `common.md` — "A proof never writes to the live board" | one copy |
| "the text butts against the sidebar with zero padding — make it a law of the whole system" | 18:09, 18:17 (×2) | `layout/SKILL.md` — "no text or framed box at x:0" (this invariant predates today; today's `layout-analysis` fixed the CODE that was breaking it, but did not add a line naming today's cause) | one copy; add the cause |
| "the mic should look on and a small level should bounce" | 18:09, 19:48 (×2) | **not written** — queued as `open-mic` item 9, not landed by day's end | — |
| "create a new card and talk to that card... everything created goes into that card" | 18:57, 19:48 (×2) | **not written** — queued as `open-mic` items 10-11, not landed | — |
| "I keep getting pop-ups in my face... this is crazy" (visible console windows) | 15:33, 18:02, 18:06, 18:15 (×4 — the most-repeated complaint of the day, three different causes) | `minion/SKILL.md` never-list (updated twice today) **and** `Server/`'s two spawn calls (`windowsHide`) | one copy in the skill; the code fix is the real answer |
| "let's be careful on tokens... use lesser minions" | 18:36, 19:11 (×2; a standing rule since 09-18) | `mastermind/SKILL.md` — "Aim about 20 points under the pace line" | one copy |

## Two the owner didn't name, found in today's log

- **"That's literally what routes are for"** (17:32, 17:35 — ×2). The URL should decide which
  board view is open, never a stored preference. Landed in `board-declutter` and `days-view`
  (every view now has its own address); not yet written as a general rule anywhere.
- **A card needs to say who wrote it.** Said once (19:11: "Items need an author"), but it reshaped
  `ai2-master-detail`'s whole data model (every row on AI 2 now carries an author). Worth watching
  for a second mention before writing it up as a law.

## What this says about the written rules

The rules that ARE written share one thing: they were said as a direct instruction to a skill
("write that into your layout laws") or they came out of a specific, named incident (the popup
windows, the global reload hold) that a skill file could describe exactly. The four **not written**
rows above are all still-forming: the mic's on-state and one-card-one-conversation are mid-build in
`open-mic`; "stay focused once clicked" and "notes, not chat" are both fully practiced today but
nobody has yet written the one sentence that names them, so the next minion who touches AI 2 or the
board has to re-derive them from the code rather than read them.
