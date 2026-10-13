import { Page } from "../Page/Page.class.js";
import View, { div, p, h2, h3, span, a, code, button, table, thead, tbody, tr, th, td } from "../View/View.js";
import { stage } from "../../ext/demo/stage.js";
import pane from "../../ext/demo/pane.js";
import { FIXTURES, arrange, tone_of, apply } from "./fixtures.js";
import { STRIP } from "./layouts.js";
import { check, warn, prove, fatal } from "./rules.js";
import { strip } from "./strip.js";

View.stylesheet(import.meta, "Layout.css");

// History and reasons: doc/Layout-notes.md
// ⚠ Layout extends Page, not View — every VIEW part is PageLayout* for .page-layout-* (not .layout-*; see css-scopes.txt).
// ⚠ words() overridden to do nothing: room means framework layout word, not page width.
// ⚠ No class fields for defaults; they shadow from prototype at the bottom.

export class Layout extends Page {

	words(){ return this; }

	content(){
		p(this.intro);

		div.c("page-layout-top wide flex gap wrap", () => {
			this.viewport();
			div.c("page-layout-aside", () => {
				h3("How it responds");
				p.c("muted", `Seven widths, ${this.widths[0]}px to 3440. A pane below ${this.widths[0]} draws ${this.fallback} instead — below its floor this layout stacks, and the fallback is the thing being judged there.`);
				strip(this, this.fixture());
			});
		});

		h2("When to reach for it");
		p(this.when);
		if (this.note) this.prose(this.note);
		if (this.see) this.prose(this.see);

		h2("What it declares");
		this.props();

		h2("Variations");
		p.c("muted", "The same arrangement, distributed differently.");
		this.wall(this.variations);

		h2("Alternatives");
		p.c("muted", "A different arrangement that answers the same question.");
		this.wall(this.alternatives);

		h2("Is it approved?");
		this.approval();
	}

	fixture(){ return this.showing ??= FIXTURES[4]; }

	// ⚠ METHOD not getter — assign() uses [[Set]]; a prototype accessor without setter would throw.
	slots(){ return Object.fromEntries((this.boxes ?? []).map(box => [box.label, box.kind ?? "bare"])); }

	// ⚠ bleed on stage zeroes .demo-screen padding; without it render is 3rem narrower.
	// ⚠ flex basis asks ROW for floor; max-width caps layout at room width (not token).
	viewport(){
		return div.c("page-layout-viewport").style("flex", `1 1 ${this.widths[0]}px`).append(() => {
			this.chips();

			const { $stage, $render } = stage(() => this.render_fixture(), "", STRIP.map(w => [w, String(w)]));

			this.$render = $render;
			$stage.ac("bleed page-layout-stage").style({ flex: "0 0 auto", width: this.widths[0] + "px", maxWidth: "100%" });

			return $stage;
		});
	}

	// ⚠ Box has no size yet (page built detached); observer fires on first size + drag.
	render_fixture(){
		const $box = apply(div.c("page-layout-host"), tone_of(this.fixture()));

		$box.append(() => arrange(this, this.fixture()));

		new ResizeObserver(() => {
			$box.rc("page-layout-warn");
			$box.el.querySelector(":scope > .page-layout-warn-badge")?.remove();
			warn($box, check(this, $box.el));
		}).observe($box.el);

		return $box;
	}

	chips(){
		return div.c("page-layout-chips flex gap wrap v-center", () => {
			span.c("muted", "Fixture");

			FIXTURES.forEach(fixture => button.c("page-layout-chip", fixture.chip)
				.attr("title", fixture.label)
				.ac(fixture === this.fixture() && "prim")
				.click(() => { this.showing = fixture; this.redraw(); }));
		});
	}

	// ⚠ Page memoizes view; redraw empties and rebuilds, never calls render().
	redraw(){
		const view = this.view;
		this.view = null;
		view?.el.replaceWith(this.render().el);
	}

