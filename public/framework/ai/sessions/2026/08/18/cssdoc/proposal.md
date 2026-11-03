# CSSDoc — the rules that land on an element, pulled live

| # | question | verdict |
| --- | --- | --- |
| 1 | where | `ext/CSSDoc/` exporting **`cssdoc(target)` — a block, not a page type**. Doc gets a `styles:` section later, in ~12 lines |
| 2 | unit | **the target** (one element/class), not the selector. Measured: 8 rules from 3 files and 3 layers land on one `pre > code` |
| 3 | how | walk `document.styleSheets` → recurse `CSSLayerBlockRule`/`CSSMediaRule`/`CSSContainerRule`; **`getComputedStyle` names the winner** — verified, 1316 rules |
| 4 | filename | `doc/style/<name>.md`, `<name>` from `css-scopes.txt`. **A selector is never a filename** — it is a row |
| 5 | shows | live specimen, then the rule table in cascade order, then prose. The table is generated; only the *why* is typed |

## The page this was supposed to be already exists, and it is wrong in four places

`/framework/styles/elements/code/` — "*Every element the framework styles, rendered beside the
rule that styles it*". Excellent prose, six live demos, and every CSS rule in it hand-copied.
Checked against the live CSSOM tonight:

| the page says | the browser says |
| --- | --- |
| `pre > code { padding: 0; background: none }` | `…; box-shadow: none` — **the missing third declaration is tonight's bug** |
| "Both boxes share `pre, code { background: var(--code-bg…) }`" | `pre` has `--code-bg`; `code` has `var(--wash)` + the hairline. Two rules, not one |
| `pre, code, .code { font-family: var(--mono) }` (quoted 3×) | `pre, code, kbd, samp, .code` |
| "**Neither** [kbd/samp] is in `framework.css`" | both have been in that rule since it grew two words |

The doc that should have caught the defect **stated the rule and omitted the declaration**. That
is not a discipline problem — it is `files:`' failure mode (`ext/Doc/doc/files.md`) applied to CSS,
and the answer is the same one `files:` could not use: the declarations are *available at runtime*,
so they must never be typed.

## 1. Where it lives — a block, not a fifth tab

`styles/elements/code/page.js` is a plain `Page`, not a `Doc`. So is every page under
`/framework/styles/`. `framework.css` — the actual subject, the file with the defect — has no
module page at all. **A `styles:` section on `Doc` would reach none of them.**

What is reusable is *a view that renders the live rules for one target* — the same shape as
`demo()` and `md()`: a function you call inside any `content()`. Build that. Doc adopts it later
as a section (`styles: "panel-grip panel-bar"` → `doc/style/<name>.md`) in about twelve lines
copied from `files_section()` — that is "extend, never configure" honoured, just not first.

The owner's instinct, `doc/style/<classname>.md`, is kept for the **prose** file. It is only the
"whole design is a Doc tab" reading that the pages refute.

## 2. The unit is a target

Measured on `/framework/ext/Doc/`, with a `<code>` in a sentence and a `<code>` in a `<pre>`:

```
INLINE code — 6 rules              pre > code — 8 rules
  1 [base ] *, ::before, ::after     1 [base ] *, ::before, ::after
 30 [theme] code                    30 [theme] code
 32 [theme] code                    32 [theme] code
 33 [theme] pre, code, kbd, samp    33 [theme] pre, code, kbd, samp, .code
                                    34 [theme] pre > code          ← the reset
 91 [util ] :last-child             90 [util ] :first-child
247 [theme] .theme-lew42 :is(…)     91 [util ] :last-child
                                   247 [theme] .theme-lew42 :is(code, pre, .code)
```

Three arguments, all from that measurement:

- **A selector page for `code` would not contain `pre > code`.** The two rules the defect is about
  live on different selectors. Only a target page holds both.
- **One rule belongs to five targets.** `pre, code, kbd, samp, .code` has no single home as a file;
  as a row it appears correctly on all five target pages.
- **The rules are not co-located.** `code` finds 7 rules in 4 files —
  `framework.css`, `lew42.css`, `highlight.css` (`code.code-inline`) and `space.css`
  (`.space-word > code`). Grepping `framework.css` finds four of seven.

The target's identity is the page's own url slug — `/framework/styles/elements/code/` documents
`code`. Nothing is declared, so nothing can go stale (see §rot).

## 3. The CSSOM walk — measured, not asserted

Headless Chromium against `http://localhost/framework/ext/Doc/`, one page: **72 stylesheets
(58 `<link>`, 14 `<style>`), 1316 style rules, 86 `@layer` blocks, 27 `@media`, 10 `@container`,
0 `@import`, 0 cross-origin failures.** Of those 1316, **8 land on the element.** The filter is the
whole product.

The three APIs: `CSSLayerBlockRule.name` (join nested names with `.`), `sheet.href`, `rule.cssText`.
Layer *order* is `CSSLayerStatementRule.nameList` on the first sheet → `["base","theme","site","util"]`.

Traps, each verified:

