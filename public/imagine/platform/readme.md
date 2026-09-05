# Platform — a design lab for a community platform, not a live product

Nine research verdicts, four decision records, an MVP slice, and one real demo — the
paper trail for what a small community platform built entirely from this framework's own
words could look like. **A topic is not an article; it is a world around an idea.**

Live: [/imagine/platform/](/imagine/platform/) — the landing page shows the real pages
first, the research log (why they say what they say) second.

## Where to start

1. [Topic demo](./topic/) — the one page here you can actually click around in: earn
   points, open a subtopic, watch a level change. Everything else is reference material.
2. [Research](./research/) — nine questions, each dug to a verdict with how sure anyone is.
3. [Decisions](./decisions/) and [MVP](./mvp/) — the hard-to-reverse calls, and the ten-step
   slice that spends them.

## Watch out

- The landing page used to bury its one clickable link inside a paragraph, below ~1600px
  of prose that re-linked (as bare text) six pages a card wall further down already showed —
  the same page named three times on one screen. Fixed 2026-09-05: the card wall now runs
  right after the opening two sentences, and the duplicate text links are cut.
- A verdict-cards tile wall was tried for the nine research entries and reverted — this
  page is a fixed-width Miller-columns pane, and a card grid measured taller at every width
  than the list it replaced. The reasoning and the numbers are in `page.js`'s own comment.

## More

- [`page.js`](./page.js) — the landing page, and the revert's numbers
- The research program: `research/<topic>/verdict.md`, one per topic
- Decision records: `decisions/*.md`, the §33 shape (Decision · Options · Recommended · …)
