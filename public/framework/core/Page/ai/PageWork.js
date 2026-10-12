import { div, a, span, details, summary } from "../../View/View.js";

// "N open tasks touch this page": one chip under a page. WHICH tasks touch it comes from the computed index ai/page-work.json
// (fetched once); WHAT STATE each one is in comes from ai/tasks.json (Servex rewrites it every minute), fetched fresh on every
// render, so a task that landed or woke up never shows as stalled. (ai/doc/page-work-line.md, 2026-10-12 sessions-detail)
export default class PageWork {

	static INDEX = "/framework/ai/page-work.json";
	static TASKS = "/framework/ai/tasks.json";
	static #index;

	static #json(url){
		return fetch(url).then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null, () => null);
	}

	// One fetch for the whole session. Fails soft: no file (production, never generated) means no line.
	static index(){
		return this.#index ??= this.#json(this.INDEX).then(json => json?.pages ?? {});
	}

	// This page's own open tasks, and the ones on pages below it: one entry per task, current state from tasks.json, landed ones dropped.
	static async of(url){
		const [pages, tasks] = await Promise.all([this.index(), this.#json(this.TASKS)]);
		const live = new Map((tasks?.tasks ?? []).map(t => ["/" + t.dir.replace(/^public\//, "") + "/", t]));
		const pick = (rows, page) => rows.map(row => ({ ...row, ...(live.get(row.task) ? { state: live.get(row.task).state, landed: live.get(row.task).landed } : {}), page }))
			.filter(task => !task.landed);
		const dedupe = list => [...new Map(list.map(task => [task.task, task])).values()];
		const own = dedupe(pick(pages[url] ?? [], null));
		const seen = new Set(own.map(task => task.task));
		const below = url === "/" ? [] : dedupe(Object.keys(pages).filter(key => key !== url && key.startsWith(url)).flatMap(key => pick(pages[key], key))).filter(task => !seen.has(task.task));
		return { own, below };
	}

	// The view, or undefined when there is nothing to say (a page with no open work shows nothing).
	static async line(url){
		const { own, below } = await this.of(url);
		if (!own.length && !below.length) return undefined;

		const n = (count, what) => `${count} open task${count === 1 ? "" : "s"} ${what}`;
		const said = [own.length && n(own.length, "on this page"), below.length && n(below.length, "on pages inside it")];
		return details.c("page-open-line", () => {
			summary(said.filter(Boolean).join(" · "));
			div.c("page-open-rows", () => [...own, ...below].forEach(task => div.c("page-open-row", () => {
				a(task.title).href(task.task);
				span.c("muted", ` ${task.state}${task.page ? ` · ${task.page}` : ""}`);
			})));
		});
	}
}
