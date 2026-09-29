import { Doc, View, div, p } from "/app.js";
import { Collab } from "./Collab.js";
import { view } from "./view.js";

View.stylesheet(import.meta, "collab.css");

const DEMO = new URL("demo/collab.jsonl", import.meta.url).pathname;
const DEMO_SCORE = new URL("demo/scoreboard.jsonl", import.meta.url).pathname;
const SCOREBOARD = "/framework/ai/collab/scoreboard.jsonl";

/* Every decision is addressable — `?src=…#d-1` (collab-format.md "Added
   14:25"): the runner and ext/Doc build exactly that url. Each decision's own
   card carries `id="d-1"`, so this is a plain anchor scroll plus opening its
   "every option" disclosure — nothing decision-specific to look up. */
function open_hash(){
	const id = decodeURIComponent(location.hash.slice(1));
	const el = id && document.getElementById(id);
	if (!el) return;
	el.querySelector("details")?.setAttribute("open", "");
	el.scrollIntoView({ block: "center" });
	el.classList.add("collab-highlight");
}

// A Doc page: the live run stays the Overview (content(), below — unchanged from before
// this was a Doc), and the API tab lists `Collab`'s own members PLUS `Collab.Scoreboard`'s
// (the "Scoreboard." prefix, same pattern ext/Saver's readme shows for a second class) —
// so a reader can see `Collab.tally()` or `Scoreboard.retire()` the same way they would any
// other class's methods, instead of only ever meeting them live inside a run.
export default new Doc({
	meta: import.meta,
	title: "Collab",
	label: "Collab",
	description: "One collaboration run, live: members through phases to a vote, every decision the owner can overrule, and the model scoreboard.",
	icon: "forum",

	subject: Collab,
	properties: "members phases votes decisions tallies cost winner",
	methods:    "tally member phase decision root_decisions children_of",
	files:      "Collab.js view.js page.js collab.css",

	// ⚠ `api` here is an ASSIGNED instance member (Object.assign construction, not a
	// class body), so it has no real [[HomeObject]] — `super.api()` throws "not a
	// function". `Doc.prototype.api.call(this, section)` is the actual base behavior.
	api(section){
		Doc.prototype.api.call(this, section);
		this.members(section, Collab.Scoreboard, { properties: "rows", methods: "models retire", prefix: "Scoreboard." });
	},

	/* A sample run by default (`ext/Collab/demo/`); `?src=<url of a real
	   collab.jsonl>` draws that one instead, so the mastermind can link a live
	   run straight from a task's own page. Streams either way — `Collab.live()`
	   redraws in place as the run's own log grows. */
	content(){
		const src = new URLSearchParams(location.search).get("src");
		const demo = !src;

		div.c("collab-page flow wide", async $page => {
			const collab = new Collab({ url: src || DEMO });
			const scoreboard = new Collab.Scoreboard({ url: demo ? DEMO_SCORE : SCOREBOARD });
			// Reviews are a sitewide rollup, not this one run's own numbers — always the real
			// shared scoreboard, even in demo mode or behind a ?src= pointing somewhere else.
			const reviews = new Collab.Scoreboard({ url: SCOREBOARD });

			const draw = () => $page.empty(() => {
				if (demo) p.c("muted", "A sample run below — add ?src=<url of a real collab.jsonl> to draw that run instead.");
				if (!collab.loaded) return p.c("muted", "collab.jsonl not found at " + collab.url);
				view(collab, scoreboard.loaded ? scoreboard : null, reviews.loaded ? reviews : null);
			});

			await Promise.all([collab.live(draw), scoreboard.live(draw), reviews.live(draw)]);
			draw();
			open_hash();
		});
	},
});
