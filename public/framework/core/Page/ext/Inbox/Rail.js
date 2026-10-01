import { View, div, span, small, a, button, label, input, h4, icon } from "/framework/core/View/View.js";
import grip from "/framework/ext/grip/grip.js";

/* The look lives in the ux block (ux/Inbox/), so any page that builds a rail gets it. */
View.stylesheet("/framework/ux/Inbox/Inbox.css");

/**
 * INBOX RAIL — a list of previews on the left, the one you picked open on the right,
 * and nothing in the list ever jumps (the owner, 2026-09-22, 2026-09-30: "it is a
 * persistent navigation… it shouldn't jump when you click on an item").
 *
 * This is the base class. AI 2 draws `AIRail` (ai2/rail.js; the AI page too, next merge), which
 * extends this with the usage meters, "+ New card" and the AI data. Any other page can
 * extend it the same way: override `source()` to say what the rows are, and the rest
 * comes with it.
 *
 *   const rail = new InboxRail({ page: this, items: [...] }).mount();   // inside content()
 *
 * WHAT YOU GET
 *   - three columns: the rail, the detail (`page.$pages`, where a row's page opens) and
 *     a sub column (`page.$sub`, where a sub-page opens beside it);
 *   - the rail is a FLUSH STACK of row previews (rows touching, no gaps), resizable by
 *     its grip, and it scrolls by itself;
 *   - filters: Needs you (a chip), search, notes, archived, and a SCORE FLOOR (`?min=`,
 *     default 90 — the Inbox shows only rows that score at least that; 0 is the Log);
 *   - read/unread (the row's dot), archive (the row's ×) and "clear all";
 *   - THE ORDER NEVER MOVES ON ITS OWN while you look: an existing row that changed is
 *     counted on an "N updated ↑" pill, and only a press (or a reload) re-sorts.
 *
 * THE SELECTION IS THE URL. A row is a plain `<a>` to its page; the Router navigates
 * it, marks it `.active`, and Back, a reload and a pasted link all work. A click swaps
 * only the detail column: no row here is rebuilt, re-sorted or scrolled by a click.
 *
 * Every part is a method, so a subclass changes one part and keeps the rest. Docs:
 * ux/Inbox/readme.md · see one running at /framework/ux/Inbox/.
 */
export default class InboxRail {
	/* ── settings a subclass or a caller may override ── */
	title = "Inbox";               // the rail's own name, above its filters
	key = "inbox";                 // localStorage prefix: `<key>-rail-w`, `<key>-read-ids`
	min_default = InboxRail.FLOOR; // the floor when the url has no `?min=`
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

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	/** The Inbox's floor: rows scoring under this stay out of it (inbox zero, 2026-09-30). */
	static FLOOR = 90;

	/** The page this rail belongs to — rows link under its url. */
	get url(){ return this.page.url; }
	get router(){ return this.page.app?.router; }

	/* ════ BUILDING IT — call `mount()` synchronously, inside the page's content() ════ */

	mount(){
		const q = new URLSearchParams(location.search);
		this.review_only = q.get("review") === "1";
		this.min = this.floor_from_url(this.min_default);
		// A fresh mount keeps applying every reorder for a moment while the data's several
		// streams each finish their first load — see `order_rows()`.
		this.settle_until = Date.now() + 2500;

		this.$shell = div.c(this.shell_classes(), () => {
			this.rail();
			this.detail();
			this.sub();
			this.shell_extra();
		});
		this.page.$pages = this.$detail;
		this.page.$sub = this.$sub;
		this.size(parseInt(this.store_get(this.key + "-rail-w"), 10) || null);
		this.listen();
		this.start();
		return this;
	}

	/* `bleed`: the whole region, never the prose track. */
	shell_classes(){ return "inbox-shell bleed"; }
	shell_extra(){}

	rail(){
		// ⚠ No `flex v` utility: util beats theme, so a `.flex` here could never be hidden
		// by the phone rule. The column is declared in Inbox.css.
		div.c("inbox-rail", () => {
			this.top();
			this.stream();
			this.foot();
			this.grip();
		});
	}

	top(){
		div.c("inbox-top", () => {
			this.name();
			this.head_extra();
			this.$chrome = div.c("inbox-chrome flex v-center gap-25", () => {
				this.actions();
				this.needs_chip();
				this.floor();
				this.toggles();
				this.search();
				this.$count = div.c("inbox-count flex v-center gap-25");
			});
		});
	}

