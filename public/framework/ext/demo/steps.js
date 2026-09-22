import View, { div, ol, li } from "../../core/View/View.js";
import demo from "./demo.js";

View.stylesheet(import.meta, "steps.css");

/**
 * demo.steps({ steps, stage, side }) — a demo beside the minimal steps that make
 * it make sense: the two-column shape for a page that used to lead with a title
 * and an intro paragraph and said too little. Read step one, do it in the demo
 * right beside it, watch the checkmark land, read step two.
 *
 *   demo.steps({
 *     steps: [
 *       { say: "Expand a branch", when: "expand" },
 *       { say: "Drag Jackets into Shoes", when: "move" },
 *       { say: "Turn on Adapt", when: "adapt" },
 *     ],
 *     stage: () => demo.stage(tree),
 *   });
 *
 * `steps` — up to eight `{ say, when }` pairs. `say` is a verb phrase, the whole
 * step ("Drag Jackets into Shoes", never "Dragging" or a paragraph). `when` is
 * the name of a DOM event the demo fires on (or inside) whatever `stage()`
 * builds — `$tree.el.dispatchEvent(new CustomEvent("move", { bubbles: true }))`
 * inside the page's own move handler is the whole wiring on that side. A step
 * with no `when` can only be finished by a click — fine for "read this" steps
 * that have no matching gesture.
 *
 * `stage` — a function that builds and returns the demo (any View: `demo.stage()`,
 * `demo.app()`, an `<img>`, a plain box). Called once, synchronously, the same as
 * every other capture function on this site.
 *
 * `side` — "left" or "right", which side the DEMO sits on once there's room for
 * two columns; default "left" (the demo first, the way the owner said it: "a demo
 * on the left or the right, THEN minimal text"). Either way the steps are what
 * stacks on TOP below the `.rail` word's own width, because `.rail` reorders
 * itself there — nothing extra to write for that, see doc/method/steps.md.
 *
 * The reader can also just click a step — the two ways to finish one are equal,
 * because not every reader is going to perform the gesture instead of reading
 * ahead. Either way the step directly under a run of done ones is CURRENT, and
 * current is the only place this uses two different states for "look here" — a
 * font-weight, never weight AND colour together (doc/method/steps.md, why).
 */
demo.steps = ({ steps, stage, side = "left" }) => {
	const done = steps.map(() => false);
	let $rows = [];

	function mark(i){
		if (done[i]) return;
		done[i] = true;
		$rows[i].ac("demo-step-done");
		point();
	}

	// The row right after the last done one — null once every step is done, which
	// is a step list's own "you're finished", not a state this invents.
	function point(){
		const at = done.indexOf(false);

		$rows.forEach(($row, i) => {
			$row.tc("demo-step-current", i === at);
			i === at ? $row.el.setAttribute("aria-current", "step") : $row.el.removeAttribute("aria-current");
		});
	}

	const rail = () => div.c("rail demo-steps-rail", () => {
		ol.c("demo-steps-list", () => {
			steps.forEach((step, i) => {
				$rows[i] = li.c("demo-step", step.say).click(() => mark(i));
			});
		});
	});

	const specimen = () => div.c("flex-1 demo-steps-stage", () => {
		const $built = stage();

		// One listener per named step, on the box the caller just built — bubbling
		// catches an event fired anywhere inside it, however deep the real gesture
		// happened (a row, a grip, a button three layers into a tree).
		steps.forEach((step, i) => {
			if (step.when) $built.el.addEventListener(step.when, () => mark(i), { once: true });
		});
	});

	// `wide` — the page grid's own word for "all the leftover", which is exactly
	// what a rail-beside-a-region wants (styles/doc/layout-system.md §1). Only
	// works a direct child of `.page` deep, same as every other demo door, so
	// this call belongs straight inside a page's `content()`, not nested in a box
	// of your own.
	const $view = div.c("flex wrap gap demo-steps wide", () => {
		if (side === "right"){ rail(); specimen(); }
		else { specimen(); rail(); }
	});

	point();

	return $view;
};

export default demo.steps;
export { demo };
