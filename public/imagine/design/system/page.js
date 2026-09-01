import { Page, div, h2, h3, p, a, span, md } from "/app.js";

/**
 * The system study (2026-09-01) — a PROPOSAL, not a change. Reads the owner's ask
 * ("design a layout system that doesn't fail… we don't have a clearly defined
 * 'proper' design to follow") against `ext/DesignTool` and tonight's three landed
 * studies (layout, scale, padding), and answers in two parts: why the current
 * feedback method still yields broken layouts, and the written design of the system
 * that replaces it. Nothing in `framework/core/` or `ext/DesignTool/` was touched.
 */

const TOOL = "/framework/ext/DesignTool/";

// ── (a) the critique — each item: the flaw, one line of evidence, the direction ──
const FLAWS = [
	{
		n: 1, flaw: "No page ever says what it MEANT, so the tool grades outcome against a site average.",
		ev: `[widescreen.md](${TOOL}knowledge/widescreen/) says it itself: a dead-space finding asks *"is there a second thing the reader wants beside it?"* — a question only the page can answer, and no page has a word to answer it with. So \`/resume/\` (bounded on purpose, 27.5% of 3440) and \`/imagine/gallery/\` (broken, 13.2%) are charged by the same band.`,
		fix: "The page declares its intent; the tool asserts declaration == outcome. One word, below.",
	},
	{
		n: 2, flaw: "The 'proper design' already exists — and only the generator can read it.",
		ev: `\`taste/ranges.js\` exports **\`AUTHOR\`**, headed *"THE SAME TABLE FROM THE OTHER SIDE: what to WRITE so the measurement lands in the band"* — pad 0.8–1.4em, gap 0.6–1.6em, measure 27–34em, rail 12–17em, tracks 1–3, depth 1–3. Its only consumer is \`styles/layouts/space/gen.js\`, the layout generator's search.`,
		fix: "Promote `AUTHOR` to the site's tokens. The generator has a design system; the site does not.",
	},
	{
		n: 3, flaw: "A weighted mean of eleven bands averages away the one band that failed.",
		ev: "`/imagine/gallery/` scores zero on `width-used` (0.132, below its own `ok` floor of 0.28) and passes most of the other ten. Weight 8 of 62 — so a page can be 87% \"good\" and be 13% of a 3440 screen.",
		fix: "A floor is a gate, not credit. The weighted mean is right for RANKING two clean layouts — which is what taste was built for — and wrong for gating a real page.",
	},
	{
		n: 4, flaw: "Several bands were fitted to the site's own status quo, so they can only ever confirm it.",
		ev: `[ideal-ranges.md](${TOOL}knowledge/ideal-ranges/) withdraws \`measure\`'s IQR justification ("two errors cancelled"); \`scale\` was "a measurement of the SAMPLE" and had to be re-derived; \`lanes\` is "partly an artefact" of page chrome; \`contrast\` pays full credit to **163 of 165** rows because it measures the theme, not the page.`,
		fix: "Only a DECLARED target may grade. Descriptive statistics belong in a census, not in a score.",
	},
	{
		n: 5, flaw: "The guards that killed false positives took the real findings with them — and the half of every band that never fires is the wrong half.",
		ev: `[blind-spots.md](${TOOL}knowledge/blind-spots/): "three of the four are the same mistake" — \`pad-scale\` stops at 85% of the viewport and \`gutter\` measures over font-size, leaving a hole exactly the shape of a full-bleed band with a pixel inset. Tonight's [padding study](/imagine/design/padding/) closes it from the other side: **0 of 2178** real boxes exceeded 20% of their own width. The over-padded end of every band is theatre.`,
		fix: "Fewer rules, each with a declared target and no guard. A guard is a claim that a class of box cannot be wrong.",
	},
	{
		n: 6, flaw: "Nothing in the loop is about SCALE — and the loop's human never arrives.",
		ev: `Of eleven bands only \`contrast\` touches type size, and it is saturated. Meanwhile [scale study](/imagine/design/scale/): the commonest font-size on the site is *smaller than body* at 390, 1280 and 3440. And \`audit/findings.json\` and \`audit/taste.json\` are both stamped **2026-08-17**, 338 rows, unreran; \`learned.md\`'s own step 1 ("Mike ranks the 18 shots") is still open, so every tier is unvalidated.`,
		fix: "Assert at declare-time, in the page, so the screenshot→judge→tweak loop is not on the critical path at all.",
	},
];