| trap | measurement |
| --- | --- |
| **Pseudo-element rules vanish silently** | `el.matches("code::before")` returns **false and never throws**. Strip `::x` from each comma-part before matching, or lose every `::before`/`::after` rule with no error |
| **14 of 72 sheets have no source file** | `ui/parts.js`'s `css()` appends a bare `<style>` — no href, no id, no attributes. ~1 in 5 rules cannot name its file. One-line fix: `css(rules, import.meta)` stamping `data-src` |
| **There is no line number** | The rule object exposes `cssText selectorText style parentRule parentStyleSheet` and nothing positional. And `cssText` is *normalised* (`*, *::before, *::after` → `*, ::before, ::after`; `0` → `0px`), so grepping the file for it is unreliable too. **Link the file, never a line** |
| **Invalid declarations are already gone** | `{ color: reed; padding: 0; wibble: 3 }` parses to `{ padding: 0px }`. A typo shows up as a *missing row* — a feature, and the reason a source-text diff is the wrong design |
| **Non-matching `@media` rules are in the walk** | 19 of them. Do not hide them — label them `only when (width < 34em)`. That is exactly the variant you need to see while editing |
| **There is no specificity API** | And none is needed — see below |
| **CSSOM sees only *this* document** | `.space-word > code` appeared because `space.css` happened to be loaded. A target page must load the sheets it claims to document, and say so |

**The winner is `getComputedStyle`, not a specificity calculator.** For every property any matching
rule mentions, the computed value on a live specimen *is* the resolved cascade — no layer maths, no
re-implementation, no drift:

```
box-shadow    = none                      set by: theme/code | theme/pre > code
padding       = 0px                       set by: theme/code | theme/pre > code
font-family   = Consolas, "Courier New"…  set by: theme/pre, code, kbd, samp, .code
font-weight   = 700                       set by: theme/.theme-lew42 :is(code, pre, .code)
```

Two rules touch `box-shadow`, and the second wins with `none`. **On the inline specimen the same
row reads `rgb(230,230,230) 0 0 0 1px inset` from one rule.** Two specimens, one table, and the
defect is a diff you cannot miss.

## 4. Filenames, and why selectors are not files

Prose file: **`doc/style/<name>.md`**, `<name>` matching `[a-z0-9-]+` — the exact grammar of
`css-scopes.txt`. `code`, `flow`, `measure`, `panel-grip`. An element and a class of the same
spelling (`code` and `.code` both exist today) are **one page, not a collision**: `.code` exists to
give the `code` look to something else, and a reader wants both listed. The merge is the feature.

Selectors get a row and an anchor, never a file. Five real ones, and what a filename would cost:

| selector (file) | as a filename |
| --- | --- |
| `pre > code` (framework.css) | `pre-gt-code.md` — fine, and the only one that is |
| `pre, code, kbd, samp, .code` (framework.css) | no single home; it belongs to five targets |
| `.theme-lew42 :is(code, pre, .code)` (lew42.css) | `_theme-lew42--is-code-pre-_code.md` — 33 chars, three meanings of `-` |
| `.master-detail:has(> .page.active-page) > .master-empty` (compound.css) | 55 chars, and `-` now means `.`, `>`, ` ` and `:` — **not reversible** |
| `@media (max-width: 52em) { .sidebar .sidebar-toggle }` (Sidebar.css) | the condition is not part of the name at all |

A filename must round-trip; an anchor must only be unique. So anchors are
`#<file-stem>--<selector slug, 40 chars>` and nothing depends on decoding them.

## 5. What the page shows — the `code` page, as it would render

Above the fold, in order:

1. **The specimen, twice, live** — an inline `<code>` in a sentence and a `<code>` inside a `<pre>`,
   rendered by the real stylesheets. Law 1: the thing itself, first.
2. **The rule table**, cascade order, one row per rule, generated:

   `34 · theme · framework.css · pre > code · padding: 0px; background: none; box-shadow: none`

3. **The property table** — every property any rule mentions, its computed value on *each*
   specimen, and which rules set it. This is the row that catches an unreset declaration.
4. **Prose** — `doc/style/code.md`, typed by a human, appended below.

Everything above the prose is generated. Nothing in it can be stale, because it is read from the
sheet the browser is currently using.

## The four one-liners

- **`new-css-class`** — `css-scopes.txt` is already the target index; the skill gains one step:
  drop a one-line `doc/style/<name>.md` next to the new class.
- **Authoring cost** — zero for the rules, ever. A target costs *one word* if declared, and nothing
  at all when derived from the url. The prose file is optional and can start empty.
- **Human vs generated** — a human writes *why the rule exists, the caveat, the past defect*
  (the four stale quotes above were valuable prose wrapped around wrong facts). A human must never
  write a declaration, a selector, a layer name, a file name, or a computed value.
- **Rot, and the guard** — the rot is a *declared target list* going stale, exactly like `files:`.
  Cheapest guard: **do not declare one.** Derive the target from the page slug in v1; when a
  `styles:` list does arrive, render a visible "0 rules match this target" box on the page itself,
  where the person who can fix it is already looking.

## Ship tomorrow

**One file: `public/framework/ext/CSSDoc/CSSDoc.js`, exporting `cssdoc(target)`.** One call site:
the top of `content()` in `public/framework/styles/elements/code/page.js`. One real subject: `code`.
Estimated ~120 lines — the walk is ~25, the matcher ~10, the two tables the rest.

Deliberately not in v1: no `doc/style/*.md` prose files (the six demo notes already there stay put),
no `Doc` section, no `styles:` declaration, no specificity column, no `@media`/`@container`
variant rendering beyond a label, no cross-page aggregation, and no fix to `ui/parts.js` — the 14
anonymous sheets simply show `<style>` as their file until someone wants that column complete.

The acceptance test is one screen: open `/framework/styles/elements/code/`, and the `box-shadow`
row reads *one rule, a hairline* on the inline specimen and *two rules, `none`* on the block.
Tonight's defect is the case where the second number is still one.
