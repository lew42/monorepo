# AI 2 Inbox: six fixes — minion brief

Load the `minion` skill first. Your task dir: `public/framework/ai/2026-09-30/ai2-inbox-read/minion-ai2-inbox/`.
Parent task: `public/framework/ai/2026-09-30/ai2-inbox-read/`. Read its `requirements.md` and
`owner-words.md` (the owner's raw dictation) before you start — this brief is the breakdown, not
a replacement for the owner's own words.

**Fence: `public/framework/ai2/**` only.** Don't touch other modules. Work in the worktree path
your parent gives you when it messages you (it will paste the path); if none is given yet, wait —
don't improvise your own worktree.

## ⚠ OWNER UPDATE, 2026-09-30, read this before #1

Original ask 1 said "hide the Needs you tab." The owner has since corrected that: **make "Needs
you" a FILTER chip inside the Inbox list, not a hidden tab with its own UI.** Do #1 below, not the
old version. Also: a later task (`ai/2026-09-30/inbox-ext`) moves this Inbox to `/framework/ai/`
and gives the Log tab the same UI, so **keep the read-state, archive and resolution rules (asks
2, 3, 4) together in ONE small module** so that later task can carry them over wholesale — see the
note at the end of #2. Usage is over pace, so keep every change to the smallest diff that does the
job; don't refactor anything beyond what's asked.

### 1. "Needs you" becomes a filter chip in the Inbox list — not a separate tab
Good news: most of this already exists. `public/framework/ai2/page.js` already has a "Needs
review" checkbox in the rail's chrome row (~line 316-329, `label.c("ai2-review …")`) that filters
the SAME rows the Needs you tab lists (`needs_ids`, from the shared `watch_needs()` scan) — that
IS the filter chip the owner is asking for, just under the wrong label and wrong visual form.

- Relabel it "Needs you" (the `span("Needs review")` at ~line 328 → `span("Needs you")`), and give
  it the small count badge the tab currently carries (`$needs_badge`, built at ~line 89 in the
  tab strip) instead of the tab having it — move that badge onto this checkbox/chip instead of
  the tab link.
- Style it as a chip (a small toggle pill), not a bare checkbox+label, if `ai2.css` already has a
  chip/pill pattern elsewhere (search for `.ai2-chip` — `faces.js` already uses `.ai2-chip` for
  name tags) — reuse that class rather than inventing a new visual.
- Remove the "Needs you" tab from the strip entirely: in `page.js`'s tab strip (~line 83-90),
  delete the `a.c("tab ai2-tab-needs")…` block (the chip above replaces it — this is not "hide
  with CSS" any more, the owner wants the separate tab UI actually gone, the functionality folded
  into the list instead). **Keep the route** — `needs_page()` (~line 172-179) and `route(id ===
  "needs")` (~line 113) stay, so `/framework/ai2/needs/` still resolves for an old bookmark — just
  nothing in the visible chrome links to it any more. Don't delete `needs.js` or `needs-rule.js`.

### 2. Read / unread, per viewer, localStorage v1
Right now `public/framework/ai2/inbox.js`, inside `items()` (~line 657-663), ALWAYS sets
`it.unread = true` for every row, on purpose (a 2026-09-22 decision to never auto-mark read,
documented in a comment right above it). That decision is superseded now — the owner wants basic
inbox behavior back: bold/different while unread, and opening a row marks it read, remembered
per browser (localStorage, v1 — no server round-trip needed).

- **Make ONE new file, `public/framework/ai2/rules.js`** — this holds asks 2, 3 and 4 together
  (read state, archive, automatic resolution), because a later task moves this Inbox elsewhere and
  needs to carry these three rules over as one small module, not scattered across `inbox.js`,
  `card.js` and `page.js`. Put `is_read(id)` / `mark_read(id)` in it first, backed by ONE
  `localStorage` key (e.g. `ai2-read-ids`, a JSON array — wrap every access in try/catch like
  `store` does in `page.js` around line 139-143, so a private window or blocked storage never
  throws). Import both into `inbox.js`.
- In `inbox.js`'s `items()`, change `it.unread = true;` to `it.unread = !is_read(it.id);` (keep
  everything else on that line/loop the same).
