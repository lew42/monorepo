import { div, a, md } from "/app.js";
import Layout from "../Layout.js";
import recipe from "../recipe.js";
import { next } from "../../parts.js";

// white on `--bg` is not a colour decision — it is the pairing framework.css
// already ships as `.btn.bg`, restated
const dark = { background: "var(--bg)", color: "white" };

const feature = (title, body) => div.c("flex v gap").style("--gap", "0.4em").append(() => {
	div.c("h3", title);
	md(body);
});

export default new Layout({
	meta: import.meta,
	title: "Masthead",
	description: "Hero over a feature row — a landing page, and not one line of CSS.",
	icon: "web",

	/* `full`, because a band that stops short of the window is a heading, not a
	   masthead. No `fill`: a landing page is reliably TALLER than the region, and
	   `fill`'s `overflow: hidden` would put the footer band out of reach. */
	classes: "full flex v",

	layout(){

		// the band that has to reach the edge, or it is not a masthead
		div.c("pad flex v gap").style({ ...dark, "--pad": "clamp(2em, 6vw, 4.5em) 2em" }).append(() =>

			// one `measure` around the whole hero, so at 3440 the words stay a block
			// instead of a line stretched across a metre of glass
			div.c("measure flex v gap").style("--measure", "44em").append(() => {
				div.c("h1", "Ship the page, not the build step");

				md(`A no-build, native-ESM framework. Real import urls, real stylesheets, and a
page that is a file on disk. Open the folder, save, reload — that is the toolchain.`);

				div.c("flex gap wrap", () => {
					a.c("btn prim", "Read the docs").href("/framework/");
					a.c("btn", "See the layouts").href("/framework/styles/layouts/");
				});
			}));

		/* `grid three` holds three columns and then drops STRAIGHT to one — the
		   Heydon Pickering flip, done with `clamp()` instead of a breakpoint. Two
		   columns is the width nobody designed for. */
		div.c("pad").style("--pad", "2.5em 2em").append(() =>
			div.c("measure grid gap three").style("--measure", "78em").append(() => {
				feature("No bundler", `Every file in \`public/\` is served as-is and runs in the
browser as a native ES module. There is nothing between what you wrote and what
loaded.`);

				feature("No config", `The type scale, the tokens, the layer order and the
utility set are the whole vocabulary. A component starts with **no stylesheet** and
usually stays that way.`);

				feature("No waiting", `Save the file, reload the tab. No watcher warming up, no
step to fail in CI, and a deploy that is a directory of static files.`);
			}));

		div.c("pad").style("--pad", "0 2em 2.5em").append(() =>
			div.c("measure").style("--measure", "78em").append(() =>
				recipe(this, "Bands, stacked. `full` is what lets each one touch the window; every band brings its own padding back.")));

		next("[Sections](/framework/styles/sections/) — these layouts, filled with real elements and components.",
			"styles/layouts/masthead/").ac("pad wash").style("borderTop", "1px solid var(--line)");
	},
});
