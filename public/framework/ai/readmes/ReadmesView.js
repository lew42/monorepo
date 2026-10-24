import { View, div, p, a, input, small } from "/app.js";
import DataGrid from "/framework/ext/DataGrid/DataGrid.js";

View.stylesheet(import.meta, "ReadmesView.css");

/** ReadmesView — for every folder with a readme, how many tokens of readmes an agent working there is given.
 *  Rows come from chains.json, written by `node Server/ReadmeChains.mjs` (the same readme_chain() agents get). Readme: readme.md. */
export default class ReadmesView extends View {
	get classes(){ return "rm-view"; }

	// ⚠ render() runs inside View's constructor, before class fields exist: state is set in render().
	render(){
		this.rows = [];
		p("Every folder with a readme, and how many tokens of readmes (about four characters each) an agent working there is given: the readmes from the repo root down to that folder. Click a folder to see which ones. Chain and Own are token counts.");
		this.$filter = input.c("rm-filter").attr("type", "search").attr("placeholder", "Type a folder path to filter…").on("input", () => this.filter(this.$filter.el.value));
		const $body = div.c("rm-body");
		this.grid = null;
		$body.append(() => this.build());
	}

	build(){
		this.grid = new DataGrid({
			columns: [
				{ key: "dir", label: "Folder", width: "3fr", min: "14em", format: v => v.replace(/^public\//, "") },
				{ key: "levels", label: "Readmes", type: "number", width: "7em" },
				{ key: "tokens", label: "Chain", type: "number", width: "11em" },
				{ key: "own", label: "Own", type: "number", width: "9em" },
				{ key: "words", label: "Words", type: "number", width: "7em" },
				{ key: "unnamed", label: "Unnamed", type: "number", width: "8em" },
				{ key: "dead", label: "Dead links", type: "number", width: "8em" },
				{ key: "shape", label: "Shape", width: "7em" },
			],
			rows: async () => {
				this.rows = await (await fetch(new URL("./chains.json", import.meta.url))).json();
				const dir = new URLSearchParams(location.search).get("path");   // /framework/ai/readmes/?path=Servex/agents
				const row = dir && this.rows.find(r => r.dir === dir);
				if (row) this.show(row, false);
				return this.rows;
			},
			filters: false,
			sort_rows: (rows, sort) => DataGrid.prototype.sort_rows.call(this.grid, rows, sort ?? { key: "tokens", dir: "desc" }),
			row: row => div.c("datagrid-row rm-row", () => this.grid.cells(row)).attr("title", row.audit?.note || "").on("click", () => this.show(row)),
		});
		this.$panel = div.c("rm-panel", () => p("Click a folder to see its chain here."));
	}

	/** Join audit.jsonl (written by `node Server/ReadmeAudit.mjs`; the latest line per path wins) onto the rows by folder. */
	async add_audit(rows){
		const res = await fetch(new URL("./audit.jsonl", import.meta.url));
		const by = new Map();
		if (res.ok) for (const l of (await res.text()).split("\n")) {
			if (!l.trim()) continue;
			try { const a = JSON.parse(l).readme_audit; if (a) by.set(a.path.replace(/\/[^/]*$/, ""), a); } catch {}
		}
		for (const r of rows){
			const a = by.get(r.dir);
			r.audit = a; r.words = a?.words ?? null; r.unnamed = a?.unnamed.length ?? null; r.dead = a?.dead_links.length ?? null; r.shape = a?.shape ?? "";
		}
	}

	/** Narrow the table to folders whose path contains the typed text. */
	filter(text){
		const t = text.trim().toLowerCase();
		this.grid.set_rows(this.rows.filter(r => r.dir.toLowerCase().includes(t)));
	}

	/** The chain of one folder: each readme a link to the file, with its tokens, then the sum. */
	show(row, push = true){
		if (push) history.replaceState(null, "", `?path=${encodeURIComponent(row.dir).replace(/%2F/g, "/")}`);
		this.$panel.empty(() => {
			div.c("rm-title", `An agent in ${row.dir} is given ${row.levels} readmes, ${row.tokens} tokens:`);
			row.chain.forEach(r => div.c("rm-item", () => {
				a.c("rm-path").href("/" + r.path.replace(/^public\//, "")).attr("target", "_blank").text(r.path);
				small.c("muted", `${r.tokens} tokens`);
			}));
			const a = row.audit;
			if (a) div.c("rm-audit", () => {
				p(`Audit: ${a.words} words, shape ${a.shape || "not judged yet"}, ${a.unnamed.length} unnamed, ${a.dead_links.length} dead links, ${a.dated_lines} dated lines${a.docs_folder ? ", has a docs/ folder" : ""}${a.orphan ? ", not named by the readme above" : ""}${a.crowded ? ", crowded" : ""}.`);
				if (a.note) p(a.note);
				if (a.unnamed.length) small.c("muted", "Unnamed: " + a.unnamed.slice(0, 12).join(", ") + (a.unnamed.length > 12 ? ", …" : ""));
				if (a.dead_links.length) small.c("muted", "Dead: " + a.dead_links.slice(0, 8).join(", "));
			});
		});
	}
}