// ── (b) the system ──
const PARTS = [
	{
		key: "1 · DECLARE", title: "One word: what the page holds",
		body: "`one` — a single thing to read. `many` — a repeating set. `parts` — several unlike regions used together. That is the whole vocabulary, and it is usually **inferred**, not written: a page derives `this.holds ??= this.children.size >= 3 ? \"many\" : \"one\"` inside its own class, idempotently. `parts` is always explicit, because unlike regions are a real decision.",
		note: "`width` says how much room to take. `holds` says what to do with it. They are different questions and today only the first one can be asked.",
	},
	{
		key: "2 · SPEND", title: "There is no leftover",
		body: "**Room goes to tracks, then regions, then scale — and scale is never optional.** `many` spends width on more tracks (`auto-fill`, no breakpoint). `parts` opens its next declared region as soon as the row can give it its floor. `one` cannot do either, so it spends the room on **type and gaps**. Any room no track and no region claimed is spent on scale. That is the invariant, and it is why the system cannot leave a grey field.",
		note: "The inversion: today the fallback when nothing can grow is dead space. Here the fallback is scale.",
	},
	{
		key: "3 · FLOORS", title: "Four numbers that make failure impossible",
		body: "**Padding** `clamp(0.5em, 6%, 3em)` on the container, reclaimed by every leaf. **Measure** is declared in *characters* (52–68), never in ems — the em is derived until it measures. **Gaps** come from four rungs and only four: `0.5 · 1 · 2 · 3em`. **Tracks** floor at `min(14rem, 100%)`, which is 196px+ and puts a sliver out of reach.",
		note: "Every one of these is a floor, not a band: crossing it is impossible, not merely graded.",
	},
];

const SKETCH_PAGE = [
	"```js",
	"// SKETCH — what declaring feels like. One new word; the rest is today's page.js.",
	"export default new Page({",
	"    meta: import.meta,",
	"    title: \"Notes\",",
	"    holds: \"many\",                 // one · many · parts — usually inferred, written to override",
	"    children: \"git-branch-names css-layers esm\",",
	"    content(){ p(\"Short things I want to find again.\"); },",
	"});",
	"```",
].join("\n");

const SKETCH_CSS = [
	"```css",
	"/* SKETCH — the engine, three rules. No breakpoint anywhere. */",
	"@layer site {",
	"  .holds-many  { display: grid; gap: var(--gap-2);",
	"                 grid-template-columns:",
	"                   repeat(auto-fill, minmax(min(var(--column, 18rem), 100%), 1fr)); }",
	"",
	"  .holds-one   { container-type: inline-size; max-width: var(--measure); }",
	"  .holds-one   { font-size: clamp(1rem, 2.4cqi, 1.6rem); }   /* the leftover, spent */",
	"",
	"  .holds-parts { display: flex; flex-wrap: wrap; gap: var(--gap-3);",
	"                 container: row / inline-size; }",
	"  .holds-parts > * { flex: 1 1 min(var(--region, 22rem), 100%); min-width: 0; }",
	"}",
	"```",
].join("\n");

// The three studies, one number each that the system is built on.
const EVIDENCE = [
	"| study | the number | what the system does with it |",
	"|---|---|---|",
	"| [layout](/imagine/design/layout/) | **3 shells** cover 20/20 pages; **0** pages overflowed at any width | the system handles three shapes and one direction of failure |",
	"| [layout](/imagine/design/layout/) | `/imagine/gallery/` **13.2%** of 3440 — at 1280 *and* 3440 | a column with no way to say \"grow with the row\" → `holds: many` + a `grow` width word |",
	"| [layout](/imagine/design/layout/) | rail+content **45% → 19%** (`/michael/`) from 1280 to 3440 | a prose ceiling with no declared second region → `holds: parts` |",
	"| [scale](/imagine/design/scale/) | the **modal font-size is smaller than body** at 390, 1280 and 3440 | chrome outnumbers prose; content type gets a floor of 1em and a container clamp |",
	"| [scale](/imagine/design/scale/) | **one** element site-wide scales with the viewport — `clamp(2.2rem, 17cqw, 12rem)` | the mechanism already exists and is used once; `holds: one` makes it the default |",
	"| [padding](/imagine/design/padding/) | comfortable band **0.5em → min(6% width, 3em)** | the padding floor, verbatim |",
	"| [padding](/imagine/design/padding/) | **0 of 2178** real boxes exceeded 20% of their width | the ceiling never binds — the floor is the whole game |",
	"| [DesignTool](/framework/ext/DesignTool/) | audit baseline stamped **2026-08-17**, 338 rows, never re-run | the loop's human never arrives — assert at declare-time instead |",
].join("\n");

