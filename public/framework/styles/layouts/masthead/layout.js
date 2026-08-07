import { div, button } from "/app.js";
import { box, lines } from "../parts.js";

/* `grid three` holds three columns and then drops straight to one — the flip
 * done with `clamp()` instead of a breakpoint. */
export default () => {
	div.c("flex v gap", () => {
		box("Hero", () => {
			div.c("h1", "Ship the page, not the build step");
			lines(1);
			div.c("flex gap", () => { button.c("prim", "Get started"); button("Read the docs"); });
		});

		div.c("grid gap three", () => {
			box("No bundler", () => lines(1));
			box("No config", () => lines(1));
			box("No waiting", () => lines(1));
		});
	});
};
