import { Page, div, p, span, small, a } from "/app.js";
import Browse from "/framework/ux/Browse/Browse.js";

// The asks still undone, by module. The numbers come from Server/UndoneAsks.mjs (undone.json); this page only reads them. Doc: ../readme.md
const DATA = new URL("../undone.json", import.meta.url).href;
const slug = module => module.replaceAll("/", "~");

/** Modules on the left (most undone first), the clicked module's asks on the right. */
class UndoneModules extends Browse {
	key = "undone-asks";

	draw_list(){
		const $rows = div.c("inbox-rows");
		this.page.data.then(d => $rows.empty(() => d.modules.filter(m => m.undone + m.unroutable).forEach(m =>
			a.c("inbox-row").href(this.url + slug(m.module) + "/").append(() => {
				div.c("inbox-row-head flex gap-25", () => span.c("inbox-row-title").text(m.module));
				div.c("inbox-row-foot", () => small.c("inbox-row-line muted").text(`${m.undone + m.unroutable} undone · ${m.done} done`));
			}))));
	}
}

export default class UndoneAsksPage extends Page {
	constructor(...args){
		super({
			title: "Undone asks",
			description: "Every ask you made that has no landed task or card yet, by module.",
			icon: "pending_actions",
			classes: "full fill",
			leaf: true,
		}, ...args);
		this.data = fetch(DATA, { cache: "no-store" }).then(r => r.json());
	}

	content(){
		div.c("pad", () => {
			p("Asks you made that nothing has landed yet, grouped by the module they belong to. Click a module to see them.");
			const $sum = div.c("flex wrap gap-25");
			this.data.then(d => $sum.empty(() => {
				span(`${d.counted} asks counted`);
				span.c("muted").text(`= ${d.totals.done} done + ${d.totals.undone} undone + ${d.totals.unroutable} unroutable (no module folder)`);
				span.c("muted").text(d.agree ? "✅ the two numbers agree" : "⚠️ the two numbers disagree");
				a.c("page-link").href("/framework/ai/doc/undone-asks-2026-10-17.md").text("what this means");
			}));
		});
		this.browse = new UndoneModules({ page: this }).mount();
	}

	route(id){
		const module = id.replaceAll("~", "/"), page = this;
		return new Page({ title: module, url: this.url + id + "/", classes: "inbox-page", content(){
			const $box = div.c("flow pad");
			page.data.then(d => $box.empty(() => {
				const m = d.modules.find(x => x.module === module);
				if (!m) return p("No such module in the data.");
				p.c("muted").text(`${m.undone + m.unroutable} undone, ${m.done} done`);
				m.asks.filter(x => x.state !== "done").forEach(x => div.c("card pad flow", () => {
					span(x.text);
					div.c("flex wrap gap-25 muted", () => {
						small(`${x.days ?? "?"} d old · ${x.kind}`);
						a.c("page-link").href(x.source).text("source prompt");
						x.where.url ? a.c("page-link").href(x.where.url).text(x.where.label) : small(x.where.label);
					});
				}));
			}));
		} });
	}
}
