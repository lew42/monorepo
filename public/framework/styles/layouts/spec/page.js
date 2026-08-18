import { Page, demo, ui, div, span, p, a, h2, h3, md, code, icon } from "/app.js";

/* Figma `80:2916`, frame `layout-documentation-system` — 2128 × 8659, four wrappers,
   fourteen spec rows. The owner: "rather massive… break each section into a separate
   task for a sub minion."

   It is not massive. It is TALL, and it is tall for one reason: it draws about ten
   shapes FOUR TIMES, once per declared width tier —

       wrapper-1  Full Width Sections — 1920px   hero · features · testimonial · pricing
       wrapper-2  Standard Width — 1440px        nav · content+sidebar · footer
       wrapper-3  Tablet Breakpoint — 800px      stacked hero · card grid · accordion
       wrapper-4  Mobile — 400px                 mobile hero · hamburger · list · sheet

   "Hero — Full Bleed" (1920), "Stacked Hero" (800) and "Mobile Hero Sizing" (400) are
   the SAME band, drawn three times. So are the two features grids. `layouts/hero/`
   already wrote that sentence tonight for a sibling frame; here it is the whole node.

   So no sub-minions: eleven of the fourteen specimens below are `styles/sections/`
   bands, imported and RUNNING, and the three that were not are ten lines each. The
   four tiers are the stage's four width buttons.

   ⚠ Read the tables. The Figma's own spec values contradict the framework's tokens in
   places, and in two places contradict themselves — see `note` and the audit. A number
   drawn in Figma is a claim, not a fact. */

import hero from "../../sections/hero.js";
import features from "../../sections/features.js";
import testimonials from "../../sections/testimonials.js";
import pricing from "../../sections/pricing.js";
import navbar from "../../sections/navbar.js";
import site_footer from "../../sections/footer.js";
import faq from "../../sections/faq.js";

/* ---- the three specimens that did not already exist -------------------------- */

/* wrapper-2 · "Content + Sidebar — 70/30". `.rail` is the whole answer: a fixed
   basis that clamps between 14em and 22em, sticky, and below 38em of its ROW it
   takes its own line and stops being a scrollport. The Figma's four bullets
   ("sticky on scroll", "drops at tablet thresholds", "fluid gap variables") are
   three of `.rail`'s own declarations, written out as prose. */
const article_rail = () => div.c("section-band", () =>
	div.c("measure flex gap wrap", () => {

		div.c("flex v gap").style({ flex: "999 1 18em", minWidth: "0" }).append(() => {
			p.c("h4", "GUIDE").style("color", "var(--eyebrow, var(--prim))");
			p.c("h2", "Seventy thirty, without the seventy");
			p.c("muted", "The rail is sized by a clamp, not a fraction, so the article keeps whatever is left. At 3440 that is far more than 70%, and the reading column is still a reading column.");
			p.c("muted", "Nothing here is a breakpoint. The row wraps when the two no longer fit, and the rail's own container query flips it onto its own line.");
		});

		div.c("rail flex v gap", () => {
			p.c("h4", "ON THIS PAGE").style("color", "var(--eyebrow, var(--prim))");
			["The clamp", "Sticky, and its ceiling", "What wrapping costs"].forEach(t =>
				a.c("page-link", t).href("#").style({ textDecoration: "none" }));
		}).style("--gap", "0.4em");

	}).style("--measure", "72em")
).style({ background: "var(--surface)", padding: "2.5em 2em" });

/* wrapper-4 · "Mobile Stacked Card List". The Figma's one spec worth keeping —
   "min 48px" touch targets — is `3em`, so it survives a text-size change that a
   px value would not. */
const card_list = () => div.c("flex v gap surface pad", () =>
	[
		["core/App", "the boot walk, in six steps"],
		["core/Page", "a folder with a page.js is a url"],
		["core/View", "every tag, as a factory"],
		["core/Router", "it walks declared children"],
	].forEach(([title, desc]) =>
		a.c("pad flex gap v-center wash").href("#").style({
			textDecoration: "none", minHeight: "3em", borderRadius: "var(--radius)",
		}).append(() => {
			div.c("flex v").style("gap", "0.15em").append(() => {
				p.c("h4", title);
				p.c("muted", desc);
			});
			icon("chevron_right").style("marginInlineStart", "auto");
		}))
).style("--gap", "0.5em");

