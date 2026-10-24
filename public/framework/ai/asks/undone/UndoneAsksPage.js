import { Page, div, p, span, small, a, button } from "/app.js";
import Browse from "/framework/ux/Browse/Browse.js";
import ProposalTriage from "../ProposalTriage.js";

// The asks still undone, by module. The numbers come from Server/UndoneAsks.mjs (undone.json); this page only reads them. Doc: ../readme.md
const DATA = new URL("../undone.json", import.meta.url).href;
const slug = module => module.replaceAll("/", "~");

// The verifier's verdict on an undone ask (Server/UndoneVerify.mjs): found built / confirmed missing / not work / needs the owner / unclear / not checked yet.
const KIND = a => a.state === "done" ? "done" : a.verified === "done" ? "found" : a.verified ?? "unchecked";
const FILTERS = [["all", "all"], ["undone", "verified undone"], ["found", "found built"], ["retired", "not work"], ["needs-owner", "needs you"], ["unclear", "unclear"], ["unchecked", "not checked"]];
const LABEL = { found: "✅ found built", undone: "⬜ verified undone", retired: "not work (kept, retired)", "needs-owner": "❓ needs you", unclear: "unclear", unchecked: "not checked yet" };
// What became of an ask (UndoneAsks.settle): the words for the count strip.
const WORD = { done: "done", tasked: "have a task", closed: "closed (found built or not work)", noted: "written down as a note", undone: "undone", unroutable: "unroutable (no module folder)" };
/** The first repo path in the evidence text as a site link (files under public/ are served), else null. */
const evidence_href = text => { const m = String(text ?? "").match(/(?:public\/)?(?:framework|layouts|imagine|web|notes)\/[\w@./~-]+\.(?:js|md|json|jsonl|css|html)/); return m ? "/" + m[0].replace(/^public\//, "") : null; };

/** Modules on the left (most undone first), the clicked module's asks on the right. */
class UndoneModules extends Browse {
	key = "undone-asks";

	draw_list(){
		const $rows = div.c("inbox-rows");
		this.page.data.then(d => $rows.empty(() => d.modules.filter(m => m.undone + m.unroutable + (m.tasked ?? 0)).forEach(m =>
			a.c("inbox-row").href(this.url + slug(m.module) + "/").append(() => {
				div.c("inbox-row-head flex gap-25", () => span.c("inbox-row-title").text(m.module));
				div.c("inbox-row-foot", () => small.c("inbox-row-line muted").text(`${m.undone + m.unroutable} undone · ${m.tasked ?? 0} tasked · ${m.done} done`));
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
			new ProposalTriage().draw();   // the 230 proposed tasks: how many were accepted into a priority, the backlog, Approve all
			p("Asks you made that nothing has landed yet, grouped by the module they belong to. Click a module to see them.");
			const $sum = div.c("flex wrap gap-25");
			this.data.then(d => $sum.empty(() => {
				span(`${d.counted} asks counted`);
				span.c("muted").text("= " + Object.entries(d.totals).map(([k, n]) => `${n} ${WORD[k] ?? k}`).join(" + "));
				span.c("muted").text(d.agree ? "✅ the two numbers agree" : "⚠️ the two numbers disagree");
				const asks = d.modules.flatMap(m => m.asks), v = k => asks.filter(x => KIND(x) === k).length;
				if (v("found") + v("undone") + v("unclear")) span.c("muted").text(`checked against the repo: ${v("undone")} verified undone · ${v("found")} found already built · ${v("retired")} not work · ${v("needs-owner")} need you · ${v("unclear")} unclear · ${v("unchecked")} not checked yet`);
				a.c("page-link").href("/framework/ai/doc/undone-asks-2026-10-17.md").text("what this means");
					a.c("page-link").href("/framework/ai/?kind=ask").attr("title", "the asks Servex routed (asks.jsonl), in the Inbox").text("routed asks in the Inbox");
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
				const open = m.asks.filter(x => x.state !== "done"), chips = {};
				const count = k => k === "all" ? open.length : open.filter(x => KIND(x) === k).length;
				div.c("sessions-tabs flex gap-50 wrap", () => FILTERS.forEach(([k, label]) => chips[k] = button.c("sessions-chip", `${label} (${count(k)})`).on("click", () => show(k))));
				const $list = div.c("flow");
				const show = k => {
					history.replaceState(null, "", k === "all" ? location.pathname : "?v=" + k);
					Object.entries(chips).forEach(([c, b]) => b.el.classList.toggle("sessions-chip-on", c === k));
					$list.empty(() => open.filter(x => k === "all" || KIND(x) === k).forEach(x => div.c("card pad flow", () => {
						span(x.text);
						div.c("flex wrap gap-25 muted", () => {
							small(`${x.days ?? "?"} d old · ${x.kind}`);
							a.c("page-link").href(x.source).text("source prompt");
							x.where.url ? a.c("page-link").href(x.where.url).text(x.where.label) : small(x.where.label);
							if (x.task) a.c("page-link").href(x.task).text("its task");
						});
						if (x.verified) div.c("flex wrap gap-25 muted", () => {
							span(`${LABEL[KIND(x)]}: ${x.verified_evidence}`);
							if (x.owner_question) span.c("muted").text("Question for you: " + x.owner_question);
							const href = evidence_href(x.verified_evidence);
							if (href) a.c("page-link").href(href).text("evidence file");
						});
					})));
				};
				show(new URLSearchParams(location.search).get("v") ?? "all");
			}));
		} });
	}
}
