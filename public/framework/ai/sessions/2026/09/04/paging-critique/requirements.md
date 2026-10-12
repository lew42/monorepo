# paging-critique — study brief

Less is more · clarity is the exception · prioritize. Read [`../paging/requirements.md`](../paging/requirements.md) (the program: plan, vocabulary, the owner's ask) and [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; both are mandatory. Skills: `new-task` (this dir, group `paging`), `code`, `layout` (its five questions are your rubric), `new-page`, `finish-task`.

**The owner's ask, verbatim:** "look at all the imagine pages, and think about how they could be better, or alternate layouts. alternate color schemes. experiment with different ratios of columns and alignment relative to the viewport or parent page area, and think about how this factor interacts with all the other factors. experiment with various nesting patterns against all of the factors."

## Deliverable

`public/imagine/paging/critique/page.js` — one card per realm under `/imagine/` (team design platform paging game gallery scenes vary screens shells feeds mag blogx decks youtube cms research stream generated), ranked worst-first: the shot at 3440 (an `img` of your screenshot, saved in your dir), one line of what is weak, an alternate layout (which of the approved five at `/imagine/design/layout/approved/`, or which paging mechanism/ratio/alignment change), an alternate surface (`plain` `card` `tint` `prim` `dark`), and a score. Then one screen of cross-cutting findings: how column ratio × alignment × nesting × surface interact — three claims, each with the two realms that prove it. Findings also as `log` lines.

## Method

Private server (rules file); shoot every realm at 1280 and 3440 headless (a plan of `goto` + `shot` with the `ui-test` runner, or a plain Playwright script — the `ui-test` skill names the import). Numbers first: width used (%), the widest dead region (px), the deepest nesting, the content region's `scrollHeight` vs `clientHeight`. `ext/DesignTool`'s `analyze()` / `rate()` where they run. Then judgement. Do not edit any realm.

## Fences

Write only `public/imagine/paging/critique/` (page.js + your screenshots, ≤ 200KB each — `jpg`, quality 60) and this task dir. Budget ~250k tokens.
