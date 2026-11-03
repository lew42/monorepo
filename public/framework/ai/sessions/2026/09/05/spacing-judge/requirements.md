# spacing-judge — you decide, and you apply it (Fable)

You are **the owner's stand-in today**. Four auditors measured 92 pages at five widths and
found 9,177 things; a manager ranked them. **Nobody else will rule on this.** Decide, write it
down where a reader is, apply it, and keep the alternatives visible.

## Read first, in this order

1. `c:/Code/lew42/monorepo/CLAUDE.md` — the three laws. Law 2 is the one that binds you: clarity
   beats brevity, new coders are the audience.
2. `../2026-09-04/mastermind-platform/minion-rules.md` — the never-list. It applies to you.
3. **`../spacing-audit/ranked.md`** — the ranked list. This is your evidence. Its companion
   `../spacing-audit/ranked.json` has all 60 clusters and every page's growth number.
4. `../mastermind-day/requirements.md` — **decision 1 is your direction, not your number**:
   *"Every spacing token's ceiling roughly doubles at the widest screens; nothing changes at 1280
   (the clamps' minimums stay); in between it scales."* You set the exact numbers.
5. The night's work you are ruling on: `/imagine/design/spacing/page.js` (the study) and
   `/imagine/design/spacing/ceilings/page.js` (three candidate ceilings — 1× / 1.5× / 2× — shot
   on cms, paging and stream at 3440, medians 23.67 / 35.52 / 47.36px). **Read the ceilings page's
   own warning: raising only a clamp's literal max is a no-op at 3440, because the preferred
   branch already sits under the cap. The whole clamp has to move.**
6. Skills: `new-task` (this dir, group `design`), `layout`, `css` (read `framework.css`'s spacing
   section before you touch it), `documentation`, `finish-task`.

## The owner's words

> take more screenshots at 3440. our UI is ok.. it's functional, but it's not clean, simple, user
> friendly. i asked you to fix the visual flow, let things breath, and it's ALL TOO CRAMPED. …
> question the spacing between everything … in most cases, we want a few useful levels. I saw on
> one (templates?) page, a very subtle (hardly noticeable) difference in spacing from cramped, to a
> little less cramped, to "display"? Anyway, we want small ui for some things, but we need the
> padding and spacing to grow and breath at 3440. i'm looking at these "top, left, right, bottom"
> link buttons on the toolbars page, and they're 981px wide, with about 50px padding on either
> side. the buttons have about 100px of icon/text, and a massive strip of empty. in a balanced
> design, the padding would be more like 100px?

## The four rulings

**(a) The spacing scale at 3440.** Exact new values for `--pad-default` and `--gap-default`
(`framework.css` `:root`), `--flow` (`framework.css`, currently a flat `2em` on `:where(.flow)`),
the column pads `--page-column-pad-x` / `--page-column-pad-y` (`core/Page/Page.css:188–189`), and
the section gap. Constraints: **unchanged at ≤1280** (the floors stay), **about 2× at 3440**,
smooth in between. Say in one line, per token, what it reads at 1280 and at 3440.

**(b) The few useful levels.** Three words — `tight` · `regular` · `airy`, or better ones — each
**visibly different to a newcomer**. The existing three (`compact`/`regular`/`display`,
`templates.css:25–27`) are `0.88 : 1 : 1.06` and move **type only**; the owner called them "hardly
noticeable" and was right. Set ratios someone can see (the manager's suggestion, not a rule:
about `1 : 1.6 : 2.6`), say **where each is used** (a dense rail vs. a page vs. a cover), and make
them real: one class each, one declaration each, retuning the tokens from (a). Decide whether they
replace, rename, or sit beside the type ramp — and say why in one line.

**(c) The control rule.** One paragraph a newcomer can follow. The manager's draft, which you may
adopt, sharpen or reject: *a chip, a button or a link-card hugs its content, with about 1em of
side padding, and never stretches into a strip; a strip of buttons is a `flex wrap gap` row, never
a grid of full-width cells.* You must also close **U2 in the ranked list**: the rule needs an
explicit exception for **inline text links**, which correctly have no padding — without it, 4,419
of the 9,177 findings are noise. And close **U3**: say what may legitimately touch (`li`, `tr`,
`thead` all render with a 0px gap and are fine).

**(d) Every discrepancy in the list gets a reason or a fix.** D1–D7 and U1–U9. "Left open" needs a
reason a reader accepts. U7 (55–65% of a 3440 screen blank on every reading page) is a real open
question about the measure — rule on it or say plainly why it is a separate task.

