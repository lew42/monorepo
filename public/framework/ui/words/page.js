import { Page, md, div, span, h3, label, input, button, ui } from "/app.js";

// Both words, as one string — typed once so the buttons, the panel and the thumb
// cannot disagree about what is being demonstrated.
const ON = "ui-contrast ui-compact";

/* The section both panels render. Read it looking for a word: there isn't one.
   Every template in here is the copy-paste markup off its own component page, and
   the whole re-skin arrives through tokens it was already reading. */
const section = () => div.c("flex v gap", () => {

	div.c("surface pad flex wrap gap v-center split", () => {
		div.c("flex v", () => {
			div.c("h4 muted", "Framework");
			div.c("h3", "Modules");
		});

		div.c("flex v-center gap", () => {
			button("Import");
			button.c("prim", "New");
		}).style("--gap", "0.3em");
	});

	div.c("grid auto gap", () => [
		["View", "A DOM element with a chainable API."],
		["Page", "A url, a title, and what to draw."],
		["Router", "Walks the children you declared."],
	].forEach(([name, line]) => div.c("surface pad flex v gap", () => {
		div.c("h4 muted", "Core");
		h3(name);
		span.c("muted", line);
	})));

	div.c("surface pad", () => ui.table(
		["module", "lines", "callers"],
		[["View", "641", "38"], ["Page", "363", "21"], ["Router", "180", "4"]]));

	div.c("surface pad", () => label.c("flex v gap", () => {
		div.c("h4", "Filter");
		input().attr("type", "search").attr("value", "core/");
		span.c("muted", "Matches a module path.");
	}).style("--gap", "0.4em"));
});

/* A captioned half of the comparison. The caption is OUTSIDE the box the words go on,
   so it stays put while the thing under it re-skins.
   ⚠ No inline `--gap` here, and that is the whole lesson of this page pointing at
     itself: a custom property INHERITS, so a tidy 0.5em on the caption wrapper reached
     straight into the section below it and both panels measured 7.52px — the default
     panel silently wearing the compact gap it was supposed to be compared against. */
const half = (caption, build) => div.c("flex v gap", () => {
	div.c("h4 muted", caption);
	build();
});

// The thumb: one card, twice, so the card itself is the before and the after.
const mini = () => div.c("surface pad flex v gap", () => {
	div.c("h4 muted", "Core");
	h3("View");
	span.c("muted", "A chainable DOM element.");
	div.c("flex gap", () => { button("Docs"); button.c("prim", "Open"); }).style("--gap", "0.3em");
});

