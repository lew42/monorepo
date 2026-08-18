import { Page, demo, Sidebar, div, span, a, p, pre, code, h2, h3, hr, button, icon, ui } from "/app.js";

/* Figma `109:369` is FIVE frames, not one design: `app-class-overview`,
   `app-class-api-reference` and `app-class-source-code` are the SAME document split
   across three urls, and the two frames both named `app-class-tabbed` are it
   reassembled under a tab bar — the second one capped and centred.

   So the split is already the design's own subject, and the `parts:` chips are how
   the page says so: every one of the five frames is a chip combination, listed in
   `note` below. Everything drawn here already existed — see `readme.md`. */

/* ---- the pieces --------------------------------------------------------------
   Eight, each one function. Nothing below knows about any other; `layout()` is the
   only place they meet. */

// The rail. Every url is REAL — three ext/Doc tabs on core/App, then five core
// modules — so the mocked sidebar navigates the documentation it is drawn of.
const RAIL = [
	{ title: "Framework", pages: [
		{ title: "Overview",      url: "/framework/",                     icon: "menu_book" },
		{ title: "API Reference", url: "/framework/core/App/api/",        icon: "data_object" },
		{ title: "Source Code",   url: "/framework/core/App/files/",      icon: "code" },
	] },
	{ title: "Core Classes", pages: [
		{ title: "App",    url: "/framework/core/App/",    icon: "widgets" },
		{ title: "View",   url: "/framework/core/View/",   icon: "layers" },
		{ title: "Page",   url: "/framework/core/Page/",   icon: "description" },
		{ title: "Router", url: "/framework/core/Router/", icon: "alt_route" },
		{ title: "Item",   url: "/framework/core/Item/",   icon: "dataset" },
	] },
];

const CONCEPTS = [
	["The boot walk", "Six steps in one fixed order. Nothing paints until the last finishes, so a deep cold link waits for all of it.", "Read the walk", "/framework/core/App/doc/boot/"],
	["Adoption", "`.app` arrives on the walk DOWN, never by import — the global is undefined inside framework/ during boot.", "View docs", "/framework/core/App/doc/adoption/"],
	["The captor", "`View.set_captor()` is how a page knows where to mount. Point it one box too high and the error page vanishes.", "Learn more", "/framework/core/App/api/render/"],
];

const PARAMS = [
	["config()", "Function", "Runs first. Register fonts and anything render() needs."],
	["render()", "Function", "Builds $app and $pages, and hands View the captor. (Required)"],
	["load()",   "Function", "Awaited before pages initialize — stylesheets, data, anything async."],
];

const METHODS = [
	["font(name)", "Registers a webfont with the CDN registry — the framework's one unvendored dependency.", "this.font(\"Montserrat\");"],
	["styles_loaded()", "Awaited by navigation before a route paints, so no page ever arrives unstyled.", "await app.styles_loaded();"],
	["inject()", "Puts $app into the document — the last step of the walk before app.ready settles.", "app.inject();"],
];

const QUICK_START = `import App, { View, div } from "/framework/core/App/App.js";

window.app = new App({
  config(){ this.font("Montserrat"); },
  render(){
    this.$app = div.c("app", () => {
      this.$pages = div.c("pages");
    });
    View.set_captor(this.$pages);
  },
});`;

const SOURCE = `export class App {

  constructor(config){
    Object.assign(this, config);
    this.instantiate();
  }

  async instantiate(){
    this.config();
    this.render();
    await this.load();
    this.initialize();
    this.inject();
    this.ready.resolve(this);
  }
}`;

/* ⚠ The ONE text axis. Every band on the page runs its content through this, so the
   breadcrumb, the tab strip and the article are capped and centred together — measured
   at 3440, a full-width header over a centred column put the trail 1100px left of the
   heading it belongs to. The band still spans (its rule reaches both edges); only what
   is inside it is capped. */