	/* The rail names itself (the owner, 2026-09-25: it "identifies this as the navigation rail"). */
	name(){ return h4.c("inbox-rail-name", () => { span(this.title); }); }
	head_extra(){}      // AIRail: the usage meters
	actions(){}         // AIRail: "+ New card"
	toggles(){}         // AIRail: auto-transcribe

	/* NEEDS YOU IS A FILTER, not a tab (the owner, 2026-09-30). Its state is the url
	   (`?review=1`), so a reload keeps it on; its badge counts what is waiting. */
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

	/* SEARCH — title and text, archived rows included ("find this, wherever it is"). */
	search(){
		this.$search = input.c("inbox-search").attr("type", "search").attr("placeholder", "Search…")
			.attr("title", "filter the list below by title or text")
			.on("input", e => { this.search_q = e.target.value.trim().toLowerCase(); this.relist(); });
	}

	/* THE SCORE FLOOR (the owner, 2026-09-30: "inbox is only… priority… and above"; then
	   inbox zero: 90 and up). A number you can move; the url keeps it (`?min=30`). The
	   Inbox is this rail at 90, the Log the same rail at 0. */
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

	/* The box the "N new" pill floats over — in the flow, its own arrival pushed every row down. */
	stream(){
		div.c("inbox-stream", () => {
			this.$pill = button.c("inbox-new prim").attr("type", "button").click(() => this.flush(true));
			this.$rows = div.c("inbox-rows", () => {
				// STICKY, INSIDE the scrolling box, so it pushes the row below it down rather
				// than covering it (review finding 3, 2026-09-30).
				this.$updated = button.c("inbox-updated").attr("type", "button").attr("hidden", "")
					.click(() => this.order_rows(true));
				// ONE BOX, ROWS TOUCHING: the flush stack (design/layout/doc/rules.md). The
				// pinned row sits on top of it, flush too, so the two read as one list.
				this.$pinned = div.c("inbox-pinned flush-stack");
				this.$list = div.c("inbox-list flush-stack");
			});
		});
	}

	/* The foot: the list's quieter filters, and "clear all". */
	foot(){
		div.c("inbox-rail-foot flex v-center", () => {
			this.foot_words();
			this.$notes = button.c("inbox-word").attr("type", "button")
				.attr("title", "only the notes left for you")
				.text("notes").click(() => { this.only_notes = !this.only_notes; this.$notes.el.classList.toggle("on", this.only_notes); this.relist(); });
			this.$archived = button.c("inbox-word inbox-archived-word").attr("type", "button")
				.click(() => { this.show_archived = !this.show_archived; this.$archived.el.classList.toggle("on", this.show_archived); this.relist(); });
			// INBOX ZERO: archive every row shown right now, in one press.
			button.c("inbox-word inbox-clear-all").attr("type", "button")
				.attr("title", "archive every row shown here right now")
				.text("clear all").click(() => this.clear_all());
		});
	}
	foot_words(){}      // AIRail: "views"

	grip(){
		const k = this.key + "-rail-w";
		grip({ from: "start", write: px => this.size(px), done: w => this.store_set(k, w + "px"),
			reset: () => { this.store_drop(k); this.size(); } });
	}

	/* ⚠ THE DETAIL COLUMN IS `page.$pages` — core's own word for "where my child pages
	   mount" (`Page.container()`). That is the whole master–detail: a row's page renders
	   here, so the list never has to know what one looks like. */
	detail(){
		this.$detail = div.c("inbox-detail", () => { this.empty(); });
	}

	empty(){
		div.c("inbox-empty muted", () => {
			span("Pick something on the left.");
			small("It opens here and stays here while the list keeps filling.");
		});
	}

	/* THE THIRD COLUMN: a sub-page opens here, beside the page that owns it. A page sets
	   its own `$pages = shell.$sub` for that, and Inbox.css grows the shell to three
	   columns while one is open (`:has()`), with no state of ours to get stale. */
	sub(){ this.$sub = div.c("inbox-sub"); }

	// Returns the width it applied, which `grip` remembers — clamped, so no column hides.
	size(px){
		const w = px ? Math.round(Math.max(200, Math.min(px, innerWidth - 320))) : null;
		this.$shell.style("--inbox-rail", w ? w + "px" : "");
		return w;
	}

	listen(){
		this.$rows.on("pointerenter", () => { this.hovering = true; });
		this.$rows.on("pointerleave", () => { this.hovering = false; this.draw_extras(); });
	}

	/** Start the data. The base just paints `items`; a subclass subscribes to its streams. */
	start(){
		this.needs_changed(new Set(this.items.filter(it => it.needs).map(it => it.id)));
		this.paint();
	}

	/* ════ THE DATA — what the rows are ════ */