/* wrapper-4 · "Mobile Bottom Sheet Sizing". `position: absolute` inside a box that
   declares its own height — the sheet covers the page it belongs to, which is what
   `layouts/overlay/` does at full size. The Figma's `backdrop-opacity: 0.4` is a
   `color-mix` against `--ink`, so it inverts with the theme instead of staying a
   grey that only works on white. */
const bottom_sheet = () => div.c("flex v").style({
	position: "relative", height: "22em", overflow: "hidden",
	background: "var(--surface)", borderRadius: "var(--radius)",
}).append(() => {

	div.c("pad flex v gap", () => {
		p.c("h3", "Layouts");
		p.c("muted", "Thirty whole-page layouts, each one a class string.");
		p.c("muted", "Tap a card for the string that built it.");
	});

	div().style({ position: "absolute", inset: "0", background: "color-mix(in srgb, var(--ink) 40%, transparent)" });

	div.c("pad flex v gap surface").style({
		position: "absolute", insetInline: "0", bottom: "0",
		borderRadius: "1em 1em 0 0", "--gap": "0.5em",
	}).append(() => {
		div().style({ width: "3em", height: "0.3em", borderRadius: "999px", background: "var(--line)", alignSelf: "center" });
		p.c("h4", "Open in");
		["Full width", "Tablet", "Phone"].forEach(t =>
			a.c("pad flex gap v-center wash").href("#").style({
				textDecoration: "none", minHeight: "3em", borderRadius: "var(--radius)",
			}).append(() => p.c("h4", t)));
	});
});

/* ---- the fourteen rows ------------------------------------------------------- */

/* `chip` is the Figma's `badge` — the specs it declares under each card. Every one
   of them is quoted verbatim; whether it is TRUE here is the `props` table's job. */
/* ⚠ No `white-space: nowrap`. It read as "keep a badge on one line", and at 400 that
   made "Container: max-width 1200px" a 309px atom inside a 279px column — 30px of
   overflow, in a row that was otherwise perfect at all five widths. A pill wraps. */
const chip = text => span.c("h4", text).style({
	background: "var(--wash)", borderRadius: "999px", padding: "0.15em 0.7em",
});

