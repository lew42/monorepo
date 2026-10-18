import { Page, div, p, h2, a, span, small } from "/app.js";

// What landed today, yesterday and this week. The rows come from Server/Landed.mjs (landed.json); this page only reads them. Doc: readme.md
export default class LandedPage extends Page {
	static DATA = new URL("./landed.json", import.meta.url);

	/** "Today", "Yesterday" or the weekday, relative to the day the file was written. */
	static label(day, today){
		const gap = Math.round((Date.parse(today) - Date.parse(day)) / 86400e3);
		return gap === 0 ? "Today" : gap === 1 ? "Yesterday" : new Date(day + "T12:00:00").toLocaleDateString(undefined, { weekday: "long" });
	}

	content(){
		const $box = div.c("block wide");   // captured now, filled after the fetch (no DOM after an await)
		fetch(LandedPage.DATA, { cache: "no-store" }).then(r => r.json()).catch(() => null).then(d => $box.append(() => {
			if (!d) return p("No landed.json yet: run node Server/Landed.mjs.");
			p.c("muted").text(`${d.total} tasks landed since ${d.since}. Computed ${d.written.slice(0, 16).replace("T", " ")} from every task.jsonl; the hand-picked highlights are in the doc beside this page.`);
			for (const day of Object.keys(d.by_day).sort().reverse()){
				const rows = d.by_day[day];
				h2(`${LandedPage.label(day, d.today)} · ${day} · ${rows.length}`);
				div.c("inbox-rows", () => rows.forEach(r => a.c("inbox-row").href(r.url).append(() => {
					div.c("inbox-row-head flex gap-25", () => { small.c("muted").text(r.at.slice(11, 16)); span.c("inbox-row-title").text(r.title); });
					div.c("inbox-row-foot", () => small.c("inbox-row-line muted").text(r.home));
				})));
			}
		}));
	}
}
