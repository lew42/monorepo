import { Page, div, h2, p, span, md } from "/app.js";

/* ── The candidate ───────────────────────────────────────────────────────
   ONE declaration for every framed content box — the owner's question
   (2026-09-01): "can one single padding rule be reasonable at all widths?"
   `cqi`, so the % is of the box's OWN slot, not the viewport: each demo slot
   below is `container-type: inline-size`, which a grid track, a panel or a
   column can be in one line. Floor and cap are the padding study's band:
   nothing under ~0.75em survives contact with text, nothing over ~2.5em
   still reads as padding. */
const CARD_RULE = "clamp(0.75em, 3.5cqi, 2.5em)";

/* The same card at five slot widths, all wearing CARD_RULE verbatim. The
   label does the clamp's own math so the demo can't drift from the claim. */
const FONT = 16.2; // the column's body px at 18px root — labels only
const pad_px = w => Math.round(Math.max(0.75 * FONT, Math.min(0.035 * w, 2.5 * FONT)));

const card_at = w => div.c("flex v gap").style({ flex: w ? `0 0 ${w}px` : "1 1 10em", gap: "0.3em", containerType: "inline-size", minWidth: 0 }).append(() => {
	span.c("muted", w ? `${w}px → ~${pad_px(w)}px` : "fill → the clamp, live");
	div().style({ padding: CARD_RULE, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "0.3em" }).append(() => {
		div().style({ fontWeight: "700" }).text("Card title");
		div().style({ color: "var(--subtle)", fontSize: "0.9em" }).text("One line of body text, the same in every slot.");
	});
});

/* The boxes ONE rule does not fit — each is type-relative, not slot-relative. */
const VARIANTS = [
	["Icon button", { padding: "0.25em", borderRadius: "0.3em" }, "✕",
		"a tap target is a FONT thing — 0.25em on a 1.05em glyph is the 24px floor. A % would grow it with the toolbar it sits in."],
	["Text control", { padding: "0.25em 0.6em", borderRadius: "0.3em" }, "Save",
		"the house token (--pad-control). Controls sit in rows; their padding answers the label beside them, never the row's width."],
	["Chip", { padding: "0.3em 0.7em", borderRadius: "999px" }, "layout",
		"same reason, rounder. The study's borderline shot (the scenes hint pill) lives at exactly this size."],
];

const variant_row = ([name, style, label, why]) => div.c("flex gap").style({ alignItems: "center", gap: "0.8em" }).append(() => {
	div(label).style({ ...style, flex: "0 0 auto", background: "var(--surface)", border: "1px solid var(--line)", fontSize: "0.9em" });
	span(() => { span(name + " — ").style({ fontWeight: "700" }); span.c("muted", why); });
});

export default new Page({
	meta: import.meta,
	title: "One rule",
	description: "A single card padding declaration — clamp(0.75em, 3.5cqi, 2.5em) — proven at five slot widths, and the three control variants that stay em-based.",
	icon: "crop_square",
	width: "full",

	content(){
		md("**One declaration, every framed box:** `padding: clamp(0.75em, 3.5cqi, 2.5em)` — the [padding study](/imagine/design/padding/)'s comfortable band (2%–12% of a box's own width) said out loud as CSS. The `%` is `cqi` — the box's own slot, not the viewport — so a chip in a wide bar and a band on a phone both stay sane.");

		h2("The proof");
		p.c("muted", "Five slots, one rule, verbatim. The label is the clamp's own arithmetic.");
		div.c("flex gap wrap", () => { [180, 280, 420, 640].forEach(w => card_at(w)); card_at(0); });

		h2("The variants");
		p.c("muted", "Controls are type-relative — the one rule is for CONTENT boxes. Three variants cover everything else, and all three already exist as house values.");
		div.c("flex v gap").style({ gap: "0.7em" }).append(() => VARIANTS.forEach(variant_row));

		h2("What shipped");
		md("Today's system change (task: [spacing-clamp](/framework/ai/2026-09-01/spacing-clamp/)):\n\n" +
			"- `--pad-default: clamp(1em, 1.3%, 2em)` — every `.pad` with no override now scales; 1.3% of 1280 IS 1em, so nothing moved below 1280.\n" +
			"- `--gap-default: clamp(1em, 0.4em + 0.5vw, 1.6em)` — every default gap likewise (vw, never %: percentage row-gap is undefined against an auto height).\n" +
			"- Columns: pad tokens are `cqi` clamps on the host, so the crumb bar, heads, items and prose share one indent at every width.\n\n" +
			"**Open for the owner:** promoting `CARD_RULE` needs the slot to be a query container — one `container-type: inline-size` on the track. Worth a `card` word in framework.css, or stays a recipe?");
	},
});
