# Plan: a System class, /framework/ui/ as the block library, and padding

**Before, at 3440:** [the card page](shots/before/monorepo-localhost-framework-ui-card/3440.png) draws a 200px-tall card across about 2000px, with its source far off to the right. **At 1920:** [the UI wall](shots/before/monorepo-localhost-framework-ui/1920.png) leaves holes wherever one card in a band is taller than the rest.

All of it is built in one worktree, `worktree/ui-system`, and merged in small pieces, each checked at 400, 1200, 1920 and 3440.

## Wave 1: four builders at once, on separate files

| | What | Owner's ask | Files it may touch |
|---|---|---|---|
| **A** | `System`, a core class. Design, Code, UI, UX and AI become Systems and share the docs top tabs. | 1 | `core/System/` (new), the five landing `page.js` files |
| **B** | The masonry preview wall: no holes, smallest items first, order runs across. Previews draw at their own width and are scaled down, with a zoom slider. | 4, 5 | `ext/catalog/`, `styles/layouts/masonry/` |
| **C** | Class pills: every component's CSS classes, shown as small tags. A compact card page, with the code beside the template. An ideal width for each kind of component. | 3, 7 | `ui/classes/` (new), `ui/card/`, `ext/demo/` |
| **G** | Padding: the rule for % padding, a wrapper class for grid items, a fix for the AI 2 card's thin padding, and a review question. | padding 1 to 4 | `framework.css` (padding only), `design/layout/` |

## Wave 2: after Wave 1 merges

| | What | Ask | Waits on |
|---|---|---|---|
| **D** | The tree rails: siblings previewed on the left, children on the right, so you can drill down through variations. | 6 | B |
| **E** | The dev bar's Structure tree uses the library's icon tree (`ui/tree`). | 8 | nothing (small) |
| **H** | `/framework/ui/` becomes the library of approved blocks: the rule (built only from approved blocks), the request path for a missing block, and a names index where "what's it called?" is answered by a link. | 2, 10 | A, B, C |
| **F** | Task pages: done items read as green ticks, not disabled boxes; the steps bar keeps a sane width; the Report is free content. | 9 | A |

## Decisions

- **`System extends Doc`, not plain `Page`.** The owner asked for "the same docs top tabs", and `Doc` already draws them as routed child pages. Building a second tab system on `Page` would break law 6. The alternative was `System extends Page`, copying the AI page's hand-built tabs. Doc is itself a Page, so a `{"class": ".../System.js"}` line in page.jsonl still works.
- **The masonry extends `.packed`/`pack()`** (`styles/layouts/masonry/`), which already keeps reading order across. It does not add a second masonry.
- **Padding:** a % padding on a **grid** item already resolves against its own grid area, but on a **flex** item it resolves against the whole row. G measures this before naming the wrapper, and uses the wrapper only where the measurement says it is needed.

## Not now (the brief's backburner)

The demo stage overhaul, and editing the template source in place.

