import { AITask, md } from "/app.js";
import full from "/framework/styles/layouts/full.js";
import { workspace } from "/framework/ext/Panel/workspace.js";
import MemorySaver from "/framework/ext/Saver/MemorySaver.js";

/* Real page.js so `probe/` routes through file-based dispatch instead of the day's
   dynamic AITask fallback (which only checks ONE level for `page.js`) — see
   ext/AITask/dashboard.js `has_page_js()`. `probe/` is the headless driver's harness:
   a viewport-filling MemorySaver workspace, seed:()=>{} so it starts one blank leaf
   instead of random.js's `scatter`. Never touches /data/panels.json. */
export default new AITask({
	meta: import.meta,
	title: "panel-flex",
	label: "panel-flex",
	description: "test-drive ext/Panel flex features headlessly at 4 widths, then judge the flex guide",
	icon: "science",

	route(name){
		return name === "probe" && full(this,
			() => workspace({ saver: new MemorySaver(), seed: () => {} }).style("--panel-height", "100%"));
	},

	extra(){
		md("Headless driver harness: [`probe/`](./probe/) — a blank `MemorySaver` workspace, filling the window. Never touches `/data/panels.json`.");
	},
});
