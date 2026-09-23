# ux-subpages — /framework/ux/ becomes real sub-pages in the tree, with cards that breathe and a reject flag

Minion: Sonnet, effort high. Session id `947b9616-1246-49ce-bdbd-3406e643845a`. You are IN A
WORKTREE (the launcher says where; your server's port). Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `layout`, `css`,
`code`, `new-page`. `padding-law` is fixing the sitewide zero-gutter cause at the same time —
do not fix that here; do fix the card spacing.

## The owner's words (2026-09-22 18:12, verbatim)

> the UX thing needs to be using sub pages. I like the expandable collapsible tree sidebar but
> the UX things is just a single page with a bunch of tabs and that's going to run out of space
> real quickly and I thought we finished that. By the way the layouts on this UX page are
> absolutely terrible: there's no spacing between the docs and open button on either card, the
> default spacing is massive, the compact spacing — the vertical spacing is fine, the padding is
> not nearly enough. We need to get these UX cards through an approval or reject process. I
> should be able to hover these and just click reject, keep fixing it until — you got to figure
> out how to fix these things, I'm not going to babysit you.

## What exists

`public/framework/ux/page.js` — `children: "Auth Wizard Tree Course Filter Menu Pagination Tags
Dictate Popover"` (ten modules, each a dir with its own `page.js`), but the page draws them as
tabs on one screen. The rail already expands `Styles` into sub-pages (`/framework/styles/`,
`core/Page` routing, `ext/catalog`) — copy that shape. Cards: `ext/catalog/catalog.css`, the
card word (`ai/2026-09-19/card-word/`), the size standard (`styles/system`: `--size`, pad/gap
rungs). The flag/verdict route: `Server/plugins/CardAnswer.js` writes `ai/verdicts.jsonl`
(`improve` with a sentence; `ai/2026-09-19/card-replies/`).

## Deliverables

1. **Sub-pages.** `/framework/ux/` shows one preview card per module (like `/framework/styles/`),
   each a real link to `/framework/ux/<Module>/`, and the rail expands UX into its ten children.
   No tabs. Detail stays on each module's own page.
2. **Cards that breathe.** On the UX index and on each module page's own cards: the `docs` and
   `open` buttons have a gap (one `gap` rung, never touching); the default density's padding
   comes off the "massive" setting to the size standard's card pad; compact keeps its vertical
   rhythm and gets enough inner padding that no text is within one rung of the card's border.
   Measure: button-to-button gap px, card inner padding px, at 1280 and 3440, before/after.
3. **A reject flag on hover.** Each demo card shows one small flag on hover; press → a one-line
   "what's wrong?" → an `improve` verdict for `ux/<Module>` (same route as the board's), and a
   quiet marker stays on the card. That is the approval-or-reject process the owner asked for
   without an approve button anywhere. The flag's sentence reaches the mastermind's inbox.
4. **Proof:** headless on your port at 1280 and 3440: the index with ten cards and their
   measured gaps; one module page; the rail expanded; a flag pressed and the verdict line
   landed. Shots into your task dir. Zero console errors.

## Fence

`public/framework/ux/page.js`, `public/framework/ux/*/page.js` (only what sub-page routing and
the card shape need), `public/framework/ux/ux.css` (or the file that holds the UX cards' rules —
name it), `Server/plugins/CardAnswer.js` only if the target shape needs one line, your task dir,
`ai/2026-09-22/page.js` `children:`. Not `framework.css`, not `ext/catalog` (a change there is
sitewide — propose it in a `decision` instead). Land by the launcher's patch.

## Length

Fewer lines than before if the tab code goes. Landing report: five sentences and the numbers.