const PILOT = [
	{
		hrs: "~1h", title: "Prove SPEND on one page",
		body: "`/notes/git-branch-names/` — 20.9% of 3440, one article pinned top-left at body size. Give it `holds: \"one\"`: a container clamp on font-size, `--measure` left in `em`. **Nothing about the layout changes.** The column goes from ~640px of small type to ~1024px of large type at the same 52–68 characters a line, because a measure in ems scales with its own text.",
		why: "This is the whole owner's sentence — *\"if it's 3440 and we have only a few things, they don't need to be small\"* — in one page and one declaration.",
	},
	{
		hrs: "~2h", title: "Give a column the word it is missing",
		body: "`/imagine/gallery/` is 13.2% at every width because `small · hug · large · fill · full` are all fixed or capped. Add one: **`grow`** — `flex: 1 1 0; max-width: none; --column: 18rem` — and declare `holds: \"many\"` on the page. The wall inside then takes tracks from the row instead of a 40em cap.",
		why: "The layout study's handoff gap #1, closed by one CSS rule and one word. Proposal only — `Page.css` is core.",
	},
	{
		hrs: "~3h", title: "Turn the critic into a test",
		body: "`check(page)` beside `analyze()`/`rate()`: read `page.holds`, run **one** assertion for it — `one` → measure lands 52–68 chars and type grew with the container; `many` → track count rose between 1280 and 3440; `parts` → every declared region is on screen and above its floor — plus the four floors, always. Returns pass/fail with the declaration quoted. No score.",
		why: "Then the eleven bands stop being the site's grade and go back to being what they were built for: ranking two clean layouts for the generator's search.",
	},
];

// This page is a plain column under /imagine/'s columns host (a nested `columns()`
// is inert — core/Page/doc/columns.md), so its content sits in `.page-column-prose`
// with no page grid: `wide` is meaningless here and only `bleed` reaches the real
// edge. Every prose block is capped by hand; every grid is bled. Practising the
// floors this page preaches, inside today's shell.
const prose = text => div.c("measure start flow").append(() => md(text));

/* ⚠ `auto-fit`, not the house `auto-fill` — and the exemption is the one
   `styles/doc/layout-system.md` names: every row below holds a KNOWN, fixed number of
   cards and is guaranteed the whole row, so a reserved empty track is pure dead space
   (measured on this page's own first draft: two code sketches sat in 480px tracks with
   five empty ones beside them at 3440). `cap` bounds the row so three cards never
   become three 1100px measures — the ceiling `.flex.auto` still cannot say. */
