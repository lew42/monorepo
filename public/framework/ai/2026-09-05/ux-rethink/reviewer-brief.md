# UX reviewer — one realm, a second pass (Sonnet)

**Your realm is named in the message that spawned you.** Everywhere below, `<realm>` is that
one word — the directory `public/imagine/<realm>/`, the url `/imagine/<realm>/`.

Yesterday eighteen strangers opened these eighteen realms **cold** and asked one question: can
you say what this page is for in ten seconds? All eighteen pass that test now. **Do not redo
it.** Tonight is the second, harder pass, and it is the owner's own words:

> i want you to spawn ux minions to explore the imagine pages, and think again about what is
> this page? how do i use it? what is the goal of the page? how hard is it to understand? how
> could it be simpler, more visual, more intuitive, more explanatory, easier, better, etc..
>
> consider alternative layouts. if an alternative layout feels like it would work/look better,
> use it. try to improve these design systems (ui, ux, layout, etc)

The bar has moved from *"can a stranger name it"* to *"is this the best shape this page could
have?"* — and the owner has told you what to do when the answer is no: **use the better one.**

## Read first (in this order, and no further)

1. `public/framework/ai/2026-09-04/mastermind-platform/minion-rules.md` — the laws for every
   minion. Two of them decide most of your judgement calls: **clear beats brief, by far**, and
   **resolve, don't park**.
2. The repo's `CLAUDE.md`.
3. **Your realm's card from yesterday** — `grep -n 'slug: "<realm>"' -A 8 public/imagine/review/page.js`.
   Three sentences: what a stranger said, what the page meant, what got fixed. That is your
   starting line, not your finish line.
4. Skills: `new-task` (first), then `layout` and `css` before you touch a size or a rule,
   `new-page` if you add one, `ui-test` to prove the interaction, `finish-task` to land.

Do not read the whole repo. Your realm's `page.js`, its `readme.md`, its children's `page.js`,
and the two docs named below are enough.

## Your task dir and your log

`public/framework/ai/2026-09-05/ux-<realm>/` — create it with the `new-task` skill, group
**`review`**, `task.jsonl` inside it, one appended line in
`public/framework/ai/2026-09-05/day.jsonl`. Findings are `log` lines in your `task.jsonl`,
never a `findings.md`. Timestamps come from `date -Iseconds`, read again immediately before
every single append.

## The server — one is already running, do not start another unless you must

**`http://localhost:8110/`** is a private dev server the manager started for all eighteen of
you. Use it for every screenshot and every `ui-test` run. **Do not kill it** — it is not yours,
and seventeen other reviewers are on it.

If it stops answering (`curl -s -o /dev/null -w "%{http_code}" http://localhost:8110/imagine/`
is not `200`), start your own on a free port between 8120 and 8180 — `PORT=8123 node server.js`
from the repo root, checking `netstat -ano | grep LISTENING | grep ":812"` first — and **kill
that pid when you land**. Never port 80. Never the owner's browser.

---

# The five steps

## 1. The five sentences — write them before you touch anything

In your `task.jsonl`, as a `log` line, five plain sentences about **`/imagine/<realm>/`, the
realm's landing page**. Open it, look at it, click the first thing a reader would click, then
answer:

- **What is this page?** One sentence a stranger would recognise.
- **How do I use it?** The actual first gesture — what do I click, drag, read, or type?
- **What is its goal?** What is the reader supposed to leave with?
- **How hard is it to understand, 1–5, and why?** 1 is obvious at a glance; 5 needs the author
  beside you. Give the reason, not just the number.
- **How could it be simpler, more visual, more intuitive, easier, better?** This is the one
  that becomes your work list. Be specific — "the four paragraphs above the fold should be one
  sentence and a picture of the thing" beats "clearer copy".

You will write these five again at the end, about the page **after** your changes. Both sets go
in your final report. If the "after" set is not visibly better than the "before" set, you have
not finished.

## 2. Try an alternative layout — for real, and keep it if it wins

This is the step the owner asked for by name, and the one most likely to be dodged. **You are
required to actually build one**, not to consider one and decide the current shape is fine.
Build it on the realm's **landing page**.

Pick the alternative from one of these three:

- **The approved five** — `/imagine/design/layout/approved/`
  (`public/imagine/design/layout/approved/page.js`): rail + content, docs three-region, columns
  row, tile wall, solo. Read it; each entry says when to reach for it.
