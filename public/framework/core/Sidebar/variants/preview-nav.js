import { div, span } from "/app.js";

/* A handful of the real nav rows a variant's Sidebar would show, for the
 * index's own preview cards — so a card looks like a cropped screenshot of
 * the real thing instead of an empty box under the header.
 *
 * ⚠ No DOM after an await: the row box is captured synchronously and filled
 * in the `.then()` callback, same trap as everywhere else on this site.
 * `root.children` is read straight (no `ux/Tree`, no icons, no links) — this
 * is a PICTURE of the rows, not a working nav; the real one is one click
 * away on the variant's own page. */
export function navPreview(root, count = 5){
	const $rows = div.c("sidebar-nav");

	root.load_all_children(1).loading.then(() => {
		$rows.empty(() => {
			[...root.children.keys()].slice(0, count).forEach(name => {
				const nav = root.nav_for(name);
				div.c("ui-tree-row", () => span.c("ui-tree-text", nav.label));
			});
		});
	});

	return $rows;
}

export default navPreview;
