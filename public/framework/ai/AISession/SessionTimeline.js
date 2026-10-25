import View, { div, span, small, a, p, button, details, summary, label, input, icon } from "/framework/core/View/View.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";
import AICost from "../AITask/AICost.js";
import SessionOutlineView from "./SessionOutlineView.js";
import SessionPopover from "./SessionPopover.js";
import SessionTimelineRows from "./SessionTimelineRows.js";

View.stylesheet(import.meta, "SessionTimeline.css");

/** The session page's Timeline tab: everything the session recorded, in time order, newest at the bottom. One compact row per event:
 *  each line of session.jsonl is one row, each prompt of prompts.jsonl is one row (its raw words one click down), and each child session
 *  that has landed adds one. `SessionTimelineRows.rows()` builds them with no DOM, so a node test can count them (SessionTimeline.test.mjs).
 *  Fed by the page, never fetching the record itself: `record(lines)` is the tail SessionTasks already reads, `prompts(lines)` is the
 *  prompt log's live tail (`SessionTimeline.Tail`), `children(list)` is the Overview's child sessions. Filters ▾ is the Sessions pages' own
 *  popover (SessionPopover). Readme: ai/AISession/readme.md. */
export default class SessionTimeline extends View {

	/** The kinds, the hidden ones and the landed states live in SessionTimelineRows; the view uses them by these names. */
	static KINDS = SessionTimelineRows.KINDS;
	static HIDDEN = SessionTimelineRows.HIDDEN;
	static rows = (...a) => SessionTimelineRows.rows(...a);
	static landed_of = k => SessionTimelineRows.landed_of(k);

	// ---- the view ------------------------------------------------------------------------------------------------------------

	initialize(){
		this.ac("stl");
		this.lines = []; this.prompt_lines = []; this.kids = []; this.costs = new Map(); this.seen = new Set(); this.stick = true;
		setTimeout(() => { this.seen.add("record").add("prompts"); this.later(); }, 4000);   // a missing file may never answer: after this, an empty list says so (a line arriving later still redraws)
		this.on = new Set(SessionTimeline.KINDS.map(k => k[0]).filter(k => !SessionTimeline.HIDDEN.includes(k)));
		this.counts = {};
		this.empty(() => {
			div.c("stl-head", () => {
				this.$count = small.c("stl-count muted", "Reading this session's record…");
				this.$filters = button.c("sessions-hbtn", "Filters ▾").attr("type", "button").attr("title", "Which kinds of event are listed");
				SessionPopover.open(this.$filters, () => this.filter_menu(), "stl-pop");
			});
			this.$list = div.c("stl-list").on("scroll", () => { this.stick = this.at_bottom(); });
		});
	}

	filter_menu(){
		div.c("stl-menu", () => {
			for (const [kind, text] of SessionTimeline.KINDS) label.c("stl-filter", () => {
				const box = input().attr("type", "checkbox");
				box.el.checked = this.on.has(kind);
				box.on("change", () => { box.el.checked ? this.on.add(kind) : this.on.delete(kind); this.draw(); });
				span(text);
				this.counts[kind] = small.c("muted stl-n", "");
			});
		});
	}

	/** The record's lines so far (the page passes SessionTasks' own list, never a second fetch). */
	record(lines){ this.lines = lines; this.settle("record"); this.later(); }
	/** The prompt log's lines so far. */
	prompts(lines){ this.prompt_lines = lines; this.settle("prompts"); this.later(); }
	/** The Overview's child sessions: their names, state, model and cost for the rows, and which have landed. */
	children(list){ this.kids = list; this.later(); }
	/** A source has been looked at, even if it holds nothing: with all of them in and no rows, the empty sentence may show. */
	settle(source){ this.seen.add(source); }

	later(){ if (this.queued) return; this.queued = setTimeout(() => { this.queued = null; this.draw(); }, 30); }
	at_bottom(){ const e = this.$list.el; return e.scrollHeight - e.scrollTop - e.clientHeight < 48; }
	/** The tab was opened: its list is laid out now, so land on the newest row. */
	shown(){ this.stick = true; this.$list.el.scrollTop = this.$list.el.scrollHeight; }

