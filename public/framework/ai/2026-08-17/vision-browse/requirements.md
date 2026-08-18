# Make the vision analyses browsable

**Laws: less is more (ASAP), clarity is the exception, prioritize.**
**Budget: one page. `page.js` under 100 lines. Reuse, don't invent.**

Mike asked: *"did we record each vision analysis, so i can browse them?"*

**Recorded, yes. Browsable, no.** `ai/2026-08-17/vision-baseline/baseline.json` holds
18 rows — each with the image path, a content hash, an `overall`, five axis scores
(`layout typography contrast density hierarchy`) and **one sentence of prose per
axis naming what in the image drove that number**. The only thing reading it is
`human-ranking/rank/record.js`, which uses it for the ranking duel. Nobody can read
the analyses.

## Build the page that shows them

For each of the 18: **the screenshot, big enough to judge**, beside its five axis
scores and the sentence behind each one. Mike's standing complaint about previews
is *"they're too hard to see"* — a wall of thumbnails is the wrong answer.

Judgement, yours:

- **Order.** Best-to-worst by `overall` is the obvious default and probably right —
  he wants to see whether he agrees, so the ranking is the point.
- **One page or one card each.** Prefer one page he can scan.
- **Where the prose sits.** Five sentences per image is real text; it must not bury
  the picture.

⚠ **The images are the content.** Route them through the loopback-only
`/screenshot?path=` route exactly as `human-ranking/rank/` does — read its
`shots.js`, don't write a second one (RULE#7). ⚠ Give every `<img>` its real
`width`/`height`: a lazy image with no intrinsic size leaves its box 2px tall until
the bytes land, which the tool caught as a real CLS bug on the report page today.

⚠ **Say what the numbers are worth, on the page.** These scores are **not ground
truth** — a blind re-score of the same pixels by the same model agreed with itself
at ICC 0.510, and on four of six axes carried no more information than a fixed
number. Only `contrast` and `density` beat a best-constant control. **One honest
line near the top**, not buried: this is one model's single pass, and the axes
disagree about their own reliability.

## Link it

RULE#13 — nothing crawls. Declare it so it is reachable from `/framework/ai/`
without knowing the url, and **log the clickable url**, confirmed by navigating.

⚠ `ai/2026-08-17/page.js` exists now and declares `report`; add yours the same way.
An undeclared name falls through to `route()` and renders as an AITask log.

## Verify

- Loads at **390, 1280, 3440**; images render; zero console errors.
- ⚠ Take over with `full` if it needs the width — `render(){ return this.view ??=
  div.c("page full", () => this.content()).ac(…) }`, and draw your own title. See
  `core/Page/doc/layout.md`, and note it is an **open** question there: nested is
  the default, `full` is for pages that *are* the screen. A wall of 18 large images
  probably is.
- Screenshot it at 1280 and 3440 and **look** before calling it done.

## Files you own

- `public/framework/ai/2026-08-17/vision-browse/**` — your page.
- One line in `ai/2026-08-17/page.js`'s `children:` to declare it.

**Fenced:** `vision-baseline/**` and `rubric-v2/**` are **read-only sources of
truth** — `baseline.json` must not change. `human-ranking/**` is read-only (read
its `shots.js`, copy the approach, don't edit it). `ext/AITask/**`,
`ext/DesignTool/**`, `ext/Panel/**`, and `ai/2026-08-17/report/**` (another agent).

## Deliverables

1. The page, reachable, images rendering, ordered.
2. The honest caveat line about what the scores are worth.

Short on room? Cut nothing — this is already one page. If it will not fit, say so.

Findings go in your own `task.jsonl` as `log` lines. Run `finish-task` when it lands.

## Notes

- Foreground is the default. Capturing is synchronous — no DOM after an `await`;
  fill inside a callback.
- Prose is `md()`. ⚠ Only `p()` and `h1`–`h6` read backticks; every other factory
  appends raw. A backtick inside a `` css(`…`) `` template literal kills every page.
- Every CSS rule inside a layer; the order lives once, in `framework.css`.
- Reuse the dev server on port 80. Assert `document.visibilityState === "visible"`
  before a screenshot.
