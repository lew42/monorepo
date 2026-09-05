import { Page, View, div, p, h3, span, a, code, icon, md } from "/app.js";
import { MECHANISMS, STYLES, CONTENT, LAYOUT, TOOLBAR, RUNGS, LAYOUT_MEANS, NS, FULL_NS, reset } from "./words.js";
import { sample } from "./samples.js";

View.stylesheet(import.meta, "paging.css");

/* ── PAGING — the class every demo page in this realm is ────────────────────────
   A `Paging` is a `Page` with two extra ideas on it, and nothing else:

     A MODE   five axes — `style` `content` `layout` `mech` `toolbar` — each of
              which is one word. A page opens on the words it declares in `mode:`;
              the chips in its toolbar change them live; `store()` remembers.
     A STAGE  the toolbar, the box, and the rows for its children, drawn by
              `paging()` from a page's own `content()`.

   The words themselves live in `words.js`, and are re-exported below so a page can
   keep importing them from here. The sample the box holds lives in `samples.js`.  */

export { MECHANISMS, STYLES, CONTENT, LAYOUT, TOOLBAR, RUNGS, LAYOUT_MEANS, NS, FULL_NS, reset };

const VALUES = { style: STYLES, content: CONTENT, layout: LAYOUT, mech: Object.keys(MECHANISMS), toolbar: TOOLBAR };

/* A layout size is a column WIDTH WORD, not a new mechanism. `center` and `column`
   are the same default track — center only changes where the content floats inside
   it — so this table is the whole of the layout axis. */
const TRACK = { center: "", column: "", wide: "large", full: "full" };

/* ⚠ A CLICKABLE THAT IS NOT A `<button>`. The site theme styles every `button` as a
   small uppercase CTA — `.theme-lew42 :is(button, .btn)` at (0,2,0), later in the
   same layer — so a chip cannot win that at its own specificity, and the answer
   the styles docs already reached is a clickable span rather than a heavier
   selector (a tree toggle glyph lost the same fight, 2026-08-19). The keyboard
   half is what a `<button>` was giving us for free, so it is restated here. */
export const press = (view, act) => view
	.attr("role", "button").attr("tabindex", "0")
	.click(act)
	.on("keydown", event => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		act();
	});

export class Paging extends Page {

	// ════ THE TAKEAWAY ════════════════════════════════════════════════════════
	// Every page in this realm opens with ONE sentence saying what it is for, so a
	// reader can say what they were supposed to learn before they read anything
	// else. `content()` calls this first; `takeaway:` is the sentence.
	lede(text){ return md(text ?? this.takeaway ?? this.description).ac("paging-lede"); }

	// ════ THE MODE ════════════════════════════════════════════════════════════
	// Five axes. A page opens somewhere else with `mode: { style: "card" }`, and
	// `axes: "style mech"` is which chip groups its toolbar shows — a page with
	// none gets no toolbar.

	/* ⚠ THE LAYOUT AXIS STARTS FROM THE PAGE'S OWN WIDTH WORD. `dress()` restamps
	     the column class from this axis, so a page declaring `width: "full"` and an
	     axis defaulting to `column` would contradict each other and the declaration
	     would silently lose — takeover/ rendered at 241px instead of the whole row
	     until this line existed (measured 2026-09-04, 1280). Derived, so they cannot
	     disagree. */
	opening(){
		return {
			style: "plain",
			content: "m",
			layout: { full: "full", large: "wide", fill: "wide" }[this.declared()] ?? "column",
			mech: "launch",
			// Matches the shape every page already had: a sibling of the box, above it,
			// on the stage — so a page silent on `toolbar` in its `axes:` is unchanged.
			toolbar: "top-outside",
		};
	}

	/* ⚠ ONE NAMESPACE FOR THE WHOLE REALM. Core keys a page's storage on its url
	     (`lew42:<url>`); `store_key` is core's own seam for saying otherwise, and
	     every page here uses it to land under `lew42:paging:` instead — which is
	     what makes ONE reset button able to forget the whole suite of demos and
	     nothing else on the site. words.js has the key shapes; doc/persistence.md
	     has the contract. Assigned rather than `??=`d: a page that moves gets a new
	     url, and a stale key would keep answering with the old page's mode. */
	store(){
		this.store_key = NS + this.url;
		return super.store();
	}

