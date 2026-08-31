import { Page, md } from "/app.js";

/* Page trees the generator wrote out — real modules, one directory per page.
 *
 * ⚠ The `children:` line below is REWRITTEN by the Export control on
 *   /framework/core/Page/generator/ (export.js). Add a tree by exporting it;
 *   remove one by deleting its directory and its name from that line.
 */

export default new Page({
	meta: import.meta,
	title: "Generated",
	description: "Page trees exported from the generator — the same tree, as files you can edit.",
	icon: "output",
	index: true,

	children: "seed-7",

	content(){
		md("Each of these was a tree in the [generator](/framework/core/Page/generator/) and is now a directory of ordinary `page.js` files — real imports, `children:` naming the subdirs, the width words the spec gave them. Open one and it is a columns tree like any other; open its files and there is nothing generated about them. ([how this works](/imagine/generated/readme/))");
		this.previews();
	},
});