const wall = (min, gap, max = "1fr") => ({
	display: "grid", gap, alignItems: "start",
	gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}, 100%), ${max}))`,
});

const card = () => ({
	border: "1px solid var(--line)", borderRadius: "0.4em",
	padding: "clamp(0.9em, 3.5%, 1.6em)", display: "flex", flexDirection: "column", gap: "0.5em",
});

const flaw_card = f => div().style(card()).append(() => {
	div.c("flex gap").style({ alignItems: "baseline" }).append(() => {
		span(String(f.n)).style({ fontWeight: "900", fontSize: "1.6em", color: "var(--prim)", lineHeight: 1 });
		span(f.flaw).style({ fontWeight: "700" });
	});
	div.c("flow").append(() => md(f.ev));
	/* ⚠ The padding is on all FOUR sides, and that is not decoration. A `border-inline-start`
	   alone makes `analyze()` read the whole box as an enclosing frame and report
	   `cramped · high` — 6 × div.flow, "nearest text sits 0px from the frame" — off the three
	   unpadded sides. Exactly the one-sided-rule false positive tonight's padding study named,
	   met on this page's own draft. 0.5em over a 13.5px face is 0.5×, inside `frame-gap`'s band. */
	div.c("flow").style({ borderInlineStart: "3px solid var(--prim)", padding: "0.5em 0.8em" })
		.append(() => md("**→ " + f.fix + "**"));
});

const part_card = s => div().style({ ...card(), gap: "0.6em" }).append(() => {
	span(s.key).style({ fontSize: "0.8em", fontWeight: "700", letterSpacing: "0.08em", color: "var(--prim)" });
	h3(s.title).style({ margin: 0 });
	div.c("flow").append(() => md(s.body));
	p.c("muted", s.note).style({ margin: 0, fontSize: "0.92em" });
});

const pilot_card = (s, i) => div().style(card()).append(() => {
	div.c("flex gap").style({ alignItems: "baseline", justifyContent: "space-between" }).append(() => {
		h3(`${i + 1} · ${s.title}`).style({ margin: 0 });
		span(s.hrs).style({ fontWeight: "700", color: "var(--prim)", whiteSpace: "nowrap" });
	});
	div.c("flow").append(() => md(s.body));
	p.c("muted", s.why).style({ margin: 0, fontSize: "0.92em" });
});

export default new Page({
	meta: import.meta,
	title: "System",
	description: "A layout system that doesn't fail: one declared word, one spend rule, four floors — and the DesignTool as its test rather than its critic.",
	icon: "architecture",
	width: "full",

	content(){
		prose("**A proposal, not a change.** Nothing in `framework/core/` or [`ext/DesignTool/`](/framework/ext/DesignTool/) was touched tonight. This is the design the owner asked for, written against the tool as it stands and tonight's three studies — [layout](/imagine/design/layout/), [scale](/imagine/design/scale/), [padding](/imagine/design/padding/) — which agree on one thing: **every failure on this site is dead space or cramped. Not one page overflowed.**");

		h2("The system");
		prose("A page declares what it **holds**. The room goes to tracks, then regions, then scale. Four floors make the cramped side impossible. Read left to right.");

		div.c("bleed").append(() => div().style(wall("22em", "1.2em", "44em")).append(() => PARTS.map(part_card)));

		div.c("bleed").style({ marginBlock: "1.4em" }).append(() =>
			div().style(wall("30em", "1.2em", "52em")).append(() => {
				div.c("flow").append(() => md(SKETCH_PAGE));
				div.c("flow").append(() => md(SKETCH_CSS));
			}));

		// Two bounded reading columns, not one — `widescreen.md`'s "more tracks" applied
		// to prose, which is the only move this page's own shell allows it.
		div.c("bleed").style({ marginBlockStart: "1.2em" }).append(() => div().style({
			display: "grid", gap: "1.6em", alignItems: "start",
			gridTemplateColumns: "repeat(auto-fit, minmax(min(30em, 100%), 44em))",
		}).append(() => {
		prose("**Why a measure in characters is the load-bearing idea.** [widescreen.md](/framework/ext/DesignTool/knowledge/widescreen/) is right that widening a column is never the fix for dead space — it trades a `dead-space` medium for a `measure` high. But **scaling** one is: `--measure` is an `em`, so growing the type grows the column in pixels while the character count does not move. A 3440 screen gets a 1024px column of comfortable large type instead of a 640px column adrift in grey, and the band that would have punished it reads the same number it always did. That is how `holds: \"one\"` spends a widescreen without breaking anything.");

		prose("**And 390 is the same declaration.** No value above names a viewport width. `many` is `auto-fill` over `min(--column, 100%)` — one track at 390, four at 3440. `one` is a container `clamp()` that bottoms out at body size. `parts` opens a region when the *row* can afford its floor, as a container query, the way `.rail` already does. A bound is not a breakpoint ([bounds.md](/framework/ext/DesignTool/knowledge/bounds/)) — and ⚠ every floor here is in `rem`, never `em`, because the root font-size on this site is itself a viewport clamp and an `em` floor is a moving target.");
		}));

		h2("Why layouts still break");
		prose("Six flaws in how the feedback is made, worst first. The through-line: **feedback fixes symptoms; a declared target makes most feedback unnecessary.** Ten of the eleven bands measure something a page never said it wanted.");

		div.c("bleed").append(() => div().style(wall("24em", "1.1em")).append(() => FLAWS.map(flaw_card)));

		prose("**Where the bands should move.** Six of the eleven — `pad-share`, `gap-share`, `scale`, `measure`, `slivers`, `width-used` — become *consequences* of the four tokens above rather than measurements of a page. A page that used `--pad`, `--gap`, `--column` and `--measure` cannot fail them, so there is nothing to grade; only a page that **overrode** a token gets measured. The remaining five (`frame-gap`, `lanes`, `repetition`, `depth`, `contrast`) keep doing the job they were built for — ranking two clean layouts for the generator's search — and stop being the site's report card.");

		h2("The evidence");
		div.c("bleed").append(() => div.c("flow").append(() => md(EVIDENCE)));

		h2("The pilot");
		prose("Three smallest real changes that would prove the system on one page each. Sized in hours; independently useful; none of them touches a shared class.");

		div.c("bleed").append(() => div().style(wall("22em", "1.1em", "44em")).append(() => PILOT.map(pilot_card)));

		prose("**What I would cut first:** the eleven-band weighted score as the site's grade. It is a ranker wearing a report card's clothes, it has been anti-correlated with how pages look once already (Pearson −0.39, `doc/learned.md`), and every hour spent retuning a band is an hour not spent writing the number the page should have declared.");
	},
});
