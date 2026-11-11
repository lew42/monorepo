# Step 6a: LivePage's card onto the kit's `.card`

- Budget: $5, hard stop, review fixes included.
- Load the `minion` skill first, then `css` and `layout`.
- Card (the owner's words): `public/framework/ai/sessions/2026/11/09/cards/ui-kit-one-small-set-of-parts-every-page/`. Plan: [/live/plan/ui-kit/](/live/plan/ui-kit/), card 6.
- You own `public/live/LivePage.css` and `public/live/LivePage.js` for this step (live-page's mastermind is dormant).

Rules:
- Work in a worktree (`take_worktree`, use its `path` and `url`). Commit by exact path after each working piece.
- Never kill or restart the dev server, never drive the owner's tabs, never `git stash` (diff, don't stash).
- Log as you go on this folder's `session.jsonl` with `mcp__servex__log` (hand appends to .jsonl are blocked).

## What the owner wants

"A very consistent design system… a small set of tools… eliminate all these little CSS fixes." `/live/` is the page the owner sees most. Its cards draw with their own rules (`.live-card`, `public/live/LivePage.css:136-160`); the kit's card is `.card` (`public/framework/framework.css:492-542`, shown at `/framework/library/?at=ui/card`). This step moves ONE part, the card, onto the kit. Rows, file lists and settings come in later steps, not this one.

## The change

1. The card divs LivePage draws (`LivePage.js:661` `div.c("live-card live-item")` and the other places that add `live-card`; grep for it) also get `card`. Keep `live-card` as the hook for the link-card behaviour only (the chevron, the whole-card link `::after`, the z-index of controls inside).
2. Delete from `.live-card` every declaration `.card` already gives (background, radius, padding, shadow, colour). Keep only what is LivePage's own job: `position: relative`, cursor, the press/hover feedback, the bottom strip for the chevron. If a `.card` variant (`ui/card/page.js`) already covers hover or the link look, use it and drop LivePage's rule.
3. If `--live-card` (the colour token) is then unused, remove it; if it is still used by rows or settings, leave it (later step).
4. Where the kit can't do what the card needs (e.g. the code block bleed at `:159` uses `-1rem`, which must now follow `--pad-card`), fix it to the kit's token, and write one `ui-kit gap: ...` log line for anything the kit is missing. Don't add new kit words in this step.

The line count of `LivePage.css` before and after is a deliverable (`wc -l`).

## Proof

- `node Server/LayoutCheck.mjs <worktree url> /live/ /live/done/ /live/plan/ui-kit/ --widths 400,1200 --json`: BROKEN count before (on `http://monorepo.localhost`) and after (worktree). After must be no higher than before, and ideally 0 for the card.
- Headless shots (`Server/Browser.mjs`, as `Server/smoke.mjs:34` does) of `/live/done/` and `/live/plan/ui-kit/` at 400 and 1200, before and after, into the MAIN tree's `step-6a/shots/`. Read them yourself: cards must look like the kit's cards and the chevron must still open the card.
- `node public/live/LivePage.test.mjs` (or the repo's test runner for it) still passes.
- `node Server/smoke.mjs <worktree path> /live/ /live/done/ /live/plan/ui-kit/` shows no FAIL; a FAIL from a page you did not touch is checked on compliance/dev and logged as pre-existing.
- If `public/live/readme.md` or a doc says the card has its own frame, update it in the same commit.

Stop with one reply: branch, commits, CSS lines before/after, BROKEN before/after, shot paths, gap lines. Do not merge; the mastermind reviews and merges.
