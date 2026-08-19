import { Page, div, p, a, span } from "/app.js";
import { Research, ResearchJSONL } from "/framework/ext/Research/Research.js";

/* ⚠ The SPA fallback answers every miss with index.html — content-type is the 404. */
const json = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
	.catch(() => null);

/* Topics are the DIRS under this one, enumerated from the dev server's manifest the
   way ext/AITask/dashboard.js does — a new topic appears when that rebuilds. Each
   one's own log names it, so the list reads as titles rather than as slugs. */
async function topics(base){
	const dir = await json("/framework/directory.json");

	return Promise.all((dir?.files?.find(f => f.name === "research")?.children ?? [])
		.filter(kid => kid.type === "dir")
		.map(async kid => ({
			name: kid.name,
			url: base + kid.name + "/",
			r: await new ResearchJSONL({ url: base + kid.name + "/research.jsonl" }).load(),
		})));
}

export default new Page({
	meta: import.meta,
	title: "Research",
	description: "Live research topics — the minions dig, the report moves while you read it.",
	icon: "travel_explore",

	content(){
		p("A topic is one append-only log the minions write while they dig. Open one and it moves as they work — conclusions first, every claim a card you can open forever.");

		div.c("research-topics flex v gap", async $t => {
			const list = await topics(this.url);

			$t.append(() => list.length
				? list.forEach(topic => this.topic(topic))
				: p.c("muted", "No topics yet — a topic is a dir under here holding a `research.jsonl`."));

			this.app?.router?.mark_links();
		});
	},

	topic({ name, url, r }){
		return div.c("research-topic flex v", () => {
			a.c("page-link", r.title ?? name).href(url);
			if (r.question) p.c("muted", r.question);
			if (r.status) span.c("research-status").ac(r.status).text(`${r.status} · ${r.nodes.size} nodes`);
		});
	},

	/* Every dir under here is a topic. `route()` sees undeclared names only, so it
	   can never shadow a real child — and a name with a dot is a file, not a topic. */
	route(slug){
		if (slug.includes(".")) return;

		return new Research({ title: slug, icon: "biotech", url: this.url + slug + "/" });
	},
});
