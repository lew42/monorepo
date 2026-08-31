import { Page, md } from "/app.js";

/* Round 1 of the research program: the modern UAP/disclosure arc, 2017-2026. Six
   subject pages, each with the claim, the public evidence, the skeptical analysis,
   and a credence label throughout — the raw log a sibling page aggregates is
   `log.jsonl` beside this file; these six pages are the curated reading of the
   same evidence. `previews()` draws the six as cards so this index stays a single
   md() paragraph plus the list — nothing here restates a subject page. */

export default new Page({
	meta: import.meta,
	title: "The Modern Disclosure Arc",
	description: "2017's AATIP leak to 2026's open cases: the Navy videos, the ODNI report, Grusch and AARO, Congress's records act, and the Age of Disclosure documentary — each claim against its mundane accounting, credence labelled throughout.",
	icon: "visibility",

	children: "aatip-videos odni-2021 grusch-aaro legislation age-of-disclosure state-of-play",

	content(){
		md(`Six chapters in the same nine-year arc: the [2017 NYT story](./aatip-videos/) that made UAP mainstream and the Navy videos it dragged into daylight, the [2021 ODNI report](./odni-2021/) that put a number on the unknown, the [Grusch/AARO fight](./grusch-aaro/) over whether any of it is a cover-up, [Congress's records act](./legislation/) fight to force disclosure by law, the [Age of Disclosure](./age-of-disclosure/) documentary that took the claim to a mass audience, and [where things actually stand in 2026](./state-of-play/). Every page gives the claim, the public evidence, the skeptical analysis, and what would actually settle it — credence labelled throughout: **established** / **contested** / **fringe** / **speculation**.

Sourced findings as they were logged: [\`log.jsonl\`](./log.jsonl).`);
		this.previews();
	},
});
