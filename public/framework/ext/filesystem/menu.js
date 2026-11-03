import View, { div, a } from "../../core/View/View.js";
import { file_link } from "./file_link.js";

View.stylesheet(import.meta, "filesystem.css");

let $open;

/**
 * context_menu(path, x, y) — the right-click menu for one file row: Copy path, Open in
 * /fs, Open raw. `path` is the file's site-root path (no leading slash); `x`/`y` are
 * viewport pixels — hand it `event.clientX`/`clientY` straight from the `contextmenu`
 * event. One menu at a time; opening a second closes the first, and a click anywhere
 * (including a pick) closes it too.
 *
 *   $row.on("contextmenu", e => { e.preventDefault(); context_menu(path, e.clientX, e.clientY); });
 *
 * A small menu of our own, not `ux/Menu` — that class is a `<details>` dropdown with an
 * always-visible trigger button and no "open at the pointer" mode; a right-click menu
 * needs nothing else it provides.
 */
export function context_menu(path, x, y){
	close_menu();

	const items = [
		{ text: "Copy path", act: () => navigator.clipboard?.writeText("/" + path) },
		{ text: "Open in /fs", href: file_link(path) },
		{ text: "Open raw", href: "/" + path },
	];

	$open = div.c("fs-menu", () => {
		items.forEach(item => {
			a.c("fs-menu-item", item.text).href(item.href ?? "#")
				.click(e => {
					if (!item.href) { e.preventDefault(); item.act(); }
					close_menu();
				});
		});
	}).style({ left: x + "px", top: y + "px" });

	document.body.append($open.el);
	// Next tick — the contextmenu event itself is still bubbling; listening now would
	// close the menu it just opened.
	setTimeout(() => document.addEventListener("click", close_menu, { once: true }), 0);
}

function close_menu(){
	$open?.el.remove();
	$open = null;
}
