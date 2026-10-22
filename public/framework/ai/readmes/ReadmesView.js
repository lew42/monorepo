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
		p("Every folder with a readme, and how many tokens of readmes (about four characters each) an agent working there is given: the readmes from the repo root down to that folder. Click a folder to see which ones.");
		this.$filter = input.c("rm-filter").attr("type", "search").attr("placeholder", "Type a folder path to filter…").on("input", () => this.filter(this.$filter.el.value));
		this.grid = new DataGrid({
			columns: [
				{ key: "dir", label: "Folder", width: "3fr" },
				{ key: "levels", label: "Readmes", type: "number", width: "6em" },
				{ key: "tokens", label: "Chain tokens", type: "number", width: "8em" },
				{ key: "own", label: "Own tokens", type: "number", width: "8em" },
			],
			rows: async () => (this.rows = await (await fetch(new URL("./chains.json", import.meta.url))).json()),
			filters: false,
			sort_rows: (rows, sort) => DataGrid.prototype.sort_rows.call(this.grid, rows, sort ?? { key: "tokens", dir: "desc" }),
			row: row => div.c("datagrid-row rm-row", () => this.grid.cells(row)).on("click", () => this.show(row)),
		});
		this.$panel = div.c("rm-panel");
	}

	/** Narrow the table to folders whose path contains the typed text. */
	filter(text){
		const t = text.trim().toLowerCase();
		this.grid.set_rows(this.rows.filter(r => r.dir.toLowerCase().includes(t)));
	}

	/** The chain of one folder: each readme a link to the file, with its tokens, then the sum. */
	show(row){
		this.$panel.empty(() => {
			div.c("rm-title", `An agent in ${row.dir} is given ${row.levels} readmes, ${row.tokens} tokens:`);
			row.chain.forEach(r => div.c("rm-item", () => {
				a.c("rm-path").href("/" + r.path).attr("target", "_blank").text(r.path);
				small.c("muted", `${r.tokens} tokens`);
			}));
		});
	}
}
