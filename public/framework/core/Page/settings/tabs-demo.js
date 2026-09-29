import { Page } from "../Page.class.js";
import "../../../ext/tabs/tabs.js";   // this.tabs() — ext leaning on ext, the allowed direction

/**
 * TabsDemo — the whole point of this folder's `page.jsonl` in one method: `this.tabs()`.
 * The three children below (`normal/`, `disabled/`, `hidden/`) are ordinary `file` lines,
 * pages like any other — the ONLY thing that makes two of them behave differently is a
 * `tab` line on the PARENT (this folder's own `page.jsonl`) naming one `disabled` and one
 * `nav: false`. See page.jsonl and readme.md, both beside this file.
 */
export default class TabsDemo extends Page {
	content(){ return this.tabs(); }
}