- Mark a row read the moment its card actually opens: in `public/framework/ai2/card.js`,
  `activated()` (~line 1038), call `mark_read(this.id)` — but only for a real top-level card with
  a real id (skip the Live card, `LIVE`, which is never "read" in this sense — check `id ===
  "live"` isn't the case, or just guard on `this.tabbed()`). After marking, redraw the rail so the
  dot/bold clears without a reload — the existing `this.shell?.ai2?.cards_changed?.()` pattern or
  a plain `this.shell?.ai2?.repaint?.()` call (see `page.js`'s returned object, ~line 864) does
  that; call it once, after `mark_read`.
- CSS: `.ai2-row.ai2-unread .ai2-dot` already exists in `ai2.css` (~line 429) — add a sibling rule
  so the TITLE is visibly different too, e.g. `.ai2-row.ai2-unread .ai2-row-title { font-weight:
  700 }` (check the existing font-weight tokens used nearby in `ai2.css` and match the codebase's
  own weight scale rather than inventing a raw number if a variable exists).
- Leave the "never auto-mark via viewing alone in the old board sense" comment in inbox.js
  updated, not deleted — note that this is a NEW, opt-in, per-viewer localStorage rule, not the
  old auto-mark-on-read behavior the 2026-09-22 note was about (that was about a shared
  `verdicts.jsonl` `read` line marking it for EVERYONE; this is local-only).

### 3. Archive button on every row — nothing is ever deleted
A card's own page already has an "Archive this card" menu action (`card.js` `actions()`, ~line
668, and `clear()` ~line 874) and `page.js`'s `card_page()` already wires `on.clear` for the old
board-style pages. What's missing is a button ON THE ROW ITSELF, so archiving doesn't require
opening the card first.

- In `public/framework/ai2/rules.js` (the same new file from #2), add one exported helper that
  archives either kind of id correctly (a folder card id vs an old board id) — import
  `is_folder_id`, `append_card` and `archive_card` from `inbox.js`:
  ```js
  export async function archive_row(id){
      return is_folder_id(id) ? append_card(id, { status: "archived" }) : archive_card(id);
  }
  ```
- In `public/framework/ai2/faces.js`, `row(it)` (~line 40): add a small button beside the existing
  head row (near the dot/icon/title/when), e.g. `.ai2-row-archive`, title "archive — nothing is
  deleted", that on click calls `archive_row(it.id)` then refreshes. `row()` doesn't currently
  take a refresh callback — add one: `export function row(it, on){ ... if (on?.archive) button...
  .click(e => { e.preventDefault(); e.stopPropagation(); on.archive(it.id); }); }`. Stop
  propagation matters: the row is an `<a>` (`page.js` `make()`), and a click on the button must
  not also navigate to the card.
- Wire it from `public/framework/ai2/page.js`'s `refill()` (~line 754) and `make()` (~line 745):
  pass `{ archive: id => { archive_row(id).then(() => folders.soon()); } }` as `row`'s second
  argument. `folders` is already in scope inside `board()`.
- Don't add this button to `group_face()` or page rows — only plain card/prompt/landed rows (what
  `row()` already draws). A group or a real site page isn't a single archivable thing.

### 4. Automatic resolution — write the rule down in ONE comment
"A row leaves the Inbox by itself when it's resolved" — the owner named four cases: an ask
answered (a `chose` line), a question replied to, a task landed or stopped, a card marked done.

- Add ONE pure function to `public/framework/ai2/rules.js` (the same file from #2/#3), with a
  comment block laying out the rule plainly (model it on the comment style already in
  `needs-rule.js` — read that file first, it is the closest prior art: it already knows how to
  tell "this card has an open ask" from raw lines). Something like:
  ```js
  /** AUTOMATIC RESOLUTION (the owner, 2026-09-30): a row leaves the Inbox by itself, with
   *  nothing deleted, once it is resolved — any ONE of:
   *    1. a task attached to it landed or stopped (it.task?.state is "landed" or "stopped",
   *       or it.landed is set for a "landed" kind row);
   *    2. its card's status is "done" (checked the same way DONE works elsewhere — see card.js's
   *       own DONE set for the words that count);
   *    3. it was a question or decision ask that has since been answered — reuse
   *       `needs-rule.js`'s own `card_needs()` where the row already carries raw lines; a row
   *       with nothing open there and a `chose`/`answer` line present counts as resolved.
   *  A row that was never an ask at all (a plain note, a topic stub) is NEVER auto-resolved —
   *  only resolve what was something to resolve.
   */
  export function is_resolved(it){ ... }
  ```
  Use whatever fields `it` already carries in `items()`'s output (`task`, `landed`, `status` if
  present) — you do not need to re-fetch anything. If a case needs raw lines `items()` doesn't
  carry today, resolving to the SIMPLEST version that covers the four owner cases from what's
  already there is fine; note in a `log` line in your own task.jsonl anything you deliberately left
  simpler, with why.
- Apply it in `items()` (or right after, in `page.js`'s `visible()`/`paint()` — your call, pick
  whichever is the smaller diff) so a resolved row is filtered OUT of the main Inbox list the same
  way an archived one already is — but keep it a SEPARATE concept from archived (don't set
  `status: "archived"` on it — it's just not shown in Inbox any more; it still shows wherever the
  card/task/log itself already shows, same as the owner's words: "it can happen automatically").

### 5. Search — one box, cards and rows, including archived, by title and text
- In `public/framework/ai2/page.js`, in the rail's `ai2-top` chrome row (~line 297-342, beside "+
  New card" and the two checkboxes), add a plain text `input()` with a placeholder like "Search
  cards…", class `ai2-search`.
- Keep its value in a local variable (like `review_only`, `only_notes` just above it) and put it
  in the URL too (`?q=`) the same way `review_only` uses `?review=1` (~line 320-326), so a reload
  keeps the search.
- Filter: extend `visible()` (~line 462-476) with one more `.filter()` step when the query is
  non-empty, matching case-insensitively against `it.title` and `it.text` (fall back to
  `it.said?.join(" ")` and `it.landed` too, if present — search should find what the row actually
  shows). When the query is non-empty, IGNORE the `show_archived` toggle and always search archived
  rows too (`list.archived`) — the owner's words were explicit: "find any card or row, including
  archived ones". The simplest correct shape: when `query` is set, `visible()` returns matches from
  `[...pool, ...(list.archived ?? [])]` instead of respecting `show_archived`; when `query` is
  empty, behave exactly as today.
- Debounce isn't required for v1 — a plain `input` event calling `relist()` (already defined,
  ~line 478) is fine; the list is already small.

### 6. The Now card's redundant wording
`public/framework/ai2/live.js`:
- Line ~152-153, `running()`: the `line` field currently reads
  `(KNOWN[a.id]?.[1] ?? ROLES[a.role] ?? "working") + " — now"`. Drop the `+ " — now"` — the
  heading right above the list already says "Running now" (`live_full`, ~line 303), so every row
  repeating "— now" is the redundant part the owner named. Also: when the fallback word would just
  be `"working"` (no specific `KNOWN`/`ROLES` text), and the row's own state badge (`sub_full`/the
  `span.c("ai2-live-state ...")` at ~line 283) ALREADY reads "working" — don't print the word
  twice on the same row. Simplest fix matching the owner's own sentence ("say it once: the heading
  says it, and the rows just name the agent and what it's doing"): change the fallback from
  `"working"` to `""` (empty) when there is no more specific role text, since the state badge
  already shows "working" — only show `line` when it says something the badge doesn't.
