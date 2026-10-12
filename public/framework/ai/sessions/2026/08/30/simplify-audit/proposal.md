# Simplify — where the weight actually is

**The ask:** *"analyze the thoroughness and simplicity of our styles, UI, layouts, etc. we need to greatly simplify our framework."*

**The finding, in one line:** the styles are not the problem. **The framework carries 4.9 MB of prose against 2.9 MB of executable code — 1.7 words of explanation for every word of program.** Every utility word in the whole vocabulary fits in 6.8 KB.

---

## 0. The one measurement that reframes the question

Everything under `public/framework/`, excluding the `ai/` task log:

| | bytes | files |
|---|---|---|
| markdown (`*.md`) | **3,821 KB** | 1,139 |
| JavaScript | 3,480 KB | 810 |
| CSS (`*.css`) | 472 KB | 94 |
| CSS inside `` css(`…`) `` template literals | 26 KB | 71 blocks in 40 files |

Split each by comment ratio:

| | code | prose | prose % |
|---|---|---|---|
| CSS | 204 KB | **273 KB** | **57%** |
| JS | 2,656 KB | **793 KB** | 23% |
| markdown | — | 3,821 KB | 100% |
| **total** | **2,860 KB** | **4,887 KB** | **63%** |

`framework.css` itself is 72% comment. `Page.css` is 76%. `ext/Panel/panel.css` and `ext/catalog/catalog.css` are 83%.

**This is not automatically a defect** — CLAUDE.md says *"deep docs may breathe"*, and the comments are the reason the census below could confirm or refute a claim in seconds. But it is where the mass is, and any plan that starts with the CSS vocabulary is optimising 0.3% of the byte budget.

---

## 1. The CSS vocabulary census

`framework.css` defines **51 class words**; `public/styles.css` (the site skin) defines **28**. Raw data: [`census.json`](census.json) — 51 `rows` + 28 `site_rows`, the two numbers agree with this section.

Method: a word's **live** count is `.c()` / `.ac()` / `.rc()` / `.tc()` string tokens plus `class=` attributes across all of `public/`, **excluding** `framework/ai/` (the task log) and `framework/styles/` (the pages that are *about* the vocabulary). Counting those would let a word justify itself with its own documentation.

### The headline

