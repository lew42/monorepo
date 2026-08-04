import { Page, View, p, div } from "/app.js";
import { section, file, stage, code } from "../ui.js";

View.stylesheet(import.meta, "discrete.css");

export default new Page({
	meta: import.meta,
	title: "@starting-style",
	classes: "motion motion-fade",

	content(){
		file(import.meta, "discrete.css");

		stage("motion-fade");

		p("Press “swap + measure”: `getAnimations()` is non-zero, opacity ramps across frames, and the leaving card keeps `display: block` until its fade finishes. The page you are reading faded in the same way — this is the recipe, not a mock-up of it.").ac("note");

		section("The verdict");

		p("Entry motion costs the framework nothing. `Page.render()` memoizes into `this.view`, so a page is mounted once and thereafter only toggles `display` — which is precisely the state change `@starting-style` was specified for.").ac("note motion-verdict");

		section("Two properties, two jobs");

		code.css(`
transition: display .32s allow-discrete;

  entering    display flips block at 0%    — there is a box for the whole fade
  leaving     display flips none at 100%   — the box survives its own fade

@starting-style { … }

  the FIRST computed style an element gets when it starts being rendered.
  Without it the browser has one value, not two, and interpolates nothing.`);

		section("Where it still needs a hand");

		p("`display: none` does two jobs, and `allow-discrete` only fixes the first. The second is layout: a page fading out is still laid out, so in `.pages` (a flex row) it sits beside the page arriving and both get half the width until the fade ends.").ac("note motion-warn");

		code.css(`
/* what this page ships, scoped with :has() because I don't own site/styles.css */
.pages:has(> .page.motion-fade) { position: relative; }

/* what the site should ship — one line, inert, breaks nothing */
.pages { position: relative; }`);

		p("`position: relative` does not create a containing block for `position: fixed`, so `.page.full` is unaffected. Verified on `/full/` with the rule live.").ac("note");

		section("Your browser, right now");

		div.c("motion-readout", () => {
			const rows = [
				["transition-behavior: allow-discrete", CSS.supports("transition-behavior", "allow-discrete")],
				["@starting-style", typeof CSSStartingStyleRule !== "undefined"],
				[":has()", CSS.supports("selector(:has(*))")],
			];
			return rows.map(([name, ok]) => `${ok ? "yes" : "NO "}   ${name}`).join("\n");
		});

		p("Both landed in Chrome 117 (Sep 2023), Safari 17.4–17.5 (spring 2024) and Firefox 129 (Aug 2024) — Baseline *newly* available, not yet widely. An older browser gets no fade and a correct page, which is the right way round: this is decoration, and every rule degrades to the site as it is today.").ac("note");

		section("Next");

		p("`/motion/view-transitions/` — the other modern answer, and the one that wants the framework's cooperation.").ac("note");
	},
});
