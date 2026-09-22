import { Page, md, demo, div, p, span, a, b, code, button, input, h3 } from "/app.js";

/* No stylesheet, on purpose — the parent page says every page under it is built
   from framework.css utilities alone, and the page that IS the design system has
   to mean it. The only styling written by hand is the demo's own geometry: a bar
   whose WIDTH is the token it names. That is the picture, not a look. */

/* THE FIVE QUESTIONS (layout skill)
   1. Container — a child of /framework/styles/, which previews its children and
      routes them as ordinary pages, so content lands in the page's `main` track.
   2. Size — one screen at 1280. The ladder is a narrow card (34em) and NOT `wide`:
      the lengths it paints top out at 30px, and a 30px bar inside an 890px band
      reads as an empty row. In a 34em card the bar slot is ~185px and a 30px bar is a
      sixth of it, with room beside it for the px and a note.
   3. Own layout — prose in the page's own flow; one `.surface.pad` card holding
      the ladder as a `flex v` stack; one `demo()`; one table, on `wide`.
   4. Regions — none. One declared child, `studies` — a card wall one click down,
      never drawn on this page. The rest of the detail nests in three `<details>`.
   5. Preview — the default title + description card on /framework/styles/. */

/* The ladder, biggest first. `word` is the class you type, `token` the custom
   property it asks for, `note` the one thing a newcomer needs about that step.

   ⚠ `--pad` is NOT in this list, and that is a correctness fix rather than a
     simplification: it is a PERCENTAGE of the box it sits in, so a bar drawn
     inside the 190px slot below reported 18px at 3440 while a real `.pad` box on
     this page was getting 62px. It gets its own box under the ladder instead,
     measured for real. */
const LADDER = [
	{ token: "--flow", word: ".flow", note: "between sections" },
	{ token: "--gap", word: ".gap", note: "between things" },
	{ token: "--gap-70", word: ".gap-70", note: "70% of the gap" },
	{ token: "--gap-50", word: ".gap-50", note: "half" },
	{ token: "--gap-35", word: ".gap-35", note: "about a third" },
	{ token: "--gap-25", word: ".gap-25", note: "a quarter" },
];

const SIZES = [["size-small", "small"], ["size-regular", "regular"], ["size-large", "large"]];

const WORDS = [
	["`.pad`", "`padding: var(--pad)`", "a box's own padding"],
	["`.all-pad`", "`padding: var(--pad)` on every child", "a row of cards, padded in one word"],
	["`.gap`", "`gap: var(--gap)`", "a flex or grid row"],
	["`.gap-70` `.gap-50` `.gap-35` `.gap-25`", "`gap:` that rung", "a tighter row — the four steps under the gap"],
	["`.flow`", "`--flow` between stacked children", "prose. A page already is one"],
	["`.mb`", "`margin-bottom: var(--gap)`", "one block, pushed off the next"],
	["`.measure`", "a 34em column, centred", "reading width, anywhere"],
	["`.size-small` `.size-regular` `.size-large`", "`--size` 0.75 / 1 / 1.5", "scales pad, gap AND flow for a whole box"],
];

