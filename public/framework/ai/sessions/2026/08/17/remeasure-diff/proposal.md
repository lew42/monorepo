# Is the site better? Yes — and `78 → 83` measured the instrument, not the site

**Better: 3 real regressions, all one rule, against 4 real fixes.** Both numbers below reach 3 and 4 twice — once from the corpus, once summed from the per-page lines.

## The seat reads ±1 on a page that did not change

The sweep has **59** page-level rows, not 19×3=57. `/framework/ui/`@1280 and `/framework/ai/2026-08-17/`@1280 were each shot **twice**, nine minutes apart — same model, same prompt, same unchanged page:

| repeat shot | broken | findings | agreed on |
|---|---|---|---|
| `ui/`@1280 | 1 → **2** | 4 → 5 | 1 defect of 6 (Panel card empty) |
| `ai/2026-08-17/`@1280 | 1 → **2** | 5 → 5 | **0** broken of 3 |

Two of two trials drifted +1 and agreed on about one finding in five. That is the noise floor: **±1 per page-width, ±3 per page**. Deduped the corpus is **74 → 83** — nine, across 57 page-widths whose repeat rate is +1. No page that moved ≤3 means anything. The duplicates also inflate the note's table: `ui/` is **5 → 3**, not 7 → 3; `ai/2026-08-17/` is **3 → 3**, not 5 → 3.

## And the site changed under the measurement

Sweep shot 18:43 (wave 2 in), remeasure 20:34 (wave 3 in). Between them three siblings changed the **pages**, not the CSS: `ui-wall` 19:55 rebuilt `/framework/ui/` and nine component pages, `task-status` 20:00 added a status line to every card, `accept-buttons` 20:23, and `vision/page.js` changed at 20:18. `ui/` −4, `ai/…-17/` −2 and `DesignTool/vision` +3 are new content.

## The one real regression — `framework.css:274`, wave 3's `code-inline`

`code { background: var(--wash) }` sits on `code { padding: .15em .4em }` (`:272`). `--wash` is `#f2f2f2`, a card is `#fff`, and `.app` **is** `--wash` — so the chip is invisible and its padding becomes a naked space before the next character. In the png pairs: `/framework/core/`'s one dark `Item` pill became `Item 's own record` and `View , Page ,`; `/framework/ext/Doc/`'s "documenting `Doc` with `Doc`." became `Doc  with  Doc .` — 3 broken + 1 maybe, one cause, every page with inline code. The trade was real (22 "heaviest thing on the page" findings went away) but the chip has to stay visible. `pre` keeps `--code-bg` and is fine. **Revert is one line** (`changes.js#code-inline`).

## The ledger — every new `broken` on the eight pages that moved

| page | broken | real fix (wave rule) | regression | the rest of the new ones |
|---|---|---|---|---|
| `DesignTool/vision` | 5→8 | `import` pill in the prose | — | 2 new content · 1 pre-existing · 1 taste · 1 **artifact**: the badge it flags is inside a stored 17:xx thumbnail — a photo of the pre-fix site |
| `styles/elements/` | 2→5 | — | — | 1 pre-existing (orange in the before png too) · 1 taste · 1 is the 3440 gap counted a second time |
| `/framework/` | 2→4 | — | — | 2 pre-existing — both were `maybe` rows in the before run |
| `core/` | 3→5 | `--pad-y` clamp | **2** | 1 pre-existing (same glyph before) · 1 taste |
| `ext/Doc/` | 3→5 | — | **1** | 1 is the unlanded `wide` · 1 taste (`tabs.css:71` untouched by every wave) |
| `ui/` | 5→3 | — | — | all of it `ui-wall` — new content, both directions |
| `/web/` | 5→1 | `.muted` 65→75% | — | 3 of the 4 "gone" are the same defect **demoted to `maybe`** |
| `ai/2026-08-17/` | 3→3 | `--pad-y` (demoted) | — | 1 new content · 1 was a `maybe` at that width before |
| | **74→83** | **4** | **3** | |

## Wave 4 — six, cause → fix → class. Nothing was fixed here.

1. **Inline `code` has no chip and a naked gap** — `framework.css:274`+`:272`. Give it a hairline (`border: 1px solid var(--line)`) or drop the padding. — *regression*
2. **`wide` still reaches nothing** — 12 of 19 pages at 3440, the biggest cluster in both runs. `md()` emits classless markup and nothing claims the track. One word: `AITask.js:76` → `"ai-task flow wide"` ([measured](../layout-wave-3/proposal.md): tables 720 → 2806px). — *broken, out of wave 3's fence*
3. **Tabs still clip at the left edge** — `core/Page/`, its `doc/`, `DesignTool/vision`@390. The bar **is** `ext/tabs`; wave 3's left fade is exactly `--tab-pad-x` (21.6px), so a scrolled strip still slices a glyph. Widen it to the right edge's 2em, or scroll-snap so a tab never rests half-cut. — *broken*
4. **Unframed panels outside `.page-preview`** — the vision analysis pane @1280 and @3440. Wave 3's card frame landed on `.page-preview` only. Apply the existing `surface` utility at the three call sites in `vision.css`; no new rule. — *broken, scope gap*
5. **`mastermind-shots`' agents table: no header, truncated cells** — 6 mentions, unmoved. Authoring: add the `thead`. Item 2 gives it the width. — *broken, authoring*
6. **Shoot every page-width twice and report only what both seats say** — the ±1 above is why. Until then a ±3 page delta is unreadable, and so is any total built from it. — *instrument, blocks every future count*

[`after-3440.png`](../layout-primitives/after-3440.png) regenerated — same recipe, current CSS, so it is a wave-3 "after".
