# Approve / Improve on any page

Owner's brief, 2026-09-18, verbatim:

> being able to click and give you feedback on a specific item — for layouts and pages.
> Pages should be the essence of the layout system; each layout component can be a page,
> dynamic or real, and each could have these features built in so that I can respond to a
> specific page and ask for improvements or approve it, and it goes into an approved layout
> library. Then we refine that library and get nice, clean, robust layouts that the AI knows
> to lean on.

## What exists

- `/layouts/browse/` writes Approve / Improve verdicts for its 102 items to
  `public/layouts/verdicts.jsonl` through `rpc:append` — `public/layouts/browse/verdicts.js`
  is the seam; `item` is the browser's id.
- `ext/Ask`'s floating **?** (`mount()`) and `pick()`
  (`public/framework/ext/Ask/pick.js`, `Ask.js`) sit on any page that opts in.
- Reply-in-place landed today (`ext/Ask/doc/reply.md`) — a reply carries the item as context.
- The approved layouts page: `/imagine/design/layout/approved/`.

## Deliverables

1. **Approve / Improve on any page** — the floating control from `ext/Ask` gains two buttons
   (Improve takes a one-line note, and may open the reply box with the page as the item so the
   note reaches Claude the same way a reply does). A press appends a `verdict` line to
   `public/layouts/verdicts.jsonl` with `item` = the page's url (the browser's ids stay as they
   are; a page url and a browser id never collide — say why). Shown live on the control (a
   check or a pen) and on `/layouts/browse/` where that url is an item. Hidden when the edit
   switch is off — a sibling minion is building `app.edit` / `edit()` right now in
   `ai/2026-09-18/edit-mode/` — consume `available()` today and leave one line saying where the
   switch plugs in.
2. **The approved library** — `/imagine/design/layout/approved/` gains a live list under its
   five: every url with an `approve` as its latest verdict, drawn as a picture card where the
   browser has a shot for it and as a title link otherwise — the library the AI leans on. The
   layout skill's "approved set" line gets one clause pointing at it.
3. **Mount on the pages that are layouts by name** — `/layouts/practice/*` (three),
   `/layouts/shell/`, `/layouts/labs/*` — one `mount()` call each in their `page.js`.
4. **Prove headless** on the private server (`PORT=8137 node server.js`, background, killed by
   its real Windows PID): approve `/layouts/practice/workbench/` for real, see the mark on the
   control and on its browser card and in the approved list, then remove that line from
   `verdicts.jsonl` (the owner is the only writer). Zero console errors at 400 / 1280 / 3440 on
   three of the mounted pages.
5. **Docs** — `ext/Ask/readme.md` one line, `doc/decisions.md` there (the record; the
   alternative — a verdicts file per realm — and when it wins), the approved page's
   `decisions.md`, one clause in `.claude/skills/layout/SKILL.md`'s "The approved set is
   closed" bullet (the only `.claude/` write).

## Fence

`public/framework/ext/Ask/**`, `public/imagine/design/layout/approved/**`, the one `mount()`
line in each named `page.js`, one clause in the layout skill, this task dir. Nothing else —
not `/layouts/browse/` (read its seam; if the approved list needs its shots, read
`items.json`, do not edit it).

## Rules carried from the mastermind

- The owner's dev server on port 80 is running: never touch it.
- Never `git stash`, never `find /`, never drive the owner's tabs.
- An `rg` pattern starting with `/` returns nothing here (MSYS path rewrite) — drop the slash.
- Final report: one screen — the control in one line, the pages mounted (count), the approved
  list's count, the round trip proven, links, what was left.
