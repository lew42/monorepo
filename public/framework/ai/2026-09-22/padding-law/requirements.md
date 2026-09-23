# padding-law — text never touches an edge, anywhere, at any width: find the rule that breaks it, fix it once, and make it a check

Minion: Opus, effort high. Session id `2e26b182-3c4c-4cd0-8e17-50a3431795fa`. You are IN A
WORKTREE (the launcher says where; your server's port). Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `layout`, `css`,
`code`. This is a cause-level task: a finding across many pages means the RULE is wrong.

## The owner's words (2026-09-22 18:12, verbatim)

> I just clicked on framework/styles and the text is butting up against the sidebar with zero
> pixels of padding. This is like make this a fucking law of the whole system. You never have
> zero padding with text. It looks terrible. Did you not take screenshots?

And 18:03 on the AI board: "sorted by importance is nudged against the left side of the page
with zero padding. This is the law of padding that should never be broken."

## What the mastermind measured (18:14)

`/framework/styles/` at 1280: fine (the H1 and paragraph start ~40px in from the rail). At
**3440**: the H1 "Styles" and the paragraph start at x = the rail's right edge — 0px — while the
card row below them is indented (~50px). A "ON THIS PAGE" ToC column appears on the right at
that width. So the gutter is lost at wide widths on pages with a ToC. Leads: `core/Page/Page.css:135`
`--gutter-x: clamp(2em, 4%, 5em)`; the ToC grid (`toc.css` — "opts out with :not(.standard)");
`.page-column-prose > .bleed` margins (`Page.css:48`); `ai/v/3/v3.css:706–718` zero the gutter
for the AI board specifically (`.page:has(> .v3)`); `.page.full` (`Page.css:1059`) zeroes it by
design. The handover's lesson 2: a reconstructed `framework.css` once lost four spacing tokens
and every rule using them computed to 0 — check the tokens the ToC layout uses actually exist.

## Deliverables

1. **The probe — `probe.mjs` in your task dir:** Playwright headless over a page list
   (every page named in `public/framework/page.js` `children:` and one level below, plus
   `/framework/ai/days/`, `/framework/ai2/`, `/framework/styles/system/`), at 400, 1280, 1920 and
   3440: for each page, the smallest gap between any visible text node's left edge and the
   rail's right edge (and between text and the viewport's right edge / the ToC column). Output
   one JSON line per page×width and a table sorted by the smallest gap. Two numbers that must
   agree: pages probed and pages listed. Put the table on your page.
2. **The cause, fixed once.** From the table, name the rule(s) that produce a gap < one rhythm
   unit (`--flow`/the size standard's smallest rung — read `styles/system`). Fix each at its
   source (a token, a shell, the ToC grid), never per page. Re-run the probe: zero violations
   at all four widths. Log before/after counts.
3. **The check — `Server/padding-check.mjs`** (or a mode of the existing page-health watcher
   `Server/health.mjs` if it is a ten-line addition — decide, `decision` line): the same
   measurement on one url at one width, exit non-zero with the offending text and its gap, so
   any minion can run it on its page before landing, and the health watcher can run it on a
   changed page. Wire it into `.claude/hooks/` only as a proposal (settings are the owner's).
4. **The law, written where agents read it:** one line in the `css` skill and one in `layout`
   (fail-safe, via a node script — Write refuses `.claude/`): "Text never sits at 0 from an
   edge: rail, viewport, ToC, card border. Run `node Server/padding-check.mjs <url>` before
   landing a page." With the 2026-09-22 evidence in one clause.
5. **The page — `ai/2026-09-22/padding-law/page.js`:** the before/after table (violations
   per width), the rule that was wrong in one sentence, the check command, three shots
   (styles at 3440 before/after, the board at 1280 after).

## Fence

`public/framework/core/Page/**` css, `public/framework/framework.css` ONLY if the cause is a
missing token there (say so, one line), the ToC css, `Server/padding-check.mjs` (new) or
`Server/health.mjs`, the two skill lines, your task dir, `ai/2026-09-22/page.js` `children:`.
Not `ai/v/3/**` (another minion is there). Land by the launcher's patch.

## Length

Landing report: six sentences — the rule in the first, the two counts, the check command.