- Re-read your diff against the owner's exact sentence once done: "Running now" (said once, in the
  heading) → then each row just names the agent + what it's doing, with no "· now" appended
  anywhere.

## What "done" looks like — prove each one
For every one of the six, take one screenshot (headless, `ui-test` skill or a quick Playwright
script — never the owner's live tabs) showing it working at 1920: the Inbox rail with at least one
unread (bold) and one read row, the archive button visible on a row, the search box with a result,
the Now/Live card's rows without "— now"/double "working", and the tab strip with only Inbox · Log
· Overview showing (Needs you gone from the strip but `/framework/ai2/needs/` still loads if you
hit it directly).

## Rules
- Commit early and often inside the worktree (the pool can be reclaimed if idle with nothing
  committed).
- Don't run `node Server/merge.mjs` yourself — your parent (task-mastermind-ai2-inbox-read) does
  the smoke test and merge. When you're done, log what you built and where, and say so; don't stop
  the worktree server yourself either.
- Log your work in `task.jsonl` in YOUR task dir as you go (steps, one `decision` per fork, one
  `log` per caveat) — the parent reads this log, not a chat summary.
- Budget: this is the only minion on an $8 hard task budget. Work efficiently — six focused edits
  across `inbox.js`, `page.js`, `card.js`, `faces.js`, `live.js`, `ai2.css`. Don't refactor anything
  you don't have to touch.
