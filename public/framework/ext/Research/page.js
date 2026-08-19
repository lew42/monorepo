import { Doc, md } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Research",
	description: "A research topic as an append-only log — minions write it while they dig, the page renders it live.",
	icon: "biotech",

	files: "Research.js Research.css verbs.js store.mjs research.mjs",
	notes: "render verbs writers process decisions",

	content(){
		md("One topic is one `.jsonl` file. Minions append `node`, `vote`, `verdict` and `agent` lines to it; the page streams those over the dev socket and redraws in place — the minions strip first, then the conclusions, then every claim as a card that opens forever. No reload, ever.");

		md("Live: **[LiveReload](/framework/research/livereload/)** — or the index of topics, [/framework/research/](/framework/research/).");
	},
});
