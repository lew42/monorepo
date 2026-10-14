// history and reasons: doc/InboxRail-notes.md

import { View, div, span, small, a, button, label, input, h4, icon } from "/framework/core/View/View.js";
import Browse from "/framework/ux/Browse/Browse.js";

View.stylesheet("/framework/ux/Inbox/Inbox.css");

/** The Inbox's rows (ranking, read, archive, filters) on Browse's list-and-detail shell: ux/Browse/doc/architecture.md. */
export default class Rail extends Browse {
	/* ── settings a subclass or a caller may override ── */
	title = "Inbox";          // the rail's own name, above its filters
	key = "inbox";            // localStorage prefix: `<key>-rail-w`, `<key>-read-ids`
	min_default = Rail.FLOOR; // the floor when the url has no `?min=`
	items = [];                    // the rows, for a rail that is just given them (the demo)

	/* ── state ── */
	list = [];
	shown = [];
	hovering = false;
	only_notes = false;
	show_archived = false;
	search_q = "";
	needs_ids = new Set();
	group_order = [];
	rows = new Map();          // id → { $row, sig }
	at_of = new Map();         // entry id → when it was last updated
	waiting = new Set();       // ids that arrived while the list was busy
	watching = new Set();      // detail pages on screen, each redrawn from the list (`open()`)
	list_watchers = new Set();
	applied_at = new Map();    // each row's `at` the last time the DOM order was applied
	pending_ids = new Set();   // rows whose `at` moved since — counted on the pill
	archived_pending = new Set();
	last_needs = "";

	// Assigned again after this class's own fields, which would otherwise overwrite what a caller passed.
	constructor(...args){ super(); this.assign(...args); }

	/** The Inbox's floor: rows scoring under this stay out of it (inbox zero, 2026-09-30). */
	static FLOOR = 90;
	/** The three plain words a row is sorted into by its score (the owner's ask: blocking / review / fyi). */
	static CATEGORIES = ["blocking", "review", "fyi"];

	/* ════ BUILDING IT — call `mount()` synchronously, inside the page's content() ════ */

	before_mount(){
		const q = new URLSearchParams(location.search);
		this.review_only = q.get("review") === "1";
		this.cat = Rail.CATEGORIES.includes(q.get("cat")) ? q.get("cat") : null;
		this.min = this.floor_from_url(this.min_default);
		// A fresh mount keeps applying every reorder for a moment while the data's several
		// streams each finish their first load — see `order_rows()`.
		this.settle_until = Date.now() + 2500;
	}

	/* Browse's list pane holds these three; its grip comes after them. */
	draw_list(){
		this.top();
		this.stream();
		this.foot();
	}

	top(){
		div.c("inbox-top", () => {
			this.name();
			this.head_extra();
			this.$chrome = div.c("inbox-chrome flex v-center gap-25", () => {
				this.actions();
				this.needs_chip();
				this.category_chips();
				this.floor();
				this.toggles();
				this.search();
				this.$count = div.c("inbox-count flex v-center gap-25");
			});
		});
	}

	name(){ return h4.c("inbox-rail-name", () => { this.$name = span(this.title); }); }
	head_extra(){}
	actions(){}
	toggles(){}

	needs_chip(){
		label.c("inbox-review flex v-center gap-25 muted").attr("title", "show only what's waiting on you").append(() => {
			const $box = input().attr("type", "checkbox");
			$box.el.checked = this.review_only;
			$box.on("change", e => {
				this.review_only = e.target.checked;
				this.set_query("review", this.review_only ? "1" : null);
				this.relist();
			});
			span("Needs you");
			this.$needs_count = small.c("inbox-badge").attr("hidden", "");
		});
	}

