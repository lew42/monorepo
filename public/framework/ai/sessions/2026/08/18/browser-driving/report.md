# browser-driving — what can each driver TEST on ext/Panel?

Extends [`../mcp-tab-awareness/comparison.md`](../mcp-tab-awareness/comparison.md) — that
answered *what each tool IS*; this answers *what each can TEST*, tried live on ext/Panel's
three no-saver `panel()` demos at `/framework/ext/Panel/` (the persisted `workspace()` at the
top was never touched — dev socket blocked for Playwright/CDP; `eval`'s own tab stayed
scoped to the no-saver leaves, where `save()` resolves `false`). Evidence: 9 pngs in this dir
(`pw-*`, `cdp-*`).

## The table

| test | site `eval` | Playwright | CDP (own browser) |
|---|---|---|---|
| read DOM/computed geometry | ✓ direct, cheapest | ✓ `page.evaluate` | ✓ `page.evaluate`, same channel |
| real click | ✓ *but* `dispatchEvent` skips hit-testing — fires the handler even where `pointer-events:none` blocks a real click ([pw-01](./pw-01-before-split.png)) | ✓ native, hit-tested | ✓ `Input.dispatchMouseEvent`, hit-tested |
| real drag (pointer sequence) | partial — works, but only by dispatching on the exact listener-owning element (not `document`) and awaiting the app's own rAF queue by hand; wrong target + no await measured 0px moved, right target + await measured the true 100px | ✓ `mouse.down/move/up`, matched the 100px exactly ([pw-04](./pw-04-before-drag.png)→[pw-05](./pw-05-after-drag.png)) | ✓ `Input.dispatchMouseEvent` sequence, same as Playwright |
| hover state (`:hover`) | ✗ no pointer position exists — the edge stayed `pointer-events:none` until dispatched straight at it | ✓ `.hover()`/`mouse.move` sets real `:hover` | ✓ `mouseMoved` sets real `:hover` — edge flipped to `pointer-events:auto`, `eval` never did |
| keyboard | ✓ `dispatchEvent(KeyboardEvent)`, same mechanics as click (not separately re-run this pass — budget) | ✓ `page.keyboard.press` | ✓ `Input.dispatchKeyEvent` |
| viewport resize, no window resize | ✗ no such call | ✗ `setViewportSize` **is** a window resize | ✓ `Emulation.setDeviceMetricsOverride` — measured `window.innerWidth` 1400→480, zero Playwright resize call |
| matched CSS rules + origin | partial — reconstructed from `getComputedStyle`, no origin | ✗ no such API | ✓ `CSS.getMatchedStylesForNode` — 5 rules, origins `user-agent`/`regular`, natively |
| screenshot | ✗ (`shot` is separate, a cold `goto`) | ✓ | ✓ |
| sees the owner's live tab state | ✓ *if* the owner has it open — the one thing neither launcher can do | ✗ always a cold `goto` | ✗ always a cold `goto` |
| works when the tab is hidden | evaluates fine, geometry frozen (no rAF/ResizeObserver) — the trailing status line says so every call | n/a — drives its own tab | n/a — drives its own tab |
| needs the owner to change anything | no, for a tab already connected | no | no, for a minion's own browser — only reaching the owner's *own* Chrome needs `--remote-debugging-port` |

## Verdict

For a Panel gesture test-drive: **Playwright is the workhorse** — real, hit-tested input,
no app-internals knowledge required, one call per gesture, and it is what actually caught the
`pointer-events:none` gate that `eval` walked straight through. **CDP earns its keep for
three things only**: viewport-without-resize, matched-rules-with-origin, and forcing real
`:hover`/focus — reach for it when the assertion is specifically one of those, not as a
Playwright replacement. **`eval` is the wasted effort for *driving* gestures** — it works,
but only by knowing which element owns which listener and hand-timing the app's own rAF,
which is reverse-engineering the code under test rather than testing it. It stays exactly
what `comparison.md` already said: unmatched for reading the *owner's actual live tab*, never
for synthesizing one. The one capability that would change what Panel minions can test:
`CSS.forcePseudoState` (untested this run) — force `:hover`/`:focus-visible` without a real
pointer, closing `eval`'s biggest gap without needing a click at all.