- **The 3-column card**, from the owner's brief tonight, verbatim: *"large (3440?) cards. they
  can be any height... the card has 3 columns: the center column is a card itself, a demo,
  responsive viewport, or a section or layout, or whatever... and on the left we have a small
  title + intro and maybe some controls. on the right, we have some readouts, metrics,
  feedback, config, etc."* When a realm's landing page is a row of demos with numbers attached,
  this is very often the better shape — and if you use it, **multiple cards on one page must be
  related, so scrolling from one to the next shows the relation.**
- **A surface change from the paging vocabulary** — `/imagine/paging/` — where what changes is
  how a click moves you (launch, expand, swap, takeover) rather than how the boxes are stacked.
  The owner's note tonight: *"any time a click triggers a massive shift, it's more for the
  brain to process... if a click/navigation can result in a subtle shift, or a clearly defined
  (visually evident) area swaps content, then it's much easier to process."*

**Then measure, honestly.** Shoot the page at **1280** and **3440** before you change anything,
change it, shoot it again, and compare on:

- **Width used** — the right edge of the widest real content ÷ viewport width, at 3440.
- **Dead space** — the biggest empty horizontal band at 3440, in px.
- **Page height** at 3440 (a page that got shorter without losing anything got better).
- **The three invariants** (the `layout` skill): no content at `x: 0`; no line of prose past the
  measure (~40em); no framed box — card, figure, table — touching a container edge. `bleed` is
  for paint only.
- **The five sentences, read again.** Numbers are not the whole verdict. A layout that measures
  better and reads worse loses.

**Keep it if it wins on both; revert it if it does not, and write the reason in your log.**
"Reverted" with a real measured reason is a complete, respectable result — it is evidence the
current shape is right, which is worth as much as a change. "I did not try one" is a failure.

A measurement recipe that works (adapt it; `.active-page` is the page you are looking at):

```js
// as a ui-test `eval` step, or inside your own Playwright script
(() => {
  const root = document.querySelector(".page.active-page") ?? document.body;
  const boxes = [...root.querySelectorAll("*")].map(el => el.getBoundingClientRect())
    .filter(r => r.width > 8 && r.height > 8);
  return { right: Math.max(...boxes.map(r => r.right)),
           left: Math.min(...boxes.map(r => r.left)),
           height: document.documentElement.scrollHeight,
           viewport: innerWidth };
})()
```

### Known already — do not spend tokens re-deriving these

Three reviewers found each of these independently in round 1. They are true, they are
site-wide, and they are **not your realm's finding**:

- **The ~1,856px empty band on the right at 3440 is the columns row**, not your page. Every
  realm's landing page sits in a Finder-style columns host whose `large` width word caps a
  column near 64em; the leftover is held for a sibling column to open into. It does not move
  when you change your page, and **widening the column is not the fix** — `fill` was tried and
  reverted twice (2026-08-31, 2026-09-04) because it starves a page opened beneath it. So
  "width used" at 3440 will read around 46% on most realms before *and* after. Report it, then
  judge your layout on **page height, the invariants, and the five sentences**.
- **The document's `scrollHeight` at 3440 is pinned to the viewport** by that same columns
  shell. Measure your column's own body height (`.page.active-page`'s rect), not the document's.
- **A `doc/*.md` link ends in a file extension and the router will not intercept it** — the
  click leaves the app onto raw markdown. Six realms had this yesterday. If you meet one, just
  fix it; it is not worth a paragraph.

## 3. Make it more visual

Wherever a paragraph *explains* something the page could simply *show*, show it: the thing
itself, a picture of it, or a live miniature. The pattern to copy is the four worked examples on
the paging hub (`/imagine/paging/`). Wherever a list of links could be cards with a still image
or a real miniature in them, make them cards. This is not decoration — it is the owner's
"more visual, more intuitive" turned into an edit.

Two rules that bite here: a preview is **a picture, never a live instance**, and a card wall is
`.grid.auto` with a real `--column` between 14em and 22em so 3440 gets four or more tracks.

## 4. The persistence rule — if your realm remembers anything

**Demos never persist silently.** The rule and the audit of every persisting page under
`/imagine/` are landed at `public/imagine/paging/doc/persistence.md`; the shared piece is
`public/imagine/paging/baseline.js`. Two lines:

```js
import { baseline } from "/imagine/paging/baseline.js";

content(){
    baseline(this);   // draws nothing at baseline; an amber mark + Reset once anything is saved
    …
}
```

Find out whether your realm persists: `grep -rn "store()\|localStorage" public/imagine/<realm>/`.
If it does and the mark is not there yet, add it — one import, one line. If your realm keeps
something **on purpose** (a board, a run, a page the reader made), pass
`saved: () => "Saved in this browser"` so the mark is green rather than amber. If your realm
persists nothing, say "none" in your report; that is a complete answer.