const axis = (measured, classes, fn) => div.c(classes)
	.ac(measured && "measure")
	.style("--measure", "64em")
	.append(fn);

// 1 · the breadcrumb band. `ui-crumbs` and `ui-badge ui-pill accent` verbatim.
const crumbs = (trail, measured) => div.c("pad").style({
	"--pad": "1.25em clamp(1em, 3%, 3.5em)", borderBottom: "1px solid var(--line)",
}).append(() => axis(measured, "flex gap wrap v-center split", () => {

	div.c("ui-crumbs flex wrap v-center gap h4", () => trail.forEach((name, i) => {
		if (i) icon("chevron_right").style({ color: "var(--subtle)", fontSize: "1em" });
		i === trail.length - 1 ? span(name) : a.c("page-link muted", name).href("/framework/core/App/");
	})).style("--gap", "0.35em");

	div.c("flex gap wrap v-center", () => {
		a.c("page-link h4 muted", "DOCS HOME").href("/framework/");
		span.c("ui-badge ui-pill h4 accent", "v1.2.0");
	}).style("--gap", "0.9em");

}).style("--gap", "0.75em"));

// 2 · the strip. Real ext/tabs CSS; a tab lights when its section is shown, so the
// bar and the chips can never disagree.
const tabs = shows => div.c("tabs", () => div.c("tab-bar", () =>
	[["overview", "Overview"], ["api", "API Reference"], ["source", "Source Code"]]
		.forEach(([part, label]) => div.c("tab").ac(shows(part) && "active").text(label))));

// 3 · the title block — one per page, whatever is under it.
const title = () => div.c("flex v gap", () => {
	span.c("h1", "App");
	p("Boot, and the one container every page mounts into — a site constructs it once, in `/app.js`.").ac("muted");
	hr();
}).style("--gap", "0.5em");

// 4 · a section heading plus its body, the one rhythm every band below uses.
const band = (heading, body) => div.c("flex v gap", () => { h2(heading); body(); }).style("--gap", "0.9em");

// 5 · a dark code block is `pre` — `--code-bg` is already a theme token, and
// `pre > code` already un-rings the inline hairline. No rule, no class.
const block = text => pre(() => code(text)).style({ borderRadius: "var(--radius)", padding: "1em 1.2em" });

// 6 · the Overview body: prose, a sample, three cards.
const overview = () => div.c("flex v gap", () => {

	/* ⚠ ONE code pill in the paragraph, deliberately. Inline code is a filled wash, and
	   framework.css records the measured cost of more: six per paragraph read as a row
	   of buttons and the eye stops mid-sentence. The member names stay plain prose. */
	band("Overview", () => p("`new App()` walks a fixed order — config, render, load, initialize, inject — and then the app settles as ready. It is an element with a lifecycle attached, not a coordinator: pages mount into the captor it hands View, and nothing paints until the whole walk has finished."));

	band("Quick Start", () => block(QUICK_START));

	/* `--column: 18em` is what puts three across at the 64em measure and one at 400,
	   with no query — auto-fit does the counting. */
	band("Key Concepts", () => div.c("grid gap auto", () => CONCEPTS.forEach(([name, blurb, cta, url]) =>
		div.c("surface pad flex v gap", () => {
			h3(name);
			p(blurb).ac("muted");
			div.c("flex split").style("marginTop", "auto").append(() => {
				span();
				a.c("btn prim", cta).href(url);
			});
		}).style("--gap", "0.5em"))).style({ "--column": "18em", "--gap": "1em" }));

}).style("--gap", "2.2em");

