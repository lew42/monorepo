import { Page, View, p, div, button } from "/app.js";
import { section, file, stage, code } from "../ui.js";

View.stylesheet(import.meta, "reduced.css");

export default new Page({
	meta: import.meta,
	title: "Reduced motion",
	classes: "motion motion-lift",

	content(){
		code.css(`
--motion-dur: .32s;      --calm-dur: .12s;
--motion-shift: 1.5rem;  --calm-shift: 0rem;`);

		stage("motion-lift");

		div.c("motion-controls", () => {
			this.$motion_toggle = button.c("motion-btn motion-toggle", "preview calm")
				.attr("aria-pressed", "false")
				.click(() => this.calm());

			button.c("motion-btn", "read tokens").click(() => this.$motion_readout.text(read(this.view.el)));
		});

		this.$motion_readout = div.c("motion-readout", "press “read tokens”");

		p("Toggle it and swap the stage again. The fade stays; the movement is gone. That is what the preference actually asks for — `prefers-reduced-motion` is about vestibular triggers, not about animation, and a site that answers it by disabling everything has over-read it.").ac("note motion-verdict");

		section("One override, not eight");

		file(import.meta, "../motion.css");

		p("Every rule in this section reads `--motion-dur` and `--motion-shift` and names no number of its own. So honouring the preference is one media query, and a demo added next month cannot forget to — there is nothing to remember, because there is nothing to repeat.").ac("note");

		section("Why a token and not a blanket");

		code.css(`
/* the usual advice — one rule, kills everything, needs !important */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
    }
}

/* what this section does instead — no !important, and it keeps the fade */
@media (prefers-reduced-motion: reduce) {
    .page.motion { --motion-dur: var(--calm-dur); --motion-shift: var(--calm-shift); }
}`);

		p("The blanket rule spends `!important` — the last rung of the escalation ratchet — on a decision that a custom property makes for free, and it throws away the cross-fade that was never the problem. It also reaches every element on the page, including five other seats' work.").ac("note");

		section("The spinner is the exception that proves it");

		code.css(`
@media (prefers-reduced-motion: reduce) { .motion-spinner { animation-duration: 3s; } }`);

		p("A loading spinner should not stop — it is telling you something is happening. It slows down. `/motion/release/` ships that rule; the tokens do not cover it, and should not.").ac("note");

		section("Next");

		p("`/motion/head-start/` — one motion idea nobody asked for.").ac("note");
	},

	calm(){
		this.view.tc("motion-calm");
		this.$motion_toggle.attr("aria-pressed", String(this.view.hc("motion-calm")));
		this.$motion_readout.text(read(this.view.el));

		return this;
	},
});

// what the browser resolved, not what the stylesheet asked for
function read(el){
	const os = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const style = el && getComputedStyle(el);

	return [
		`prefers-reduced-motion   ${os ? "reduce" : "no-preference"}`,
		style ? `--motion-dur             ${style.getPropertyValue("--motion-dur").trim()}` : "",
		style ? `--motion-shift           ${style.getPropertyValue("--motion-shift").trim()}` : "",
	].filter(Boolean).join("\n");
}