	// The reader's last pick here, over this page's opening state.
	modes(){ return this.picked ??= this.store().get({ ...this.opening(), ...this.mode }); }

	at(axis){ return this.modes()[axis]; }

	chips(){ return (this.axes ?? "style content layout mech").trim().split(/\s+/).filter(Boolean); }

	// What the toolbar calls an axis. A seam, not a config key: transitions/ reads
	// the same three axes as FROM, BY and TO.
	axis_word(axis){ return axis === "mech" ? "mechanism" : axis; }

	// THE ONE SEAM. A chip click and a line of code are the same call — which is
	// what makes the code tab honest: it appends the call you just made, and what
	// every Example on the site prints beside its result.
	pick(axis, value){
		const was = this.at(axis);
		const before = this.measure();

		this.picked = { ...this.modes(), [axis]: value };
		this.store().patch({ [axis]: value });

		this.calls = [...(this.calls ?? []), `page.pick("${axis}", "${value}")`];
		this.coded?.relist();

		this.repaint();

		// ⚠ Measured AFTER the repaint, and `getBoundingClientRect()` flushes layout
		//   synchronously — so these are the real numbers, not an estimate. The note
		//   is then refilled on its own rather than by a second repaint.
		this.change = { axis, was, value, before, after: this.measure() };
		this.$note?.empty(() => { this.note(); });

		return this;
	}

	// The box's own rect. Null before the first paint, and on a page with no stage.
	measure(){
		const box = this.$frame?.el?.getBoundingClientRect();
		return box ? { w: Math.round(box.width), h: Math.round(box.height) } : null;
	}

	// ════ THE BOX ═════════════════════════════════════════════════════════════
	// A page's `content()` calls this; everything below is a seam it can override.

	paging(){ return this.$stage = div.c("paging-stage", () => this.build()); }

	/* ⚠ A `full` PAGE ALWAYS GETS A TOOLBAR, even with zero mode chips — it is the only
	   way `Toolbar` can offer the exit chip (below) on a page whose brief declares no
	   `axes:` at all. Every page in this program today has at least one chip, so this
	   only ever adds behaviour, never removes the gate that kept a 241px demo silent. */
	build(){
		const show = this.chips().length > 0 || this.at("layout") === "full";
		const inside = show && this.at("toolbar").endsWith("inside");

		if (show && !inside) new this.constructor.Toolbar({ page: this });

		this.$frame = div.c("paging-box", () => {
			// INSIDE nests the toolbar as the box's own first flex child, sharing
			// whatever frame the style gave the box — `dress()` never learns this ran.
			if (!inside){
				this.shown();
				this.items();
				return;
			}

			new this.constructor.Toolbar({ page: this });
			div.c("paging-content", () => { this.shown(); this.items(); });
		});

		// THE CAPTION. Below the box, so it reads as a report on what just happened
		// rather than as another control. Only a page with chips can change, so only
		// a page with chips gets one.
		if (show) this.$note = div.c("paging-change", () => { this.note(); });
	}

	/* WHAT JUST CHANGED, IN WORDS AND IN PIXELS. The owner's report was that the
	   chips looked like they switched CONTENT rather than SIZE; the honest answer is
	   to make the page say, every time, which axis moved and what it did to the box.
	   Numbers come from `measure()` — read off the real element, never estimated. */
	note(){
		const change = this.change;

		if (!change) return p.c("muted", "Press any chip above and this line will say exactly what changed, in pixels.");

		const { axis, was, value, before, after } = change;

		return md("**" + this.axis_word(axis) + ": " + was + " → " + value + ".** " +
			this.note_size(before, after) + " " + this.note_axis(axis, was, value));
	}

