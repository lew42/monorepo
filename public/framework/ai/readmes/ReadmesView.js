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
				{ key: "levels", label: "Readmes", type: "number", width: "6em" },
				{ key: "tokens", label: "Chain", type: "number", width: "5em" },
				{ key: "own", label: "Own", type: "number", width: "5em" },
				{ key: "words", label: "Words", type: "number", width: "5.5em" },
				{ key: "unnamed", label: "Unnamed", type: "number", width: "6.5em" },
				{ key: "dead", label: "Dead", type: "number", width: "5em" },
				{ key: "shape", label: "Shape", width: "5.5em" },
			],
			rows: async () => {
				this.rows = await (await fetch(new URL("./chains.json", import.meta.url))).json();
				await this.add_audit(this.rows);
				const dir = new URLSearchParams(location.search).get("path");   // /framework/ai/readmes/?path=Servex/agents
				const row = dir && this.rows.find(r => r.dir === dir);
				if (row) this.show(row, false);
				return this.rows;
			},
			filters: false,
			sort_rows: (rows, sort) => DataGrid.prototype.sort_rows.call(this.grid, rows, sort ?? { key: "tokens", dir: "desc" }),
			row: row => div.c("datagrid-row rm-row", () => this.grid.cells(row)).attr("title", row.dir + (row.audit?.note ? "\n" + row.audit.note : "")).on("click", () => this.show(row)),
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
			const au = row.audit;
			if (au) div.c("rm-audit", () => {
				p(`Audit: ${au.words} words, shape ${au.shape || "not judged yet"}, ${au.unnamed.length} unnamed, ${au.dead_links.length} dead links, ${au.dated_lines} dated line${au.dated_lines === 1 ? "" : "s"}${au.docs_folder ? ", has a docs/ folder" : ""}${au.orphan ? ", not named by the readme above" : ""}${au.crowded ? ", crowded" : ""}.`);
				if (au.note) p(au.note);
				if (au.unnamed.length) small.c("muted", "Unnamed: " + au.unnamed.slice(0, 12).join(", ") + (au.unnamed.length > 12 ? ", …" : ""));
				if (au.dead_links.length) small.c("muted", "Dead: " + au.dead_links.slice(0, 8).join(", "));
			});
		});
	}
}
