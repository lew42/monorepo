import { Page, View, div, span, small, a, p, h3, button } from "/app.js";
import { md } from "/framework/ext/markdown/md.js";
import DataGrid from "/framework/ext/DataGrid/DataGrid.js";
import { TaskJSONL } from "/framework/ext/JSONL/JSONL.js";
import Timeline from "../Timeline.js";
import { age } from "../Inbox.js";
import TimelineTalk from "./TimelineTalk.js";

View.stylesheet({ url: import.meta.url }, "timeline.css");

/** The inbox as a timeline: a preview rail of every big thing, newest and most urgent first; a row opens its detail
 *  beside the rail (core/Page doc/columns.md), and the detail links the card, where you talk to it. Doc: ../doc/inbox-data.md. */
export default class TimelinePage extends Page {
	static KIND_WORD = { landed: "landed", owner_note: "note for you", card: "needs you" };

	constructor(...args){
		super({
			title: "Inbox timeline",
			description: "Everything built and everything waiting on you, newest and most urgent first.",
			icon: "view_timeline",
			classes: "timeline-page",
		}, ...args);
	}

	initialize(){ this.columns(); this.timeline ??= new Timeline(); }

	/** The two switches live in the url, so a reload keeps them: `?all` shows every landing, `?debug` shows sources and scores. */
	flag(name){ return new URLSearchParams(location.search).has(name); }
	flip(name){
		const url = new URL(location.href);
		url.searchParams.has(name) ? url.searchParams.delete(name) : url.searchParams.set(name, "");
		history.replaceState(history.state, "", url.pathname + url.search.replace(/=(?=&|$)/g, "") + url.hash);
		this.refill();
	}

	content(){
		this.$head = div.c("timeline-head");
		this.grid = new DataGrid({
			columns: [{ key: "title", label: "What" }, { key: "kind", label: "Kind" }, { key: "at", label: "When", type: "date" }, { key: "score", label: "Score", type: "number" }],
			rows: [], filters: false, row_height: null, page_size: 60, prefs_id: "inbox-timeline", settings: { view: "rail" },
			href: r => this.url + r.row_key + "/",
			card: r => this.row_card(r),
			sort_rows: rows => rows,   // Timeline.rows() already ranked them
		});
		this.off?.();
		this.off = this.timeline.on(() => this.refill());
		this.started ??= this.timeline.start();
		this.refill();
	}

	deactivated(){ this.off?.(); this.off = null; }

	refill(){
		if (!this.grid) return;
		const all = this.timeline.rows(), big = !this.flag("all"), rows = big ? all.filter(r => r.big) : all, debug = this.flag("debug");
		this.grid.set_rows(rows);
		this.$head.empty(() => {
			const landed = rows.filter(r => r.kind === "landed").length;
			p.c("timeline-count", `${landed} built · ${rows.length - landed} for you`);
			div.c("timeline-chips", () => {
				button.c("timeline-chip" + (big ? " timeline-chip-on" : ""), "Big things only").attr("aria-pressed", String(big)).click(() => this.flip("all"));
				button.c("timeline-chip" + (debug ? " timeline-chip-on" : ""), "Sources and scores").attr("aria-pressed", String(debug)).click(() => this.flip("debug"));
			});
			if (debug) small.c("muted timeline-sources", TimelinePage.sources(all));
		});
	}

	/** "landings.jsonl 1302 · cards.jsonl 63": how many rows each file gave. */
	static sources(rows){
		const n = {};
		rows.forEach(r => { const f = r.source.split(":")[0]; n[f] = (n[f] ?? 0) + 1; });
		return Object.entries(n).map(([f, c]) => `${f} ${c}`).join(" · ");
	}