	note_size(before, after){
		if (!before || !after) return "";

		const dw = after.w - before.w, dh = after.h - before.h;
		const grew = n => n > 0 ? "grew" : "shrank";

		if (!dw && !dh) return "The box did not move or change size — it is still " + after.w + " × " + after.h + "px.";
		if (dw && dh)   return "The box went from " + before.w + " × " + before.h + "px to " + after.w + " × " + after.h + "px.";
		if (dh)         return "The box " + grew(dh) + " from " + before.h + "px tall to " + after.h + "px — " + Math.abs(dh) + "px " + (dh > 0 ? "more" : "less") + ", same width.";

		return "The box " + grew(dw) + " from " + before.w + "px wide to " + after.w + "px — " + Math.abs(dw) + "px " + (dw > 0 ? "more" : "less") + ", same content.";
	}

	// One sentence per axis, so the number above always has a meaning beside it.
	note_axis(axis, was, value){
		if (axis === "content"){
			const rung = RUNGS.find(r => r.word === value);
			return "Nothing was taken away: `" + value + "` is `" + was + "` " + (rung ? "with " + rung.adds.replace(/^\+ /, "") + " added." : "with more of the same sample.");
		}

		if (axis === "layout")   return "`" + value + "` is " + (LAYOUT_MEANS[value] ?? "a column width word") + ". The content is identical — only the room changed.";
		if (axis === "style")    return "A style is one CSS class on this box. Nothing about the size or the content changed.";
		if (axis === "mech")     return "The rows below now `" + value + "`: a click " + (MECHANISMS[value]?.does ?? "behaves differently") + ".";
		if (axis === "toolbar")  return "The chips moved to the " + value.split("-")[0] + ", " + value.split("-")[1] + " the box.";

		return "";
	}

	// What the box holds: my own sample, or — after a `swap` — the child that
	// replaced it. The box itself never moves; only its content changes.
	shown(){
		const swapped = this.swapped && this.children.get(this.swapped);

		if (!swapped) return this.sample();

		/* ⚠ SAY WHAT SWAPPED AND WHY. The owner's report on the old version was that
		   it "switches a random paragraph and it's not clear exactly what is switching"
		   — so the swapped state now names the row you clicked, says what a swap did,
		   and offers the way back in the same box. */
		div.c("paging-swapped", () => {
			span.c("paging-swapped-eyebrow", "swapped in — the box did not move");
			h3(swapped.title);
		});

		p(swapped.description ?? MECHANISMS.swap.does);
		press(span.c("paging-back", () => { icon("swap_horiz"); span("put the sample back"); }), () => this.swap(this.swapped));
	}

	// THE SAME SAMPLE AT FIVE SIZES, and every size keeps what the smaller ones
	// showed. `samples.js` is the ladder; a page overriding this is showing
	// something else on purpose.
	sample(size = this.at("content")){ return sample(size, this.sample_title()); }

	sample_title(){ return "What does a click do?"; }

	// One row per child, each carrying the icon of the mechanism it will use.
	// Flip the chip and the same rows behave differently — that is the page.
	items(){
		const mech = this.at("mech");

		return div.c("paging-items").ac(mech === "swap" && "paging-items-swap").append(() => this.children.forEach((child, name) => {
			if (!child) return;
			this.item(name, mech);
			if (this.opened === name) this.panel(child);
		}));
	}

	item(name, mech){
		const nav = this.nav_for(name);
		const opens = mech === "launch" || mech === "takeover";

		return new this.constructor.Item({
			tag: opens ? "a" : "span",
			url: opens ? nav.url : null,
			words: nav.label,
			glyph: nav.icon,
			sign: MECHANISMS[mech].icon,
			/* WHICH ROW IS SELECTED. Without this a `swap` list said nothing about
			   which of its rows you were looking at, which is most of why it read as
			   "a random paragraph changed" (the owner, 2026-09-04).
			   ⚠ `chosen`, not `on` — `View.on()` is the event binder, and a field by
			     that name shadows the method: `press()` called `this.on("keydown", …)`
			     and threw "this.on is not a function" three frames away, on the PARENT
			     page (2026-09-04, exactly the shadowing trap the code skill names). */
			chosen: this.swapped === name || this.opened === name,
			act: opens ? null : () => this[mech](name),
		});
	}

	// `expand` — the item grows downward, in place. `swap` — the box keeps its
	// place and changes what it holds. Neither navigates, so neither has a url.
	expand(name){ this.opened = this.opened === name ? null : name; return this.repaint(); }
	swap(name){ this.swapped = this.swapped === name ? null : name; return this.repaint(); }

