# `--measure: 52em` — the hand count, and who was wrong

Judged 2026-08-16 for `mastermind-layout`. **The mastermind's own number is the
worst of the three.** 117 is not what 52em produces; it is what four presets that
declare no `--measure` at all produce. The minion's 53 is an instrument reading,
not a character count. `knowledge/characters-per-line.md` is the closest to right
and its ceiling is a few characters low.

No source file was edited. Scripts in the session scratchpad.

## 1. The hand count (ground truth)

One `div.measure` with `--measure` set inline, holding one `<p>` of the site's own
prose (the 434-character `LONG` string in `web/layout/measure/page.js`), appended
**inside `.theme-lew42`** so it inherits the real Montserrat and the real body
font-size clamp. Headless Chromium, dev server on :80, `$BLOCKRELOAD` set.

Two independent methods, neither depending on `read.js`, `probe.js` or any tool
in this repo:

- **C** — per-character `Range.getBoundingClientRect()`, count the characters
  whose rect shares the first line's `top`. *What the browser actually put on
  line one.*
- **B** — binary-search `substring(0,n)` width on a `white-space:pre` copy
  against the column width. *How many characters physically fit, ignoring word
  breaks.*

| viewport | `--measure` | column | C: chars on line 1 | B: chars that fit | chars/em |
|---|---|---|---|---|---|
| 3440 | 52em | 936px = 52.00em | **106** | 108 | 2.04 |
| 1920 | 52em | 832px = 52.00em | **106** | 108 | 2.04 |
| 1280 | 52em | 782px = 52.00em | **106** | 108 | 2.04 |
| 390 | 52em | 390px = 27.86em *(clamped)* | 57 | 60 | 2.05 |
| 3440 | 30em | 540px = 30.00em | **62** | 64 | 2.07 |
| 1920 | 30em | 480px = 30.00em | **62** | 64 | 2.07 |
| 1280 | 30em | 451px = 30.00em | **62** | 64 | 2.07 |

Full lines of the same paragraph at 52em: 106 · 107 · 100 · 90 (mean 100.8).
At 30em: 62 · 56 · 62 · 58 · 57 · 54 (mean 57.1).

**The count is bit-identical at 1280, 1920 and 3440.** The font-size clamp moves
px and moves nothing else — `space/readme.md`'s "because the body font-size clamp
grows with the viewport" is a false mechanism.

**Real copy, hand-counted:** 322 multi-line paragraphs on columns >20em, across
ten real routes, longest line ÷ column in em → median **1.90 chars/em** at 3440
and **1.92** at 1280; p10–p90 **1.62–2.02**; max 2.14. Scaled to 52em: median
**99**, p10–p90 **84–105**, worst paragraph on the site **117 at 54.7em** (= 2.14
chars/em, a lowercase-heavy `<p>` — not a 52em column).

## 2. Each party's instrument, on the identical specimen

| party | its number at 52em | vs hand (106) | why |
|---|---|---|---|
| `probe.js` → `read.js` → `rate()` **on the specimen alone** | **103.9** (60.6 at 30em) | −2% | correct. `probe.js:150` `advance = ink/chars` divides inked width by a char count that includes the collapsed line-break space, so advance is a hair low; `probe.js:139` takes the *widest* line. Net a slight under-read of the max line. **The arithmetic is not the bug.** |
| `read.js` **on a real page** | 24.4 – 254.3 | never within 40 | two lines, below |
| `characters-per-line.md` | 83–103 | ceiling ~5 low | its method *is* probe's, and its p10 is right. 103 for "technical prose, lowercase-heavy" hand-counts at 101–108. |
| mastermind (presets, taste tier) | 117 @3440 / 104 @1920 | +10%, and viewport-varying | measured the wrong presets, below |

### `read.js`, on a real page, is not a characters-per-line reading