export default new Page({
	meta: import.meta,
	title: "Config words",
	description: "Two classes on a section — every component inside re-skins, and no component knows.",
	icon: "style",

	content(){

		md("**A config word is a class you put on a section, not on a component.** It sets custom properties; everything inside is already reading them, so twenty templates re-skin and not one of them has a line about it.");

		let $words;

		div.c("flex wrap gap v-center", () => {

			// Not "on the right" — below 22em the two panels stack and the worded one
			// is underneath. The captions carry the identity; this row only toggles.
			span.c("h4 muted", "toggle");

			[["ui-contrast", "readable"], ["ui-compact", "tighter"]].forEach(([word]) => {
				const $b = button(word).ac("prim");

				// tc() on both, together, so the button and the panel cannot drift.
				$b.on("click", () => { $words.tc(word); $b.tc("prim"); });
			});

			span.c("muted", "density");

			// The argument, made draggable: the step between compact and micro is a
			// NUMBER, not a fourth class name.
			const $density = input().attr("type", "range")
				.attr("min", "0.2").attr("max", "1").attr("step", "0.05").attr("value", "0.5")
				.style("maxWidth", "9em");

			$density.on("input", () => $words.style("--density", $density.el.value));

		}).style("--gap", "0.5em");

		/* ⚠ Two panels of real UI never fit the reading measure — `bleed`, and
		   `--column: 22em` is the width one panel needs before it is worth splitting
		   the row. Below that (a phone, the 360 shot) they stack, which is the
		   comparison read top to bottom instead of side by side. */
		div.c("flex auto gap", () => {
			half("default", () => section());
			half(ON, () => { $words = section().ac(ON); });
		}).ac("bleed").style("--column", "22em");

		md("## The whole mechanism");

		md("```css\n.ui-compact {\n\t--density: 0.5;\n\t--pad: calc(1em * var(--density));\n\t--gap: calc(1em * var(--density));\n\t--pad-cell:    calc(0.25em * var(--density)) calc(0.75em * var(--density));\n\t--pad-control: calc(0.25em * var(--density)) calc(0.6em * var(--density));\n}\n```");

		md("`.pad` is `padding: var(--pad, var(--pad-default))` and `.gap` is `gap: var(--gap, var(--gap-default))` — the fallbacks became `:root` clamps on 2026-09-01 (`clamp(1em, 1.3%, 2em)` / `clamp(1em, 0.4em + 0.5vw, 1.6em)`), so an unworded box scales with its space; a word still declares the token and **inheritance** carries it down. That is why a word has no specificity to win, composes with every other word, and works the same on `<html>`, on `.app` or on one card.");

		md("**Every line keeps its own default ratio, so `--density: 1` lands back on the framework's own numbers** — measured, the worded panel is 876.30px tall at `1`, against the default panel's 876.30px, with every spot equal. Drag the slider to the right end and the two halves become the same picture.");

		md("**A word replaces a token; it can never scale one.** `calc(var(--radius) * var(--density))` is a self-reference and CSS drops the whole declaration — so a density word can only restate a value. That is fine for `--pad`, `--gap`, `--flow` and the two `--pad-*` tokens, which nothing declares (the fallback lives at the use site), and wrong for `--radius`, which the **theme** owns: `lew42` says `0.25em`, `terminal` says `0`. `0.5em × 0.5` measured 3.76px against the theme's own 3.76px — a no-op that would have overruled a theme's corners the day one of them changed. It was written, measured, and removed.");

		md("Reading `--density` is **not** the banned scale. The ban is on *self*-reference; a value computed off a **different** token is ordinary CSS, and that is what `--pad-cell` and `--pad-control` do.");

		md("**`--density: 0.5` is the shipped default, and `0.7` is the documented half step.** A config word has to be *visibly* different or it is not a word, and `0.5` is the value this page can demonstrate — 7.52px against 15.04px, a 684.69px panel against an 876.30px one. The knob exists for everything in between: `.ac(\"ui-compact\").style(\"--density\", \"0.7\")` measures 10.53px and 761.19px. Revisable — the number is a default, not a law.");

		md("**`ui-compact` deliberately leaves `font-size` alone.** Shrinking the type is [`zoom`](/framework/styles/), which already exists and is frozen at eight rungs. Density is *less space at the same reading size* — a different thing, so a different word.");

		md("**And there is no `micro` / `mini` / `small`.** Those are three values on one axis, and this repo's own rule is that a variant earns its place by being a different thing, not a different value. The knob is the number: `.ac(\"ui-compact\").style(\"--density\", \"0.7\")` is the half step — the slider above is doing exactly that.");

		md("## What a word reaches — read this before adding one");

		md("A word sets tokens and **nothing else**: no element selectors, no component classes. So **a value the framework never tokenized is a value no word can touch** — and toggling one is what makes those values visible. This page found four. On 2026-08-21 `framework.css` [took three of them](/framework/ai/2026-08-21/ux-tokenize/), each a one-line change keeping the old literal as the fallback, proven byte-identical across 4436 elements before any word was pointed at them.");

		// ⚠ Plain text only: ui.table() puts a cell straight into a td — no markdown pass
		// — so a `backtick` or a **star** renders as itself.
		ui.table(
			["the value", "reached by", "measured at 1280, default vs compact"],
			[
				["th / td padding", "--pad-cell", "3.76 / 11.28px  ->  1.88 / 5.64px"],
				["input, select, textarea padding", "--pad-control", "3.76 / 9.024px  ->  1.88 / 4.512px"],
				[".muted", "--muted", "a knob nothing turns - see below"],
				["button padding", "nothing, under this theme", "8.42 / 16.84px in BOTH panels"],
				["a component's inline --gap", "nothing, and that one is correct", "the card stated its own rhythm"],
			]);

		md("**The button is the row worth reading, and its lesson is not \"a missing token\".** `framework.css` now says `padding: var(--pad-control, 0.25em 1em)` — but `lew42` restates `padding: 0.7em 1.4em` for every `button` and `.btn` in `@layer site`, and a later layer beats `@layer theme` at any specificity. The token reaches every field, `select`, `textarea` and every unthemed button; on *this* site the button carries a **second literal, one layer up**. The fix is the same one line in the theme, and it belongs to whoever owns the theme.");

		md("**`--muted` ships as a knob nothing turns.** Inside `.ui-contrast` the muted text already measures **10.41:1** against the surface — the word moves `--ink` to `#000` and `.muted` derives from `currentColor` — against 5.02:1 in the default panel, where AA wants 4.5. Bumping `75%` to `85%` buys contrast that is already there and spends the single step of de-emphasis the class exists for. Measured, then left alone.");

		md("The last row is the boundary, not a bug: density governs the space **the section owns**. A card that wrote `--gap: 0.5em` inline has already made its own decision, and a section-level word does not get to overrule it.");

		md("The tier boundary this sits on — what belongs in `ui/`, what graduates to a class — is [ux/](/framework/ux/).");
	},

	preview(nav){
		return this.preview_card(nav, () => div.c("zoom-50 pad flex gap", () => {
			mini();
			mini().ac(ON);
		}));
	},
});
