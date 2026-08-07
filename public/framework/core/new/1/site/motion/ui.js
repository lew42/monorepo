import { View, div, p, h3, button, code } from "/app.js";
import "/framework/ext/highlight/highlight.js";   // adds code.js / code.css / code.fn / code.file

// the section's own stylesheet — every page here imports this module, so it
// arrives with the first /motion/ page and not once per child
View.stylesheet(import.meta, "motion.css");

export { section } from "../ui.js";
export { default as demo } from "/framework/ext/demo/demo.js";
export { code };

/* Show a file BY FETCHING IT.
 *
 * A transition is mostly CSS, and CSS retyped into a template string is a second
 * copy — it drifts the first time somebody tunes a duration, and the page then
 * lies about what it just did. So every page in this section keeps its animation
 * in its OWN stylesheet, loads it with View.stylesheet(import.meta, "x.css"), and
 * prints it with file(import.meta, "x.css"). Same url, same bytes, no extraction
 * and nothing to keep in sync.
 */
export function file(meta, url){
	return div.c("code", () => {
		div.c("code-label", url);
		return code.file(meta, url);      // a promise — append_promise places it
	});
}

/* A stage: two cards and a button, so a transition can be re-run and MEASURED
 * without navigating away from the sentence explaining it.
 *
 * The cards carry the same variant class the real pages do, and every stylesheet
 * here writes ONE declaration block against two selectors — `.page.motion-x` and
 * `.motion-card.motion-x`. So the stage is not a mock-up of the recipe, it is the
 * recipe, and you can read that in the file printed under each demo.
 *
 * `.showing`, never `.active-page`: Router.mark() runs
 * `$app.querySelectorAll(".active-page, .active-ancestor")` and strips both names
 * on every navigation, anywhere in the app. Those two words belong to the Router.
 */
export function stage(variant, names = ["First", "Second"]){
	const cards = [];
	let shown = 0;

	div.c("motion-stage", () => names.forEach((name, i) => cards.push(
		div.c("motion-card " + variant, () => { h3(name); p("card " + (i + 1)); })
			.ac(i === 0 && "showing"))));

	div.c("motion-controls", () => {
		button.c("motion-btn", "swap").click(swap);
		button.c("motion-btn", "swap + measure").click(measure);
	});

	const $readout = div.c("motion-readout", "press “swap + measure”");

	function swap(){
		const leaving = cards[shown];
		shown = (shown + 1) % cards.length;
		leaving.rc("showing");
		cards[shown].ac("showing");
		return { leaving: leaving.el, entering: cards[shown].el };
	}

	// samples the two cards every frame — the numbers are the reader's browser,
	// not mine. No DOM is built in here: the readout view already exists.
	async function measure(){
		const { leaving, entering } = swap();
		const rows = [];

		for (let frame = 0; frame < 14; frame++){
			const t = await new Promise(requestAnimationFrame);
			rows.push(`${String(Math.round(t % 100000)).padStart(6)}  in ${read(entering)}   out ${read(leaving)}`);
			if (frame === 0)
				rows.unshift(`getAnimations()  in ${entering.getAnimations().length}   out ${leaving.getAnimations().length}`);
		}

		$readout.text(rows.join("\n"));
	}

	function read(el){
		const s = getComputedStyle(el);
		return `${s.display.padEnd(5)} op ${Number(s.opacity).toFixed(2)} ${s.translate === "none" ? "     " : s.translate.split(" ")[0].padStart(5)}`;
	}
}