	category_chips(){
		this.$cats = span.c("inbox-cats flex v-center gap-25", () => {
			Rail.CATEGORIES.forEach(word => {
				button.c("inbox-cat").attr("type", "button").attr("data-cat", word)
					.attr("title", Rail.CAT_HELP[word]).text(word)
					.click(() => {
						this.cat = this.cat === word ? null : word;
						this.set_query("cat", this.cat);
						this.paint_cats();
						this.relist();
					});
			});
		});
		this.paint_cats();
	}
	paint_cats(){
		this.$cats.el.querySelectorAll(".inbox-cat").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cat === this.cat)));
	}
	static CAT_HELP = { blocking: "a blocker: score 97 and up", review: "waiting on you: score 90 to 96", fyi: "good to know: score under 90" };

	/** Which plain word a row is: by its importance score (needs-rule.js). A subclass can override. */
	category(it){
		const n = it.score ?? 0;
		return n >= 97 ? "blocking" : n >= this.min_default ? "review" : "fyi";
	}

	search(){
		this.$search = input.c("inbox-search").attr("type", "search").attr("placeholder", "Search…")
			.attr("title", "filter the list below by title or text")
			.on("input", e => { this.search_q = e.target.value.trim().toLowerCase(); this.relist(); });
	}

	floor(){
		label.c("inbox-floor flex v-center gap-25 muted")
			.attr("title", "show only rows scoring at least this — 0 shows everything").append(() => {
				span("score ≥");
				this.$floor = input.c("inbox-floor-input").attr("type", "number")
					.attr("min", "0").attr("max", "100").attr("step", "10");
				this.$floor.el.value = String(this.min);
				this.$floor.on("change", e => this.set_min(Math.max(0, Number(e.target.value) || 0)));
			});
	}

	stream(){
		div.c("inbox-stream", () => {
			this.$pill = button.c("inbox-new prim").attr("type", "button").click(() => this.flush(true));
			this.$rows = div.c("inbox-rows", () => {
				this.$updated = button.c("inbox-updated").attr("type", "button").attr("hidden", "")
					.click(() => this.order_rows(true));
				this.pins_box();   // Browse's pinned lists (AIRail: Waiting on you)
				this.$pinned = div.c("inbox-pinned flush-stack");
				this.$list = div.c("inbox-list flush-stack");
			});
		});
	}

	foot(){
		div.c("inbox-rail-foot flex v-center", () => {
			this.foot_words();
			this.$notes = button.c("inbox-word").attr("type", "button")
				.attr("title", "only the notes left for you")
				.text("notes").click(() => { this.only_notes = !this.only_notes; this.$notes.el.classList.toggle("on", this.only_notes); this.relist(); });
			this.$archived = button.c("inbox-word inbox-archived-word").attr("type", "button")
				.click(() => { this.show_archived = !this.show_archived; this.$archived.el.classList.toggle("on", this.show_archived); this.relist(); });
			button.c("inbox-word inbox-clear-all").attr("type", "button")
				.attr("title", "archive every row shown here right now")
				.text("clear all").click(() => this.clear_all());
		});
	}
	foot_words(){}

	listen(){
		this.$rows.on("pointerenter", () => { this.hovering = true; });
		this.$rows.on("pointerleave", () => { this.hovering = false; this.draw_extras(); });
	}

	start(){
		this.needs_changed(new Set(this.items.filter(it => it.needs).map(it => it.id)));
		this.paint();
	}

	/* ════ THE DATA — what the rows are ════ */

	source(){
		const live = this.items.filter(it => it.status !== "archived");
		live.archived = this.items.filter(it => it.status === "archived");
		return live;
	}

	decorate(list){ list.forEach(it => { it.unread = !this.is_read(it.id); }); }
	prepare(rows){}
	order(x, y){
		const now = Date.now();
		return Rail.rank ? Rail.rank(y, now) - Rail.rank(x, now) : (Date.parse(y.at ?? 0) || 0) - (Date.parse(x.at ?? 0) || 0);
	}
	/** New rows (under 30 min) show whatever their score: the floor never hides them. */
	is_new(it){ return !!Rail.fresh?.(it); }

	/* ── what the filters read — one seam each ── */
	pool(list){ return list; }
	pool_archived(list){ return list; }
	resolved(it){ return false; }
	needs(it){ return this.needs_ids.has(it.id); }
	exempt(it){ return !!it.exempt; }
	haystack(it){ return (it.title + " " + (it.text ?? "")).toLowerCase(); }

	visible(){
		let base = this.pool(this.list);
		if (this.only_notes) base = base.filter(it => it.kind === "note");
		base = base.filter(it => !this.resolved(it));
		if (this.review_only) base = base.filter(it => this.needs(it));
		if (this.cat) base = base.filter(it => this.exempt(it) || this.category(it) === this.cat);
		const archived = this.pool_archived(this.list.archived ?? []);
		if (this.search_q){
			const hit = it => this.haystack(it).includes(this.search_q);
			return [...base.filter(hit), ...archived.filter(hit)];
		}
		if (this.show_archived) return [...base, ...archived];
		if (this.cat === "fyi") return base;
		return base.filter(it => this.exempt(it) || this.is_new(it) || (it.score ?? 0) >= this.min);
	}

	floored(){ return this.min > 0 && this.cat !== "fyi" && !this.search_q && !this.show_archived; }

	/* ── read / unread and archive — a subclass writes them somewhere real ── */
	is_read(id){ return this.read_set().has(id); }
	mark_read(id, val = true){
		const set = this.read_set();
		val ? set.add(id) : set.delete(id);
		this.store_set(this.key + "-read-ids", JSON.stringify([...set]));
	}
	read_set(){ try { return new Set(JSON.parse(this.store_get(this.key + "-read-ids") ?? "[]")); } catch { return new Set(); } }
	archive(it){ it.status = "archived"; return Promise.resolve(); }
	archived_soon(){}

	/* ════ DRAWING ════ */

	quiet(){ return this.$rows.el.scrollTop <= 2 && !this.hovering; }

	paint(){
		const list = this.source();
		list.archived ??= [];
		this.decorate(list);
		this.list = list;
		this.apply_pending_archives();
		list.sort((x, y) => this.order(x, y));
		this.prepare([...list, ...list.archived]);
		const by_id = new Map([...list, ...list.archived].map(it => [it.id, it]));

		this.count();
		this.watching.forEach(h => h.draw(by_id.get(h.id) ?? null));

		this.visible().forEach(it => { if (!this.rows.has(it.id)) this.waiting.add(it.id); });
		if (this.quiet()) this.flush();
		else this.pill();

		this.shown.forEach(id => { const it = by_id.get(id); if (it) this.refill(this.rows.get(id), it); });
		this.draw_extras();
		this.list_watchers.forEach(fn => fn(list));
	}

	paint_soon(){
		if (this.paint_timer) return;
		this.paint_timer = setTimeout(() => { this.paint_timer = null; this.paint(); }, 40);
	}

	relist(){
		this.rows.forEach(rec => rec.$row.el.remove());
		this.rows.clear();
		this.shown = [];
		this.waiting.clear();
		this.flush(true);
	}

	flush(to_top){
		const here = this.visible();
		const by_id = new Map(here.map(it => [it.id, it]));
		this.waiting.clear();

		const had_new = here.some(it => !this.rows.has(it.id));
		this.$list.append(() => { here.forEach(it => { if (!this.rows.has(it.id)) this.rows.set(it.id, this.make(it)); }); });
		let removed = false;
		this.rows.forEach((rec, id) => { if (!by_id.has(id)){ rec.$row.el.remove(); this.rows.delete(id); removed = true; } });

		this.shown = here.map(it => it.id);
		here.forEach(it => this.at_of.set(it.id, it.at));
		this.draw_extras(!!to_top || had_new || removed);

		this.pill();
		if (to_top) this.$rows.el.scrollTo({ top: 0 });
		// ⚠ THE ROWS ARRIVE AFTER THE ROUTER HAS MARKED THE PAGE — on a cold load of a row's
		// url the Router marked during `activate()`, when this list was still empty.
		this.router?.mark_links?.();
	}

	draw_extras(force){ this.order_rows(force); }
	extra_entries(){ return []; }

	order_rows(force){
		const entries = [
			...this.shown.filter(id => this.rows.has(id)).map(id => [id, this.at_of.get(id), this.rows.get(id).$row.el]),
			...this.extra_entries(),
		].sort((x, y) => (Date.parse(y[1] ?? 0) || 0) - (Date.parse(x[1] ?? 0) || 0));
		const want = entries.map(e => e[2]);
		const have = [...this.$list.el.children].filter(c => c.classList.contains("inbox-row"));
		const in_place = want.length === have.length && want.every((el, i) => el === have[i]);

		const ids_now = new Set(entries.map(e => e[0]));
		for (const id of [...this.pending_ids]) if (!ids_now.has(id)) this.pending_ids.delete(id);
		entries.forEach(([id, at]) => { if (this.applied_at.has(id) && this.applied_at.get(id) !== (at ?? null)) this.pending_ids.add(id); });

		const apply = force || !this.group_order.length || Date.now() < this.settle_until;
		if (!in_place && !apply) return this.updated_pill();   // defer: the DOM stays exactly as it is

		if (!in_place){
			this.group_order = want;
			want.forEach(el => this.$list.el.appendChild(el));   // moves, never rebuilds
			this.router?.mark_links?.();
		}
		this.applied_at = new Map(entries.map(([id, at]) => [id, at]));
		this.pending_ids.clear();
		this.updated_pill();
	}

	updated_pill(){
		this.$updated.el.hidden = !this.pending_ids.size;
		if (this.pending_ids.size) this.$updated.text(this.pending_ids.size + " updated ↑");
	}

	pill(){
		this.$pill.el.classList.toggle("on", this.waiting.size > 0);
		if (this.waiting.size) this.$pill.text(this.waiting.size + (this.waiting.size === 1 ? " new card ↑" : " new cards ↑"));
	}

	count(){
		const n = this.visible().length;
		const note = this.count_note();
		const sig = n + "|" + this.only_notes + "|" + note;
		if (sig !== this.count_sig) this.$count.empty(() => { if (note) span.c("inbox-off muted").text(note); });
		this.count_sig = sig;
		document.title = (n ? "(" + n + ") " : "") + (this.page.title ?? this.title);

		const a_n = this.list.archived.length;
		this.$archived.el.hidden = !a_n && !this.show_archived;
		this.$archived.text("archived (" + a_n + ")");
	}
	count_note(){ return null; }

	/* ── one row ── */

	href(it){ return this.url + it.id + "/" + this.query(); }
	query(){ return this.min !== Rail.FLOOR ? "?min=" + this.min : ""; }

	make(it){
		const rec = { sig: null, $row: a.c("inbox-row").href(this.href(it)) };
		this.refill(rec, it);
		return rec;
	}

	// ⚠ The signature is the row's WHOLE record, never a hand-picked list of fields: the
	// first build listed them, forgot one, and its feature silently never rendered.
	refill(rec, it){
		const sig = JSON.stringify(it);
		if (rec.sig === sig) return;
		rec.sig = sig;
		const cl = rec.$row.el.classList;
		cl.toggle("inbox-unread", !!it.unread);
		cl.toggle("inbox-flagged", !!it.flag);
		cl.toggle("inbox-archived", it.status === "archived");
		cl.toggle("inbox-note", it.kind === "note");
		this.row_classes(rec, it);
		rec.$row.empty(() => { this.face(it, this.row_on(rec, it)); });
	}
	row_classes(rec, it){}

	face(it, on = {}){
		this.row_head(it, on);
		if (it.sub) div.c("inbox-row-foot flex v-center gap-25", () => { small.c("inbox-row-line muted").text(it.sub); });
		this.face_extra(it);
	}
	face_extra(it){}

	row_head(it, on = {}){
		return div.c("inbox-row-head flex gap-25" + (it.kind === "stalled" ? " inbox-row-ask" : ""), () => {
			if (it.dot !== false) on.toggle_read ? button.c("inbox-dot").attr("type", "button")
				.attr("title", it.unread ? "mark read" : "mark unread")
				.click(e => { e.preventDefault(); e.stopPropagation(); on.toggle_read(); }) : span.c("inbox-dot");
			if (it.icon) icon(it.icon);
			if (this.is_new(it)) span.c("inbox-new-mark").text("new").attr("title", "arrived in the last 30 minutes");
			if (it.owner_kind) span.c("inbox-kind inbox-kind-" + it.owner_kind).text(it.owner_kind);
			if (it.score != null) span.c("inbox-score" + (it.score >= 70 ? " inbox-score-hot" : "")).text(String(it.score));
			this.title_text(span.c("inbox-row-title").text(it.title), it);
			small.c("inbox-row-when muted").text(this.is_new(it) ? this.age(it.at) : this.when(it.at, it)).attr("title", this.when_full(it.at));
			if (on.archive) button.c("inbox-clear").attr("type", "button")
				.attr("title", "archive — nothing is deleted").text("×")
				.click(e => { e.preventDefault(); e.stopPropagation(); on.archive(); });
		});
	}
	title_text($title, it){}

	age(at){ const m = Math.floor((Date.now() - Date.parse(at)) / 60000); return m < 1 ? "now" : m + " min"; }
	when(at){
		const d = new Date(at ?? 0);
		if (!at || isNaN(d)) return "";
		const now = new Date();
		if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
		return d.toLocaleDateString([], d.getFullYear() === now.getFullYear() ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric" });
	}
	when_full(at){
		const d = new Date(at ?? 0);
		return !at || isNaN(d) ? "" : d.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
	}

	row_on(rec, it){
		const on = {
			toggle_read: () => {
				this.mark_read(it.id, !this.is_read(it.id));
				it.unread = !this.is_read(it.id);
				rec.sig = null;
				this.refill(rec, it);
			},
			archive: () => {
				this.archived_pending.add(it.id);
				this.apply_pending_archives();
				rec.sig = null;
				this.flush();
				this.archive(it).catch(() => null);
				this.archived_soon();
			},
		};
		if (!this.archivable(it)) delete on.archive;
		return on;
	}
	archivable(it){ return true; }

	apply_pending_archives(){
		const list = this.list;
		for (let i = list.length - 1; i >= 0; i--){
			if (!this.archived_pending.has(list[i].id)) continue;
			const [gone] = list.splice(i, 1);
			gone.status = "archived";
			(list.archived ??= []).push(gone);
		}
	}

	async clear_all(){
		const targets = this.visible().filter(it => this.archivable(it) && !this.exempt(it));
		if (!targets.length) return;
		if (!confirm(`Archive ${targets.length} row${targets.length === 1 ? "" : "s"}?`)) return;
		targets.forEach(it => this.archived_pending.add(it.id));
		this.apply_pending_archives();
		this.flush();
		const BATCH = 20;
		for (let i = 0; i < targets.length; i += BATCH)
			await Promise.all(targets.slice(i, i + BATCH).map(it => this.archive(it).catch(() => null)));
		this.archived_soon();
	}

	/* ════ OUTSIDE IN — what a subclass or a page tells the rail ════ */

	needs_changed(ids, n = ids.size){
		this.needs_ids = ids;
		if (this.review_only) this.relist();
		this.$needs_count.el.hidden = !n;
		if (n) this.$needs_count.text(String(n));
		const key = [...ids].sort().join(",");
		if (key === this.last_needs) return;
		this.last_needs = key;
		this.rows.forEach(rec => { rec.sig = null; });
		if (this.$list) this.paint();
	}

	open(h){ this.watching.add(h); this.current = h; this.paint(); return h; }
	close(h){ this.watching.delete(h); if (this.current === h) this.current = null; }
	repaint(){ this.paint(); }
	on_list(fn){ this.list_watchers.add(fn); if (this.list?.length) fn(this.list); return () => this.list_watchers.delete(fn); }

	set_min(n){
		if (n === this.min) return;
		this.min = n;
		if (this.$floor) this.$floor.el.value = String(n);
		this.set_query("min", n === this.min_default ? null : String(n));
		this.relist();
		this.router?.mark_links?.();
	}

	tab_floor(d, title = this.title){
		this.min_default = d;
		this.$name?.text(title);
		setTimeout(() => this.set_min(this.floor_from_url(d)), 0);
	}

	floor_from_url(fallback){
		const v = new URLSearchParams(location.search).get("min");
		return v == null || v === "" || isNaN(Number(v)) ? fallback : Math.max(0, Number(v));
	}

	set_query(k, v){
		const url = new URL(location.href);
		v == null ? url.searchParams.delete(k) : url.searchParams.set(k, v);
		history.replaceState(history.state, "", url.pathname + url.search + url.hash);
	}
}
