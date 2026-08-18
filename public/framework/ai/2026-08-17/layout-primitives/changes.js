/* The change list, as data — the page below is one loop over it.
   `class`: "broken" is a defect Mike can see in the before shot; "maybe" is a
   judgement call he can reject without anything regressing.
   `wave: 2` is a fix the vision tool asked for AFTER the first wave shipped
   (`../vision-after/proposal.md`), landed by `../layout-wave-2/`. */

export const CHANGES = [

	{
		id: "card-frame",
		title: "Every card wears the surface, thumb or no thumb",
		cls: "broken",
		wave: 3,
		line: "One `:not(:has(> .page-preview-thumb))` guard said a card that shows a render needs no frame around it. What it actually drew was a picture with a caption floating under it and nothing around either, so the caption reads as a **heading for the empty row below** — 38 findings on 15 pages, 8 on `/framework/ui/`@1280 alone. \"Floats unframed\", \"the Panel column is empty\", \"no boundary between demos\" were all this one selector.",
		before: "a thumbed card: no surface, no border, no padding",
		after: "one rule, no exception — every card is a box",
		css: `.page-preview { padding: 0.9em 1em; background: var(--surface); border: 1px solid var(--line); }
- .page-preview:not(:has(> .page-preview-thumb)) { … }`,
		deletes: "The guard, and with it one `:has()`. Reverting is putting the `:not(:has())` back on one selector.",
		files: ["core/Page/Page.css"],
	},

	{
		id: "muted",
		title: "`.muted` was under AA in 253 call sites",
		cls: "broken",
		wave: 3,
		line: "The largest single contrast defect on the site, and a different mechanism from wave 2's `--subtle`: `.muted` derives from whatever ink it sits on, which is the right idea — 65% of it was simply too little. ⚠ The sweep also proved wave 2's `--subtle` bump **never shipped**: `lew42.css:18` overrides `:root`, so `framework.css:66` reached no pixel of this site. Left alone deliberately — the theme's own `#6a6a6a` is 5.41:1 / 4.83:1, already darker than the bump and over AA on both.",
		before: "65% of `#3f3f3f` — #828282 **3.84:1** on white, #7e7e7e **3.63:1** on `--wash`",
		after: "75% — #6f6f6f **5.02:1** and #6c6c6c **4.69:1**",
		css: `.muted { color: color-mix(in srgb, currentColor 75%, transparent); }   /* was 65% */`,
		deletes: "Nothing. Reverting is two digits in `framework.css`.",
		files: ["framework.css"],
	},

	{
		id: "tab-fade-both",
		title: "The tab strip fades at BOTH ends",
		cls: "broken",
		wave: 3,
		line: "Wave 2 fixed the right edge and left the other one. A strip auto-scrolls to bring the active tab into view, so the overflow lands on the **left** as often as the right — `SHELL` rendered as `ELL`, 19 findings on 7 pages, and every bar involved is `ext/tabs`, none foreign. The left fade is exactly `--tab-pad-x` wide, so an unscrolled strip loses one tab's own padding and no glyph.",
		before: "`ELL` — a hard cut at the left edge",
		after: "a 0.9rem fade left, 2em right, the hairline still intact",
		css: `--tab-fade: linear-gradient(90deg, transparent, #000 var(--tab-pad-x, 0.9rem),
                            #000 calc(100% - 2em), transparent),
            linear-gradient(to top, #000 1px, transparent 1px);`,
		deletes: "Nothing. Reverting is one gradient stop pair in `ext/tabs/tabs.css`.",
		files: ["ext/tabs/tabs.css"],
	},

	{
		id: "code-inline",
		title: "Inline `code` is a wash, not a dark pill",
		cls: "broken",
		wave: 3,
		line: "`pre` and `code` shared one `--code-bg`, so a theme asking for a dark code **block** (lew42 does, per its comp) also got a dark filled pill around every inline `` `code` `` — six per paragraph on `/framework/core/` and `/web/`, \"the heaviest visual elements on the page\", pulling the eye mid-sentence. 22 findings on 13 pages. The block keeps the token; inline takes the same `--wash` a `th` or a hover takes, and reads better by contrast too.",
		before: "`#e6e6e6` on `#3f3f3f` — a dark pill mid-sentence, 8.44:1",
		after: "`#3f3f3f` on `--wash` — a tint, 9.41:1",
		css: `pre  { background: var(--code-bg, var(--wash)); color: var(--code-ink, inherit); }
code { background: var(--wash); }        /* was the same line as pre */`,
		deletes: "The conflation. `--code-bg` now means the block, which is what every theme setting it was drawing. Reverting is one line in `framework.css`.",
		files: ["framework.css"],
	},

	{
		id: "prim-ink",
		title: "The accent has a text twin — the orange stays a fill",
		cls: "broken",
		wave: 3,
		line: "`--prim` is `#FF8F60`: **2.25:1** as ink. It is also the only mark an active link wears, so \"no visible active-state indicator\" and \"reads as an accidental colour leak\" were the same 10 findings. An accent is picked to be seen as a *fill*; this is the same hue taken down until it reads as ink. A token, not a rule — `--prim-ink` defaults to `--prim`, so a theme whose accent already reads changes nothing. ⚠ Applied to the three text sites inside this task's fence; ~27 more still say `--prim`, most of them marks, outlines and fills that should.",
		before: "`#FF8F60` as text — **2.25:1** on white, **2.01:1** on `--wash`",
		after: "`#B84A24` — **5.19:1** and **4.64:1**; dark mode keeps the orange (7.98:1)",
		css: `--prim-ink: var(--prim);                              /* framework.css :root — the default IS the accent */
--prim-ink: light-dark(#B84A24, #FF8F60);             /* lew42.css */

.page-link.active, .page-link.in-path { color: var(--prim-ink); }
.page-preview:hover .page-preview-title { color: var(--prim-ink); }
:where(p, li, td, th, dd, blockquote, .md) a:hover { color: var(--prim-ink); }`,
		deletes: "Nothing yet. Reverting is deleting one token and three `-ink` suffixes.",
		files: ["framework.css", "styles/layers/theme/lew42/lew42.css", "core/Page/Page.css"],
	},

	{
		id: "pad-y",
		title: "The space above an `h1` scales with the page",
		cls: "maybe",
		wave: 3,
		line: "A flat `3em` is a quarter of the fold at 390 — 10 findings on 9 pages, and the value was added five hours earlier at Mike's own request, so this is a retune rather than a reversal. The clamp is the idiom `--gutter-x` already uses, so a page's two insets now scale together instead of one of them being fixed.",
		before: "`3em` — 42px at 390, 45px at 1280, 54px at 3440",
		after: "`clamp(1.5em, 4%, 3em)` — **21px** at 390, 42px at 1280, 54px at 3440",
		css: `--pad-y: clamp(1.5em, 4%, 3em);   /* was 3em */`,
		deletes: "Nothing. Reverting is one value in `core/Page/Page.css`.",
		files: ["core/Page/Page.css"],
	},

	{
		id: "thru",
		title: "NOT LANDED — the reach-through reaches nothing",
		cls: "maybe",
		wave: 3,
		line: "The sweep's biggest cluster (45 findings, 17 pages): `.page > .wide` is a **child** combinator and `md()`, `AITask` and `.tab-panel` all wrap, so nothing inside them can claim the track. Built it as a subgrid pass-through on `.flow` — the word core already owns — and measured it at three widths on both named pages: **not one pixel moved.** `display: contents` matched the widths and came out 40–54px shorter, which is the wrapper's box being lost. The word was already reachable; **nothing claims it** — `md()` emits raw marked output with no classes at all. Injecting the *claim* instead is one word in `AITask.js:76`, needs no Page.css rule, and is outside this task's fence. [The full write-up.](/framework/ai/2026-08-17/layout-wave-3/proposal.md)",
		before: "`mastermind-shots` @3440 — tables 720px inside a 2,986px page, 5,538px tall",
		after: "`\"ai-task flow wide\"` — tables **2,806px**, page **2,425px** tall. Four CSS rules: **no change at all**",
		imgs: [
			{ w: 1280, before: "wide-before-1280.png", after: "wide-after-1280.png", beforeW: 602, afterW: 890, beforeH: 5079, afterH: 4495 },
			{ w: 3440, before: "wide-before-3440.png", after: "wide-after-3440.png", beforeW: 720, afterW: 2806, beforeH: 6068, afterH: 2436 },
		],
		css: `/* measured, then NOT landed — four rules that move nothing on their own */
.page > .flow          { display: grid; grid-template-columns: subgrid; grid-column: bleed; }
.page > .flow > *      { grid-column: main; min-width: 0; }
.page > .flow > .wide  { grid-column: wide; }
.page > .flow > .bleed { grid-column: bleed; }

/* what actually pays, one word, ext/AITask.js:76 */
div.c("ai-task flow wide", …)`,
		deletes: "Nothing — nothing landed. Accepting is one word in `ext/AITask/AITask.js`.",
		files: ["ai/2026-08-17/layout-wave-3/proposal.md"],
	},

	{
		id: "measure",
		title: "The reading column is 40em, and every shell obeys it",
		cls: "broken",
		line: "`--measure: 52em` measured ~104 characters a line at every width above 1100, and the shells that opted out with `--measure: none` measured *worse* — 105 on doc pages, 250 on the report page. The token moved to 40em and the opt-outs are gone. The fourth opt-out, the **topic** shell (`/`, `/michael/`, `/framework/`), was outside the first wave's fence and is the one thing the vision run reported on `/framework/` both times; it is 40em now too.",
		before: "104 ch (standard) · 105 ch (doc) · 250 ch (report) · topic opted out",
		after: "80 ch everywhere",
		css: `.pages { --measure: 40em; }          /* was 60em */
.page  { --measure: 40em; }          /* was .page.standard { --measure: 52em } */
.page.topic { --measure: 40em; }     /* was none — /styles.css, wave 2 */

- .page.full     { --measure: none; --page-pad: 0; }
- .doc-section   { --measure: none; --page-pad: 0 var(--gutter-x); }`,
		deletes: "`.page.full`'s `--measure: none`, `.doc-section`'s, `.page.topic`'s. Reverting is one number in `core/Page/Page.css` and one in `/styles.css`.",
		files: ["core/Page/Page.css", "ext/Doc/Doc.css", "public/styles.css"],
	},

	{
		id: "strip",
		title: "Only a rail of cards turns sideways",
		cls: "broken",
		wave: 2,
		line: "Below 38em the container query flipped *every* rail into a strip. `/framework/ui/`'s rail is a search box and five filters: flipped, the box was a 176px empty square and all five filters sat off the scrollport behind a 2px sliver. The flip now asks whether the rail holds cards — a rail of controls stacks, which is what a control is already shaped for. Taking its own line stayed with every rail, and moved from `flex-basis` to `min-width`: `browse.css`'s `.browse-rail { flex-basis: 12em }` is the same specificity in the same layer and loads later, so the basis written here never won.",
		before: "rail 168px at 390 · the filter column at x=221, clipped · 14px of scrollbar gutter",
		after: "rail 278px on its own line · five filters as full-width rows",
		css: `@container page (width < 38em) {
    .rail { min-width: 100%; order: -1; position: static; max-height: none; overflow: visible; }
    .rail:has(> .page-preview) { flex-direction: row; overflow-x: auto; }
}`,
		deletes: "Nothing. Reverting is `.rail:has(> .page-preview)` back to `.rail` in three selectors.",
		files: ["core/Page/Page.css"],
	},

	{
		id: "subtle",
		title: "`--subtle` was under AA, on every page",
		cls: "broken",
		wave: 2,
		line: "\"Low contrast\" was the most-repeated finding the vision tool has ever made about this site — **6 of 6 pages, in both runs** — on tab labels, card descriptions, counts and sidebar group titles. All of them are one token.",
		before: "`rgba(0,0,0,0.5)` = #808080 — 3.95:1 on white, 3.81:1 on `--wash`",
		after: "`rgba(0,0,0,0.55)` = #737373 — 4.74:1 and 4.54:1, over AA on both",
		css: `--subtle: light-dark(rgba(0,0,0,0.55), rgba(255,255,255,0.55));   /* light half was 0.5 */`,
		deletes: "Nothing. Reverting is one digit in `framework.css`; the dark half (6.12:1) never moved.",
		files: ["framework.css"],
	},

	{
		id: "tab-fade",
		title: "The tab strip fades — a scrollbar never said \"more\"",
		cls: "broken",
		wave: 2,
		line: "`scrollbar-width: thin` shipped in wave 1 as the clipping fix and measurably is not one: at 900 `/framework/ext/DesignTool/` still drew \"KNOWLEDGE\" and then a sliced glyph at the frame edge, with no bar painted at all. A horizontal scrollbar is invisible in a screenshot and on a trackpad. Two mask layers, not one, because a mask applies to the **border** box: the fade alone took the hairline under the whole strip with it.",
		before: "`scrollbar-width: thin` — a sliced glyph, no bar",
		after: "a 2em fade · the hairline intact · scrolling unchanged",
		css: `.tab-bar {
    overflow: auto; scrollbar-width: none;                    /* was thin */
    mask-image: linear-gradient(90deg, #000 calc(100% - 2em), transparent),
                linear-gradient(to top, #000 1px, transparent 1px);
}`,
		deletes: "Wave 1's own `scrollbar-width: thin`. Reverting is two lines in `ext/tabs/tabs.css`.",
		files: ["ext/tabs/tabs.css"],
	},

	{
		id: "span-2",
		title: "A double-width card around the same empty interior",
		cls: "broken",
		wave: 2,
		line: "`grid-column: span 2` made one card — Stat tiles, its only user — twice as wide around a preview that draws nothing. And a span does not clamp itself: `auto-fill` must generate as many tracks as the widest span asks for, so it forced a second track at one column and overflowed the wall, which took a second rule to undo. Two rules for one void. `tall` keeps its height claim; the card's real defect is the missing preview, not the width.",
		before: "1 card double-width around a void · 2 rules, one undoing the other",
		after: "every card one track · `tall` unchanged",
		css: `- .page-preview:is(.two, .big) { grid-column: span 2; }
- @media (max-width: 28em) { .page-preview:is(.two, .big) { grid-column: span 1; } }`,
		deletes: "`.two`/`.big`'s column claim — `card: \"two\"` is inert now. Reverting restores both rules.",
		files: ["core/Page/Page.css"],
	},

	{
		id: "landing",
		title: "The landing's widths are two rules, not four inline styles",
		cls: "broken",
		wave: 2,
		line: "`/framework/` is one `.default` block rather than a grid page, so one max-width governs the prose, the clock band and the whole tree. It opted the block out with an inline `--measure: none` — the one thing the layout system says never to write — and then hand-typed `max-width: 52em` back onto each of the three prose blocks. Two rules say it once: the block takes the region, its prose takes the token. The band also had no heading, so nothing on the page named the thing it was demonstrating.",
		before: "prose 782px (~97 ch) at 1280 · 4 inline styles · an unlabelled band",
		after: "prose 602px at 1280 / 720px at 3440 (40em) · 0 inline styles · `## A live panel`",
		css: `.page-framework > .pages > .default        { max-width: none; }
.page-framework > .pages > .default > .flow { max-width: var(--measure); }`,
		deletes: "Three `.style(\"max-width\", \"52em\")` and one `.style(\"--measure\", \"none\")` in `framework/page.js`. Reverting is those four calls back.",
		files: ["public/styles.css", "framework/page.js"],
	},

	{
		id: "code-void",
		title: "A two-line snippet inside 2em of padding",
		cls: "broken",
		wave: 2,
		line: "The site skin padded every code block by `2em`, so a two-line example read as a large empty dark rectangle with some text in one corner — new at 1280 in the second vision run. `--pad` is the size everything else on this site is padded by, and a page that wants more can retune the token instead of the rule.",
		before: "`padding: 2em` — a dark void under two lines",
		after: "`padding: var(--pad, 1em)`",
		css: `.code-block { padding: var(--pad, 1em); }   /* was 2em */`,
		deletes: "Nothing. Reverting is one value in `/styles.css`.",
		files: ["public/styles.css"],
	},

	{
		id: "wide",
		title: "`wide` takes all the leftover, so three payback rules delete",
		cls: "broken",
		line: "The old `--breakout` capped `wide` at 1295px of a 3165px region, so nothing existed between the reading column and full bleed. Everything that wanted room had to claim `bleed`, spend the page's gutter tracks, and hand the inset back — in a separate rule per module.",
		before: "`.wide` = 1295px of 3440 · 3 payback rules",
		after: "`.wide` = 2366px of 3440 · 0 payback rules",
		css: `  minmax(0, 1fr) [wide-end]          /* was minmax(0, var(--breakout)) */
  var(--gutter-x) [bleed-end]        /* was minmax(var(--gutter-x), 1fr) */

- .page.standard > .page-catalog > .page-previews { margin-inline-start: var(--gutter-x) }
- .page.standard > .browse                        { padding-inline: var(--gutter-x) }
- .report-wide                                    { padding-inline: var(--gutter-x) }`,
		deletes: "`--breakout`; the payback rules in `catalog.css`, `browse.css` and `report.css`. `ai.css:196` is the fourth copy and is still embargoed.",
		files: ["core/Page/Page.css", "ext/catalog/browse.css", "ai/2026-08-17/report/report.css"],
	},

	{
		id: "rail",
		title: "`.rail` is sized by its row, not by the window",
		cls: "broken",
		line: "Every `@media` breakpoint in a component measured the **window** while styling a box inside a region that is window − 220–274px of sidebar. Below its threshold a rail is now a strip that scrolls sideways — never the short vertical scroll band that put 31,838px inside a 306px box on Mike's screen.",
		before: "`@media (max-width: 64em)` → `flex: 0 0 min(22em, 34dvh)`",
		after: "`@container page (width < 38em)` → `flex-direction: row`",
		css: `:has(> .rail) { container: page / inline-size; }

.rail { display: flex; flex-direction: column; gap: var(--gap, 0.8em);
        flex: 0 0 clamp(14em, 26%, 22em); min-width: 0;
        position: sticky; top: 0; align-self: start;
        max-height: 100dvh; overflow-y: auto; }

@container page (width < 38em) {
    .rail { flex-direction: row; flex-basis: 100%; order: -1;
            position: static; max-height: none; overflow-x: auto; }
}`,
		deletes: "`browse.css`'s own sticky rule and the four utilities at the call site. **Not yet:** `ai.css:188-241` (three competing `:has()` rules and the 64em query) and `catalog.css:140-196` — the rail consumers this word exists to replace. Both are blocked on the `ai-board-fix` embargo.",
		files: ["core/Page/Page.css", "ext/catalog/browse.css", "ext/catalog/browse.js"],
	},

	{
		id: "stage",
		title: "A preview is an aspect with a ceiling, not a fixed height",
		cls: "maybe",
		line: "A fixed `12em` bottom-aligned every row and dealt twelve other cards visible dead space — `wall-polish`'s own verdict this morning. A pure aspect fixes that at 900 and breaks it at 3440, where a 570px card drew a 356px thumb. It takes both: the aspect governs while a card is narrow, the ceiling once it is wide.",
		before: "`height: 12em` (one width right, every other wrong)",
		after: "`aspect-ratio: 16/10` + `max-height: 12em`",
		css: `.stage, .page-preview-thumb {
    container-type: inline-size;
    aspect-ratio: var(--stage, 16 / 10);
    max-height: var(--stage-max, 12em);
    overflow: hidden; pointer-events: none;
}`,
		deletes: "`--thumb-max` (two call sites moved to `--stage-max`). Rejecting this restores one declaration and the ragged rows with it.",
		files: ["core/Page/Page.css", "styles/layouts/page.js"],
	},

	{
		id: "solo",
		title: "`.solo` — one full-screen word, and it scrolls",
		cls: "maybe",
		line: "`full`, `fill`, `topic`, `layout-full` and `demo.max` were five ways to take the screen, on a z-index ladder of 20/30/60. `.solo` fills the *region* instead of covering the window, so it cannot fight the drawer or the dev rail. Its `overflow` is `auto`, not the `hidden` that made 900–4100px of eighteen `/web/` pages unreachable by any scrollbar.",
		before: "`.fill { overflow: hidden }` — audit finding #1, unapplied since 08-15",
		after: "`.page.solo { overflow: auto }`",
		css: `.page.solo { align-self: stretch; overflow: auto; min-height: 100%; }`,
		deletes: "On accept: `.page.full`, `.page.fill`, `.page.topic`, `.page.layout-full`, `.page.dt-page`, `.page.doc-page`'s shell half. All still work as aliases today.",
		files: ["core/Page/Page.css"],
	},

	{
		id: "wall",
		title: "`.wall` is one grid, and `dense` is gone",
		cls: "maybe",
		line: "`.page-previews` repeated six declarations that are now `.wall`'s. `grid-auto-flow: dense` went with them: it backfilled a heading's gap with a card from the run *below* it, so a grouped wall rendered its sections one heading out of step — a known bug the file had already recorded and kept.",
		before: "6 duplicated declarations · grouped walls one heading out of step",
		after: "one `.wall` · DOM order preserved",
		css: `.wall, .page-previews:where(:not(.page)) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(var(--column, 18em), 100%), 1fr));
    gap: var(--gap, 1em);
    align-items: start;
}`,
		deletes: "`grid-auto-flow: dense` and the `:has(> .page-previews-group)` rule that existed only to switch it back off.",
		files: ["core/Page/Page.css"],
	},

	{
		id: "browse-track",
		title: "The browse row was in the reading track at every width",
		cls: "broken",
		line: "A rail beside a wall is two columns of content, which the layout skill says may never live in `main`. It did: on `/framework/styles/layouts/` the row measured 684px at 500px **and at 3440**, so the new container query correctly drew a mobile strip on an ultrawide monitor. The wrapper div that caused it is gone.",
		before: "row = 684px at every width from 500 to 3440",
		after: "row = 444px at 500, 2986px at 3440",
		css: `- div.c("page full", …)   →   div.c("page", …)
- div.c("layouts flex v gap pad", …)  wrapper deleted
+ .page > .browse { grid-column: wide; }`,
		deletes: "The `layouts flex v gap pad` wrapper and its `--pad` inline style.",
		files: ["styles/layouts/page.js", "ext/catalog/browse.css"],
	},

	{
		id: "tabs",
		title: "The tab strip says it scrolls",
		cls: "broken",
		line: "At 900 `/framework/ext/DesignTool/` sliced \"TEST CORPUS\" at the right edge. The strip always could scroll; with the scrollbar hidden nothing said so, and it read as a clipping bug. `overflow: auto` draws the bar only when it is genuinely needed.",
		before: "`scrollbar-width: none` — clipped, silently",
		after: "`scrollbar-width: thin` — a bar, only when it overflows",
		css: `.tab-bar { overflow: auto; scrollbar-width: thin; }   /* was none */`,
		deletes: "Nothing. One word.",
		files: ["ext/tabs/tabs.css"],
	},

	{
		id: "page-pad",
		title: "Every grid page was paying its inset twice",
		cls: "broken",
		line: "`.pages` declared `--page-pad`, and a custom property **inherits** — so the `var(--page-pad, …)` fallback on `.page` never fired and every page paid the region's 90px of padding *around* its own 90px gutter track. Found by measuring, not by reading.",
		before: "90px padding + 90px gutter track",
		after: "90px gutter track",
		css: `.pages { --measure: 40em; }   /* --page-pad: 3em clamp(0px, 6%, 5em) removed */`,
		deletes: "The region's `--page-pad`. A shell that opts out of the grid still declares its own.",
		files: ["core/Page/Page.css"],
	},
];