- **All 51 definitions total 6,838 bytes** — 20% of `framework.css`, 1.4% of the CSS budget.
- **10 words carry 2,401 of 3,051 live applications (79%)**: `flex`, `gap`, `pad`, `mb`, `muted`, `v`, `v-center`, `wrap`, `btn`, `auto`.
- **Zero `!important` declarations in 94 CSS files.** (Two files contain the *word* — both inside a comment explaining why one wasn't needed.) The layer system is doing its job.

### The dead list — 15 words with ≤2 live applications

`all-pad · checkered · code · h-center · h1 · icon · masonry · material-icons · packed · zoom-75 · zoom-100 · zoom-150 · zoom-175 · zoom-200 · zoom-responsive`

**Total: 1,413 bytes — 4.1% of `framework.css`, 0.3% of all CSS.** Deleting every one of them is a rounding error. Two corrections before anyone acts on the list:

- **`icon` and `material-icons` are not dead.** They are applied by the `icon()` factory in `View.js` (`el.c("span", "material-icons icon", name)`), not typed. My scanner counts typed classes; a factory-applied class is invisible to it. Same caveat applies to anything `View.classify()` derives from a subclass name.
- **`zoom-75`, `zoom-175`, `zoom-200` have zero application sites anywhere in `public/`** — every occurrence is prose *about* them, in `arya/` and `edric/` doc pages. `framework.css`'s own comment says *"EIGHT of these nine have real call sites… A scale that is used is not a scale nobody asked for, so it stays."* **The count says five.** And `arya/styles/page.js` still advertises `.zoom-50 … .zoom-200` as a range including `zoom-125`, which was deleted. This is the one place in the census where a documented claim is falsified by the code.

### The redundant list — two words, one effect

| pair | live uses | verdict |
|---|---|---|
| `.gap` (reads `--gap`) vs `.gap-2em` (hardcoded) | 448 vs 13 | `.gap-2em` **is** `.gap` + `.style("--gap","2em")`. 26 bytes; it contradicts the token pattern `.pad`/`.gap`/`.basis` all follow. |
| `.masonry` (CSS columns) vs `.packed` (measured grid) | 0 vs 1 | Two masonry walls, 391 bytes, alive only on their own two doc pages. Documented as a deliberate worked-both-ways pair. |
| `.flex.all-1` vs `.flex.auto` | 3 vs 79 | Both make children grow; `all-1` adds nothing `flex-1` on each child doesn't. |
| 8 `zoom-*` rungs vs the `--zoom` token shape | 5 rungs used, 3 unused | The ladder was audited once as *"a scale nobody asked for"*, defended with a count, and the count was wrong. |

### The confusing list — same word, different meaning by context

| word | rules | the meanings | live |
|---|---|---|---|
| `auto` | 5 | `.flex.auto` = auto-fill flex tracks **+ wrap**; `.grid.auto` = auto-fit grid tracks; `select.auto` = `width:auto`; `textarea.auto` = `field-sizing` | 79 |
| `three` | 3 | `.flex.three` and `.grid.three` do the same visual thing by completely different math | 9 |
| **`app` · `md` · `grid` · `flow`** | — | **each defined TWICE — once in `framework.css`, once in `styles.css`, in two different layers.** A reader grepping one file finds half the rule. | 5 / 4 / 61 / 66 |

That last row is the census's most actionable confusion finding: four words, two homes, no marker in either file saying the other exists.

**Verdict on the vocabulary: it is tight, defended, and small.** Cutting words here would be honest tidying but buys ~1 KB. **Do not start here.**

---

## 2. The component overlap map

Ext modules, by importers outside their own directory (excluding `ai/` and `core/new/`):

| system | JS LOC | CSS KB | real callers | verdict |
|---|---|---|---|---|
| `ext/DesignTool` | 5,635 | 10 | 10 | dev tooling shelved in `ext/` (a prior audit made the same charge) |
| `ext/Panel` | 4,483 | **75** (15 files) | 4 (homepage band, editor shell, `files/panels.js`, `layouts/space`) | load-bearing, but 75 KB of CSS for 4 callers |
| `ext/demo` | 1,755 | 33 | 15 | most-used module in the tier — earns it |
| `ext/Playground` | 1,623 | 17 | **0** | nav-reachable, zero code importers |
| `ext/AITask` | 1,519 | 20 | 4 | the task-log viewer — earns it |
| the other 20 ext modules | 4,189 total | 26 total | 1–10 each | |

**Panel + Playground + DesignTool = 11,741 LOC = 55% of `ext/`'s 21,204 JS lines**, and all three are tools for building the site, not parts of it.

### The verified doubles

- **Panel vs Playground** — Playground is 36% of Panel's JS and 23% of its CSS, but it is **not a subset**: zero shared imports, different mechanism (CSS-property authoring vs window/region chrome + persistence). The 2026-08-19 memory note *"Playground IS the simpler Panel"* is **half wrong**. The one genuine duplicate is narrow: both hand-roll the same hug/fill/fixed sizing model (`Panel/size.css`, 11.4 KB, vs `Playground/items.js#size_decls`).
- **`ext/catalog.catalog()` (≈25 sites) vs `imagine/blogx`'s rail (0 external sites)** — same idea (a persistent list of children beside content), reinvented from scratch, 22 KB of CSS, zero shared code. The blogx rail adds nothing catalog's lacks.
- **Sticky-rail CSS, four times with unexplained drift** — `Sidebar`, `Doc`'s member rail, `ext/toc`, `ext/files`' tree. **Two independent auditors reached this in August without knowing about each other.** Still not fixed. `scrollbar-width: none` here, `thin` there.
- **Demo variants — 14, 584 call sites** ([demo-merge proposal](../demo-merge/proposal.md), already audited; not redone). 14 → 6. Dead: `twin()` 0 calls, `demo.stage.two` 2 calls. 17 sites hard-code `height:` + `overflow:auto` and clip content — 6 of 8 sampled pages cut content at 1920, worst hides 74%.
- **Generators — three, zero shared code.** `styles/layouts/space/` (1,564 LOC, 3 real callers, shipped infra Panel depends on) vs `core/Page/generator/` (1,180 LOC, **23 KB CSS**, 1 caller, showcase only). Its own readme admits the parallel: *"there a line is a box, here a line is a page."*
- **`imagine/decks` (0 external callers, 16 KB CSS) and `imagine/blogx` (0, 22 KB CSS)** — 8–10 self-contained variant pages each, never called from outside their own directory.

### The systems that only *look* doubled

- **`Page.preview_card()` (≈64 external call sites) vs `catalog()`/`browse()`** — catalog *consumes* preview_card. A real layer, not duplication. `preview_card` is the most reused primitive in the repo.
- **`ext/tabs` (14 real sites) vs `core/Sidebar` (3 live rails)** — tabs swaps a panel in place, Sidebar navigates away. Visually similar, not interchangeable.
- **`ui/` (20 components, 4 external importers) vs `ux/` (8 classes, 1)** — the low import counts are **by design**: `ui/` is copy-paste markup, so an import count of 0 is the intended state. Judge these two tiers by page traffic, not by imports.

---

## 3. Layered-CSS health

**Healthy — better than expected.** The `@layer base, theme, site, util` declaration is stated exactly once (`framework.css` line 11), and the evidence it works is that there is **not one `!important` declaration in 94 CSS files.** Two files contain the word; both times inside a comment saying an `!important` wasn't needed because the layer order already won. A four-layer cascade with zero escapes is a rare thing and it should be left alone.

The cost shows up as prose instead: **32 mentions of "specificity" / "out-rank" across 17 `doc/decisions.md` files**, 140 across all markdown, 185 across all file types. Those are 17 modules that each had to *reason about the cascade in writing* to place one rule. That is the tax of the current structure, and it is paid in documentation rather than in `!important` — which is the better of the two, but it is not free.

The one structural wrinkle the layer comment itself names: *"Plus one thing that isn't [a utility]: the arrangement contract, in Page.css, which has to out-rank a `display` utility."* One documented exception in the whole system.

**Second CSS home:** 26 KB of CSS lives inside `` css(`…`) `` template literals in 40 JS files (`ui/` alone is 10 KB, `core/` 14 KB). Two mechanisms, two places to grep. `ui/` reports "0 CSS files" to any tool that looks for `*.css`.

---

## 4. The ranked proposal

Ordered by value ÷ risk. "Loses" = what a visitor to the site would notice.

### 1 — Delete `core/new/0/` and `core/new/starter/`; keep `new/1/`
**Evidence:** `core/new` is **445 files, 2,861 KB, 308 of the framework's 533 `page.js` files, 30,608 JS lines = 81% of `core/`'s JS, 98 KB of CSS**. **Zero importers** — CLAUDE.md rules it un-importable. The 2026-08-15 audit read all 425 files and reported their value *already fully extracted into prose*.
**Risk:** near zero. **Effort:** one afternoon. **Loses:** nothing — three core readmes cite `new/1/`'s measurements, which is why `new/1/` stays.
**Buys:** the single largest cut available, and it makes every future `find`, grep, crawl and audit ~40% cheaper.

### 2 — Fix the 17 fixed-height demo clips
**Evidence:** 17 sites hard-code `height:` + `overflow:auto`; 6 of 8 sampled pages clip content at 1920, worst hides 74%. Already scoped as Step 1 of [demo-merge](../demo-merge/proposal.md), explicitly designed to stand alone.
**Risk:** near zero (`height` → `min-height`). **Effort:** an afternoon. **Loses:** nothing. **Buys:** the loudest visible defect on the site, gone.

### 3 — One shared rail stylesheet
**Evidence:** four implementations with drift (`Sidebar`, `Doc` member rail, `ext/toc`, `ext/files`), **found independently by two auditors in August and still open**. Nobody argues the components should merge — the "which is current" logic genuinely differs. The CSS does not.
**Risk:** low, visual — needs a before/after shot at 400/1920. **Effort:** a day. **Loses:** nothing. **Buys:** the strongest unification finding on record, closed.

### 4 — Collapse the demo tier, 14 variants → 6
**Evidence:** 584 call sites, 14 variants, `twin()` at 0 calls. Migration already staged in 5 steps by the sibling audit; the prototype at `/framework/ext/demo/shell/` is verified at 400/1920/3440.
**Risk:** medium — 231 sites get remapped, though through four adapter files, not 231 rewrites. **Effort:** several days. **Loses:** nothing. **Buys:** the tier with the most call sites in the framework becomes learnable in one sitting.

### 5 — Extract the hug/fill/fixed sizing model from Panel and Playground
**Evidence:** `Panel/size.css` is 11.4 KB; `Playground/items.js#size_decls` re-implements the same truth table with zero shared code. Playground has **0 importers**, so it can be changed freely.
**Risk:** low (Playground has no downstream). **Effort:** a day. **Loses:** nothing. **Buys:** the one real Panel/Playground overlap, resolved — and it settles the standing "is Playground the simpler Panel" question with a merge instead of an argument.

### 6 — Give the four double-defined words one home
**Evidence:** `app`, `md`, `grid`, `flow` are each defined in **both** `framework.css` and `styles.css`, in different layers, with no cross-reference in either file.
**Risk:** low but real — the two halves are in different layers on purpose (theme vs site). Minimum viable fix is a one-line pointer comment in each file. **Effort:** an hour. **Loses:** nothing.

### 7 — Delete `.gap-2em`, `.all-1`, and the three zero-use zoom rungs
**Evidence:** 13, 3, and 0 live uses. **Total recovered: ~110 bytes.**
**Risk:** trivial. **Effort:** minutes. **Loses:** nothing.
**Listed seventh on purpose.** It is the item that looks most like "simplifying the styles" and buys the least. Do it while you are in the file, never as a project. And when you do, **fix the `arya/styles/page.js` line that still advertises `.zoom-125`**, which no longer exists.

### 8 — Move `ext/DesignTool` to `dev/` (and consider `ext/editor`, `ext/Playground`)
**Evidence:** 5,635 LOC of browser tooling under a directory CLAUDE.md defines as *opt-in addons the site imports*. `ext/Playground` has zero importers (counted); the 2026-08-15 audit reports the same of `ext/editor` — *"zero lines of code anywhere in the framework import anything it exports"*, integrated only by being a route. Combined with Panel, three modules hold 55% of `ext/`'s JS and none of them is a site part.
**Risk:** medium — it is a rename with a dozen callers, which CLAUDE.md says to ask about first. **Effort:** a day. **Loses:** nothing. **Buys:** `ext/` becomes readable as a list of things a site uses. **This is the owner's call, not a minion's.**

### 9 — Decide what `doc/file/*.md` is for
**Evidence:** **371 files, 734 KB** — one markdown file explaining one source file, 19% of all the framework's markdown. Against 83 readmes and 75 `decisions.md`.
**Risk:** this is a policy question, not a refactor — the convention may be exactly right. **Effort:** a decision, then a sweep. **Loses:** the Files tab, wherever it is cut.
**Why it is on the list:** it is the second-largest single mass in the framework after `core/new`, and unlike everything above it, no one has ever asked whether it earns its keep.

---

## Do not touch

- **The 51-word utility vocabulary.** Every word is documented with the measurement that produced it, `--grow`'s comment carries the basis-scaling trap that would otherwise be re-learned, and the whole thing is 6.8 KB. It is the healthiest part of the framework.
- **`@layer base, theme, site, util`.** Zero `!important` in 94 files is the proof. Do not "simplify" this into flat CSS.
- **`Page.preview_card()`** — ≈64 external call sites, the most reused primitive in the repo.
- **`ext/tabs` and `core/Sidebar` as separate things.** They look like one system; one swaps a panel in place, the other navigates away.
- **`ui/` and `ux/`'s low import counts.** `ui/` is copy-paste markup by design — an import count of 4 is the intended state, not decay. Judge these tiers by traffic.
- **`styles/layouts/space/`** — looks like a duplicate of `core/Page/generator/`, but it is shipped infrastructure `ext/Panel` depends on. It is `core/Page/generator/` (1 caller, 23 KB CSS) that is the showcase.
- **`core/new/1/`** — three core readmes cite its measurements rather than repeating them. Cutting it would move prose, not delete it.
- **The CSS comments.** 57% is a startling number and it is not the enemy: this audit could check every claim in the file against a count *because* the claims were written down. Cut files, not explanations.

---

## The three moves I would make first

1. **Delete `core/new/0/` and `core/new/starter/`.** 445 files and 2.8 MB is the largest cut on the board, it has zero importers by rule, it holds both of the site's `!important`s, and a prior audit already read every file and cleared it. Nothing else on this list changes the framework's *size* by a comparable amount, and every later step gets cheaper once the tree is 40% smaller.
2. **Fix the 17 demo height clips.** It is an afternoon, it is already scoped, it needs no decision, and it removes the only defect on this list a visitor can actually see.
3. **Take the `doc/file/*.md` decision to the owner.** 371 files and 734 KB is the second-biggest mass in the framework and the only one nobody has questioned. It is not a refactor and it is not mine to make — but until it is answered, "greatly simplify" has a ceiling, because prose is 63% of what is there.

**And the thing not to do:** do not start with the styles. The whole utility vocabulary is 6.8 KB, the dead quarter of it is 1.4 KB, and the layer system everyone worries about produced not one `!important` across 94 stylesheets. The framework's styles are already simple. Its **file count** is not.
