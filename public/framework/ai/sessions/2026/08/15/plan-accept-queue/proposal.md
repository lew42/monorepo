# The accept queue — proposal

**Turn the audit's measured proposals into applied fixes with Mike in the loop: each fix a card, before/after side by side, one Accept button.** This is the feature Mike described verbatim on 08-14 ("don't go editing any CSS just yet, simply propose" — findings shown before/after with an Accept button writing to `audit/accepted.css`); the LayoutTool readme's Open list names it; and layout-hunt just built every input it needs. Plan only — nothing here is built.

## Why this one

The layout system now measures honestly (median 79, corpus 92/92), ranks truthfully (unreachable content at the bottom, where it belongs), and proposes concretely (five fix families in `../layout-hunt/audit.md`, each with file, declaration, and a *measured* before/after — the `/web/` fix was verified 19→94 with six control pages unchanged). What's missing is the last verb: **accept**. Today acceptance means Mike reads a markdown doc and hand-edits CSS from it. The loop the whole system exists for — measure → rank → propose → accept → apply → re-measure — dead-ends at a document.

Every ingredient shipped today or already existed: the injection-re-measure method (agent D's, in the layout-hunt scratchpad scripts), `defer.js`'s remembered-judgment pattern, `mirror.js`'s before/after element view, the screenshots, Saver's RPC persistence, and the browser→CLI bridge for phase 2.

## Shape (MVP — one session, ~3 files)

`ext/LayoutTool/queue/`:

- **`page.js`** — the queue. One card per proposed fix: url · the declaration diff · **before/after scores measured live** (`frame()` the page twice, second run with the declaration injected) · screenshot link · **Accept / Defer / Reject** (reject records a reason, defer.js-style).
- **`queue.js`** — the fix list + state. Seeded from the audit's five families (hand-authored, source-located). Rule-emitted proposals join later as second-class cards: their selectors are labels, not source locations — the readme's known blocker — so an unlocated card renders as "needs locating", never as an apply target.
- **State in `queue/queue.jsonl` via Saver RPC** (dev-only, like all DevBar-tier chrome) — repo state, not localStorage, so verdicts survive any browser and show in git.
- **Accept, in MVP, records the verdict and appends the declaration to `audit/accepted.css`** — which nothing imports, exactly as Mike framed it on 08-14. The queue is a decision ledger first.

## Phase 2 — accept dispatches the edit

On Accept, hand the card to `ext/Ask`: a headless turn applies the declaration at the true source file, re-measures, and logs. Two gates, both already on Mike's desk:

1. **Ask tool-scoping is still open** — an accept-queue thread needs *write* access, which `vision.js` deliberately denies today. It must be an allowlist (edits under `public/` only), never blanket.
2. **The task-queue decisions** (`../plan-task-queue/proposal.md`: sessionless launch, board placement, scheduled draining). Accept-queue *rides* whatever launch mechanism Mike blesses there — it must not invent a second one.

## Runners-up (each a fine later task; none blocked by this one)

- **Settle-aware `frame()`** — sweep and library numbers for two-wave pages are still 350ms shell numbers; the crawler's quiescence protocol should move into the tool.
- **Continuous sweep signature** — the measure band caused 49 of 90 remaining edges (26 moved the score by 0).
- **Blind-spot rules** — the audit's sharpest verdict: the tool ranks failure well but can't see *wrong*. Painted-surface (the never-firing `invisible` rule has a real target), widescreen under-use vs the prime objective, the `width_used`/`scrolls_sideways` contradiction (165 pages).
- **Small guards** — `cramped` on `blockquote` (32 of 47 findings); the cell exemption that over-corrected and now misses a real clipped table at 400.

The queue wins because it converts everything above from "findings" into "fixes with a paper trail," and because it's the one Mike already asked for.

## Decisions needed (3)

1. **Accept target for MVP**: record + `accepted.css` (your 08-14 framing), or straight to phase-2 dispatch?
2. **Placement**: its own page at `ext/LayoutTool/queue/`, or a section on the existing audit page?
3. **Seed scope**: the five audit families only, or also rule-emitted proposals as unlocated second-class cards?
