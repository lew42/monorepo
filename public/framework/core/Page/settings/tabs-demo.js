import { Page } from "../Page.class.js";
import { div } from "../../View/View.js";
import "../../../ext/tabs/tabs.js";   // this.tabs() — ext leaning on ext, the allowed direction

/**
 * TabsDemo — the whole point of this folder's `page.jsonl` in one method: `this.tabs()`.
 * The three children below (`normal/`, `disabled/`, `hidden/`) are ordinary `file` lines,
 * pages like any other — the ONLY thing that makes two of them behave differently is a
 * `tab` line on the PARENT (this folder's own `page.jsonl`) naming one `disabled` and one
 * `nav: false`. See page.jsonl and readme.md, both beside this file.
 *
 * ⚠ 2026-09-29 fix round, finding 10: this readme IS the explanation of the two `tab`
 * lines above — showing it here, above the tabs it's about, means a reader sees WHY
 * Disabled and Hidden behave differently without going hunting for the readme first.
 * Reused, not restated (`core does not import ext` — the markdown renderer is loaded
 * dynamically, the same pattern Log.js's own draw_md() uses).
 */
export default class TabsDemo extends Page {
	content(){
		return div.c("flow", () => {
			div.c("page-log-md", $box => {
				import("../../../ext/markdown/md.js")
					.then(({ default: md }) => $box.append(() => md.file(import.meta, "readme.md", { h1: false })));
			});
			this.tabs();
		});
	}
}
