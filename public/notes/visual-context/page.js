import { Page, md, div, span, figure, figcaption, img, a, input, label } from "/app.js";

const here = new URL(".", import.meta.url).pathname;

/* Layout, answered before the first factory call (the `layout` skill's five):
   1. Container — the app's main region under /notes/. A plain page grid; /notes/ is a
      ROOT realm, not the /imagine/ columns host, so `wide` is a real breakout here.
   2. Size — one reading column; the photo and the spread take `wide`. The photo is
      capped by HEIGHT (notes.css) so the page stays one screen at every width.
   3. Own layout — `.md` prose (`.flow`); the spread is one `flex v gap` box on
      `.surface`, and the bar inside it is the only positioned thing on the page.
   4. Regions — two: crumbs, then content. No nested children.
   5. Preview — the photo as the card thumb (`preview()` below).

   The note draws a diagram twice — a span with its ends marked, then the same span
   with an anchor at one end — and ends "you don't always need an anchor point". So
   the built thing is that diagram, live: three complicating factors put three marks
   on one axis, the spread is what they cover, and the anchor toggles off. */

// The note's own topic, and three complicating factors that pull it apart. Values are
// 0..1 along the axis; they are the STARTING positions, and every one of them moves.
const TOPIC = "Punctuation doesn't matter?";
const AXIS = ["never matters", "always matters"];
const FACTORS = [
	{ name: "a text to a friend", at: 0.06 },
	{ name: "a commit message",   at: 0.44 },
	{ name: "a signed contract",  at: 0.95 },
];
const ANCHOR = 0.5;   // "the house style guide" — one fixed origin to measure from

const pct = n => (n * 100).toFixed(0) + "%";

/* One live diagram. State is the three factor positions plus whether the anchor is
   shown; `draw()` repaints the bar on every input. Nothing persists — a refresh is
   the note's numbers again (minion rules: demos do not persist). */
function spread_diagram(){
	const state = { at: FACTORS.map(f => f.at), anchored: true };

	return div.c("surface pad flex v gap wide", () => {
		div.c("flex split gap wrap", () => {
			span().style("fontWeight", "700").text(TOPIC);
			label.c("flex gap v-center", () => {
				input().attr("type", "checkbox").attr("checked", "")
					.on("change", e => { state.anchored = e.target.checked; draw(); });
				span.c("muted", "anchor point");
			});
		});

		const $bar = div().style({ position: "relative", height: "3.5em" });

		div.c("flex split", () => {
			span.c("muted", AXIS[0]);
			span.c("muted", AXIS[1]);
		});

		div.c("flex v gap", () => FACTORS.forEach((factor, i) => {
			label.c("flex gap v-center wrap", () => {
				span.c("muted").style("flex", "0 0 11em").text(factor.name);
				input().attr("type", "range").attr("min", "0").attr("max", "100")
					.attr("value", String(Math.round(factor.at * 100)))
					.style("flex", "1 1 10em")
					.on("input", e => { state.at[i] = Number(e.target.value) / 100; draw(); });
			});
		}));

		const $read = span.c("muted");

		// The bar: a rule, the covered span drawn over it, a dot per factor, and — when
		// it is on — the anchor as a solid tick you measure from.
		const draw = () => {
			const lo = Math.min(...state.at), hi = Math.max(...state.at);

			$bar.empty(() => {
				div().style({ position: "absolute", insetInline: "0", top: "50%",
					height: "1px", background: "var(--line)" });

				div().style({ position: "absolute", top: "50%", translate: "0 -50%",
					left: pct(lo), width: pct(hi - lo), height: "0.5em",
					background: "var(--prim)", opacity: "0.25", borderRadius: "999px" });

				state.at.forEach(at => div.c("notes-mark").style("left", pct(at)));

				if (state.anchored) div().style({ position: "absolute", left: pct(ANCHOR),
					top: "20%", bottom: "20%", width: "2px", background: "var(--ink)" });
			});

			$read.text(state.anchored
				? `Spread ${pct(hi - lo)} wide, sitting ${pct(Math.abs((lo + hi) / 2 - ANCHOR))} `
					+ `from the anchor — one fixed origin, and every position reads as a distance from it.`
				: `Spread ${pct(hi - lo)} wide. No origin: the topic is the RANGE, and nothing `
					+ `here is measured from anywhere.`);
		};

		draw();
	});
}

export default new Page({
	meta: import.meta,
	title: "Visual context",
	icon: "hub",
	description: "Topic × complicating factors. Each topic has a spread.",

	preview(nav){
		return this.preview_card(nav, () => { img.c("notes-thumb").attr("src", here + "note.jpg")
			.attr("alt", "Notebook page headed VISUAL CONTEXT"); });
	},

	content(){
		this.crumbs();

		figure.c("notes-shot flex v v-center gap wide", () => {
			// ⚠ Block body: a captured callback's return value is appended too.
			a(() => { img().attr("src", here + "note.jpg")
				.attr("alt", "Notebook page headed VISUAL CONTEXT, with a spread diagram"); })
				.href(here + "note.jpg").attr("target", "_blank");
			figcaption.c("muted", "Open it for the full-size scan.");
		});

		md(`## What the page says

Headed **VISUAL CONTEXT**, underlined. Then two ways in:

1. Google Form (Private)
2. Discord Role (Public)

Then a column of headlines, each one a topic:

- **ITS NOT OVER** → AI Visualization
- **PUNCTUATION DOESN'T MATTER?**
- **PARTY UP**
- ~~**THE GOVT FREQ LIES...**~~ — struck through on the page. Under it: an arrow both
  ways labelled *timelines*, then *8 people*, a drawn fish with *sus* beneath it, and a
  folded-map sketch labelled *maps*. Three ways to look at one topic.
- **Try streaming & opus...** — with two names arrowed under it, *mlew42?* (?) and
  *OpenMike*.

And down the right-hand side, the model the whole page is really about:

> **TOPIC × COMPLICATING FACTORS**
> ↓
> **Each topic has a spread.**

drawn twice — once as a span with both ends arrowed and positions stacked inside it,
once as the same span anchored to a fixed tick with the rest fanning out from it. The
last line on the page settles it:

> You don't *always* need an anchor point.`);

		md(`## What it points at

- [Platform](/imagine/platform/) — "topics as worlds", the community platform this page
  is sketching. The two front doors here, a private Google Form and a public Discord
  role, are **not built** — nothing on the site mentions either.
- [A topic, demoed](/imagine/platform/topic/) — one topic as a real page: its space, its
  channels, its levels. The thing "PARTY UP" would open into.
- [Research](/imagine/research/) — every entry already carries a credence: *established ·
  contested · fringe · speculation*. That is the site's existing answer to "each topic
  has a spread" — but as one label per claim, not a range. The note asks for the range.
- [AI](/framework/ai/) — "ITS NOT OVER → AI Visualization": one page per working day, the
  sessions drawn rather than listed.
- [Vocabulary](/imagine/design/vocabulary/) — topic × axis, already built once: 29 tags
  on 4 axes, describing structure instead of opinion.`);

		md(`## Each topic has a spread

The note's diagram, live. Three **complicating factors** each put a mark on one axis;
the **spread** is what they cover. Turn the anchor off and the spread is still a spread —
which is the note's last line.`);

		spread_diagram();

		md(`The other headlines on the page are topic *titles*, not interfaces — there is
nothing to build from "PARTY UP" until it says what it opens into. The Google Form and
the Discord role are a decision to make, not a UI to draw. So this is the one thing on
the page that was buildable, and it is built.`);
	}
});