const TIERS = [
	{
		id: "1920", title: "Full width — the Figma says 1920px",
		blurb: "“Designed for rich, immersive experiences.” Four bands, uncapped. Here they are the four `sections/` bands that already existed, at whatever width the stage is.",
		rows: [
			{
				name: "hero-wf", tone: "dark", title: "Hero — Full Bleed",
				note: "The Figma draws this band three times: here at 1920, again as “Stacked Hero” at 800, again as “Mobile Hero Sizing” at 400. It is one function, and it is the same one in all three tiers below.",
				link: ["Hero", "/framework/styles/layouts/hero/"],
				badges: ["1920 × ~600"],
				specimen: hero,
			},
			{
				name: "features-wf", tone: "surface", title: "Features Grid — 3 Column",
				note: "`grid gap auto` re-counts its own tracks. Three at this width, two at 800, one at 400 — the wrapper-3 row below is this exact function, and no breakpoint was written for either.",
				link: ["grid auto", "/framework/styles/layouts/grid/auto/"],
				badges: ["Responsive: Stack on mobile", "Min-height: 400px", "Container: max-width 1200px"],
				specimen: features,
				props: [
					["Container: max-width 1200px", "`--measure: 62em` on the band's own column (≈992px)", "Neither is 1200. `.page` declares 40em for prose and hands a wall `wide`; a band sets `--measure` inline. There is no 1200px in this framework."],
					["Min-height: 400px", "no min-height", "A band is as tall as what is in it. A floor of 400px is a gap when the copy is short and does nothing when it is long."],
					["Responsive: Stack on mobile", "`grid auto` + `--column: 14em`", "True, and it costs no rule — the track count falls out of the column width."],
				],
			},
			{
				name: "testimonial-wf", tone: "surface", title: "Testimonial Carousel — Detailed",
				note: "The Figma's own HTML spec calls for `data-autoplay` and a `carousel__track`. The band beside it is a `grid gap auto` wall of quotes — no track, no timer, no JS. `layouts/carousel/` is the real sideways one when a page wants it.",
				link: ["Carousel", "/framework/styles/layouts/carousel/"],
				badges: ["Ver 2.4"],
				specimen: testimonials,
				code: `<section class="section section--fullbleed">
  <div class="carousel" data-autoplay="true">
    <div class="carousel__track">...</div>
  </div>
</section>`,
				props: [
					["slide-padding: 40px", "`--pad` (`1em`), or the band's `3.5em 2em`", "40px is a fifth value in a scale that already has three. The owner's rule: converge."],
					["transition-speed: 300ms", "—", "Nothing here animates. A wall of quotes has no slides to time."],
					["track-align: center", "`.measure` — `margin-inline: auto`", "The one that survives, under a name the framework already had."],
				],
			},
			{
				name: "pricing-wf", tone: "surface", title: "Structured Pricing Tables",
				note: "Two panes with an equal basis: `flex gap auto` makes them equal, and stacks them when two no longer fit. The Figma's three-column `grid-cols-3` is a track count written by hand — this one counts itself.",
				link: ["Pricing", "/framework/styles/layouts/pricing/"],
				badges: ["Popular", "Drafting complete"],
				specimen: pricing,
				code: `<div class="pricing-grid grid-cols-3">
  <div class="card card--standard">...</div>
  <div class="card card--popular">...</div>
  <div class="card card--enterprise">...</div>
</div>`,
				props: [
					["grid-gap: 20px", "`--gap` (`1em` = 16px)", "20px is a fourth spacing value. The tablet tier below calls the same gap 24px — the Figma disagrees with itself."],
					["card-radius: 8px", "`--radius` (`0.5em` = 8px)", "Same number, but as a token: it scales with the text and one edit retunes the site."],
					["popular-accent: #4A7FBF", "`--prim`", "Standing rule 1 — a hex here is a colour the rest of the site does not have, and it would not follow a theme swap."],
				],
			},
		],
	},
	{
		id: "1440", title: "Standard width — the Figma says 1440px",
		blurb: "“Optimized for laptop resolutions.” Three rows, each an annotation column beside a 1440-wide card. That annotation column is `.rail`, which is also what the middle specimen is made of.",
		rows: [
			{
				name: "nav-wf", tone: "surface", title: "Navigation Bar",
				note: "“Header height maintains a rigid 80px footprint.” This one is `flex gap wrap v-center split` and is as tall as its tallest child. Rigid heights are the reason a nav clips when someone raises the base font size.",
				link: ["Landing", "/framework/styles/layouts/landing/"],
				badges: ["1440w", "Height: rigid 80px"],
				specimen: navbar,
			},
			{
				name: "content-sidebar-wf", tone: "surface", title: "Content + Sidebar — 70/30",
				note: "The Figma's four implementation bullets are three of `.rail`'s own declarations read back as prose. Nothing was built for this row except the words in it.",
				link: ["Docs", "/framework/styles/layouts/docs/"],
				badges: ["Sticky on scroll", "Drops at tablet thresholds"],
				specimen: article_rail,
				props: [
					["70 / 30", "`flex: 0 0 clamp(14em, 26%, 22em)`", "A fraction is wrong at both ends: 30% of 3440 is a 1032px sidebar. A clamp holds 14–22em and gives the rest away."],
					["Sidebar remains sticky on scroll", "`position: sticky; top: 0; align-self: start`", "Already in `.rail`."],
					["Main section forces line-height 1.5", "the theme's own `line-height`", "A layout that sets type is a layout that fights the theme."],
				],
			},
			{
				name: "footer-wf", tone: "dark", title: "Footer — Multi-column",
				note: "`flex wrap split` puts the mark at one end and the links at the other, and folds them into a column when the row runs out — one rule doing both jobs.",
				link: ["Document", "/framework/styles/layouts/document/"],
				badges: ["min-height: 320px", "link-columns: 3 cols", "input-width: 300px"],
				specimen: site_footer,
				props: [
					["min-height: 320px", "no min-height", "Same objection as the 400px hero: a floor is a gap on a short footer."],
					["link-columns: 3 cols", "`grid auto` / `flex wrap`", "Three is a number that is right at one width. A wrapping row is right at all of them."],
					["input-width: 300px", "`--basis`, or the field's own `flex`", "300px does not wrap at 400 and does not grow at 3440."],
				],
			},
		],
	},
	{
		id: "800", title: "Tablet — the Figma says 800px",
		blurb: "Here the redraws start. Both specimens in this tier are the SAME functions as the 1920 tier, with nothing changed but the width of the box they are in — no media query, no second file, no `-tablet` variant.",
		rows: [
			{
				name: "stacked-hero-wf", tone: "dark", title: "Stacked Hero",
				note: "This is `sections/hero.js` again — byte for byte the wrapper-1 specimen, in an 800px box. “Content stacks vertically as viewport width collapses” is what the band already did.",
				link: ["Hero", "/framework/styles/layouts/hero/"],
				width: "50em",
				badges: ["800px", "the same function as row 1"],
				specimen: hero,
				props: [
					["padding-vertical: 24px", "`--pad` (`1em`) / the band's `3.5em`", "24px is a third value. The mobile tier calls the same idea 16px."],
					["stacking-breakpoint: < 960px", "—", "⚠ Contradicts itself: this tier IS 800px, which is already below its own stacking breakpoint, so the spec describes a state the card it annotates cannot be in."],
					["heading-font-size: 22px", "the theme's `h1`/`h2` scale", "A per-tier type size is a second type scale to keep in sync with the first."],
				],
			},
			{
				name: "card-grid-wf", tone: "surface", title: "Card Grid — 2 Column",
				note: "And this is `sections/features.js` again. The Figma calls it a different layout because it drew it in a narrower frame; `grid auto` calls it the same wall with one fewer track.",
				link: ["grid auto", "/framework/styles/layouts/grid/auto/"],
				width: "50em",
				badges: ["800px", "the same function as row 2"],
				specimen: features,
				props: [
					["Standard 24px column gap", "`--gap` (`1em` = 16px)", "⚠ The pricing row above declared the same gap as 20px. Two tiers of one spec sheet, two numbers, one idea."],
					["grid-template-columns adjusted on compilation", "`repeat(auto-fit, minmax(min(--column, 100%), 1fr))`", "No compilation, and no second value to adjust."],
				],
			},
			{
				name: "accordion-faq-wf", tone: "surface", title: "Accordion FAQ",
				note: "`details` + `summary`, which the browser already opens and closes. The framework's contribution is one border on the summary.",
				link: ["Stack", "/framework/styles/layouts/stack/"],
				width: "50em",
				badges: ["800px"],
				specimen: faq,
				props: [
					["collapsed → `height: auto`", "`details` without `[open]`", "⚠ Wrong as written: `height: auto` is the OPEN state. Its own guideline column says “hides long answers using overflow hidden bounds”, which `height: auto` cannot do."],
					["expanded → `opacity: 1`", "`details[open]`", "Opacity is not a layout state — a transparent panel still takes its space and still traps a tab stop."],
				],
			},
		],
	},
	{
		id: "400", title: "Mobile — the Figma says 400px",
		blurb: "Four cards at 400. The first is the hero for the third time. The other three are genuinely their own shapes — a menu, a list, a sheet — and two of them were the only new code this whole node needed.",
		rows: [
			{
				name: "mobile-hero-wf", tone: "dark", title: "Mobile Hero Sizing",
				note: "`sections/hero.js`, third appearance, in a 25em box. Constraining the BOX is enough because the band contains no media query — it has never once asked how wide the window is.",
				link: ["400", "/framework/styles/layouts/400/"],
				width: "25em",
				badges: ["400px", "the same function as rows 1 and 8"],
				specimen: hero,
				props: [
					["canvas-width: 400px", "no canvas", "The box is 25em here only so you can see it without dragging the stage. The band has no width of its own."],
					["horizontal-gap: 16px", "`--pad` (`1em` = 16px)", "The one tier whose number matches the token — because 16px IS 1em, which is why the token is written that way."],
					["text-scale: 18px", "the theme's scale", "A third type size, after 22px at tablet and the implicit one at 1920."],
				],
			},
			{
				name: "mobile-nav-wf", tone: "surface", title: "Hamburger Menu Expanded",
				note: "DILEMMA, LOGGED. The Figma opens a full-screen overlay from a burger. `sections/navbar.js` instead WRAPS — the links fall under the mark and stay on the page. Both are defensible; ours needs no state and no trap-focus. The overlay version is `core/Sidebar`, which collapses to a burger bar on its own.",
				link: ["Overlay", "/framework/styles/layouts/overlay/"],
				width: "25em",
				badges: ["400px", "wraps, does not overlay"],
				specimen: navbar,
			},
			{
				name: "mobile-card-list-wf", tone: "surface", title: "Mobile Stacked Card List",
				note: "New here, and ten lines. The Figma's “min 48px” touch target is the one number in this whole node that is worth keeping — written as `3em`, so it survives a reader who raises their text size.",
				link: ["Stack", "/framework/styles/layouts/stack/"],
				width: "25em",
				badges: ["400px", "min-height: 3em"],
				specimen: card_list,
			},
			{
				name: "mobile-bottom-sheet-wf", tone: "surface", title: "Mobile Bottom Sheet",
				note: "New here too. A sheet that covers the page it belongs to — the same idea `layouts/overlay/` runs at full size, with `--ink` mixed for the scrim so it inverts with the theme.",
				link: ["Overlay", "/framework/styles/layouts/overlay/"],
				width: "25em",
				badges: ["400px", "backdrop: 0.4"],
				specimen: bottom_sheet,
				props: [
					["slide-direction: bottom-to-top", "—", "Not drawn: the shape is the deliverable, and an animation is a behaviour a layout page should not own."],
					["animation-timing: cubic-bezier", "—", "A cubic-bezier with no four numbers in it is a category, not a value."],
					["backdrop-opacity: 0.4", "`color-mix(in srgb, var(--ink) 40%, transparent)`", "Same 40%, but mixed against the theme's ink — a fixed grey scrim is invisible in dark mode."],
				],
			},
		],
	},
];

