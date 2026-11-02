# Chat layout, the walkthrough (2026-11-02)

Your words are a tinted pill on the right that hugs the text; the assistant's words are plain text on the left. Both stop at 80% of the width (a `min(80%, 40rem)` cap on a desktop, so a line stays readable at 1920). One rule set, [`ext/Chat/bubbles.css`](/framework/ext/Chat/bubbles.css), draws all three views.

Shot with the headless browser at 360×740 (phone user agent `Android 10; K`) and 1920, from the worktree's own server. Demo data: [`layout-session.jsonl`](/framework/ext/Chat/v3/fixture/layout-session.jsonl) (a one-word `/compact`, a `Hello`, a long wrapped message, replies with markdown). The Chat V1 page's own demo has `/compact` too.

| View | Phone, 360×740 | Desktop, 1920 |
|---|---|---|
| **V1** (`ext/Chat/`, the ✦ sheet, the drawer) | ![V1 at 360](screens/v1-360.png) | ![V1 at 1920](screens/v1-1920.png) |
| **V2** (`ext/Chat/v2/`) | ![V2 at 360](screens/v2-360.png) | ![V2 at 1920](screens/v2-1920.png) |
| **V3** (`ext/Chat/v3/`) | ![V3 at 360](screens/v3-360.png) | ![V3 at 1920](screens/v3-1920.png) |

## What the numbers say
- No horizontal scroll: `scrollWidth` equals `clientWidth` (360 and 1920) in all three.
- Hugging: at 360 V3's owner pills are 91 px (`/compact`) and 60 px (`Hello`), against 259 px for the long message, which wraps at the cap; V1's are 106 and 82 against 225; at 1920 `/compact` is 104 px in V3 (the long one 499 px).
- Assistant bubbles have no fill (`background: rgba(0,0,0,0)`) in every view.

## What was decided
- **V1's avatar is its own column.** A floated icon is left out of a bubble's intrinsic width, which squeezed a one-word reply ("Compacted.") to "Compa / cted." and let the second line wrap under the icon. A reply is now a two-column grid, icon then words.
- **Your 👤 icon is hidden in V1** (the right side already says who). The assistant's icon stays (fast, smart and a mastermind look different).
- **V2:** a sentence row is a small pill of yours; a reply anchored to it sits plain beneath it. A Prompt with refined text is one pill, as in V3. (`ChatV2.test.mjs` asserts `[data-sentence] .chat-v2-beside`, so the reply stays beside its sentence's row, in the DOM.)
- **The replay control** ▶/⏸ ↺10 (from the replay-bubbles task) sits under each plain reply at its left edge.
- **`--bubble-max`** is the one token for both sides: change it on any host to move both.
- **Alternative not taken:** a fixed 80% with no rem cap. On a 1920 page that is a 1500 px line, which reads badly; the cap is one value in `bubbles.css`.

## Checks run
`ChatV3.test.mjs` (18), `ChatV2.test.mjs` (19), `live-guess.test.mjs` (5), `ReciteBubble.test.mjs` (37), `Recite.test.mjs` (34, with the new same-opening-words test), the Dictate browser tests, then `node core/Test/run-all.mjs --browser`.
