import { View, div, span, a, h2 } from "/app.js";

/** DashBig — the big things now: each "### N. Title" in ai/priority.md with its "Now" line, cut short and linked to the full text. Read once from the file; the file is the only source. */
export default class DashBig extends View {
	static URL = new URL("../priority.md", import.meta.url).pathname;
	static NOW = 260;

	get classes(){ return "ad-sec ad-bigs"; }

	render(){
		h2.c("ad-h", "The big things now");
		this.$list = div.c("ad-bigrows", () => div.c("ad-none", "Reading priority.md…"));
		fetch(DashBig.URL).then(r => r.ok ? r.text() : "").catch(() => "").then(text => this.paint(DashBig.parse(text)));
	}

	/** [{n, title, now}] from the markdown; links and emphasis come out as plain words. */
	static parse(text){
		return String(text).split(/^### /m).slice(1).map(sec => {
			const lines = sec.split(/\r?\n/), head = /^(\d+)\.\s*(.+)$/.exec(lines[0]);
			if (!head) return null;
			const now = lines.find(l => l.startsWith("- **Now:**")) ?? "";
			return { n: head[1], title: head[2].trim(), now: DashBig.cut(DashBig.plain(now.replace("- **Now:**", ""))) };
		}).filter(Boolean);
	}

	static plain(s){ return String(s).replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*`_]/g, "").replace(/\s+/g, " ").trim(); }

	/** Whole sentences up to NOW characters. */
	static cut(s){
		if (s.length <= DashBig.NOW) return s;
		const ends = [...s.matchAll(/[.!?](?=\s|$)/g)].map(m => m.index + 1).filter(i => i <= DashBig.NOW);
		return ends.length ? s.slice(0, ends.at(-1)) : s.slice(0, DashBig.NOW).replace(/\s+\S*$/, "") + "…";
	}

	paint(rows){
		this.$list.empty(() => {
			if (!rows.length) return void div.c("ad-none", "priority.md did not load.");
			rows.forEach(r => div.c("ad-bigrow", () => {
				div.c("ad-bigtitle", () => { span.c("ad-bign", r.n); span(r.title); });
				if (r.now) div.c("ad-now", () => { span.c("ad-label", "Now "); span(r.now); });
			}));
			a.c("ad-more").href(DashBig.URL).attr("target", "_self").text("priority.md, in full →");
		});
	}
}
