import { div, a, span, details, summary } from "../../View/View.js";

// "N open tasks touch this page": one line under every page, from the computed index ai/page-work.json. (ai/doc/page-work-line.md)
export default class PageWork {

	static INDEX = "/framework/ai/page-work.json";
	static #index;

	// One fetch for the whole session. Fails soft: no file (production, never generated) means no line.
	static index(){
		return this.#index ??= fetch(this.INDEX).then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
			.then(json => json?.pages ?? {}, () => ({}));
	}

	// This page's own open tasks, and the ones on pages below it.
	static async of(url){
		const pages = await this.index();
		const own = pages[url] ?? [];
		const below = Object.keys(pages).filter(key => key !== url && key.startsWith(url) && url !== "/")
			.flatMap(key => pages[key].map(task => ({ ...task, page: key })));
		return { own, below };
	}

	// The view, or undefined when there is nothing to say (a page with no open work shows nothing).
	static async line(url){
		const { own, below } = await this.of(url);
		if (!own.length && !below.length) return undefined;

		const said = [own.length && `${own.length} open task${own.length === 1 ? "" : "s"} on this page`, below.length && `${below.length} below`];
		return details.c("page-open-line", () => {
			summary(said.filter(Boolean).join(" · "));
			div.c("page-open-rows", () => [...own, ...below].forEach(task => div.c("page-open-row", () => {
				a(task.title).href(task.task);
				span.c("muted", ` ${task.state}${task.page ? ` · ${task.page}` : ""}`);
			})));
		});
	}
}
