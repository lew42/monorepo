import Item from "../../Item/Item.js";
import View from "../../View/View.js";

/* {"type":"part-file","file":"./readme.md"} — a markdown file in the page's folder, rendered here.
   One implementation with the page-level `place` line: Jsonl.draw_md (Jsonl.js). */
export default class PageFile extends Item {}
PageFile.View = class PageFileView extends View {
	render(){
		const page = this.item.root();
		return page.draw_md(new URL(this.item.get("file"), location.origin + page.log_folder()).href);
	}
};
Item.register(PageFile, "part-file");