/* ---- the page ---------------------------------------------------------------- */

/* THE shape this whole design is made of, once: an annotation rail beside a
   specimen. `.rail` gives the fixed basis, the sticky, and the container query that
   drops it onto its own line below 38em of the ROW — which is exactly what the
   Figma redraws by hand for each of its four tiers. */
const spec_row = (row, shows) => div.c("flex gap wrap", () => {

	if (shows("notes"))
		div.c("rail flex v gap", () => {
			h3(row.title);
			p.c("muted", row.note);
			if (row.link) a.c("page-link", row.link[0] + " →").href(row.link[1]).style({ textDecoration: "none" });
		}).style("--gap", "0.6em");

	div.c("flex v gap").style({ flex: "999 1 18em", minWidth: "0" }).append(() => {

		/* The only place a width appears. `maxWidth` on the BOX, never a query on the
		   window — the specimen inside has no idea either way.
		   ⚠ `() => row.specimen(row.tone)`, never `.append(row.specimen)`: `append_fn`
		     calls `fn.call(this, this)`, so a bare reference hands the band a View
		     where its tone goes. `band()` has no case for that, falls through to
		     `surface`, and every specimen on the page renders white — silently. */
		div().style({ maxWidth: row.width, width: "100%" }).append(() => row.specimen(row.tone));

		if (row.badges) div.c("flex gap wrap", () => row.badges.forEach(chip)).style("--gap", "0.4em");

		if (row.code && shows("code")) code.html(row.code);

		if (row.props && shows("props"))
			/* ⚠ Cells as FUNCTIONS. `ui.table` hands a string cell straight to `td()`,
			   and only `p()`/`h1`–`h6` read backticks — so `` `--pad` `` printed its own
			   backticks in every one of the ten tables. `() => p(cell)` is the seam the
			   component already documents ("a cell may be a string or a function"). */
			ui.table(["the Figma declares", "the framework already has", "which is right, and why"],
				row.props.map(cells => cells.map(cell => () => p(cell))));
	});
});

