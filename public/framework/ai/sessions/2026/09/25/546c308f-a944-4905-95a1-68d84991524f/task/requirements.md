# AI 2: the resurfacing bar

Load the `minion` skill first, then the `code` skill.

## The owner's ask (card `2026/09/25/inbox-show-what-changed-when-a-card-resu`)

Read the card's whole conversation first: `public/framework/ai/2026/09/25/inbox-show-what-changed-when-a-card-resu/page.jsonl`
and the handover in `public/framework/ai2/readme.md` (its "Open, first" item).

The brief as handed to the lead: when a card or group jumps to the top of the rail, its row shows a
one-line bar saying what happened, in plain words, taken from the newest line that bumped it.
Clicking the bar opens that card's Activity tab (routed, with its own URL), not Overview, with the
new events marked. It clears once seen (localStorage, wrapped in try/catch).

## Deliverables

1. **The bar.** A rail row (a card row in `faces.js`, a group row in `page.js` `group_face`) whose
   newest line is newer than the last time that card was seen shows one line under its preview:
   who + what happened, in plain words (e.g. "the AI 2 lead: Taken. I am the new AI 2 lead…"),
   from the newest line that bumped it. One line, ellipsis if long. No bar when nothing is new.
2. **The Activity tab.** A card's tabs become Overview · Tasks · Activity (Activity always shown
   on a top-level card). Activity lists the card's lines (messages, files, tasks landing — whatever
   the card and, for a group, its members already expose), newest first, each with its time.
   Events newer than the last-seen time are marked (a left accent + "new").
3. **Routed.** The Activity tab has its own URL — e.g. `…/<card id>/#tab=activity` or the
   existing tiny-tabs `#tab=` convention in `card.js` (see `tiny()`, line ~349). Reload and Back land on
   it. Clicking the bar navigates there, not to Overview. Overview/Tasks should use the same
   routing if it costs little.
4. **Clears once seen.** Opening Activity stores the card's newest time in localStorage
   (`ai2-seen:<card id>`); every read/write in try/catch; the page works with storage throwing.
   After that the bar disappears from the row, until a newer line arrives.

## Fence

Write only in: `public/framework/ai2/faces.js`, `page.js`, `card.js`, `inbox.js`, `groups.js`,
`ai2.css`, a new `public/framework/ai2/activity.js` if you want one, and
`public/framework/ai2/readme.md` + `doc/cards.md` (a line each). Nothing else.
Other agents are touching AI 2 in the main tree: manager-now is making the Now card tabbed, and
content-ui put concept tiles on System design. Keep your diff small and local; don't reformat.

## Where

Work ONLY in the worktree `C:\Code\lew42\worktrees\ai2-resurface` (branch `worktree/ai2-resurface`),
its server at http://localhost:57505/ . Never edit `C:\Code\lew42\monorepo`. Commit in the worktree
when done (end the message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`).
Note: the card data (page.jsonl files) in the worktree is a snapshot; Servex (port 8090) reads the
main tree, so `cards_ready()` may make the rail read board.jsonl — make it work either way.
New CSS class names use the `ai2-` prefix. Every CSS rule inside a layer. No DOM after an await.
Any process you start: `windowsHide: true`; never show a window.

## Proof before you report

Headless Playwright (script in the scratchpad
`C:\Users\mike\AppData\Local\Temp\claude\C--Code-lew42-monorepo\546c308f-a944-4905-95a1-68d84991524f\scratchpad`,
named `ai2r-*.mjs`), at 1920x1080, against http://localhost:57505:
- `/framework/ai2/`, one card, one group: zero console errors, zero failed requests.
- Shot 1: the rail with a bar showing (clear storage first). Shot 2: after clicking the bar —
  the Activity tab, URL printed, new events marked. Shot 3: back on the rail, that bar gone.
- Reload on the Activity URL lands on Activity.
Save the shots in `public/framework/ai/2026-09-25/ai2-resurface-bar/` in the WORKTREE.

Report back: the commit hash, the three shot paths, the URLs, and anything you could not do.