	panel(child){
		return div.c("paging-panel", () => {
			p(child.description ?? MECHANISMS.expand.does);
			a.c("paging-panel-link", () => { span("open it as a column"); icon("chevron_right"); }).href(child.url);
		});
	}

	/* A MINIATURE OF THIS PAGE — the box exactly as it draws itself, with no mode
	   toolbar and no column around it, so another page can show it inline beside the
	   code that made it (`examples/`). It reuses `shown()` and `items()`, so what an
	   Example shows is the real page and not a picture of one. */
	still(){
		return div.c("paging-still").ac("paging-" + this.at("style")).append(() => {
			div.c("paging-box", () => { this.shown(); this.items(); });
		});
	}

	// ════ THE PAINT ═══════════════════════════════════════════════════════════
	// The style and the layout size are CLASSES ON THE PAGE'S BOX — the column
	// body core hands me. One class each, so the toolbar is one add and one remove.

	// The width word I was DECLARED with, kept because `takeover` overwrites it.
	declared(){ return "own_width" in this ? this.own_width : (this.own_width = this.width); }

	/* ⚠ A CHILD'S TRACK IS ITS PARENT'S MECHANISM. That is the whole of `takeover`:
	     one set of children, and the word on the parent's toolbar decides whether
	     opening one puts a column beside it or collapses the row into it. Only a
	     parent whose toolbar actually shows the `mech` chips can do it, so a hub
	     that never offers the word cannot leave a sticky full-screen child behind. */
	column(host){
		const parent = this.parent;
		const drives = parent?.chips?.().includes("mech");

		// `items()` already drew my children, carrying their mechanism — core's own
		// rail below would say all of it a second time (layout Q4). A page that
		// draws none of them says `index: false` and gets the rail back.
		this.index ??= true;

		this.width = drives && parent.at("mech") === "takeover" ? "full" : this.declared();

		this.$box = super.column(host);
		return this.dress();
	}

	dress(){
		const $box = this.$box;
		if (!$box) return $box;

		$box.rc(...STYLES.map(word => "paging-" + word)).ac("paging-" + this.at("style"));

		// A page that DECLARES a layout word wears it even with no layout chips —
		// center/ is the page whose whole subject is one of these words.
		if (this.chips().includes("layout") || this.mode?.layout){
			const track = TRACK[this.at("layout")];

			$box.rc("paging-center", "page-column-large", "page-column-fill", "page-column-full")
				.ac(track && "page-column-" + track)
				.ac(this.at("layout") === "center" && "paging-center");
		}

		// The stage's own placement classes — restamped here too, so a `pick("toolbar", …)`
		// on repaint moves the rect without a second seam to keep in step with `build()`.
		if (this.$stage){
			const [side, place] = this.at("toolbar").split("-");

			this.$stage
				.rc("paging-side-top", "paging-side-left", "paging-side-right", "paging-side-bottom")
				.rc("paging-place-inside", "paging-place-outside")
				.ac("paging-side-" + side, "paging-place-" + place);
		}

		return $box;
	}

	repaint(){
		this.dress();
		this.$stage?.empty(() => this.build());
		return this;
	}

	// ════ THE CODE TAB ════════════════════════════════════════════════════════
	// A dynamic child, not a directory: `/…/code/` on ANY page in this program.
	route(name){
		if (name === "code") return this.coded = new this.constructor.Code({
			subject: this,
			title: "Code",
			icon: "code",
			width: "large",
			description: "This page's own module, and the calls your chips just made.",
		});
	}
}