export const OPEN = [
	["**`auto-fit` on the wall — measured and rejected**", "The sweep asked for it 15 times on 10 pages (\"3 dead slots\"). Injected site-wide it made `/web/`'s two cards **583px each at 1280 and 1,623px each at 3440** — which is exactly what `Page.css:186` has said since the word landed. It pays only where a wall is guaranteed a full row, which is why `browse.css:34` scopes it to `.browse-band` rather than the primitive. And an empty track is what a `--column`-sized wall IS: the sweep's own prompt feedback #5 says so. Nothing to accept; the fix is to the prompt, in `vision-fixes`."],

	["**The table rule the sweep asked for already exists**", "Cluster #5 says \"no table rule anywhere\". `framework.css:278` has carried `display: block; width: max-content; max-width: 100%; overflow-x: auto` on `table` since before the sweep ran, with its own measurement in the comment. What is left at 390 — a three-column table wrapping one word a line in a 278px column — is a *wrappable* table doing the right thing in the room it has. The room is the `wide` question above, not a missing rule."],

	["Rhythm, truncation, the type scale at 3440, touch targets", "Clusters #10–#14 of the [sweep](/framework/ai/2026-08-17/sweep-harvest/proposal.md), 66 findings — affordance and component JS, not layout, and the brief fenced them out. #11 (`--flow` flat, so an `h2` gets a `<p>`'s air) is the one that is one token and would be the natural next wave."],

	["`ai.css`'s rail is annotated, not adopted", "`ai-board-fix` had already deleted the `34dvh` band before the embargo lifted. What remains there is five declarations that ARE `.rail`, plus two `:has()` rules that are **not** — they say *hidden when a day is routed* and *the whole page when nothing is*, which is an arrangement question the primitive has no opinion about. Folding them in would have been the sixth word (failure mode 3), so I stopped and wrote it up. Adoption is one word in `dashboard.js:130`, which is outside this fence."],
	["`/framework/` is still 104 ch", "The topic shell lives in `/public/styles.css`, which is the site skin and outside this task's fence. It is one `--measure` away."],
	["A doc page still spends 58% of 3440", "Rail + article genuinely does not fill an ultrawide. The layout caveats say the answer is a **third region**, which is authoring, not CSS. Classed `maybe` and left alone."],
	["Accept/Reject buttons — done", "Landed in `ai/2026-08-17/accept-buttons/`: every card above writes `verdicts.jsonl` over the dev socket, `twin.js`'s write-whole-file pattern. The header count and each card's tag read it back on load."],
	["The catalog claims `wide` now", "`catalog.js` said `bleed`, which spends the page's gutter tracks — so `catalog.css`, `ai.css` and `report.css` each restated the same `var(--gutter-x)` payback. One word deleted all four copies. Measured at 3440: the catalog moved from x=274 (flush against the app sidebar) to x=364, inside the page's own axis."],
	["Three cards still draw a white void — authoring, not CSS", "`Page.css:195` reserves a `.stage` whether the live call inside it draws anything or not, and **Panel, Accordion and Breadcrumbs** draw nothing: three empty 16/10 boxes on `/framework/ui/`, reported at every width in both vision runs. Deleting the stage is the wrong fix (the twelve cards that DO render need it) and so is hiding it per-component. Each of those three needs one line — a `preview()` override that renders the component small, the way the other twelve already do. Three `page.js` edits, no CSS. Wave 2 deleted the CSS half (`span 2`, above) and stopped there on purpose."],

	["The branch count did not fall", "60 `:has()` and 13 width queries site-wide, against 59 and 14 before. I added exactly one `:has()` (the container) and removed exactly one (`dense`); the deletions that move the number are the two embargoed rail blocks."],
];
