import { Page, md } from "/app.js";

/* Round 1 of the research program: precisely carved ancient stone. Six sites, each with
   a mainstream account and a fringe claim, both sourced and credence-labelled — the raw
   log a sibling page aggregates is `log.jsonl` beside this file; these six pages are the
   curated reading of the same evidence. `previews()` draws the six as cards so this index
   stays a single md() paragraph plus the list — nothing here restates a subject page. */

export default new Page({
	meta: import.meta,
	title: "Precisely Carved Stone",
	description: "Six sites where ancient stonework reads as suspiciously exact — what's measured, how mainstream archaeology explains it, what the lost-technology claims say, and what would actually settle it.",
	icon: "architecture",

	children: "puma-punku serapeum barabar-caves sacsayhuaman predynastic-vases unfinished-obelisk",

	content(){
		md(`Six places get called "impossibly precise": Bolivia's Puma Punku, Egypt's Serapeum and unfinished obelisk, India's Barabar caves, Peru's Sacsayhuamán, and Egypt's predynastic hard-stone vases. Each page here gives the actual measurements, the mainstream archaeological explanation (tools, technique, and where real replication work exists), the alternative claim in its strongest real form, and the open question a fair reader keeps — credence labelled throughout: **established** / **contested** / **fringe** / **speculation**.

Sourced findings as they were logged: [\`log.jsonl\`](/imagine/research/stone/log.jsonl).`);
		this.previews();
	},
});
