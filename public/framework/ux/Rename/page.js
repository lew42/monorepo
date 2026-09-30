import { Doc, md } from "/app.js";
import Rename from "./Rename.js";

export default new Doc({
	meta: import.meta,
	title: "Rename",
	description: "Tap a title to select it, then Rename turns it into a dropdown of 5 suggested names plus keep current.",
	icon: "drive_file_rename_outline",

	files: "Rename.js fixtures.js page.js readme.md",
	notes: "decisions",

	content(){

		md("**The owner's own ask:** \"I could click on a title and say, hey, can we rename this? And then it suggests… maybe it turns that title into a dropdown and then it has a whole bunch of alternatives that I can choose from… I guess I just need like the basic function working for now.\" Tap a title below to try it.");

		new Rename.Demo();

		md("## How it works");

		md("**Tap a title** to select it (it gets a visible border). **Press Rename**, or type \"rename this\" into the small field that appears, and the title becomes a dropdown of 5 suggested names plus \"keep current\". **Pick one** and the title updates — the log beneath shows every rename, in order, so you can see the latest one winning.");

		md("## Use");

		md("```js\nimport Rename, { rename_options } from \"/framework/ux/Rename/Rename.js\";\n\nconst log = [];\nnew Rename({ id: \"card-1\", title: \"Q3 planning\", log });\n// or ask directly:\nconst out = await rename_options(\"Q3 planning\");\n// -> {ok: true, names: [5 strings], source: \"assistant\" | \"fixtures\"}\n```");

		md("`rename_options()` asks Servex's `/api/hitl` (`{op:\"rename\", title, context}`); when that isn't reachable, or answers `ok:false`, it falls back to a plain rules pass in `fixtures.js`.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
