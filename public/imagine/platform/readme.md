# Platform — a design lab for a community platform, not a live product

Nine research verdicts, five decision records, an MVP slice, and a demo that actually
runs — the paper trail for what a small community platform built entirely from this
framework's own words could look like. **A topic is not an article; it is a world around
an idea.**

Live: [/imagine/platform/](/imagine/platform/) — the landing page shows the real pages
first, the research log (why they say what they say) second.

## Run the slice

```
PORT=8097 API_PORT=8201 npm run dev
```

Then open <http://localhost:8201/imagine/platform/topic/>, sign in at
`/api/dev/login?as=carol`, and click the like button. That is the whole first vertical
slice — a topic world, a page inside it, a signed-in user, and a like that is a row in a
real database. Step by step, with what you should see at each:
[the recipe](/framework/ai/2026-09-06/platform-slice/run.md).

## Where to start

1. [Topic demo](./topic/) — the one page here you can actually click around in: earn
   points, open a subtopic, watch a level change, like it for real.
2. [Research](./research/) — nine questions, each dug to a verdict with how sure anyone is.
3. [Decisions](./decisions/) and [MVP](./mvp/) — the hard-to-reverse calls, and the ten-step
   slice that spends them. [MVP](./mvp/)'s "Running" section is the picture of it working.

## Watch out

- The landing page used to bury its one clickable link inside a paragraph, below ~1600px
  of prose that re-linked (as bare text) six pages a card wall further down already showed —
  the same page named three times on one screen. Fixed 2026-09-05: the card wall now runs
  right after the opening two sentences, and the duplicate text links are cut.
- A verdict-cards tile wall was tried for the nine research entries and reverted — this
  page is a fixed-width Miller-columns pane, and a card grid measured taller at every width
  than the list it replaced. The reasoning and the numbers are in `page.js`'s own comment.

- **D1 enforces foreign keys**, so `worker/seed.sql` can no longer `DELETE FROM users` —
  it is an upsert, and the second `npm run dev` used to die once anybody had liked
  anything. Detail: [`decisions/slice.md`](./decisions/slice.md) ruling 3.
- The like button is `like.js` here, **not** `framework/ext/auth/`, and `/notes/auth/` §7's
  sketch of it has the build-after-`await` bug. Detail: `decisions/slice.md` ruling 1.

## More

- [`page.js`](./page.js) — the landing page, and the revert's numbers
- [`like.js`](./like.js) — `like(url)` and `who()`: the client half of the slice, ~50 lines,
  no CSS. Both degrade to a dash when there is no API, which is the acceptance test.
- The worker is **not** here — it is `worker/` at the repo root (`likes.js`, `index.js`,
  `session.js`, `dev.js`, `room.js`, `can.js`), because `public/` is the deploy artifact.
- The research program: `research/<topic>/verdict.md`, one per topic
- Decision records: `decisions/*.md`, the §33 shape (Decision · Options · Recommended · …)