	props(){
		const rows = [
			["columns", String(this.columns), "1 · 2 · 3 · 4 (four or more) — the band it lands in"],
			["room", this.room, "which of the five framework words it compiles to"],
			["widths", this.widths.join(" – ") + "px", "the range it is PROVEN at; the floor is where the viewport opens"],
			["fallback", this.fallback, "the 1-column layout it becomes below its floor"],
			["grows", String(this.grows), this.grows ? "a stack — content length can never break it" : "a bounded box: content longer than it has to go somewhere"],
			["overflow", this.overflow ?? "—", this.grows ? "not asked of a growing layout" : "what happens to content longer than the box"],
			["wraps", String(this.wraps), this.wraps ? "the track count follows the room — proven at 1 · 2 · 3 · 5 · 7 items" : "a fixed number of tracks"],
			["tags", (this.tags ?? []).join(" · ") || "—", "facets, from /framework/styles/system/studies/vocabulary/"],
			["accepts", this.accepts, "what may go inside it"],
			["allowed_in", this.allowed_in, "what it may go inside"],
			["denies", (this.denies ?? []).join(" · ") || "—", "the deny list — three rules exist, and most layouts use none"],
			["approved", this.approved ?? "draft", this.approved ? "the date the fixtures last passed at every strip width" : "the fixtures have not passed yet — see below"],
		];

		table.c("page-layout-props", () => {
			thead(() => tr(() => ["Prop", "This layout", "What it means"].forEach(h => th(h))));
			tbody(() => rows.forEach(([key, value, means]) => tr(() => {
				td(() => code(key));
				td(() => span.c("page-layout-value", value));
				td(() => span.c("muted", means));
			})));
		});

		div.c("page-layout-word", () => {
			span.c("muted", "It compiles to ");
			a.c("page-link", this.word.label).href(this.word.href);
			span.c("muted", " — one line of page code:");
		});

		code.c("page-layout-config", this.config);
	}

	wall(names){
		const kin = (names ?? []).map(name => this.parent?.children.get(name)).filter(Boolean);

		if (!kin.length) return p.c("muted", "None recorded yet.");

		return div.c("page-previews wide", () => kin.forEach(page => page.preview(this.parent.nav_for(page.name))));
	}

	// ⚠ click binds this to BUTTON's View; page reached via closure above.
	// ⚠ requestAnimationFrame required: 56 renders block paint; show "Running…" before.
	approval(){
		const page = this;

		p(this.approved
			? "Approved " + this.approved + " — every fixture passed at every width in the strip."
			: "Draft. The fixtures have not all passed yet; run them below to see which.");

		let $out;

		button.c("prim page-layout-run", "Run the fixtures at all seven widths").click(function(){
			const label = this.el.textContent;
			this.text("Running…");

			requestAnimationFrame(() => {
				const found = STRIP.flatMap(width => prove(page, width));
				this.text(label);
				page.report($out, found);
			});
		});

		p.c("muted", "A box here is a fixed width, so it answers container queries and clamps but not `@media`; the recorded date comes from the headless run, which sets the real viewport to each width.");

		return $out = div.c("page-layout-verdict");
	}

	report($out, found){
		const bad = found.filter(fatal);

		$out.empty(() => {
			p(bad.length ? `${bad.length} finding${bad.length === 1 ? "" : "s"} — this is a draft.` : "Every fixture passed at every width. Approved.");

			found.slice(0, 40).forEach(one => div.c("page-layout-finding")
				.ac(fatal(one) && "page-layout-bad")
				.append(() => {
					span.c("page-layout-value", one.width + "px · " + one.fixture + " · " + one.kind);
					span.c("muted", one.says);
				}));
		});
	}

	prose(text){ return p.c("muted", text); }

	// ⚠ Thumb is .stage (16/10, overflow hidden); height dropped to avoid 2x on port.
	preview(nav){
		return this.preview_card(nav, () => pane({ width: 900, height: 560 }, () => this.picture()));
	}

	// ⚠ Drawn at 900px and painted down (not card's width); prevents 30 identical rects.
	picture(){
		const { height, ...decl } = this.decl ?? {};

		return apply(div.c("page-layout-picture"), stacked(decl))
			.append(() => (this.boxes ?? []).forEach(box => this.blocks(box)));
	}

	blocks(box){
		for (let i = 0; i < Math.min(box.repeat ?? 1, 8); i++){
			const { height, ...decl } = box.decl ?? {};
			const $block = apply(div.c("page-layout-block"), decl);

			if (box.kids) $block.append(() => box.kids.forEach(kid => this.blocks(kid)));
		}
	}
}

const stacked = decl => (decl.columns || (decl.display && decl.display !== "block"))
	? decl : { ...decl, display: "flex", "flex-direction": "column" };

Object.assign(Layout.prototype, {
	columns: 1,
	room: "page",
	widths: [400, 3440],
	fallback: "stack",
	grows: true,
	wraps: false,
	accepts: "any",
	allowed_in: "any",
	denies: [],
	tags: [],
	variations: [],
	alternatives: [],
	icon: "view_quilt",
	leaf: true,
});

export default Layout;
