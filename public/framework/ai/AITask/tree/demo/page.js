import { Lanes } from "../../nested.js";
import { design_page } from "../design.js";

// An alias of the Lanes page: the made-up two-phase plan in the default design.
// Not listed in the switcher, so the same page never shows up twice.
export default design_page(import.meta, Lanes, {
	title: "Demo",
	description: "A made-up two-phase plan drawn as nested tasks: three tasks at once, then two more that wait for them.",
	icon: "science",
	intro: "A made-up plan, to show how nested tasks read. Phase 1 is three tasks running at the same time; phase 2 is two tasks that wait for all of phase 1. A check is done, a pulsing dot is running (with its %), a clock is waiting.",
});