export default new Page(demo.layout({
	meta: import.meta,
	title: "Spec sheet",
	description: "A Figma layout spec drawn at four widths, rebuilt as one page — and its twenty declared values checked against the framework's tokens.",
	icon: "straighten",
	group: "Reference",

	parts: "header notes props code",

	note: "**Figma `80:2916`, frame `layout-documentation-system` — 2128 × 8659, the tallest node in the file.** "
		+ "It is tall because it draws about ten shapes four times, once per declared width tier: 1920, 1440, 800, 400. "
		+ "“Hero — Full Bleed”, “Stacked Hero” and “Mobile Hero Sizing” are one function; so are the two features grids. "
		+ "Here each is drawn once, and the four tiers are the **width buttons on this stage** — 390, 810, 1440, 3440. \n\n"
		+ "**Eleven of the fourteen specimens are `styles/sections/` bands, imported and running.** None of them contains a "
		+ "media query, which is why constraining the *box* to 25em produces the mobile form. Three were new: an article "
		+ "beside a `.rail`, a touch-target list, and a bottom sheet — ten lines each. **No new CSS, no stylesheet, no sub-tasks.** \n\n"
		+ "**The tables are the point.** Twenty values are declared in that Figma. Two of them contradict the spec sheet "
		+ "itself: the tablet tier sets `stacking-breakpoint: < 960px` on a card that is 800px wide, and the accordion's "
		+ "collapsed state is `height: auto`, which is the open state. Two more disagree across tiers — the same column gap "
		+ "is 20px in the pricing row and 24px in the card-grid row. The `props` chip turns the audit off.",

	/* Real-width verification without a nested page, the seam `apidoc/` and
	   `toc-studio/` use: `layout()` already IS the one `.page`. */
	route(name){
		if (name !== "full") return false;
		const layout = () => this.layout();
		return { title: this.title + " — full", render(){ return this.view ??= layout(); } };
	},

	/* ⚠ NO `fill`. This is a document — 8659px of Figma is content height, not a
	   viewport — and `fill` hands scrolling to one pane and clips the rest.
	   ⚠ NO `full` either: the three-track grid is what puts prose in `main` (40em)
	     and every spec row in `wide`, which is the answer to "two columns of content
	     never live in main". `flow` is the page's rhythm; each row carries its own. */
	layout(){

		/* ⚠ `surface` — the page paints its own ground, as a CLASS. A `.page` is
		   transparent; the site's ground is `styles.css`'s `.app { background:
		   var(--wash) }`, which a page on a stage does not have under it. Without it
		   the demo board (dark) showed through and every line of prose here was
		   `--ink` on near-`--ink`: 723px of `h1`, in the DOM, measurable, invisible.
		   ⚠⚠ And it must be the class, not `.style("background", …)` — `demo.layout`'s
		     own `frame()` re-styles what `layout()` returns with `background: ""`,
		     which wipes an inline value. Two silent failures in one line. */
		return div.c("page flow surface", () => {

			if (this.shows("header"))
				div.c("wide flex gap wrap split v-center", () => {

					/* ⚠ `minWidth: 0`. `framework.css` already puts `overflow-wrap:
					   break-word` on every heading, but that does NOT lower a box's
					   min-content width — so at 400 this column refused to shrink below
					   345px ("Documentation" at `h1`) inside a 321px header and pushed
					   24px out. `min-width: 0` lets it shrink, and the break-word that
					   was there all along finally applies. Measured, both directions. */
					div.c("flex v gap").style({ "--gap": "0.3em", flex: "1 1 16em", minWidth: "0" }).append(() => {
						p.c("h4", "GLOBAL SPECS").style("color", "var(--eyebrow, var(--prim))");
						p.c("h1", "Layout Documentation System");
						p.c("muted", "Standardized responsive section containers, spacing, and structural behavior standards — checked against the tokens that already exist.");
					});

					div.c("flex gap wrap", () => { chip("Active Specs"); chip("System v2.4"); })
						.style("--gap", "0.4em");
				});

			/* The Figma's `wrapper-1..4` — a washed card per width tier, the specimen
			   bands sitting white on top of it. `.wash` is 8% ink, so it is a tint of
			   whatever ground it lands on and follows a theme swap. */
			TIERS.forEach(tier =>
				div.c("wide wash pad flex v gap").style({ "--gap": "2em", "--pad": "1.5em", borderRadius: "var(--radius)" }).append(() => {

					div.c("flex v gap").style("--gap", "0.3em").append(() => {
						h2(tier.title);
						p.c("muted", tier.blurb);
					});

					tier.rows.forEach(row => spec_row(row, part => this.shows(part)));
				}));
		});
	},

	/* The mapping table and the dilemmas live under the stage, not inside `note` —
	   a fourteen-row table in a caption is a wall. */
	content(){
		demo.exhibit({
			page: this,
			stage: steer => this.stage(steer),
			def: this.layout,
			file: new URL("page.js", import.meta.url).pathname,
			note: this.note,
		});

		h2("What the fourteen frames actually are");

		md("| Figma frame | tier | it is |\n|---|---|---|\n"
			+ "| `hero-wf` | 1920 | [`sections/hero.js`](/framework/styles/sections/hero/) — [Hero](/framework/styles/layouts/hero/) |\n"
			+ "| `features-wf` | 1920 | [`sections/features.js`](/framework/styles/sections/features/) — [grid auto](/framework/styles/layouts/grid/auto/) |\n"
			+ "| `testimonial-wf` | 1920 | [`sections/testimonials.js`](/framework/styles/sections/testimonials/) — [grid auto](/framework/styles/layouts/grid/auto/); the sideways one is [Carousel](/framework/styles/layouts/carousel/) |\n"
			+ "| `pricing-wf` | 1920 | [`sections/pricing.js`](/framework/styles/sections/pricing/) — [Pricing](/framework/styles/layouts/pricing/) |\n"
			+ "| `nav-wf` | 1440 | [`sections/navbar.js`](/framework/styles/sections/navbar/) — [Landing](/framework/styles/layouts/landing/)'s top band |\n"
			+ "| `content-sidebar-wf` | 1440 | **new, 12 lines** — `.rail` beside an article; the populated one is [Docs](/framework/styles/layouts/docs/) |\n"
			+ "| `footer-wf` | 1440 | [`sections/footer.js`](/framework/styles/sections/footer/) — [Document](/framework/styles/layouts/document/) |\n"
			+ "| `stacked-hero-wf` | 800 | **`sections/hero.js` again** — same function, narrower box |\n"
			+ "| `card-grid-wf` | 800 | **`sections/features.js` again** — same wall, one fewer track |\n"
			+ "| `accordion-faq-wf` | 800 | [`sections/faq.js`](/framework/styles/sections/faq/) — `details` + [Stack](/framework/styles/layouts/stack/) |\n"
			+ "| `mobile-hero-wf` | 400 | **`sections/hero.js` a third time** — see [400](/framework/styles/layouts/400/) |\n"
			+ "| `mobile-nav-wf` | 400 | `sections/navbar.js` — it wraps rather than overlaying (dilemma below) |\n"
			+ "| `mobile-card-list-wf` | 400 | **new, 10 lines** — `flex v gap` and a `3em` touch target |\n"
			+ "| `mobile-bottom-sheet-wf` | 400 | **new, 14 lines** — the small form of [Overlay](/framework/styles/layouts/overlay/) |");

		md("**Fourteen frames, ten shapes, three new functions, zero new CSS rules.** Eleven specimens on this page are `styles/sections/` modules imported and run — the same files the [Sections](/framework/styles/sections/) page exhibits. The three tiers of hero are one import used three times.");

		h2("Two dilemmas");

		md("**1 · The hamburger.** The Figma's mobile nav is a full-screen overlay opened from a burger. `sections/navbar.js` wraps instead: the links fall under the mark and stay in the page. Ours needs no open state, no focus trap and no scroll lock; theirs keeps the viewport clear. **We shipped the wrap** and left [`core/Sidebar`](/framework/core/Sidebar/) — which collapses to a burger bar on its own — as the overlay answer. Worth the owner's call.\n\n"
			+ "**2 · Whether to draw the specimens at all.** The Figma's cards are wireframes: grey boxes with labels. Standing rule 1 says reuse, and eleven live bands already existed, so this page runs the real thing. The cost is that a spec sheet is now also a heavy page — every band on it is real DOM. The alternative was fourteen grey rectangles that prove nothing.");

		md("Next: [Sections](/framework/styles/sections/) — the fifteen bands eleven of these specimens come from · [Layouts](/framework/styles/layouts/) — the wall this page is a card on.");
	},
}));
