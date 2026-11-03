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
	flip(name, value = ""){
		const url = new URL(location.href);
		url.searchParams.get(name) === value ? url.searchParams.delete(name) : url.searchParams.set(name, value);
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

	/** `?day=today`, `?day=yesterday` or `?day=2026-10-12` → the local day it means (a word stays a word, so a reload tomorrow still says "today"). */
	day(){
		const word = new URLSearchParams(location.search).get("day");
		if (!word) return null;
		const d = new Date();
		if (word === "yesterday") d.setDate(d.getDate() - 1);
		return word === "today" || word === "yesterday" ? Timeline.day_of(d) : word;
	}

	refill(){
		if (!this.grid) return;
		const big = !this.flag("all"), seen = this.flag("seen"), day = this.day(), debug = this.flag("debug"), word = new URLSearchParams(location.search).get("day");
		const scoped = this.timeline.rows({ big, day });
		const rows = seen ? scoped : this.timeline.rows({ big, day, seen: false, keep: this.open_key });
		this.grid.set_rows(rows);
		this.$head.empty(() => {
			const landed = rows.filter(r => r.kind === "landed").length, hidden = scoped.length - rows.length;
			p.c("timeline-count", `${landed} built · ${rows.length - landed} for you` + (hidden ? ` · ${hidden} seen` : ""));
			if (!rows.length && hidden) p.c("timeline-zero muted", "Inbox zero: everything here is seen. Seen too brings it back.");
			div.c("timeline-chips", () => {
				const chip = (label, on, go) => button.c("timeline-chip" + (on ? " timeline-chip-on" : ""), label).attr("aria-pressed", String(on)).click(go);
				chip("Big things only", big, () => this.flip("all"));
				chip("Today", word === "today", () => this.flip("day", "today"));
				chip("Yesterday", word === "yesterday", () => this.flip("day", "yesterday"));
				if (word && word !== "today" && word !== "yesterday") chip(word, true, () => this.flip("day", word));
				chip("Seen too", seen, () => this.flip("seen"));
				chip("Sources and scores", debug, () => this.flip("debug"));
				if (rows.length && !seen) button.c("timeline-chip timeline-chip-clear", "Mark all seen").attr("title", "Everything up to now leaves this view; Seen too brings it back")
					.click(() => { this.timeline.seen.clear_all(); this.refill(); });
			});
			if (debug) small.c("muted timeline-sources", TimelinePage.sources(this.timeline.rows()));
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
				if (r){ this.home.timeline.seen.mark(r); this.home.open_key = r.row_key; this.home.refill(); }   // seen once opened; it stays in the rail while open
				$box.empty(() => r ? this.detail_of(r) : p.c("muted", "Loading…"));
			};
			this.off = this.home.timeline.on(draw);
			(this.home.started ??= this.home.timeline.start()).then(draw);
			draw();
		}

		deactivated(){ this.off?.(); this.talk?.stop(); this.shown = null; this.home.open_key = null; this.home.refill(); }

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
			h3.c("timeline-detail-title").text(r.title);   // plain text: a title like "/framework/core/Page/ is not loading" must not turn into a mention chip
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