	/** The rows, newest data first or not — `paint()` sorts. Override this. `.archived` on the
	 *  returned array is the archived pile (searched, and shown greyed on "archived"). */
	source(){
		const live = this.items.filter(it => it.status !== "archived");
		live.archived = this.items.filter(it => it.status === "archived");
		return live;
	}

	/** Before sorting: mark each row read or unread (the dot). AIRail adds the scores. */
	decorate(list){ list.forEach(it => { it.unread = !this.is_read(it.id); }); }
	/** After sorting, on every row (archived too): anything the face draws. */
	prepare(rows){}
	/** Newest first. */
	order(x, y){ return (Date.parse(y.at ?? 0) || 0) - (Date.parse(x.at ?? 0) || 0); }

	/* ── what the filters read — one seam each ── */
	pool(list){ return list; }                       // the rows that can be listed at all
	pool_archived(list){ return list; }              // the archived rows that can
	resolved(it){ return false; }                    // left by itself (AIRail: rules.js)
	needs(it){ return this.needs_ids.has(it.id); }   // waiting on you
	exempt(it){ return !!it.exempt; }                // never under the floor (AIRail: the Live row)
	haystack(it){ return (it.title + " " + (it.text ?? "")).toLowerCase(); }

	/** The rows on screen right now, in data order. */
	visible(){
		let base = this.pool(this.list);
		if (this.only_notes) base = base.filter(it => it.kind === "note");
		base = base.filter(it => !this.resolved(it));
		if (this.review_only) base = base.filter(it => this.needs(it));
		const archived = this.pool_archived(this.list.archived ?? []);
		if (this.search_q){
			const hit = it => this.haystack(it).includes(this.search_q);
			return [...base.filter(hit), ...archived.filter(hit)];
		}
		if (this.show_archived) return [...base, ...archived];
		return base.filter(it => this.exempt(it) || (it.score ?? 0) >= this.min);
	}

	/** Is the floor on right now? Off while searching, showing archived, or at 0. */
	floored(){ return this.min > 0 && !this.search_q && !this.show_archived; }

	/* ── read / unread and archive — a subclass writes them somewhere real ── */
	is_read(id){ return this.read_set().has(id); }
	mark_read(id, val = true){
		const set = this.read_set();
		val ? set.add(id) : set.delete(id);
		this.store_set(this.key + "-read-ids", JSON.stringify([...set]));
	}
	read_set(){ try { return new Set(JSON.parse(this.store_get(this.key + "-read-ids") ?? "[]")); } catch { return new Set(); } }
	archive(it){ it.status = "archived"; return Promise.resolve(); }
	archived_soon(){}   // after an archive: AIRail asks its folders to refresh

	/* ════ DRAWING ════ */

	// THE LIST IS QUIET when you are at its top and not pointing at it — the one test a
	// new row has to pass to enter on its own.
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

