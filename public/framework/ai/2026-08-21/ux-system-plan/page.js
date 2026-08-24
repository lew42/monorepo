import { Page, md, div, img, a, ui } from "/app.js";

const HERE = "/framework/ai/2026-08-21/ux-system-plan/";

export default new Page({
	meta: import.meta,
	title: "ux/ + config words",
	description: "Two words re-skin a whole section: ui-contrast and ui-compact, measured, plus the ux/ tier that states the system.",
	icon: "layers",

	content(){

		md("**Two config words, working, and a `ux/` tier that says what the two tiers are.** A word is a class on a *section* that remaps framework tokens — so twenty `ui/` templates re-skin and not one of them has a line about it. [`ui/words/`](/framework/ui/words/) is the live demo (toggles, and a density slider); [`ux/`](/framework/ux/) is the plan.");

		a.c("", () => div.c("surface", () => img.c("")
			.attr("src", HERE + "words.png")
			.attr("alt", "the same section twice, default and wearing both words")
			.style({ display: "block", width: "100%" })))
			.href(HERE + "words.png");

		md("Left: default. Right: the identical markup inside `.ui-contrast.ui-compact`. Measured at 1280 — padding **7.52px vs 15.04px**, gap the same, and `font-size` **15.04px in both**, which is the whole point: density is *less space at the same reading size*, not `zoom`. **Re-shot** after the tokenize pass below — the table's cells and the search field tighten now too.");

		md("## The words");

		// ⚠ Plain text only: ui.table() puts a cell straight into a td, no markdown pass.
		ui.table(
			["word", "what it remaps", "why it earns a name"],
			[
				["ui-contrast", "--ink --subtle --line --wash --tint --prim-ink", "readable at a glance; names no hue, so it covers light, dark and any theme"],
				["ui-compact", "--pad --gap --flow, scaled by --density", "less space at the same text size; --density is the knob, so there is no micro/mini/small ladder"],
			]);

		md("**No `micro` / `mini` / `small`.** Three values on one axis is a value, not a thing — this repo has ruled that twice already (`avatar/sizes` → `--avatar`, `stats/summary` → `--column`). The half step is `.style(\"--density\", \"0.7\")`, and the slider on the demo page is exactly that call.");

		md("## The contract");

		md("**A word sets custom properties and nothing else** — no element selectors, no component classes, no `!important`. That is what makes it cost every component zero lines, makes two words compose, and makes it work the same on `<html>`, on `.app` or on one card. The precedent is `dev/DevBar`.");

		md("**A word replaces a token; it can never scale one.** `calc(var(--radius) * var(--density))` self-references and CSS drops it — so a word may only touch a token *nothing else declares*. `--radius` failed that test (the theme owns it: `lew42` `0.25em`, `terminal` `0`) and was measured at 3.76px against the theme's own 3.76px, then removed.");

		md("## The four tokens — approved and shipped");

		md("Because a word can only reach tokens, **a value the framework never tokenized is a value no word can touch** — and toggling one makes the gaps visible. Four showed up immediately. The owner approved all four; [`ux-tokenize`](/framework/ai/2026-08-21/ux-tokenize/) landed them on 2026-08-21 as **exactly four one-line changes in `framework.css`**, each keeping the old literal as the `var()` fallback so nothing moves until a word declares the token.");

		ui.table(
			["was, literal", "now", "measured at 1280 under ui-compact"],
			[
				["th, td padding 0.25em 0.75em", "padding: var(--pad-cell, 0.25em 0.75em)", "3.76 / 11.28px  ->  1.88 / 5.64px"],
				["input, select, textarea padding 0.25em 0.6em", "padding: var(--pad-control, 0.25em 0.6em)", "3.76 / 9.024px  ->  1.88 / 4.512px"],
				["button / .btn padding 0.25em 1em", "the same --pad-control", "unchanged - lew42 restates it one layer up"],
				[".muted color-mix currentColor 75%", "currentColor var(--muted, 75%)", "a knob nothing turns - already 10.41:1"],
			]);

		md("**The proof came before the words did.** With the fallbacks in place and no token declared anywhere, every element on three pages — 4436 of them — was swept for all four paddings and its colour, before and after: identical, line for line. A tokenization that renders differently is a redesign wearing a refactor's name.");

		md("**Two of the four turned out to be one-line changes somewhere else.** `--pad-control` reaches every `input`, `select`, `textarea` and every unthemed button, but not a button on this site: `lew42` restates `padding: 0.7em 1.4em` for `button, .btn` in `@layer site`, which beats `framework.css`'s `@layer theme` at any specificity — the button carries a *second* literal, one layer up, and the fix is the same one line in the theme. And `--muted` ships as a knob nothing turns: inside `.ui-contrast` the muted text already measures **10.41:1** (against 5.02:1 in the default panel), so bumping `75%` to `85%` would buy contrast that is already there and spend the one step of de-emphasis the class exists for.");

		md("**`--density` stays at `0.5`, with `0.7` as the documented half step.** A config word must be visibly different or it is not a word, and `0.5` is the measured, demonstrated value — a 684.69px panel against the default's 876.30px. The knob covers everything in between, and `--density: 1` lands back exactly on the framework's own numbers. Revisable.");

		md("## What landed");

		md("- [`ux/`](/framework/ux/) — [readme](/framework/ux/) · [`doc/system.md`](/framework/ux/doc/system/) (the tier boundary argued, the config-word contract) · [`doc/decisions.md`](/framework/ux/doc/decisions/)\n- [`ui/words/`](/framework/ui/words/) — `words.js` (the two rules) and the live demo\n- [`ui/readme.md`](/framework/ui/) — refreshed: the template tier, the words, the graduation rule\n- The graduation rule itself: **a template graduates when something has to be remembered between renders.** `ui/tree` is the only candidate — the sibling [behaviors audit](/framework/ai/2026-08-21/ui-behaviors-audit/) scored 1 behavioral / 20");

		md("## Three traps, for whoever is next");

		md("1. **A loaded stylesheet is not evidence that *your* rule is in it.** An edit put prose between a comment's `*/` and the `.ui-compact` rule *inside the same `css()` call*: `.ui-contrast` kept working, `.ui-compact` was silently dead, nothing appeared in the console. Read a computed value back.\n2. **A custom property inherits, so a tidy inline value leaks into what it is being compared against.** The demo's caption wrapper set `--gap: 0.5em` for its own spacing; it reached into the section below and *both* panels measured 7.52px — the default panel wearing the compact gap.\n3. **`--flow` cannot be set from an ancestor.** `framework.css` declares it *on* the flow root at `(0,0,0)`, so an inherited value is overwritten at every flow on the page.");
	},
});