// 7 · the API body: a signature, the parameter table, three member cards.
const api = () => div.c("flex v gap", () => {

	band("API Reference", () => {
		p("Detailed breakdown of the constructor, the config interface, and the instance methods on `App`.").ac("muted");
		block("const app = new App(config);");

		/* `ui.table()`, not a hand-built grid: framework.css already gives every
		   table `display: block; max-width: 100%; overflow-x: auto`, measured at
		   390px — so the one box on this page that genuinely cannot wrap scrolls
		   itself instead of pushing the page sideways. */
		ui.table(["Parameter", "Type", "Description"], PARAMS.map(([name, type, desc]) =>
			[() => code(name), () => span.c("muted", type), desc]));
	});

	band("Methods", () => div.c("flex v gap", () => METHODS.forEach(([sig, blurb, sample]) =>
		div.c("surface pad flex v gap", () => {
			div.c("flex gap wrap v-center split", () => {
				span.c("h3", () => code(sig));
				a.c("page-link h4 muted", "VIEW SOURCE →").href("/framework/core/App/files/");
			});
			p(blurb).ac("muted");
			block(sample);
		}).style("--gap", "0.6em"))).style("--gap", "1em"));

}).style("--gap", "2.2em");

// 8 · the Source body: a file header, then the window.
const source = () => band("Source Code", () => div.c("flex v gap", () => {

	div.c("flex gap wrap split", () => {
		div.c("flex v", () => { h3("App.js"); span.c("muted", () => code("framework/core/App/App.js")); });
		div.c("flex v muted h4").append(() => { span("5 FILES"); span("EVERY MEMBER HAS A DOC PAGE"); });
	});

	/* ⚠ `--code-ink` as well as `--code-bg`. The two are a PAIR — a theme that darkens
	   the block lightens the ink — and taking only the background painted the title
	   bar dark with the page's own ink on it: invisible, and nothing threw. */
	div.c("flex v").style({
		borderRadius: "var(--radius)", overflow: "hidden",
		background: "var(--code-bg, var(--wash))", color: "var(--code-ink, inherit)",
	}).append(() => {

		/* Three dots, ONE colour. The token set has a single accent and no
		   traffic-light palette, and standing rule 1 says pick what exists rather
		   than mint red, amber and green. */
		div.c("flex gap v-center pad", () => {
			[0, 1, 2].forEach(() => span().style({ width: "0.7em", height: "0.7em", borderRadius: "50%", background: "var(--subtle)", opacity: "0.6" }));
			span.c("h4 muted", "App.js — core/App/").style("marginInlineStart", "0.6em");
		}).style({ "--pad": "0.6em 1em", "--gap": "0.4em", borderBottom: "1px solid var(--line)" });

		/* The gutter is its own `pre` so it stays put while the code scrolls — same
		   element, so the two can never disagree about line height. ⚠ `min-width: 0`
		   on the code pane, or the widest line sets the row's width and the page
		   scrolls instead of the block. */
		div.c("flex").append(() => {
			pre(() => code(SOURCE.split("\n").map((_, i) => i + 1).join("\n")))
				.style({ flex: "0 0 auto", textAlign: "right", padding: "1em 0.6em 1em 1.2em", opacity: "0.45", margin: "0" });
			pre(() => code(SOURCE)).style({ flex: "1 1 0", minWidth: "0", padding: "1em 1.2em 1em 0.6em", margin: "0" });
		});
	});
}).style("--gap", "1em"));

// 9 · the pager.
const pager = () => div.c("flex gap wrap split v-center", () => {
	div.c("flex gap v-center", () => { span.c("muted", "Next:"); a.c("page-link", "API Reference →").href("/framework/core/App/api/"); });
	a.c("page-link", "View Source →").href("/framework/core/App/files/");
}).style({ "--gap": "0.5em", paddingTop: "1.5em", borderTop: "1px solid var(--line)" });

/* ---- the reassembly ---------------------------------------------------------- */

