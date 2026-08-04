import { Page, div, p, span, a, table, tbody, tr, td } from "/app.js";
import { code, section } from "../../ui.js";
import { ChromeShell, sample, crumbs, prev_next, show_source, widths, demo } from "../chrome.js";

export default new Page({
	meta: import.meta,
	title: "Breadcrumbs",
	classes: "chrome",

	content(){
		demo(() => {
			// this page's real chain — [root … me]
			crumbs(this);
		}, "Every page in `chain()` is loaded by construction: the Router walked through them to get here. Breadcrumbs are the one derived chrome with no lazy-title problem at all.");

		show_source(crumbs);

		section("The separator is not content");

		this.separators();

		p("A `›` written as a DOM node is selected, copied and read aloud with the links. As `::before` it is none of those, and the rule is one line.").ac("note");

		code(`
.chrome-crumbs > * + *::before { content: "›"; color: #b6bcc5; }`, "the whole separator");

		section("The root label");

		this.roots();

		p("The root's `title` is the site's brand, and a trail that starts with a brand reads like a masthead. Three answers, none free: use the title, declare a label, or spend an icon. `Home` is a label, so it belongs where every other label lives — in the parent's list. The root has no parent, which is exactly why this one case has to be told.").ac("note");

		section("Depth 6");

		demo(() => {
			new ChromeShell({
				root: sample(),
				start: "/guide/config/env/secrets/rotation/",

				chrome(shell){ shell.$bar = div.c("chrome-box"); },

				// derived: rebuilt on every navigation, into a bar built once
				navigated(shell){ shell.$bar.empty(() => crumbs(shell.page)); },
			});
		}, "Six deep. Drill down and back up — the bar is built once, its contents are a function of the leaf.");

		this.overflow();

		prev_next(this);
	},

	// a six-deep chain to abuse, built once and read twice
	deep(){ return this.deep_leaf ??= sample().guide.config.env.secrets.rotation; },

	/* The same trail twice: separators as elements, separators as CSS. The
	 * readout is `textContent`, so what you read IS what a copy would take. */
	separators(){
		const chain = this.chain();
		let $nodes, $css;

		div.c("chrome-box", () => {
			$nodes = div.c("chrome-crumbs chrome-crumbs-nodes", () => chain.forEach((pg, i) => {
				if (i) span.c("chrome-crumb-sep", " › ");
				a.c("chrome-crumb", pg.title).href(pg.url);
			}));

			$css = crumbs(this);
		});

		return div.c("chrome-scroll", () => table.c("chrome-readout", () => tbody(() => {
			tr(() => { td("elements"); td(JSON.stringify($nodes.el.textContent)).ac("classes"); });
			tr(() => { td("::before"); td(JSON.stringify($css.el.textContent)).ac("classes"); });
		})));
	},

	// three ways to say "the top", none of them derivable
	roots(){
		const chain = this.chain();

		return div.c("chrome-box", () => {
			["title", "label", "icon"].forEach(how => div.c("chrome-crumbs", () => {
				chain.forEach((pg, i) => a.c("chrome-crumb",
					i ? pg.title : { title: pg.title, label: "Home", icon: "⌂" }[how]).href(pg.url));
			}));
		});
	},

	// what a six-deep trail does when the box is narrower than the trail
	overflow(){
		const $stage = div.c("chrome-stage", () => div.c("chrome-box", () => {
			crumbs(this.deep());
			crumbs(this.deep()).ac("scroll");
			crumbs(this.deep(), 4);
		}));

		// down to 260px, because a six-deep trail is only a problem once the box
		// is narrower than the trail — at 380 it still fits and proves nothing
		widths($stage, "900px 400px 260px auto");

		p("Top wraps: every link stays reachable, and the bar changes height — which moves the page under it. Middle scrolls: fixed height, but the `root` is the end that scrolls away, and the root is what you navigate with. Bottom collapses past four: fixed height, and the middle is gone for good.").ac("note");

		code(`
crumbs(page)            wrap       every link reachable · the bar resizes
crumbs(page).ac("scroll")  scroll   fixed height · the root scrolls off
crumbs(page, 4)         collapse   fixed height · the middle is unreachable`);

		return $stage;
	},
});
