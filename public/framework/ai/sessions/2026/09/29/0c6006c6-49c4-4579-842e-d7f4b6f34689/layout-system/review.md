# Review — layout-system: fix (4 blocking, 6 notes)

| # | kind | where | issue | fix |
|---|------|-------|-------|-----|
| 1 | fix | `short/`, `centred/` demos | Cards are only a few lines tall at 1920/3440, so the "hole" under the short title is ~40px and `centred/` looks almost the same as `short/`. | Cap the row's width, or give the full columns more text, so the empty box — and centring it — is visible. |
| 2 | fix | `demo.js:18-29` `pictures()` | Each demo's lead photo is the box only, two across at half width — at 3440 that's a strip of grey slivers, not readable. | Shoot the whole page at 1920 and 3440, one picture per row — or drop the lead photo and let the live demo below be the picture. |
| 3 | fix | `decide/shoot.mjs:4` | Imports Playwright by an absolute path containing the owner's Windows username — breaks the global no-name rule and only works on this machine. | Resolve the global node_modules folder at run time (e.g. `npm root -g`). |
| 4 | fix | `.claude/skills/layout/SKILL.md` | Two lists are both called "five questions" — a reader (or `demo.js:14`'s own reference to "question 2") can't tell which. | Rename the new section, e.g. "Choosing a layout (before sizing)", and number references to it. |
| 5 | note | `questions.js`, `questions.md`, the skill | Three copies of the question list, not the one `questions.js` claims. | A short script to write `questions.md` from `questions.js` removes one copy. |
| 6 | note | `servex/` demo | One narrow prose column, 84% empty at 3440 — the very failure the demo warns against — with the answer (Tile wall) buried at the end. | Lead with the five picks as small cards, reasoning one click down. |
| 7 | note | `/layouts/` | The new link is a sentence part-way down the page. | Show it as a preview card near the top. |
| 8 | note | `/layouts/decide/` | Demos start below the fold at 1920 — order's right, just not signposted. | Say so in the lead sentence. |
| 9 | note | amount demo's left nav | Links go to `#` — clicking does nothing. | Point them at real anchors. |
| 10 | note | `demo.js` | Imports and re-exports `ul`/`li` — unused anywhere. | Delete both. |