export default new Page(demo.layout({
	meta: import.meta,
	title: "API Doc",
	description: "A rail, a breadcrumb, a tab strip and three bodies — a class's documentation page, and the five Figma frames it was split into.",
	/* ⚠ Measured: the site loads **Material Icons**, not Material Symbols, and a name
	   only the newer set has renders as its own literal ligature — `developer_guide`
	   came out 291px of text in a 219px label and broke the wall card's title in two.
	   Nothing throws. Probe a new icon name's `offsetWidth`: a glyph is ~19px. */
	icon: "api",
	group: "Pages",

	twin: true,
	parts: "rail header tabs overview api source measure footer",

	note: "**Five Figma frames, one page.** `app-class-overview`, `-api-reference` and `-source-code` "
		+ "are the same document split across three urls; the two frames both named `app-class-tabbed` "
		+ "are it reassembled under a tab strip, the second one capped and centred. So the chips **are** "
		+ "the design: `tabs` off with one body on is frames 1–3, `header` off is frame 4, and `measure` "
		+ "is frame 5. \n\n"
		+ "**Nothing here needed a new rule.** The rail is `core/Sidebar`'s titled-group form (an entry "
		+ "with its own `pages` *is* a group), the strip is [`ext/tabs`](/framework/ext/tabs/), the "
		+ "parameter table is `ui.table()` — which already scrolls itself at 390px rather than pushing "
		+ "the page — the version chip is `ui-badge ui-pill h4 accent`, and a dark code block is a bare "
		+ "`pre`. **The live version of this page is [`ext/Doc`](/framework/ext/Doc/)**, which renders a "
		+ "real module as Overview · API · Docs · Files; every row in the rail links into it.",

	/* Real-width verification, the same seam `toc-studio/` uses: `layout()` already
	   IS the one `.page`, and `full.js` would nest a second one. */
	route(name){
		if (name !== "full") return false;
		const layout = () => this.layout();
		return { title: this.title + " — full", render(){ return this.view ??= layout(); } };
	},

	/* NO `fill`. This is a document, not an app shell: the Figma frames are
	   1200–1624px tall at three different heights, which is content height, not a
	   viewport. `fill` would hand scrolling to one pane and clip the rest — and a
	   wrapping flex row sizes its line to its CONTENT, so the clipped part has
	   nothing to scroll it (measured on `sidebar/`, same shape). The page grows; the
	   region scrolls. */
	layout(){

		return div.c("page full flex v", () => {

			/* `flex gap wrap` with a fixed-basis rail and a `24em` article is the
			   whole responsive story: side by side at 1280 and up, stacked at 400,
			   where Sidebar's own query has already turned itself into a top bar. */
			div.c("flex wrap flex-1").style("minHeight", "0").append(() => {

				/* ⚠ NOT `.basis` (`flex: 0 0 …`), which is what `sidebar/` uses: when
				   this row wraps at 400 the rail is ALONE on its line and a fixed
				   basis left Sidebar's collapsed burger bar 19em wide with the page
				   behind it. `1 0` plus a grow of 999 on the article means the rail
				   fills a line it has to itself and takes a thousandth of the slack
				   on a line it shares — the same trick framework.css's `.flex.three`
				   is built from. */
				if (this.shows("rail"))
					new Sidebar({
						pages: RAIL,
						header: () => div.c("brand", () => span.c("h4", "LEW 42")),
						footer: null,
					}).style({ flex: "1 0 var(--sidebar)", minWidth: "0" });

				div.c("flex v").style({ flex: "999 1 24em", minWidth: "0" }).append(() => {

					const measured = this.shows("measure");

					if (this.shows("header")) crumbs(["Framework", "Core", "App"], measured);

					div.c("pad").style("--pad", "2em clamp(1em, 3%, 3.5em)").append(() => {

						/* `.measure` at `64em` — the Figma's own content column is
						   1013px at 1440 and 1200px at 1920, and 64em is the first
						   of those. The frame that does NOT cap it is the same page
						   with this chip off. */
						axis(measured, "flex v gap", () => {

							if (this.shows("tabs")) tabs(part => this.shows(part));

							title();

							if (this.shows("overview")) overview();
							if (this.shows("api")) api();
							if (this.shows("source")) source();
							if (this.shows("footer")) pager();

						}).style("--gap", "2.5em");
					});
				});
			});
		});
	},
}));
