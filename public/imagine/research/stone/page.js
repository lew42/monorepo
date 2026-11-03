import { Page, md } from "/app.js";

/* Round 1 of the research program: precisely carved ancient stone, six sites. Round 2
   deepened the log (65 -> 104 entries) chasing round 1's open questions — chiefly whether
   Dunn's Serapeum measurements were ever independently re-verified (answer: no, and why
   not) — and added a seventh subject, the Great Pyramid's granite coffer. `previews()`
   draws all seven as cards so this index stays a single md() paragraph plus the list —
   nothing here restates a subject page. */

export default new Page({
	meta: import.meta,
	title: "Precisely Carved Stone",
	description: "Seven sites where ancient stonework reads as suspiciously exact — what's measured, how mainstream archaeology explains it, what the lost-technology claims say, and what would actually settle it.",
	icon: "architecture",

	children: "puma-punku serapeum barabar-caves sacsayhuaman predynastic-vases unfinished-obelisk giza-coffer",
	index: true, // content() already shows every child as a previews() wall below

	content(){
		md(`Seven places get called "impossibly precise": Bolivia's Puma Punku, Egypt's Serapeum, unfinished obelisk and predynastic hard-stone vases, India's Barabar caves, Peru's Sacsayhuamán, and the Great Pyramid's granite coffer. Each page here gives the actual measurements, the mainstream archaeological explanation (tools, technique, and where real replication work exists), the alternative claim in its strongest real form, and the open question a fair reader keeps — credence labelled throughout: **established** / **contested** / **fringe** / **speculation**.

Sourced findings as they were logged: [\`log.jsonl\`](/imagine/research/stone/log.jsonl).`);
		this.previews();
	},
});