`read.js:19` — `m.nodes.filter(n => n.text && n.text.chars > 80)`. Any text block
over 80 characters is "prose", which admits `pre.code-block`, `code.hljs` and
every `span.hljs-string`. On `/web/layout/measure/` **6 of the 9 prose nodes sit
inside one code listing**, with `per_line` 159 · 222 · 240 · 263 · 434 · 458 — so
`read.js:45`'s median lands on `pre.code-block` at **222.5**, while the page's
three real paragraphs read 29.7 / 83.3 / 86.5. `/framework/ai/` reads **254.3**
at 3440.

`read.js:45` — `median(prose.map(n => n.text.per_line))` is a median **over
blocks**, not over lines. On a gallery page the population is card blurbs in
12–15em cards: `/framework/` reads **41.9** while its body paragraphs hand-count
a median longest line of **92** (widest 110).

Ten routes, `read().measure` vs hand-counted median longest line, at 3440:

| route | `read().measure` | hand | page |
|---|---|---|---|
| `/framework/` | 41.9 | 92 | gallery — median is card copy |
| `/framework/core/Page/` | 54.1 | 98.5 | 12 of 81 "prose" nodes are code |
| `/framework/core/App/` | 61.3 | 104 | |
| `/framework/styles/` | 49.4 | 96 | |
| `/framework/ext/LayoutTool/` | 67.7 | 104 | |
| `/web/layout/measure/` | 222.5 | 103 | median is a `<pre>` |
| `/framework/ai/` | 254.3 (57.3 @1280) | n/a | no prose; also *not* viewport-flat, which a chars/em reading must be |

### The mastermind's 117 is four presets that never declare `--measure`

Rendered every `styles/layouts/space/presets.js` preset into a fixed-width
offscreen box and measured both ways:

| preset | declares `--measure`? | `read().measure` | hand, longest line | prose column |
|---|---|---|---|---|
| `document` | **yes, `--measure:52em`** | **97.45** | **98** | 50em |
| `docs` | no (`fluid`) | 115 | 121 | 51–60em |
| `shell` | no (`fluid`) | 114 | — | 51–59em |
| `split` | no (`fluid`) | 113 | — | 51–59em |
| `mail` | no (`fluid`) | 114 | — | 51–59em |
| `landing` | no | 59.2 | — | 30.5em |
| `masonry` | no | 26.7 | 28 | 13em |

Every value is **identical at 1920 and 3440, to two decimals** — so the
mastermind's "117 at 3440, 104 at 1920" is not reproducible and its own internal
inconsistency (2.25 vs 2.00 chars/em for the same token) was the tell.

`space/readme.md:343` — "`--measure: 52em` is the single most common complaint at
3440, at zero credit on five of the nine … so 52em is ~117 characters a line" —
is a conflation. The one preset that declares the token reads **97**. The 113–115
band belongs to **fluid tracks with no ceiling**, which is a different finding and
arguably a better one.

## 3. Verdict

> **`--measure: 52em` produces about 100 characters per line on this site — 106
> on a full line of plain prose, 84 to 108 across real copy, ~2.0 characters per
> em — and the number does not change with the viewport.**

## 4. What must change (listed, not edited)