		// Everything already on screen redraws in place, wherever it sits.
		this.shown.forEach(id => { const it = by_id.get(id); if (it) this.refill(this.rows.get(id), it); });
		this.draw_extras();
		this.list_watchers.forEach(fn => fn(list));
	}

	/** Many answers arriving at once ask for one paint, not one each (a card's cost
	 *  answering for each of 300 rows once meant 300 full paints, 2.6s at load). */
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

	/* Let the waiting rows in. A row APPEARING or LEAVING forces a reorder (it has no old
	   place to keep); an existing row merely moving waits behind the "updated" pill. */
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

	/** Rows a subclass draws itself (AIRail: groups, real pages), then the one order. */
	draw_extras(force){ this.order_rows(force); }
	/** `[id, at, el]` for each of those extra rows, so `order_rows()` sorts them in. */
	extra_entries(){ return []; }

	/* ONE TIMELINE, NEWEST FIRST — BUT THE ORDER NEVER MOVES WHILE YOU ARE LOOKING (the
	   owner, 2026-09-30: "the rail reorders live and jumps"). A reorder is applied only on
	   the first paint (and a short settle after mount), when `force`d (a row appeared or
	   left, or the pill was pressed). Anything else is counted on the "N updated ↑" pill. */
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
	count_note(){ return null; }   // AIRail: "· the assistant is off"

	/* ── one row ── */

	/** A row's address: its page under mine, carrying a floor that is not the Inbox's own. */
	href(it){ return this.url + it.id + "/" + this.query(); }
	query(){ return this.min !== InboxRail.FLOOR ? "?min=" + this.min : ""; }

	/* A ROW IS AN ANCHOR — no click handler: the Router navigates it and marks it. */
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

	/** THE FACE — what one row shows: its head, one quiet line, then anything a subclass adds. */
	face(it, on = {}){
		this.row_head(it, on);
		if (it.sub) div.c("inbox-row-foot flex v-center gap-25", () => { small.c("inbox-row-line muted").text(it.sub); });
		this.face_extra(it);
	}
	face_extra(it){}   // AIRail: the progress meter and "what happened"

	/** The head: the unread dot (a button: press it to toggle), the icon, the score,
	 *  the title, when, and the archive ×. `it.dot === false` draws no dot at all. */
	row_head(it, on = {}){
		return div.c("inbox-row-head flex gap-25" + (it.kind === "stalled" ? " inbox-row-ask" : ""), () => {
			// No toggle (the AI's Live row): a plain dot, so a click on it still opens the row.
			if (it.dot !== false) on.toggle_read ? button.c("inbox-dot").attr("type", "button")
				.attr("title", it.unread ? "mark read" : "mark unread")
				.click(e => { e.preventDefault(); e.stopPropagation(); on.toggle_read(); }) : span.c("inbox-dot");
			if (it.icon) icon(it.icon);
			if (it.score != null) span.c("inbox-score" + (it.score >= 70 ? " inbox-score-hot" : "")).text(String(it.score));
			this.title_text(span.c("inbox-row-title").text(it.title), it);
			small.c("inbox-row-when muted").text(this.when(it.at, it));
			if (on.archive) button.c("inbox-clear").attr("type", "button")
				.attr("title", "archive — nothing is deleted").text("×")
				.click(e => { e.preventDefault(); e.stopPropagation(); on.archive(); });
		});
	}
	title_text($title, it){}   // AIRail: turn #Page and /path into links (ext/Mention)

	/** "10:04 PM" today, "Sep 28, 2:20 PM" before. */
	when(at){
		const d = new Date(at ?? 0);
		if (!at || isNaN(d)) return "";
		const today = d.toDateString() === new Date().toDateString();
		const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
		return today ? time : d.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + time;
	}

	/** The row's two buttons — built once per record, so a click during a redraw never
	 *  reaches a stale closure. Both act at once and redraw just this row. */
	row_on(rec, it){
		const on = {
			toggle_read: () => {
				this.mark_read(it.id, !this.is_read(it.id));
				it.unread = !this.is_read(it.id);
				rec.sig = null;
				this.refill(rec, it);
			},
			// The row LEAVES — `archived_pending` keeps it out however often the data rebuilds
			// before the write lands.
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

	/* "CLEAR ALL" — every row shown right now, through the same write the × makes, a
	   batch at a time so neither the page nor the server freezes on hundreds. */
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

	/** What waits on you changed: the chip's badge, and the filter if it is on. */
	needs_changed(ids, n = ids.size){
		this.needs_ids = ids;
		if (this.review_only) this.relist();
		this.$needs_count.el.hidden = !n;
		if (n) this.$needs_count.text(String(n));
		// A row's signature cannot see this set, so redraw them — but only on a real change.
		const key = [...ids].sort().join(",");
		if (key === this.last_needs) return;
		this.last_needs = key;
		this.rows.forEach(rec => { rec.sig = null; });
		if (this.$list) this.paint();
	}

	/** A detail page on screen asks to be redrawn from the list: `{ id, draw(it) }`. */
	open(h){ this.watching.add(h); this.current = h; this.paint(); return h; }
	close(h){ this.watching.delete(h); if (this.current === h) this.current = null; }
	repaint(){ this.paint(); }
	on_list(fn){ this.list_watchers.add(fn); if (this.list?.length) fn(this.list); return () => this.list_watchers.delete(fn); }

	/** Change the floor: the input, the url (`?min=`, dropped at the default) and the rows. */
	set_min(n){
		if (n === this.min) return;
		this.min = n;
		if (this.$floor) this.$floor.el.value = String(n);
		this.set_query("min", n === this.min_default ? null : String(n));
		this.relist();
		this.router?.mark_links?.();
	}

	/** A tab says which floor it means: the Inbox 90, the Log 0. A `?min=` in the url wins.
	 *  Read on the next tick: the Router pushes the new url only after the page activates. */
	tab_floor(d){
		this.min_default = d;
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

	/* ⚠ Storage can throw (a private window, blocked site data); a bare read once stopped
	   the whole rail drawing. Every read and write goes through these. */
	store_get(k){ try { return localStorage.getItem(k); } catch { return null; } }
	store_set(k, v){ try { localStorage.setItem(k, v); } catch {} }
	store_drop(k){ try { localStorage.removeItem(k); } catch {} }
}

export { InboxRail };
