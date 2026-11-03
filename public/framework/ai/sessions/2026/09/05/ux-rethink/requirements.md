# ux-rethink — manager brief (Opus, a sub-mastermind)

Read first: the repo's `CLAUDE.md` (law 2: clear beats brief, by far), `../mastermind-night/requirements.md` (the night's rules + the owner's brief verbatim), `../../2026-09-04/mastermind-platform/minion-rules.md`, and yesterday's review at `/imagine/review/` (`public/imagine/review/page.js` — the eighteen cold reads and the five patterns; do not redo the ten-second test, build on it). Skills for you: `new-task` (this dir, group `review`), `code`, `layout`, `new-page`, `finish-task`.

## The owner's words, the ones you deliver on

> i want you to spawn ux minions to explore the imagine pages, and think again about what is this page? how do i use it? what is the goal of the page? how hard is it to understand? how could it be simpler, more visual, more intuitive, more explanatory, easier, better, etc..
> consider alternative layouts. if an alternative layout feels like it would work/look better, use it. try to improve these design systems (ui, ux, layout, etc)

## What you are

A manager: one **UX reviewer per realm** (Sonnet), the eighteen realms under `public/imagine/` except `paging`, `layouts`, `codrops`, `review` (being built or yours): `team design platform game gallery scenes vary screens shells feeds mag blogx decks youtube cms research stream generated`. ⚠ Spawn them in the FOREGROUND — `run_in_background: false`, three Agent calls per message — six rounds of three. A background minion's completion never reaches you.

## The reviewer's brief — write it once as `reviewer-brief.md` here, then point each spawn at it with its realm

For its realm, a reviewer:

1. **Answers the owner's five questions in five plain sentences**, in its task log, before touching anything: what is this page; how do I use it; what is its goal; how hard is it to understand (1–5, with the reason); how could it be simpler / more visual / more intuitive / easier. Read yesterday's card for the realm on `/imagine/review/` first.
2. **Tries an alternative layout — for real.** Pick the one that would work better (the approved five at `/imagine/design/layout/approved/`, the 3-column card technique from the owner's brief — title + intro + controls left, the thing centre, readouts right — or a surface change from the paging vocabulary). Build it on the realm's landing page. Shoot before and after at 1280 and 3440. If it is better by the `layout` skill's numbers (width used, dead space, the three invariants) AND by the five sentences read again, keep it; if not, revert and say why in the log. The owner said: *if an alternative layout feels like it would work/look better, use it.*
3. **Makes it more visual.** Where a paragraph explains, replace it with the thing itself, a picture of it, or a live miniature (the paging hub's four examples are the pattern). Where a list of links could be cards with a still, make them cards.
4. **Persistence rule** (night rule 4): if the realm remembers anything, it shows a modified mark and a reset — the persistence judge's `public/imagine/paging/doc/persistence.md` says how, if it has landed; else the simplest local version.
5. **Resolves, doesn't park**: fixes inside the realm; `core`/`ext` needs are written proposals with the diff. `ui-test` the primary interaction after the change. Lands with `finish-task`: the five sentences, before/after shots, kept or reverted and why, fixed/proposed lists. Fences: the realm's dir and its task dir only; private servers; scratch under `scratchpad/ux-<realm>/`; never `git stash`/commit; never `find /`; never spawn agents.

## Your deliverable

`public/imagine/review/rethink/page.js` (a child of the review realm; the mastermind wires it): opens with three plain sentences on what this second pass did and how to read it; then one card per realm with the before and after shots side by side at 1280, the five sentences (after), kept/reverted, and links; then "What made pages better", five patterns in full sentences with the two realms that show each. Verify at 1280 and 3440 on a private server, zero console errors.

## Budget and reporting

You ~200k; each reviewer ~180k (say so in its brief — yesterday's ran 172k). When you land, reply in ≤ 15 lines: the url, how many realms kept their alternative layout, the three biggest improvements with before/after numbers, the five patterns, tokens.
