import { Page, md, div, a, p } from "/app.js";
import { ShotsJSONL, ShotsView } from "./ShotsView.js";

/* ?url=&round=&width= routes the view, so a reload or a shared link lands on
   the same picture — see doc/architecture.md. No url: the index, every page
   that has a shot, newest run first. */
export default new Page({
	meta: import.meta,
	title: "Shots",
	label: "Screenshots",
	description: "Shoot a page at the widths its template needs, keep the rounds, diff each one against the last, and judge with a click — the owner's dev bar Screenshots tab and this page share the same view.",
	icon: "compare",

	content(){
		const params = new URLSearchParams(location.search);
		const url = params.get("url");

		md("`node Server/shots.mjs <url>` shoots a page; this reads the log it writes, `runs.jsonl`, and never shoots anything itself. The same tree also opens in the dev bar's **Screenshots** tab for whichever page you're on.");

		if (url){
			a.c("shots-back", "← every page with shots").href(this.url);
			div.c("shots-page-view").append(() => new ShotsView({
				url,
				round: params.get("round") ?? undefined,
				width: params.get("width") ?? undefined,
			}));
			return;
		}

		// ⚠ No DOM after the await — `draw()` builds inside `empty()`, which
		// re-establishes the captor (Research.js's own rule for this pattern).
		div.c("shots-index flow", async $i => {
			const log = new ShotsJSONL({ url: "/framework/ext/Shots/runs.jsonl" });

			const draw = () => $i.empty(() => {
				const urls = log.urls();
				if (!urls.length){
					p.c("muted", "No shots yet anywhere: `node Server/shots.mjs <url>`");
					return;
				}
				urls.forEach(u => {
					const runs = log.runs_for(u);
					a.c("shots-index-row flex gap v-center").href(`${this.url}?url=${encodeURIComponent(u)}`).append(() => {
						p(u);
						p.c("muted", `${runs.length} round${runs.length === 1 ? "" : "s"}`);
					});
				});
			});

			await log.live(() => draw());
			draw();
		});

		md.details(import.meta, "readme.md", "Readme");
	},
});
