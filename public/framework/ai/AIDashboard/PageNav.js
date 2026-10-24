import { View, a, span } from "/app.js";
import { servex_url } from "/framework/dev/servex_url.js";

View.stylesheet(import.meta, "PageNav.css");

/** PageNav — a row of link pills to a page's own sub-pages: the click path a new page needs (a name in `children:` draws no link on a leaf page). Server/NavCheck.mjs is the check that refuses a new page nobody can click to.
 *  `links` is [{ href, label, title, primary, count }]; `count` is an async function that gives a number shown on the pill, left out when it gives null. */
export default class PageNav extends View {
	links = [];   // ⚠ assign() in the constructor fills it before render() runs
	get classes(){ return "pn"; }

	/** The Merge link, with how many branches wait (Servex `GET /api/ready-to-merge`; no number when Servex does not answer). One definition for every page that shows it. */
	static merge_link(){
		return { href: "/framework/ai/merge/", label: "Ready to merge", title: "Branches agents marked ready, each with a Merge button", primary: true,
			count: () => fetch(servex_url("/api/ready-to-merge"), { signal: AbortSignal.timeout(8000) }).then(r => r.ok ? r.json() : null).then(rows => Array.isArray(rows) ? rows.length : null) };
	}

	render(){
		(this.links ?? []).forEach(l => a.c("pn-link" + (l.primary ? " pn-primary" : "")).href(l.href).attr("target", "_self").attr("title", l.title ?? "")
			.append(() => {
				span(l.label);
				if (!l.count) return;
				const $n = span.c("pn-count");   // made now, filled after the fetch (no DOM after an await)
				l.count().then(n => { if (n == null) return; $n.el.textContent = n; $n.el.classList.add("pn-count-on"); }, () => {});
			}));
	}
}