	/** One preview card: what, when, the one-line outcome; with ?debug its source line and score. */
	row_card(r){
		div.c("timeline-card-head", () => {
			span.c("timeline-kind timeline-kind-" + r.kind, r.owner_kind && r.kind !== "landed" ? r.owner_kind : TimelinePage.KIND_WORD[r.kind]);
			small.c("muted", age(r.at)).attr("title", r.at);
		});
		div.c("timeline-title", r.title);
		if (r.sub) div.c("timeline-sub muted", r.sub);
		if (this.flag("debug")) small.c("timeline-debug muted", `${r.source} · score ${r.score}`);
	}

	/** A routed row is always shown: answering here skips the per-row settings.jsonl/page.jsonl/weight.jsonl probe (Page/Jsonl.js tab_visible). */
	tab_state(name){ return { nav: true, ...super.tab_state(name) }; }

	route(id){
		if (id.includes(".")) return;
		return new TimelinePage.Detail({ home: this, row_key: id });
	}

	/** One row's own page: the full outcome, its links, and the card to talk to it. */
	static Detail = class TimelineDetail extends Page {
		constructor({ home, row_key }){ super({ home, row_key, width: "fill", title: "", url: home.url + row_key + "/" }); }

		content(){
			const $box = div.c("timeline-detail");
			const draw = () => {
				const r = this.home.timeline.row(this.row_key);
				if (r && r.row_key === this.shown?.row_key) return;   // a stream batch keeps the open row and its chat as they are
				this.talk?.stop();
				this.shown = r;
				$box.empty(() => r ? this.detail_of(r) : p.c("muted", "Loading…"));
			};
			this.off = this.home.timeline.on(draw);
			(this.home.started ??= this.home.timeline.start()).then(draw);
			draw();
		}

		deactivated(){ this.off?.(); this.talk?.stop(); this.shown = null; }

		/** The row on the left; its card's chat on the right (stacked on a narrow screen). */
		detail_of(r){
			div.c("timeline-split", () => {
				div.c("timeline-main flow", () => this.main_of(r));
				if (r.card) this.talk = new TimelineTalk({ card: r.card }), this.talk.view();
			});
		}

		main_of(r){
			const debug = this.home.flag("debug");
			small.c("muted", [TimelinePage.KIND_WORD[r.kind], new Date(r.at).toLocaleString(), debug && `score ${r.score}`, debug && r.source].filter(Boolean).join(" · "));
			h3(r.title);
			div.c("timeline-links", () => {
				if (r.page) a.c("timeline-link", "Open what was built").href(r.page);
				if (r.card_url) a.c("timeline-link", "Its card").href(r.card_url);
				if (r.dir) a.c("timeline-link", "Its task log").href(r.dir + "task.jsonl").attr("target", "_blank");   // the file: the dated folder page 404-probes page.js (noted on /framework/ai/sessions/)
			});
			const $links = div.c("timeline-links"), $out = div.c("timeline-outcome");
			if (r.sub) $out.append(() => p(r.sub));
			if (r.kind === "landed") TimelineDetail.landing(r).then(l => {   // filled in a callback: no DOM after an await
				if (!l) return;
				$links.append(() => (l.links ?? []).filter(k => k?.url && k.url !== r.page).forEach(k => a.c("timeline-link", k.label || k.url).href(k.url)));
				if (!l.outcome) return;
				const view = md(l.outcome);
				md.resolve(view.el, location.origin + r.dir);
				$out.empty(() => {});
				$out.append(view);
			});
		}

		/** The landing line itself ({outcome, links, …}), read from the task log: the record; the index holds one line of it. */
		static landing(r){
			// The raw lines, not TaskJSONL's fold: a task that landed twice keeps both outcomes, and the row names one by its time.
			return fetch(r.dir + "task.jsonl").then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.text() : "").then(text => {
				const lines = TaskJSONL.parse(text).filter(l => Date.parse(l.assign?.landed_at));
				const hit = lines.find(l => new Date(l.assign.landed_at).toISOString() === r.at) ?? lines.at(-1);
				return hit?.assign ?? null;
			}).catch(() => null);
		}
	};
}