| file | claim | correct value |
|---|---|---|
| `ext/LayoutTool/taste/ranges.js:115` `AUTHOR.measure: [27, 34]` | *the mastermind's brief assumed this was wrong* | **LEAVE IT.** At 1.90–2.04 chars/em, 27–34em = 51–69 characters — exactly the 52–68 ideal band it was written for. Its comment (`:110–114`, "~2 characters per em … ~104 characters at every viewport") is the most accurate sentence in the taste tier. |
| `ext/LayoutTool/knowledge/characters-per-line.md:3` | "between 83 and 103" | **~100 median, 84–108 across copy.** The band is right as a p10–p90; the ceiling is ~5 low. Its "the number does not move with the window at all" (`:11–13`) is **confirmed exactly** and should be cited more, not less. |
| same, `:17` | `library/reading-column` = "103 a line" | 101 hand-counted at 3440 (that page's widest paragraph); fine. |
| `styles/layouts/space/readme.md:343–345` | "52em is ~117 characters a line" | **~100.** The 117 is `docs`/`shell`/`split`/`mail` — four presets with **no `--measure`**, prose on 51–59em fluid tracks. Rewrite as a fluid-track finding. |
| `styles/layouts/space/readme.md:544–546` | "~96 characters a line at 3440 … **because** the measure is in `em` and the body font-size clamp grows with the viewport" | Number ≈ right (~100); **the causal clause is wrong** — chars/em is viewport-invariant, proven twice above. |
| `styles/layouts/space/readme.md:107–108` | "a `main` track … measured 117 at 1920" | Correct **in its own context** (a generator bug, since fixed). This is the sentence `:343` mis-borrows. |
| `ext/LayoutTool/taste/corpus.js:23–31` (`BREAKS[0]`) | "52em is already ~117 characters a line here"; `why:` "runs 117 characters a line at 3440" | **~100.** The case still stands — 100 is still past the `ok` ceiling of 92, so `base` still needs its 30em bind — but the number is wrong and this one is load-bearing code comment, not prose. |
| `styles/doc/measure.md:28–30` | "the current token's real page-level median is ~53 characters, not 94–117" | **~99–100.** 53 is `read().measure` — a median over text *blocks*, contaminated by code listings and card blurbs — not characters per line. The whole finding table (`:22–26`, 53.0/51.2/54.0) is an instrument reading. |
| `styles/doc/measure.md:85–91` (Option 1 pick) | "leave it — the median (53) is inside the readable band" | **The argument is void**; the median is ~100, above the 45–85 band *and* above the site's own 52–68 ideal. The *conclusion* may still survive on the `width-used` cost alone (that half of the sweep is sound and independent), but it has to be re-argued. |
| `styles/doc/measure.md:152–159` | the 42 `Doc`-shaped pages are "entirely outside the token's reach" | True of the **declaration**, misleading about the **outcome**: measured, `core/App/`, `core/Page/` and `ext/LayoutTool/` paragraphs land at **54.7em ≈ 105 characters** — *wider* than the token, not exempt from the problem. |
| `ext/LayoutTool/taste/read.js:19` and `:45` | the `measure` band | Two real defects: `chars > 80` admits `<pre>`/`<code>`/`span.hljs-*`; a median over blocks averages a reading column together with cards and captions. Ten routes: 24.4–254.3, never within 40 of the hand count. **The band as written does not measure the reading column.** `probe.js`'s per-node arithmetic is fine (−2%) — the population is the bug. |
| `web/layout/measure/page.js:31` | "936px, about **104 characters**" | **Already correct** (measured 106). The only place on the site that had it right. |

## 5. Confidence

**Very high** on the hand count (2.04 chars/em at the fill line, 1.90 median over
real copy): two independent methods, four viewports, two token values, agreeing
to within 2 characters and perfectly flat across viewport, with the font
confirmed as Montserrat (`document.fonts.check` true) inside the real theme
scope.

**High** on the diagnosis of `read.js` and of the mastermind's 117 — both
reproduced directly, with the specific nodes and presets named.

**Medium** on "~100 is the right target to argue from": that is the *longest-line*
statistic. If the question is instead "what does a reader typically sweep", the
mean over full lines is ~101 at 52em and the honest median over all real
paragraphs including short ones is lower.

**What would change my mind:** a specimen where Montserrat's advance differs
materially from 0.49em — heavy inline `<code>`, a lot of capitals, or a language
with wider glyphs. My real-copy p10 of 1.62 chars/em (= 84 at 52em) is that case
already, so the *band* would widen downward, not the median. Nothing viewport-
dependent would change it: three independent measurements now say the count is
flat, and any instrument that reports otherwise has found its own bug.

⚠ **First trap for whoever re-runs this:** append the specimen **inside
`.theme-lew42`**, not to `document.body`. `--font: Montserrat` is scoped to that
class on the `.app` div (`app.js:62`), so a specimen in `body` silently renders
in `system-ui` and hand-counts **120 characters at 52em** — a 13% error that
looks perfectly plausible.