## 5. Resolve, prove, land

- **Fix inside your realm.** Anything you need from `core/` or `ext/` is a **written proposal
  with the actual diff** in your log — not an edit. Nine of yesterday's fourteen proposals died
  as one-liners nobody could apply; yours should be applicable by copy-paste.
- **Prove the primary interaction** with the `ui-test` skill after your change — the one gesture
  the page exists for. A gesture you cannot see is a gesture you have not tested.
- **Zero console errors** at 1280 and 3440 on the pages you touched. Check, don't assume.
- **Land with `finish-task`**: the landing line's `outcome` carries the five sentences (after),
  kept-or-reverted with the reason, and the fixed/proposed lists; `links` carries every
  deliverable and every shot.

## Your shots — exact paths, because the manager's page loads them by url

Save four jpgs (quality ~80, not pngs — the review page loads eighteen realms' worth):

```
public/framework/ai/2026-09-05/ux-<realm>/shots/before-1280.jpg
public/framework/ai/2026-09-05/ux-<realm>/shots/after-1280.jpg
public/framework/ai/2026-09-05/ux-<realm>/shots/before-3440.jpg
public/framework/ai/2026-09-05/ux-<realm>/shots/after-3440.jpg
```

Full-page shots of `http://localhost:8110/imagine/<realm>/`. **Take the "before" pair first,
before your first edit** — you cannot go back for it, and there is no `git stash` here.
If you reverted the layout, `after-*` is still required (it shows the visual and copy work you
kept). Playwright is a global install; the only import form that works is
`import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";`
and bash scripts need `MSYS_NO_PATHCONV=1` or Git Bash rewrites `/imagine/x/` into a Windows path.

## Fences — the hard edges

- **Write only** in `public/imagine/<realm>/` and `public/framework/ai/2026-09-05/ux-<realm>/`,
  plus your one appended line in `public/framework/ai/2026-09-05/day.jsonl`. Seventeen other
  reviewers and several other tasks are editing this tree right now.
- **Never** `git stash`, `git checkout --`, `git reset`, `git commit`, `git push`. Diff, never
  stash. The manager commits.
- **Never** `find /` or any search outside the repo. Two orphaned root scans burned a core for
  hours each.
- **Never spawn a sub-agent.** Its completion would route somewhere that is not you and you
  would wait forever. Do the digging yourself.
- **Never** touch port 80, the owner's browser tabs, or another realm's files.
- Scratch scripts go in the session scratchpad under `ux-<realm>/` — never in the repo, and
  never a bare `probe.mjs` (a sibling will overwrite it mid-run).
- One line in a skill's `improvements.md` if a skill misled you (`skill-improvement`) —
  mandatory when it happened, forbidden when it did not.

## Budget

**~180k tokens.** Yesterday's cold reads ran 172k each, and this pass has more building in it,
so spend on the build and the measurement, not on reading the repo. If you are at 150k and the
alternative layout is half-built, finish it and cut the polish.

---

# Report back in exactly this shape

Your final message is harvested verbatim into `/imagine/review/rethink/`, one card per realm.
Write it for a stranger reading that page, in full plain sentences — not notes.

```
REALM: <realm>

FIVE SENTENCES (after the change)
what:  <one sentence>
use:   <one sentence>
goal:  <one sentence>
hard:  <n>/5 — <the reason>
better:<one sentence: what would make it better still>

BEFORE, IN ONE SENTENCE: <what the landing page was, and its worst problem>

LAYOUT: kept | reverted
tried:  <which alternative, one clause>
why:    <one or two sentences — the honest reason, including the numbers that decided it>

NUMBERS (3440 unless said)
width used:  <before>% -> <after>%
dead space:  <before>px -> <after>px
page height: <before>px -> <after>px
invariants:  <pass/fail on each of the three>

VISUAL: <one sentence: what stopped being a paragraph and became a thing you can see>

PERSISTENCE: none | <what it remembers, and what mark it now shows>

FIXED (<n>): <one line each>
PROPOSED (<n>): <one line each, each with the file it patches>

UI-TEST: <the gesture proved, and the result>
CONSOLE: <errors at 1280 and 3440>
SHOTS: /framework/ai/2026-09-05/ux-<realm>/shots/{before,after}-{1280,3440}.jpg
LOG: /framework/ai/2026-09-05/ux-<realm>/
TOKENS: <n>
```