export default new Page({
	meta: import.meta,
	title: "System",
	description: "The spacing system: three tokens, four rungs, and the words you type.",
	icon: "straighten",

	children: "studies",

	content(){

		p("This is the spacing system. Every space on this site — inside a box, between two things in a row, between one section and the next — is one of the seven lengths below. They are painted at their real size, at this window's width, right now.");

		this.ladder();

		p.c("h4", "The rule").ac("mb");
		p("A spacing value is a token or a rung. ", b("Never a multiplier and never a raw number."), " A control's own padding is ", code("em"), ".");
		p.c("muted", "A control is a button, a chip, a pill, a nav item, an input — anything you click or type into. Its padding, its height and the gap between its own icon and its own label are its own, in ", code("em"), ", because a spacing token caps at 2.6em and would stand a nav item 67px tall at 3440. The argument, measured: ", a("the size standard").href("/framework/styles/system/studies/size/"), ".");

		md("## The words you type");

		demo(() => {
			div.c("flex gap v-center pad surface", () => {
				div.c("h4 flex-1", "a row");
				button.c("prim", "One");
				button("Two");
			});
			div.c("flex gap-35 v-center pad surface", () => {
				div.c("h4 flex-1", "the same row, one rung tighter");
				button.c("prim", "One");
				button("Two");
			});
		}, "`pad` asks for `--pad`, `gap` asks for `--gap`, `gap-35` asks for the rung. **The class is the request, the token is the size** — you never type the number.");

		md("```js\ndiv.c(\"flex gap\")   // gap: var(--gap)\nview.ac(\"pad\")      // padding: var(--pad)\n```");

		md("| you type | you get | when |\n| --- | --- | --- |\n" +
			WORDS.map(r => "| " + r.join(" | ") + " |").join("\n")).ac("wide");

		p.c("muted", "One word is not on the ladder: ", code(".gap-2em"), " is a literal 2em, written before the standard existed. The rule that tells them apart — a number with a unit is that length, a bare number is a percent of ", code("--gap"), ".");

		md("## Region, card, control — which padding word");

		p("Three boxes want padding for three different reasons, so there are three different words. ", b("A page region takes `.pad`"), " — it scales with the PAGE. ", b("A framed box takes `.card`"), " — it scales with ITSELF, because `.card` already carries its own padding token. ", b("A control or a row keeps its own `em`"), " — it scales with its own text, the way a button already does. Below: the same viewport, three boxes, three live numbers.");

		this.three_boxes();

		p.c("muted", "Why the numbers differ: ", code("--pad"), " is a percentage of the containing block, so it sits pinned at its 1em floor inside anything narrower than about 1292px — true of nearly every card on the site, which is why a card that reached for ", code(".pad"), " directly measured 14–18px at every width while a full-page region on the same token ramped to 69.6px. ", code(".card"), "'s own token reads the same percentage against the CARD's width instead, so it tracks the card rather than the page. The full measurements: ", a("the padding audit").href("/framework/ai/2026-09-19/padding-audit/"), " and ", a("the card word").href("/framework/ai/2026-09-19/card-word/"), ".");

		md("## Card states — zero extra CSS, then two more words");

		p("A plain ", code("div.c(\"card\")"), " with a heading and a paragraph inside needs nothing else: no ", code("flex"), ", no second class. ", code(".card"), " already carries the ground, the hairline, the corner radius and its own rhythm between children — the same shape ", code(".flow"), " uses for a page, one size smaller (", code("--gap"), " instead of ", code("--flow"), ", because a heading-to-paragraph gap is a component's own rhythm, not a page's — ", code(".flow"), " on a card measured visibly too loose, the same finding the old hand-written card page made once). Two more words cover the two states V3 needed: a status edge, set by a custom property, and a selected look that does not touch the background.");

		demo(() => {
			div.c("flex gap wrap", () => {
				div.c("card").style({ flex: "1 1 14em" }).append(() => {
					h3("Plain card");
					p("Zero extra CSS — a heading, a paragraph, done.");
				});
				div.c("card").style({ flex: "1 1 14em", "--card-edge": "var(--warn)" }).append(() => {
					h3("Needs review");
					code(".style(\"--card-edge\", \"var(--warn)\")");
					p("A 3px status edge. Any colour token works; unset, it paints nothing.");
				});
				div.c("card selected").style({ flex: "1 1 14em" }).append(() => {
					h3("Selected");
					code(".ac(\"selected\")");
					p("An inset ring in the page's own ink — 17.4:1 against the ground, never the accent colour.");
				});
			});
		}, "The real shipped classes, not a mock-up. An orange border on an off-white ground was tried on V3 first and read as broken, not chosen — this ring is deliberately not accent-coloured, so it never competes with a real accent action elsewhere on the same card.");

		md("## Where the numbers come from");

		md("Three tokens are declared on **every element** by `framework.css`, from one knob called `--size`:\n\n```css\n:where(*) {\n    --pad:  calc(clamp(1em, 2.6% - 1.1em,   4em)   * var(--size));\n    --gap:  calc(clamp(1em, 1.5cqi - 0.3em, 2.4em) * var(--size));\n    --flow: calc(clamp(2em, 1.4cqi + 0.8em, 2.5em) * var(--size));\n}\n\n:where(*) {\n    --gap-70: calc(var(--gap) * 0.7);\n    --gap-50: calc(var(--gap) * 0.5);\n    --gap-35: calc(var(--gap) * 0.35);\n    --gap-25: calc(var(--gap) * 0.25);\n}\n```\n\nEach token holds its 1280 value as a floor and grows to about twice it at 3440. The four rungs are declared the same way — on every element, not once at the root — so each one follows whatever `--gap` is on the box it lands on. `--gap`'s ceiling is 2.4em, one notch under `--flow`'s 2.5em, on purpose: the row gap can never outgrow the section step.").ac("wide");

		md("## A field on a darkened ground");

		p("Not a spacing rule, but the same idea: ", b("one word carries the whole decision"), ". A text field's normal fill is one quiet step darker than whatever is behind it. Put that field on a ground that is already a step darker and you get a box inside a box — the sidebar's filter looked like that until 2026-09-19.");

		p("So the three ground words fix it themselves. ", code(".darken-1"), ", ", code(".darken-2"), " and ", code(".darken-3"), " paint the ground ", b("and"), " set ", code("--field-bg"), ", which every ", code("input"), ", ", code("select"), " and ", code("textarea"), " reads. You type one class; the fields on it come out right.");

		demo(() => {
			div.c("flex v gap", () => {
				div.c("darken-2 pad flex gap v-center", () => {
					span.c("h4", "a bar");
					input().ac("flex-1").attr("placeholder", "on a darkened ground — white");
				});
				div.c("pad flex gap v-center", () => {
					span.c("h4", "a page");
					input().ac("flex-1").attr("placeholder", "on the page itself — the usual fill");
				});
			});
		}, "The same `input()` in both rows, with no styling of its own. The top row's box wears `darken-2`; that one word is the whole difference. **Buttons are deliberately left alone** — a button already carries a fill to say what it is.");

		p.c("muted", "The worked example is the site's own rail: ", a("core/Sidebar").href("/framework/core/Sidebar/"), " — its filter is a ", code("darken-2"), " bar with a white field, and it declares neither colour.");

		p("The ten finished studies behind every number on this page — real screenshots, before/after, the audits — live one click down: ", a("Studies").href("studies/"), ".");

		md.details(import.meta, "doc/census.md", "Why four rungs and not two — the 1,894-value census the ladder was fitted to");
		md.details(import.meta, "doc/rest.md", "The rest of the system — type, colour, layers, layouts");
		md.details(import.meta, "readme.md", "Readme");
	},

	/* The picture. Each row is a bar whose WIDTH is the token it names, so the six
	   lengths can be compared by eye and read in px at the same time. `--pad` is the
	   seventh and joins below, as a real padded box.

	   Built synchronously and measured from a ResizeObserver, because the first
	   layout has not happened while `content()` runs and a one-shot read here would
	   report every bar as 0px. The size buttons re-read on click: changing `--size`
	   resizes the bars without resizing the card, so nothing else would fire. */
	ladder(){
		let card, padbox, padout;
		const bars = {}, readouts = {};

		const out = div.c("surface pad flex v gap-35").style({ maxWidth: "34em" }).append($card => {
			card = $card;
			for (const rung of LADDER) {
				div.c("flex gap-35 v-center", () => {
					/* `code`, not a heading class: the theme uppercases `h4`, and you
					   do not type `.GAP-70`. */
					code(rung.word).style({ flex: "0 1 6.5em" });
					div().style({ flex: "0 0 5.5em" }).append(() => {
						bars[rung.token] = div().style({
							width: "var(" + rung.token + ")",
							height: "1.1em",
							background: "var(--prim)",
							borderRadius: "2px",
						});
					});
					readouts[rung.token] = span("—").style({ flex: "0 0 3.5em", textAlign: "right" });
					span.c("muted", rung.note).style({ flex: "1 1 auto", minWidth: "0" });
				});
			}
		});

		const read = () => {
			if (!card || !card.el.isConnected) return;
			for (const rung of LADDER)
				readouts[rung.token].el.textContent = Math.round(bars[rung.token].el.getBoundingClientRect().width) + "px";
			padout.el.textContent = Math.round(parseFloat(getComputedStyle(padbox.el).paddingLeft)) + "px of padding, right now";
		};

		div.c("flex gap-35 v-center", () => {
			span.c("muted", "the same ladder, scaled:");
			for (const [cls, label] of SIZES) {
				button.c(cls === "size-regular" ? "prim" : "", label).on("click", () => {
					card.el.classList.remove("size-small", "size-regular", "size-large");
					card.el.classList.add(cls);
					read();
				});
			}
		});

		/* `--pad` is the seventh length and it is NOT a bar: it is a percentage of
		   the box it sits in, so it only means anything on a real box. This one is
		   on the page's own track, which is what `.pad` gives you here. */
		padbox = div.c("surface pad").append(() => {
			div.c("wash pad", () => { code(".pad"); span(" — "); padout = span("—"); });
		});
		p.c("muted", code(".pad"), " — the one length that follows the box rather than the window. On this page's track it is the number above; the same class inside a narrow card sits on its 1em floor instead.");

		new ResizeObserver(read).observe(card.el);
		new ResizeObserver(read).observe(padbox.el);
		return out;
	},

	/* The three-box picture for "Region, card, control" above. Each box's
	   padding is read GEOMETRICALLY — an inner marker's left edge minus the
	   box's own left edge — never `getComputedStyle().paddingLeft` directly:
	   `--pad` and `--pad-card` both mix a `%` into a `calc()`, and on a box
	   with no layout yet (zero size — a `.page` that is not the active one is
	   the common case) that reads back as the literal `clamp(...)` STRING,
	   not a px number (css/caveats.md). Geometry works whether or not the box
	   has been laid out, so it is the one method that is never wrong. */
	three_boxes(){
		let region, card, control;
		let regionMark, cardMark, controlMark;
		let regionOut, cardOut, controlOut;

		const out = div.c("flex gap wrap").append(() => {
			div.c("flex v gap-35").style({ flex: "1 1 14em", minWidth: "0" }).append(() => {
				div.c("wash pad").append($el => { region = $el; regionMark = div.c("darken-1").style({ minHeight: "1.2em" }); });
				div.c("flex gap-35 v-center", () => { code(".pad"); regionOut = span.c("muted", "—"); });
				p.c("muted", "a page region — scales with the page");
			});
			div.c("flex v gap-35").style({ flex: "1 1 14em", minWidth: "0" }).append(() => {
				div.c("card").append($el => { card = $el; cardMark = div.c("darken-1").style({ minHeight: "1.2em" }); });
				div.c("flex gap-35 v-center", () => { code(".card"); cardOut = span.c("muted", "—"); });
				p.c("muted", "a framed box — scales with itself");
			});
			div.c("flex v gap-35").style({ flex: "1 1 14em", minWidth: "0" }).append(() => {
				/* `align-self: flex-start` matters here: the column around this box
				   is `flex v` (a flex column), which STRETCHES a child to the column's
				   full width by default — and a full-width button CENTERS its label,
				   which would measure the centering gap instead of the padding. Kept
				   at its own shrink-wrapped width, "Save" sits directly against the
				   button's own left padding instead. */
				button.c("prim").style({ alignSelf: "flex-start" }).append($el => { control = $el; controlMark = span("Save"); });
				div.c("flex gap-35 v-center", () => { code("its own em"); controlOut = span.c("muted", "—"); });
				p.c("muted", "a control or a row — scales with its own text");
			});
		}).ac("wide");

		const pad_left = (box, mark) => {
			const b = box.el.getBoundingClientRect(), m = mark.el.getBoundingClientRect();
			const border = parseFloat(getComputedStyle(box.el).borderLeftWidth) || 0;
			return Math.round((m.left - b.left - border) * 10) / 10;
		};

		const read = () => {
			if (!region || !region.el.isConnected) return;
			regionOut.el.textContent = pad_left(region, regionMark) + "px";
			cardOut.el.textContent = pad_left(card, cardMark) + "px";
			controlOut.el.textContent = pad_left(control, controlMark) + "px";
		};

		new ResizeObserver(read).observe(region.el);
		new ResizeObserver(read).observe(card.el);
		new ResizeObserver(read).observe(control.el);
		read();
		return out;
	},
});