	draw(){
		const all = SessionTimeline.rows(this.lines, this.prompt_lines, SessionTimeline.landed_of(this.kids)), per = {};
		all.forEach(r => per[r.kind] = (per[r.kind] ?? 0) + 1);
		const rows = all.filter(r => this.on.has(r.kind)), stick = this.stick || this.at_bottom();
		for (const [kind] of SessionTimeline.KINDS) if (this.counts[kind]) this.counts[kind].el.textContent = per[kind] ?? 0;
		this.$count.el.textContent = !all.length ? (this.seen.size >= 2 ? "No events" : "Reading this session's record…") : rows.length === all.length ? `${all.length} event${all.length === 1 ? "" : "s"}` : `${rows.length} of ${all.length} events`;
		this.el.dataset.total = all.length;
		this.$list.empty(() => {
			if (!all.length) return void (this.seen.size >= 2 && p.c("muted stl-none", "Nothing is recorded for this session yet: it has no prompts and no record lines."));
			if (!rows.length) return void p.c("muted stl-none", "Every kind of event is switched off. Turn some on with Filters.");
			let day = "";
			for (const r of rows){
				const d = new Date(r.at), key = d.toDateString();
				if (key !== day){ day = key; div.c("stl-day", d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })); }
				this.row(r, d);
			}
		});
		this.el.dataset.rows = rows.length;
		if (stick) this.$list.el.scrollTop = this.$list.el.scrollHeight;
	}

	kid(id){ return this.kids.find(c => c.id === id || c.name === id || c.key === id) ?? null; }

	/** The meta of a child row: state, model and the cost line (AICost's, never summed here). */
	kid_meta(c, id, $el){
		const url = AICost.session_url(c?.id ?? id), snap = c?.snap, tab = SessionOutlineView.tab_of(snap);
		const paint = () => { $el.el.textContent = [snap?.state, snap?.model && AICost.model_name(snap.model), AICost.cost_line({ cost: this.costs.get(url) ?? AICost.known_cost(url), own_usd: snap?.usd ?? null, tab }).text].filter(Boolean).join(" · "); };
		paint();
		if (c && !this.costs.has(url) && this.kids.length <= SessionOutlineView.ASK_ALL) AICost.summary(url).then(ans => { if (ans?.summary?.cost){ this.costs.set(url, ans.summary.cost); paint(); } });
	}

	icon_of(kind){
		if (kind === "done") return SessionOutlineView.state_icon("complete");
		return icon(SessionTimeline.KINDS.find(k => k[0] === kind)?.[2] ?? "more_horiz").ac("stl-icon");
	}

	row(r, d){
		const body = () => {
			small.c("stl-time muted", d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
			this.icon_of(r.kind);
			div.c("stl-main", () => {
				div.c("stl-line", () => {
					span.c("stl-text", r.children?.length ? r.text + ":" : r.text);
					(r.children ?? []).forEach((id, i) => {
						const c = this.kid(id);
						a.c("stl-link", c?.snap?.title ?? c?.snap?.agent ?? c?.name ?? String(id).slice(0, 36)).href(AICost.session_url(c?.id ?? id));
						if (i < r.children.length - 1) span(",");
						if (r.children.length === 1 && c?.snap) this.kid_meta(c, id, small.c("stl-meta muted", ""));
					});
				});
				if (r.more) small.c("stl-more muted", r.more);
			});
		};
		if (r.raw) return details.c("stl-row stl-" + r.kind, () => { summary.c("stl-sum", body); p.c("stl-raw", r.raw); });
		return div.c("stl-row stl-" + r.kind, body);
	}
}

/** The prompt log's live tail: JSONL streams the file, and each batch of lines goes to `on_lines` (the whole history first, then appends). */
SessionTimeline.Tail = class SessionTimelineTail extends JSONL {
	lines = [];
	read(entries){ this.lines.push(...entries); this.on_lines?.(this.lines); return this; }
	reset(){ this.lines = []; this.on_lines?.(this.lines); return super.reset(); }   // a missing file answers with a reset: that is "looked, nothing there"
	live(){ super.live(() => {}); return this; }
};