/* ── the MODE TOOLBAR — chips that switch the page live ────────────────────── */
Paging.Toolbar = class PagingToolbar extends View {

	render(){
		this.page.chips().forEach(axis => this.group(axis));

		// THE WAY OUT OF A TAKEOVER. `full` collapses every ancestor into the crumb
		// strip; at 3440 that strip is a long way from a takeover-of-a-takeover, so
		// this is the second exit, right where the reader's eye already is.
		if (this.page.at("layout") === "full") this.exit();
	}

	// One seam, no new axis: a real `<a href>` to the parent, not a click handler —
	// the same pattern as core's own column-close (`Page.class.js`, `.href(this.parent.url)`).
	exit(){
		if (!this.page.parent) return;

		a.c("paging-chip paging-exit").href(this.page.parent.url).append(() => {
			icon("close_fullscreen");
			span("exit fullscreen");
		});
	}

	group(axis){
		div.c("paging-group", () => {
			span.c("paging-axis", this.page.axis_word(axis));
			VALUES[axis].forEach(value => this.chip(axis, value));
		});
	}

	chip(axis, value){
		const on = this.page.at(axis) === value;

		const $chip = span.c("paging-chip").ac(on && "on").attr("aria-pressed", String(on))
			.append(() => {
				if (axis === "mech") icon(MECHANISMS[value].icon);
				span(value);
			});

		press($chip, () => this.page.pick(axis, value));
	}
};

/* ── ONE ITEM — a child, and the icon of what clicking it does ─────────────── */
Paging.Item = class PagingItem extends View {

	render(){
		this.attr("href", this.url);           // nullish writes nothing — a button has none
		this.ac(this.chosen && "paging-item-on");

		if (this.glyph) icon(this.glyph);
		span.c("paging-item-words", this.words);
		icon(this.sign).ac("paging-sign");

		if (this.act) press(this, this.act);
	}
};

/* ── RESET — forget everything this realm remembered ───────────────────────────
   Two presses, not one: the first arms it and says what it is about to do, the
   second does it. A one-click control that throws away everything you changed is
   the wrong shape however clearly it is labelled.

   The clear itself is `words.js`'s `reset()` — every `lew42:paging:` key and no
   other. The RELOAD after it is the honest part: pages already on screen hold their
   mode in memory (`this.picked`), so clearing storage alone would leave the row
   looking unchanged until you navigated. A reload is one line and cannot be wrong. */
Paging.Reset = class PagingReset extends View {

	render(){
		this.armed ? this.confirm() : this.arm();
	}

	arm(){
		press(span.c("paging-chip").append(() => {
			icon("restart_alt");
			span("Reset the demos");
		}), () => { this.armed = true; this.empty(() => this.render()); });
	}

	confirm(){
		press(span.c("paging-chip on").append(() => {
			icon("restart_alt");
			span("Press again to forget every change");
		}), () => { reset(); location.reload(); });

		press(span.c("paging-chip", "Cancel"), () => { this.armed = false; this.empty(() => this.render()); });
	}
};

/* ── the CODE child — the module that ran, plus what you clicked ───────────── */
Paging.Code = class PagingCode extends Page {

	content(){
		p.c("paging-note", "The calls your chips make, then the module itself — fetched from its own import.meta.url, so the code you read is the code that ran. Click a chip in the column to the left and a line appears here.");

		this.$calls = div.c("paging-calls", () => { this.list_calls(); });

		// ⚠ No DOM after the await: the box is captured NOW and filled in the
		//   callback, which re-establishes the captor.
		div.c("paging-code", $box => {
			const url = this.subject.meta?.url;

			if (!url) return void $box.append(() => { p.c("muted", "This page is declared inside its parent's module — read that one."); });

			fetch(url)
				.then(res => res.text())
				.then(src => $box.append(() => { code.js(src); }))
				.catch(() => $box.append(() => { p.c("muted", "Source unavailable."); }));
		});
	}

	list_calls(){
		const calls = this.subject.calls ?? [];
		calls.length ? code.js(calls.join("\n")) : p.c("muted", "No chips clicked yet.");
	}

	// Re-listed rather than appended to, so the panel and the page's own record
	// can never disagree about what was clicked.
	relist(){ this.$calls?.empty(() => { this.list_calls(); }); }
};

/* A demo child — the thing a mechanism OPENS. Declared inside its parent's module
   rather than as a directory: there is nothing on disk to fetch, so a whole tree
   costs one module and no server probe, and `takeover` can still hand one of them
   the entire row (`column()` above). Its own toolbar keeps the style chips, so a
   reader who arrived can carry on changing the surface. */
export const leaf = (title, description, extra) => new Paging({
	title,
	description,
	takeaway: description,
	axes: "style",
	content(){ this.lede(); this.paging(); },
	...extra,
});

export default Paging;