## What you write

**`public/imagine/design/spacing/decision.md`** — the §33 decision record, **ONE SCREEN**:

> Decision · Problem · Options considered · Recommended · Why · Advantages · Disadvantages ·
> Cost · Complexity · Migration / reversibility · Deliberately NOT doing yet

Show the numbers as a small table (token · at 1280 · at 3440 · multiplier) and the three levels as
a table (word · multiplier · where it is used). No wall of text; a newcomer reads it in a minute.
Link it from `/imagine/design/spacing/page.js` so it is reachable from where a reader already is —
**a page nobody links to does not exist.**

**And add one paragraph to `/imagine/design/spacing/ceilings/page.js`** naming which candidate you
chose and why the other two stay on the page. The alternatives stay visible; that is the point of
that page.

## What you apply

- `public/framework/framework.css` `:root` — the tokens from (a), **each with the numbers in a
  comment** (what it reads at 1280 and at 3440, and why).
- `public/framework/core/Page/Page.css` — the column pads, and the head/body seam (**D6**, 28 pages
  at a 0px gap; note that the day's decision 3 already put the head's vertical padding on
  `--page-column-pad-y`).
- The three level classes from (b) — put them where a theme can retune them (the `theme` layer),
  not in a realm.
- **The control rule from (c), applied to the offenders the auditors named**, each with the numbers
  in a comment: `summary` (**D2** — `framework.css:384` is the *only* rule that touches it today,
  `cursor: pointer`; every `<details>` on the site is an unstyled full-width block, and the
  962px/137px one on `/imagine/paging/` is the owner's "981px" control), `a.page-preview-link`
  (**D3**, `core/Page/Page.css:735`), `a.page-link`, `a.sidebar-link` (`public/styles.css:64`), and
  the realm constants `a.decks-chip` (`imagine/decks/decks.css`), `a.codrops-link--swap` /
  `a.codrops-demo-title`, `button.yt-start` (`imagine/youtube/youtube.css`),
  `a.research-card-name`, and the **D5** padding inversions (`div.decks-region`, `a.screens-area`,
  `a.mag-cover-area`, `div.paging-stage`).

## Verify before you land — with your own eyes, not by reasoning

A private dev server is **already running at `http://localhost:8110/`** (the manager's, shared).
**Do not start a server; do not kill any server; never touch port 80.** Playwright is global, not in
`node_modules` — import it by file URL from an `.mjs` in the session scratchpad
(`.../scratchpad/spacing-judge-*.mjs`):
`const { chromium } = await import("file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs");`
Wait for the page (`waitUntil: "networkidle"` then `waitForTimeout(800)`) — this site builds its DOM
in JS. Measure on `.active-page`, **not** `.page`: hidden realms stay mounted at 0×0, first in DOM
order (auditor C found and verified this).

Shoot at least `/imagine/paging/`, `/imagine/paging/toolbars/`, `/framework/`, `/imagine/research/`
and `/` at 1280 and 3440, before and after, and **look at the images**. Check three things: nothing
new crosses the fold at 1280; no page overflows horizontally; and the three levels are visibly
different side by side. If a change makes something worse, say so and undo it — a token that moves
the whole site is worth being wrong about out loud.

## Fences

Yours: `public/framework/framework.css` (`:root` tokens + the rules you change under `(c)`),
`public/framework/core/Page/Page.css`, `public/imagine/design/spacing/decision.md` (new),
`public/imagine/design/spacing/page.js` (the link to the decision only),
`public/imagine/design/spacing/ceilings/page.js` (one paragraph), `public/styles.css`, the realm
CSS files named above, and this task dir.

**Not yours:** `public/imagine/design/spacing/audit/` (the manager is building it), any other task
dir, `public/imagine/paging/paging.js` and `templates.css` beyond the level classes (another agent
is rebuilding the paging realm right now — if you must touch `paging.css`, keep it to the one
declaration your rule needs and say so).

Never `git stash` / `checkout --` / `reset` / commit / push — the tree is shared with four other
agents in flight. Never `find /`. Never spawn background sub-agents. Budget ~300k tokens.

## Report back in ≤ 10 lines

The three levels and their ratios · the 3440 scale in one sentence · the control rule in one
sentence · the decision.md url · the files you changed · before/after median sibling distance at
1280 and 3440 on the five pages you re-measured · anything you deliberately left open, with its
reason.
