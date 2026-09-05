import { Doc, md } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Research",
	description: "A research topic as an append-only log — minions write it while they dig, the page renders it live.",
	icon: "biotech",

	files: "Research.js Program.js Topic.js Research.css verbs.js entries.js store.mjs research.mjs entry.mjs",
	notes: "program render verbs writers process decisions",

	content(){
		md("**A topic** is one `.jsonl` file. Minions append `node`, `vote`, `verdict` and `agent` lines to it; the page streams those over the dev socket and redraws in place — the minions strip first, then the conclusions, then every claim as a card that opens forever. No reload, ever.");

		md("**A program** is several topics dug at once and never closed — a file each, a flat entry per line, and a `credence` on every one of them. The front reads all of them: the legend, a card per topic, the theories board, the live stream. Nothing is ranked and nothing is upgraded — [`doc/program.md`](/framework/ext/Research/doc/program/).");

		md("Live: **[Ancient technology](/imagine/research/)** (a program, 4 topics) · **[LiveReload](/framework/research/livereload/)** (a topic) · the index, [/framework/research/](/framework/research/).");
	},
});
