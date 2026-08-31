import { Page, md } from "/app.js";

/* Round 1 of the research program: the modern UAP/disclosure arc, 2017-2026. Six
   subject pages, each with the claim, the public evidence, the skeptical analysis,
   and a credence label throughout. Round 2 added three chapters — PURSUE (the
   2026 executive-order disclosure channel), the Galileo Project (the academic
   entry), and two resolved cases read side by side as a methods exemplar — plus
   went deeper on the Virginia maritime case and the FY2027 NDAA fight inside the
   existing legislation/state-of-play pages. The raw log both rounds append to is
   `log.jsonl` beside this file; `previews()` draws all nine pages as cards so
   this index stays a single md() paragraph plus the list. */

export default new Page({
	meta: import.meta,
	title: "The Modern Disclosure Arc",
	description: "2017's AATIP leak to 2026's PURSUE files: the Navy videos, the ODNI report, Grusch and AARO, Congress's records act, the Age of Disclosure documentary, the Galileo Project, and two resolved cases read as a methods exemplar — credence labelled throughout.",
	icon: "visibility",

	children: "aatip-videos odni-2021 grusch-aaro legislation age-of-disclosure state-of-play pursue-disclosure galileo-project resolved-cases",

	content(){
		md(`Nine chapters in the same arc: the [2017 NYT story](./aatip-videos/) that made UAP mainstream and the Navy videos it dragged into daylight, the [2021 ODNI report](./odni-2021/) that put a number on the unknown, the [Grusch/AARO fight](./grusch-aaro/) over whether any of it is a cover-up, [Congress's records act](./legislation/) fight to force disclosure by law, the [Age of Disclosure](./age-of-disclosure/) documentary that took the claim to a mass audience, [where things actually stand in 2026](./state-of-play/), [PURSUE](./pursue-disclosure/) — the 2026 executive-order disclosure channel that moved faster than Congress — the [Galileo Project](./galileo-project/)'s academic bid to study UAP scientifically, and [two resolved cases read side by side](./resolved-cases/) as a methods exemplar: what "resolved" actually spans. Every page gives the claim, the public evidence, the skeptical analysis, and what would actually settle it — credence labelled throughout: **established** / **contested** / **fringe** / **speculation**.

Sourced findings as they were logged: [\`log.jsonl\`](./log.jsonl).`);
		this.previews();
	},
});
