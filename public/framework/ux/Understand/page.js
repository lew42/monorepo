import { Doc, md } from "/app.js";
import Understand from "./Understand.js";

export default new Doc({
	meta: import.meta,
	title: "Understand",
	description: "A ✓ or ? after every sentence the assistant read — green means clear, yellow opens a clarifying question right there in the flow.",
	icon: "fact_check",

	files: "Understand.js fixtures.js Understand.css page.js readme.md",
	notes: "decisions",

	content(){

		md("**The owner's own ask:** \"trying to figure out the objective of each statement… put like a green check mark after it just so that we see that visual feedback… if there's a statement that might have some ambiguity, maybe it's like a yellow question mark that goes after it.\" This page is that, working — a canned paragraph below is marked the moment it loads.");

		new Understand.Demo();

		md("## What the yellow ? does");

		md("Tap it. The clarification card scrolls into view and flashes — \"first it kind of selects that card,\" the owner's own words — then pick an option. The ? turns into a ✓ the instant you choose, and the choice is recorded (in memory only; a demo never writes a real log).");

		md("## Use");

		md("```js\nimport Understand, { marks } from \"/framework/ux/Understand/Understand.js\";\n\nconst out = await marks([\"Sentence one.\", \"Maybe sentence two?\"]);\n// -> {ok: true, marks: [...], source: \"assistant\" | \"fixtures\"}\n\nnew Understand({ sentences, marks: out.marks, log: [] });\n```");

		md("`marks()` asks Servex's `/api/hitl` (`{op:\"marks\", sentences, context}`); when that isn't reachable, or answers `ok:false`, it falls back to a plain rules pass in `fixtures.js` — the production site is static, so that fallback is what a real visitor actually sees. `source` in the result says which one ran.");

		md.details(import.meta, "readme.md", "Readme");
	},
});
