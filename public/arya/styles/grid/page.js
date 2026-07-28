import { h2, p, div, strong, a } from "/app.js";
import Page from "../../lib/Page.js";
import { demo, snippet, note, api } from "../../lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("Two classes. That is the whole grid API, and between them they cover most of what people reach for media queries to do.");

		api({
			".grid": "display: grid",
			".grid.auto": "as many equal columns as fit, wrapping at `--column`",
			".grid.three": "three across, then one per line",
			".gap / .gap-2em": "same classes as flex"
		});

		h2("grid auto");

		p("The workhorse. Columns are equal width, the count changes with the container, and rows line up — which is the difference from `.flex.auto`.");

		demo(() => {
			div.c("grid auto gap", () => {
				div.c("box", "one");
				div.c("box", "two");
				div.c("box", "three");
				div.c("box", "four");
				div.c("box", "five");
			});
		});

		snippet(`.grid.auto {
    grid-template-columns: repeat(auto-fit, minmax(min(var(--column), 100%), 1fr));
}`);

		p(strong("The `min()` matters."), " Without it, a `--column` wider than the screen forces a horizontal scrollbar on a phone. `min(var(--column), 100%)` caps the track at the container width, which is the difference between a layout that survives a 320px screen and one that does not.");

		h2("Tuning it");

		p("Set `--column` on the container. Same markup, three different layouts:");

		demo(() => {
			div.c("grid auto gap", () => {
				div.c("box", "6em");
				div.c("box", "columns");
				div.c("box", "are");
				div.c("box", "narrow");
			}).style("--column", "6em");
		});

		demo(() => {
			div.c("grid auto gap", () => {
				div.c("box", "20em");
				div.c("box", "columns");
				div.c("box", "are");
				div.c("box", "wide");
			}).style("--column", "20em");
		});

		h2("grid three");

		p("Locked to three or one. Useful for a feature row where two-across looks wrong.");

		demo(() => {
			div.c("grid three gap", () => {
				div.c("box", "one");
				div.c("box", "two");
				div.c("box", "three");
			});
		});

		h2("Equal heights, for free");

		p("This is the reason to pick grid over flex. Grid rows are as tall as their tallest cell, so cards line up without touching them:");

		demo(() => {
			div.c("grid auto gap", () => {
				div.c("box", "short");
				div.c("box", "a good deal more text in this one, enough to run onto several lines and make the row taller");
				div.c("box", "short");
			});
		});

		p("The same content in `.flex.auto` gives you three different heights:");

		demo(() => {
			div.c("flex auto gap", () => {
				div.c("box", "short");
				div.c("box", "a good deal more text in this one, enough to run onto several lines and make the row taller");
				div.c("box", "short");
			});
		});

		note(p("Rule of thumb: grid when the children are the same kind of thing and should line up, flex when they are different things sitting next to each other."));

		h2("Beyond the two classes");

		p("There is no `.grid.two` or `.grid-cols-4`, and I do not think there should be — past this point you want real CSS, and it is one line:");

		snippet(`.pricing { display: grid; gap: 1em;
    grid-template-columns: 2fr 1fr; }

/* or inline, straight from the view */
div.c("grid gap").style("grid-template-columns", "2fr 1fr");`);

		demo(() => {
			div.c("grid gap", () => {
				div.c("box", "2fr");
				div.c("box", "1fr");
			}).style("grid-template-columns", "2fr 1fr");
		});

		p("A full page built out of all of this is on ", a("Build something").href("/arya/styles/build/"), ".");
	}
});
