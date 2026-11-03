# Session switcher in the dictate widget (also the mobile sheet)

Item 4 of [dictation-debug/handoff.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/handoff.md) (commit 2977943e5), asked 2026-10-25 in voice session [v-9dvbbrn](/framework/ai/sessions/2026/10/25/v-9dvbbrn/), relayed by session-smart-v-9dvbbrn. Build only this item.

## The owner's asks

- [x] One control instead of the "New session" button: a dropdown of recent sessions to switch to, and a plus to start a new one. Proof: `session_switcher` in `ux/Dictate/chat.js`, used by the drawer tab and the phone sheet.
- [x] Short label per entry. Proof: `row.title ?? "Session " + row.session`, with the time ago in parentheses.
- [x] Plus placement, round 2 (2026-10-25, live testing): dropdown first, a bare "+" to its right with no words — its accessible name is `title`/`aria-label`, both "New session". Proof: `session_switcher`'s button order in `chat.js`.
- [x] Titles come from each session's `index.json` / `session.summary.json`, via `Session.recent_project()`.

## Round 2: the dropdown reflowed the page (owner, live testing, 2026-10-25)

The first landed version (round 1, below) used a plain `<div>` sibling for the list, in normal
flow: opening it with many rows pushed the title, chips and v2 strip down the page — the owner's
words, "doesn't work properly... a huge list... completely breaks the UI", and on the desktop
drawer specifically "the AI title dropdown ends up vertically centered on the page". The owner
also asked to reuse an existing dropdown component rather than hand-roll another, to cap the list
height with its own scroll, to keep title + time-ago as one compact line (not a card), and to make
sure it is not clipped by `overflow` on the sheet/drawer and closes on outside click or Escape.

**Fix:** `session_switcher()` now opens `ux/Popover`'s `menu()` — the browser's own top-layer
`[popover]`, not `position: absolute` — so it floats over the header instead of reflowing it, and
is never clipped by an ancestor's `overflow: hidden/auto`. Close-on-outside-click and Escape are
the browser's own popover behavior, free. `.ux-popover`'s existing stylesheet already caps the box
at `min(60vh, 22em)` with its own scrollbar, so a long list scrolls in place; rows are a single
line, `title (time ago)`, via `.ux-popover-item`'s existing styling — no card, no padding added.
Proof: `review/shots/` (closed and open, 400px sheet and 1200px drawer, header position unchanged
before/after open, 15-row fake list scrolling inside the popover, zero console errors) — built
with `.claude/scratch/test-switcher.mjs` (not committed; a throwaway Playwright probe that fakes
`GET /api/sessions` with 15 rows and the worktree's own `host`, since neither host had enough real
session history to show a non-empty dropdown).

## What exists already (past-work)

`ext/drawer/tabs/ai.js` (the desktop drawer's AI tab) already had its own hand-rolled "+ New session" + "Switch session ▾" + list, built 2026-10-02. The phone sheet's head (`ext/drawer/Sheet.js`) had only the bare New session button — the confirmed gap, and the one the owner actually hit (the voice session's `host` field is a phone IP).

## What was built

```
ux/Dictate/chat.js        session_switcher(mount, opts): the one shared control (keep: true mounts only)
                           — ux/Popover's menu() for the dropdown, a bare "+" beside it
ext/drawer/tabs/ai.js     calls it (its own copy removed)
ext/drawer/Sheet.js       phone sheet head calls it
ext/drawer/drawer.css     styles .drawer and .drawer-rail-sheet together; dead in-flow-list rules removed
ux/Dictate/page.js        unchanged: private demo keeps new_session_button()
```

Worktree `worktree/session-switcher`, reviewed (`Server/review.mjs`) twice (round 1: `fix`, 4
findings fixed; round 2, this popover rewrite: `fix`, 3 findings fixed — stale requirements/docs,
no visual proof, a popover that could close mid-read), landed via `Server/merge.mjs`.

## Outcome

Landed. Round 1 commits `df173833f` + `56738425b` (merge `28c6d4a4b`); round 2 (this rewrite,
dropdown-first + top-layer popover) commit `ab44c412c` plus the review-answer fixes above, merged
via `Server/merge.mjs`. Verified live at 400px (phone sheet) and 1200px/2200px (drawer).
