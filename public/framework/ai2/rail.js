import { Page, View, div, span, small, a, button, label, input, details, summary } from "/app.js";
import InboxRail from "/framework/core/Page/ext/Inbox/Rail.js";
import { mentions } from "/framework/ext/Mention/Mention.js";
import { Groups } from "./groups.js";
import { task_of, task_region } from "./tasks.js";
import { clock, when, full, flag_box, toc, sub_full, news_bar } from "./faces.js";
import { news_of, group_news, unseen } from "./activity.js";
import { plain, first_sentence, Board, Says, BOARD_URL, VERDICTS_URL, prompt_stream, card_stream, day_log, items, sub_rows, sub_row, say, new_card, archive_card, refs, CardList, create_card, resolve_card, is_folder_id, servex_up } from "./inbox.js";
import composer from "./compose.js";
import Card, { card_link } from "./card.js";
import { watch_needs, score_for } from "./needs.js";
import chat from "./chat.js";
import mount_chat from "/framework/ux/Dictate/chat.js";
import { LIVE, live_model, live_full, usage_head } from "./live.js";
import { cost_of } from "/framework/ext/AITask/cost.js";
import { progress_of, meter } from "./meter.js";
import { agent_cost } from "./agents.js";
import workspace from "./workspace.js";
import { RealPage, page_events, real_title } from "./real.js";
import { is_read, mark_read, archive_row, is_resolved } from "./rules.js";

/* The AI-only look: the usage meters, a row's progress meter, "what happened", groups.
   The rail itself is styled by the ux block (ux/Inbox/Inbox.css), loaded by InboxRail. */
View.stylesheet(import.meta, "rail.css");

/* Servex down: the page is read-only — "+ New card" quietly goes away. */
servex_up().then(ok => { if (!ok) document.head.append(Object.assign(document.createElement("style"), { textContent: "@layer site { .ai2-newcard { display: none } }" })); });

const AUTO_KEY = "ai2-auto-transcribe";
const LIVEVIEW_KEY = "ai2-live-default";
const store = InboxRail.prototype;   // its try/catch storage, shared rather than copied

/** On by default — a card you just opened starts listening unless you turned this off. */
export const auto_transcribe = () => store.store_get(AUTO_KEY) !== "off";

/**
 * AI RAIL — the AI's inbox: the base rail (`core/Page/ext/Inbox/Rail.js`) plus what only
 * the AI system has (the owner, 2026-09-30: "we don't need the AI usage meters on the
 * inbox for every single page… override the rail… and you add the progress bars above it").
 *
 * Adds, each as an override of one base method:
 *   - the usage meters above the filters (`head_extra`) — the ONLY place they exist;
 *   - "+ New card" (`actions`) and auto-transcribe (`toggles`);
 *   - the rows: cards, the Live card, groups and changed site pages, from the AI logs
 *     (`source`, `draw_extras`), with a progress meter and "what happened" on each;
 *   - the pinned Now card, the focus-follow (an agent can open a card on your screen),
 *     the workspace word, and flagging a sentence you selected in the detail.
 *
 * AI 2 (`ai2/page.js`) builds one (the AI page's Inbox and Log tabs, `ai/page.js`, next merge):
 * `this.ai2 = new AIRail({ page: this }).mount()` inside `content()`. Card pages read it
 * back as `shell.ai2` (card.js).
 *
 * ⚠ The shell also wears `.ai2`: card.js finds it with `document.querySelector(".ai2")`
 *   to write its column widths (`--ai2-subw`, `--ai2-chat`) — rail.css passes those on.
 */
export default class AIRail extends InboxRail {
	title = "AI inbox";
	key = "ai2";
	now_item = null;
	followed = new Set();

	shell_classes(){ return "inbox-shell ai2 bleed"; }

	/* The data first: the usage meters in the head read `live` while the head is built. */
	mount(){
		this.log = new Board({ url: BOARD_URL });
		this.says = new Says({ url: VERDICTS_URL });
		this.day = day_log();
		this.prompts = prompt_stream();
		this.live = live_model({ prompts: this.prompts, day: this.day });
		// Every card folder, as Servex lists them; `board.jsonl` is read only when it is not `ok`.
		this.cards = new CardList();
		// The familiar groups the work is filed under — `groups.json`, `groups.js`.
		this.groups = new Groups();
		this.page.auto_transcribe = auto_transcribe;
		super.mount();
		// With the workspace view on, every link clicked in here keeps `?view=workspace`.
		this.$shell.el.addEventListener("click", e => workspace.keep(e));
		// LIVE IS THE INBOX'S DEFAULT — the bare url goes to it once per load (Back returns
		// here, no loop). A stored "off" from the old toggle is still honoured.
		const url = this.page.url;
		if ((location.pathname === url || location.pathname === url + "inbox/") && this.store_get(LIVEVIEW_KEY) !== "off" && !this.page.went_live){
			this.page.went_live = true;
			setTimeout(() => this.router?.go(workspace.url(url + "live/" + location.search)), 0);
		}
		return this;
	}

	/* ── the head ── */

	name(){
		return super.name().append(() => {
			// THE WORKSPACE VIEW, an experiment (workspace.js): shown only for a top-level card,
			// where it does something (the owner, 2026-09-28: "it doesn't do anything").
			// ⚠ `visibility`, not `hidden`: shown, the word made the name's line 0.5px taller, and
			// every row below moved on the first click of a card. It keeps its space now.
			this.$ws = a.c("inbox-word ai2-ws-word").attr("target", "_self").style({ visibility: "hidden" }).text(workspace.label())
				.click(e => { e.preventDefault(); location.assign(workspace.flipped()); })
				.on("pointerenter", e => { e.currentTarget.href = workspace.flipped(); });
		});
	}

	head_extra(){ usage_head(this.live); }

	/* A blank card that listens: it exists on the board the moment you press this. */
	actions(){
		button.c("inbox-newcard ai2-newcard").attr("type", "button")
			.attr("title", "an empty card that starts listening — everything you say goes into it")
			.text("+ New card")
			.click(async () => {
				// A FOLDER, made by Servex; Servex down or without the card routes: the old board card.
				const made = await create_card({ title: "New card" });
				const id = made?.ok ? made.id : await new_card();
				if (!id) return;
				if (made?.ok) await this.cards.refresh();
				this.page.opening = id;
				this.router?.go(workspace.url(this.url + id + "/"));
			});
	}

	toggles(){
		label.c("inbox-auto flex v-center gap-25 muted").attr("title", "a new card starts listening on its own — turn off to start it silent").append(() => {
			const $auto = input().attr("type", "checkbox");
			$auto.el.checked = auto_transcribe();
			$auto.on("change", e => this.store_set(AUTO_KEY, e.target.checked ? "on" : "off"));
			// "-transcribe" is its own span so a rail dragged narrow can say just "auto".
			span(() => { span("auto"); span.c("inbox-auto-tail").text("-transcribe"); });
		});
	}

	foot_words(){
		a.c("inbox-word page-link").href(this.url + "view/today/").attr("title", "today, open, all, or a tag").text("views");
	}

	shell_extra(){
		this.$flagger = button.c("ai2-selection-flag").attr("type", "button")
			.attr("title", "flag the text you selected").text("⚑");
	}

	count_note(){ return this.prompts.ok ? null : "· the assistant is off"; }

	/* ── the data ── */

	source(){
		const list = items({ board: this.log.cards, folders: this.cards, prompts: this.prompts.entries, landed: this.day.landings, says: this.says, groups: this.groups });
		// THE LIVE CARD joins the same list and sort, so an update lifts it like any arrival.
		list.push(this.live.item());
		// THE NOW CARD is in the list only so its own page finds it (`pool()` keeps it out of
		// the rows; `render_pinned()` draws its one row).
		if (this.now_item) list.push(this.now_item);
		return list;
	}

	/* READ/UNREAD is this browser's own flag (rules.js); the Live card is always fresh and
	   the pinned Now card never bold. Then each row's importance: its highest open need. */
	decorate(list){
		list.forEach(it => {
			it.unread = it.kind === "live" ? true : it.id === "now" ? false : !is_read(it.id);
			// ⚠ `?? it.score`: `score_for()` only answers "needs you" and is null for most rows.
			if (it.kind !== "stalled") it.score = score_for(it.id) ?? it.score;
		});
	}

	prepare(rows){
		rows.forEach(it => { it.cost = this.row_cost(it); });
		// What bumped each row, while it is new to you (activity.js).
		this.list.forEach(it => { it.news = news_of(it, this.groups.folds); });
	}

	/* A progress bar and one dollar figure, written onto the item so the row's signature
	   redraws it when either moves. */
	row_cost(it){
		if (it.kind === "live") return null;
		const t = this.groups.task_member(task_of(it) ?? task_of(this.groups.folds.get(it.id)?.fold));
		const c = cost_of(t);
		it.usd = c ? c.usd : (it.folder ? agent_cost(it.id, () => this.paint_soon()) : null);
		it.usd_open = !!c?.open;
		it.progress = progress_of(t, it.status);
		return null;
	}

	/* A thing filed in a group shows THROUGH its group, never twice — except one active in
	   the last half hour, which stands as its own row too. */
	pool(list){
		const fresh = it => Date.now() - Date.parse(it.at ?? 0) < 30 * 60 * 1000;
		const group_cards = new Set((this.groups.list ?? []).map(g => g.card));
		return list.filter(it => it.id !== "now" && !group_cards.has(it.id) && (!this.groups.filed(it) || fresh(it)));
	}
	pool_archived(list){ return list.filter(it => !this.groups.filed(it)); }
	resolved(it){ return is_resolved(it); }
	exempt(it){ return it.kind === "live"; }
	// A stalled ask has no card to archive (it leaves when the ledger moves on); Live never leaves.
	archivable(it){ return it.kind !== "stalled" && it.kind !== "live"; }

	is_read(id){ return is_read(id); }
	mark_read(id, val){ mark_read(id, val); }
	archive(it){ return archive_row(it); }
	// A folder card's row is polled every 20s — asking now shows its archived state at once.
	archived_soon(){ this.cards.soon(); }

	/* ── a row ── */

	row_classes(rec, it){ rec.$row.el.classList.toggle("ai2-row-live", it.kind === "live"); }

	when(at, it){ return it?.kind === "live" ? clock(at) : when(at); }

	title_text($title, it){ if (!it.plain) mentions($title.el); }

	face(it, on){
		// THE LIVE ROW: one line of state under its name — never an agent's words.
		if (it.kind === "live"){
			const t = it.tasks.length, w = it.agents.filter(x => x.state === "working").length;
			const sub = [w ? `${w} working` : "none working", t ? `${t} ${t === 1 ? "task" : "tasks"} running` : ""].filter(Boolean).join(" · ");
			this.row_head({ ...it, plain: true }, {});
			div.c("inbox-row-foot flex v-center gap-25", () => { small.c("inbox-row-line muted").text(sub); });
			return;
		}
		super.face(it, on);
	}

	face_extra(it){
		meter(it.progress, it.usd, it.usd_open);
		if (it.news) news_bar(it.news);
	}

	/* ── the rows the base does not draw: groups and changed site pages ── */

	draw_extras(force){
		this.draw_groups();
		this.draw_pages();
		this.order_rows(force);
	}

	extra_entries(){
		return [
			...[...(this.group_rows ?? [])].map(([id, rec]) => ["group:" + id, this.at_of.get("group:" + id), rec.$row.el]),
			...[...(this.page_rows ?? [])].map(([path, rec]) => ["page:" + path, this.at_of.get("page:" + path), rec.$row.el]),
		];
	}

	/* THE GROUP ROWS — one per group, a link to its card, redrawn in place when its newest
	   member changes. A group shows only while its own card, or a member, makes the floor. */
	draw_groups(){
		const rows = this.group_rows ??= new Map();
		const order = this.groups.ordered();
		order.forEach(g => {
			let rec = rows.get(g.id);
			if (!rec){
				rec = { sig: null };
				this.$list.append(() => { rec.$row = a.c("inbox-row ai2-group-row").href(this.url + g.card + "/"); });
				rows.set(g.id, rec);
			}
			const latest = this.groups.latest(g.id);
			const size = this.groups.members(g.id).filter(m => m.kind !== "said");
			const tasks_cost = this.groups.cost(g.id);
			// The name is the card's LATEST title; groups.json only names it first.
			const name = this.cards.card(g.card)?.title || g.name;
			// Money: the member tasks, else what the card's own agents spent (agents.js).
			const agents = tasks_cost?.tracked ? null : agent_cost(g.card, () => this.paint_soon());
			const spent = tasks_cost?.tracked ? tasks_cost : (agents ? { tracked: true, usd: agents, open: false } : tasks_cost);
			const news = group_news(g, latest, this.groups.at(g));
			const sig = JSON.stringify([g, name, latest, size.length, spent, news]);
			if (rec.sig === sig) return;
			rec.sig = sig;
			rec.$row.empty(() => { this.group_face(g, size, spent, name); if (news) news_bar(news); });
		});
		order.forEach(g => this.at_of.set("group:" + g.id, this.groups.at(g)));
		const pressing = g => !this.floored() || [this.list.find(x => x.id === g.card), ...this.groups.members(g.id)].some(x => (x?.score ?? 0) >= this.min);
		order.forEach(g => {
			const rec = rows.get(g.id);
			if (rec) rec.$row.style({ display: ((this.review_only && !this.needs_ids.has(g.card)) || !pressing(g)) ? "none" : "" });
		});
	}

	/* A group's face: its name, a bar (member tasks landed of all), the money. The dollars
	   take the place of a "2 tasks" count — all three made the line wrap (measured, 1920). */
	group_face(g, members, spent, name){
		const tasks = members.filter(m => m.kind === "task");
		const done = tasks.filter(m => m.landed).length;
		this.row_head({ icon: g.icon, title: name, at: this.groups.at(g), dot: false, plain: true }, {});
		meter({ pct: tasks.length ? Math.round(100 * done / tasks.length) : 0, live: tasks.length > done, done, total: tasks.length, unit: "tasks" },
			spent?.tracked ? spent.usd : null, !!spent?.open);
	}

	/* THE REAL PAGES — one row per site page an event named; a link to that page shown here.
	   A changed page is never pressing, so it shows only in the Log (no floor, no filter). */
	draw_pages(){
		const rows = this.page_rows ??= new Map();
		page_events(this.day, this.groups).forEach((evs, path) => {
			let rec = rows.get(path);
			if (!rec){
				rec = { sig: null };
				this.$list.append(() => { rec.$row = a.c("inbox-row ai2-page-row").href(this.url + path.slice(1)); });
				rows.set(path, rec);
			}
			rec.$row.style({ display: (this.review_only || this.floored()) ? "none" : "" });
			real_title(path, this.router, () => this.paint_soon());
			this.at_of.set("page:" + path, evs[0].at);
			const sig = JSON.stringify([evs[0], RealPage.known.get(path), unseen("page:" + path, evs[0].at)]);
			if (rec.sig === sig) return;
			rec.sig = sig;
			rec.$row.empty(() => {
				const known = RealPage.known.get(path), top = evs[0];
				this.row_head({ icon: known?.icon || "description", title: known?.title || path.split("/").filter(Boolean).at(-1), at: top?.at, dot: false, plain: true }, {});
				small.c("ai2-real-path muted").text(path);
				if (top && unseen("page:" + path, top.at)) news_bar({ who: top.who, what: top.what });
			});
		});
	}

	/* THE ONE PINNED ROW — the Now card, above everything, filled into `$pinned` so the
	   ordering never touches it. Read once from its own folder (`ai/now/`). */
	render_pinned(){
		if (!this.now_item) return;
		const it = this.now_item;
		this.$pinned.empty(() => {
			a.c("inbox-row inbox-row-pinned").href(this.url + "now/")
				.empty(() => { this.face({ ...it, sub: first_sentence(plain(it.text)) }, {}); });
		});
		this.router?.mark_links?.();
	}

	build_now_item(fold){
		const said = [...(fold.messages ?? []).map(m => ({ at: m.at, text: m.text ?? m.raw })),
			...(fold.prompts ?? []).map(p => ({ at: p.at, text: p.text ?? p.raw }))]
			.filter(x => x.text).sort((x, y) => Date.parse(x.at ?? 0) - Date.parse(y.at ?? 0)).at(-1);
		this.now_item = { id: "now", kind: "card", icon: "push_pin", title: plain(fold.title || "Now"),
			at: fold.last ?? fold.created, text: said?.text ?? "", links: [], flag: null, author: fold.by,
			unread: false, status: "open" };
	}

	/* ── listening ── */

	listen(){
		super.listen();
		/* THE BAR OPENS ACTIVITY: a row is a link and cannot hold another, so the "what
		   happened" bar's click is caught here, before the Router's own listener. */
		this.$rows.on("click", e => {
			const bar = e.target.closest?.(".ai2-news");
			const $a = bar?.closest("a.inbox-row:not(.ai2-page-row)");
			if (!$a || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
			e.preventDefault();
			e.stopPropagation();
			this.router?.go(workspace.url($a.getAttribute("href").split("?")[0] + "activity/"));
		});
		this.listen_flagger();
	}

	/* NOTHING HERE EVER RELOADS THE PAGE: three logs stream over the dev socket, the owner's
	   own sentences over Servex's EventSource. */
	start(){
		// Every stream asks for a paint; `paint_soon()` folds a burst of them into one.
		const paint = () => this.paint_soon();
		Promise.all([this.log.live(paint), this.says.live(paint), this.day.live(paint)]).then(paint);
		this.prompts.ready.then(paint);
		this.prompts.on(paint);
		this.live.on(paint);
		this.cards.on(paint);
		this.cards.start();
		this.groups.on(paint);
		this.groups.start({ folders: this.cards, socket: this.page.app?.socket });
		resolve_card("now").then(fold => { if (fold){ this.build_now_item(fold); this.render_pinned(); this.paint_soon(); } });
		// The Needs you chip reads the SAME shared scan as the needs page (needs.js).
		watch_needs(s => this.needs_changed(s.ids, s.rows.length));
		this.follow_focus();
	}

	/* A CARD MADE FOR YOU OPENS ON YOUR SCREEN (the owner, 2026-09-25): an agent writes
	   `{"type": "focus", "ref": "<card id>"}` to the Live card's log, and every open page
	   goes there. Live pushes only: a focus older than two minutes, or followed, is ignored. */
	follow_focus(){
		this.live.log.on(e => {
			if (e?.type !== "focus" || !e.ref || this.followed.has(e.ref + e.at)) return;
			if (Date.now() - Date.parse(e.at ?? 0) > 2 * 60 * 1000) return;
			this.followed.add(e.ref + e.at);
			this.cards.refresh?.().finally(() => this.router?.go(workspace.url(this.url + String(e.ref).replace(/^\/+|\/+$/g, "") + "/")));
		});
	}

	/* ── flagging a sentence you selected in the detail ──
	   ⚠ IT MUST LAND INSIDE THE WINDOW: a fixed button at a negative top is simply gone. */
	listen_flagger(){
		const FLAG_H = 38, FLAG_W = 44, $f = this.$flagger;
		const hide = () => { this.flagging = null; $f.el.classList.remove("on"); };
		const show = () => {
			const sel = document.getSelection();
			const text = (sel?.toString() ?? "").trim();
			const node = sel?.anchorNode;
			const host = node && (node.nodeType === 1 ? node : node.parentElement)?.closest?.(".ai2-full");
			if (!text || !host || !this.current) return hide();
			const box = sel.getRangeAt(0).getBoundingClientRect();
			const above = box.top - FLAG_H;
			const top = above >= 4 ? above : Math.min(box.bottom + 8, window.innerHeight - FLAG_H);
			const left = Math.min(Math.max(box.left + box.width / 2, FLAG_W), window.innerWidth - FLAG_W);
			this.flagging = text.slice(0, 240);
			$f.style({ left: Math.round(left) + "px", top: Math.round(Math.max(top, 4)) + "px" });
			$f.el.classList.add("on");
		};
		$f.click(() => {
			const quote = this.flagging;
			hide();
			if (quote && this.current) this.current.$box.append(() => flag_box(this.current.on, quote));
		});
		this.$detail.on("mouseup", () => setTimeout(show, 0));
		this.$detail.on("keyup", () => setTimeout(show, 0));
		document.addEventListener("mousedown", e => { if (!e.target.closest(".ai2-selection-flag")) hide(); });
	}

	/* ── what a card page asks of the rail (card.js reads these off `shell.ai2`) ── */

	open(h){
		this.watching.add(h);
		this.current = h;
		// Only a TOP-LEVEL card owns the workspace word; a sub-card beside it never touches it.
		if (h.top){ this.ws_owner = h; this.render_ws(); }
		this.paint();
		return h;
	}
	close(h){
		super.close(h);
		if (this.ws_owner === h){ this.ws_owner = null; this.render_ws(); }
	}
	render_ws(){
		const ok = !!this.ws_owner?.ws;
		this.$ws.el.style.visibility = ok ? "" : "hidden";
		if (!ok) return;
		this.$ws.el.classList.toggle("on", workspace.on);
		this.$ws.el.href = workspace.flipped();
		this.$ws.el.title = workspace.title;
		this.$ws.text(workspace.label());
	}
	cards_changed(){ this.cards.soon(); }
	flag(id, note, quote){
		this.says.flags.set(id, { id, say: "improve", note, quote });
		say(id, "improve", { note, quote });
		this.paint();
	}
	unflag(id){ this.says.flags.delete(id); say(id, "reopen"); this.paint(); }
	on_tasks(fn){ const go = () => fn([...this.groups.tasks.values()]); go(); return this.groups.on(go); }

	/* ════ THE ADDRESSES A RAIL OPENS — the same on every page that has the rail ════
	   A static, because the Router asks a page's `route()` before its `content()` (and so
	   before this rail exists) on a cold deep link. `shell` is the page the rail lives on. */
	static route(shell, id){
		if (id === LIVE) return card_page(shell, LIVE);
		// A CARD FOLDER'S ADDRESS starts with its year — `2026/09/24/<slug>/`, sub-cards one
		// segment deeper. The year, month and day are pages too (`Card.Folder`).
		if (/^\d{4}$/.test(id)) return new Card.Folder({ id, title: id, shell });
		if (id === "view") return views_page(shell);
	}
}

export { AIRail, card_page };

/**
 * ONE CARD'S OWN PAGE — the thing on the right that does not move. Two fixed regions:
 * THE IDEAS above, scrolling in their own box, and THE TRANSCRIPT FOOTER pinned below
 * (the owner, 2026-09-22: "the last paragraph always on screen"). Everything said in
 * its composer is posted `re: <this card's id>`, so it goes INTO this card.
 * (The Live card, and an old board id; a card FOLDER's page is card.js's `Card`.)
 */
function card_page(root, id){
	let $box, box, talk, sig = null, held = false, handle, stop_clog, stop_live, chat_mount;
	let latest_it = null, $tasks = null;
	const task_state = {};
	const clog = card_stream(id);   // the card's own log: `.ready` the backlog, `.on()` the rest

	/* ⚠ `held` stops a redraw: tearing the box down under a half-typed sentence was a bug. */
	const on = {
		held: v => { held = v; },
		flag(note, quote){
			root.ai2.flag(id, note, quote);
			setTimeout(() => { held = false; sig = null; root.ai2.repaint(); }, 1200);
		},
		unflag: () => root.ai2.unflag(id),
		clear: () => { archive_card(id); sig = null; root.ai2.repaint(); },
	};

	function draw(it){
		latest_it = it;
		talk?.sync();
		if ($tasks) task_region($tasks, root.ai2.groups.task_at(task_of(it)), task_state, { head: false });
		const next = JSON.stringify(it) + "|" + clog.entries.length;
		if (held || next === sig) return;
		sig = next;
		$box.empty(() => {
			if (it?.kind === "live") return live_full(it, root.ai2.live);
			if (it) full(it, on);
			else small.c("muted").text("No card by that name yet — it may still be on its way, or it has scrolled out of the log.");
			// THE TABLE OF CONTENTS: every sub-card in this card's log, each opening the third column.
			const rows = sub_rows(clog.entries);
			if (rows.length) toc(rows, root.url + id + "/");
		});
	}

	const mine = e => { const r = refs(e); return !r.length || r.includes(id) || e.type !== "prompt" && e.type !== "reply"; };
	const source = () => (id === LIVE ? root.ai2.live.entries() : clog.entries);

	return new Page({
		title: id,
		url: root.url + id + "/",
		classes: "ai2-card-page" + (id === LIVE ? " ai2-card-live" : ""),

		content(){
			// THE THIRD COLUMN belongs to this card: a sub-card mounts beside the detail column.
			this.$pages = root.$sub;
			// Only shown below 40em, where the rail is the whole screen and this is the second.
			a.c("ai2-back page-link").href(root.url).text("← all cards");
			// ⚠ The Live card keeps `.ai2-full` as its own box: its columns are its children.
			if (id === LIVE) $box = div.c("ai2-full");
			else div.c("ai2-full", () => { $box = div.c("ai2-full-card"); $tasks = div.c("ai2-tasks"); });

			// v1: the card's own log as a conversation, and its own composer.
			const foot = () => div.c("ai2-foot", () => {
				talk = chat({ source, keep: mine });
				const fresh = root.opening === id;
				if (fresh) root.opening = null;
				box = composer({
					re: () => id,   // asked fresh on every send: this composer belongs to this card
					placeholder: id === LIVE ? "talk to the assistant about what is running" : "talk into this card",
					on_text: text => talk.echo(text),
					autostart: fresh && auto_transcribe(),
				});
			});
			// v2 for Live: the one global chat every surface builds (ux/Dictate/chat.js). To
			// bring v1 back, call `foot()` instead below.
			const live_foot_v2 = () => div.c("ai2-foot ai2-foot-chat", () => {
				chat_mount = mount_chat(div.c("ai2-foot-chat-slot").el, {
					path: root.url + id + "/",
					card: id,
					placeholder: "talk to the assistant about what is running",
				});
			});
			/* ON LIVE THE ASSISTANT IS ONE ROW; pressing it opens the chat (the owner, 2026-09-25). */
			if (id === LIVE) details.c("ai2-live-assistant", () => {
				summary.c("ai2-live-assistant-row").text("Assistant: ask it about what is running");
				live_foot_v2();
			});
			else foot();
		},

		route(sub){ return sub.includes(".") ? undefined : sub_card_page(root, id, sub, clog); },

		// ⚠ `activated()`, not `content()`: the view is cached, so a card you return to watches again.
		activated(){
			// AN OLD ADDRESS STILL OPENS ITS CARD: Servex answers an old board id with the
			// folder it moved into, and the url is swapped in place (`replaceState`).
			if (id !== LIVE && !is_folder_id(id)) resolve_card(id).then(found => {
				if (!found || !is_folder_id(found.id) || location.pathname !== this.url) return;
				const url = root.url + found.id + "/";
				history.replaceState({}, "", url);
				root.app?.router?.load(url);
			});
			handle = root.ai2.open({ id, draw, on, $box, top: true, ws: false });
			stop_clog = clog.on(() => { sig = null; draw(latest_it); });
			clog.ready.then(() => { sig = null; draw(latest_it); });
			if (id === LIVE) stop_live = root.ai2.live.on(() => talk?.sync());
		},

		/* ⚠ AND THE MICROPHONE STOPS: a cached card page left listening would keep posting
		   into a card you navigated away from. */
		deactivated(){
			root.ai2.close(handle);
			try { if (box?.mic && !["idle", "error"].includes(box.mic.state)) box.mic.stop(); } catch {}
			try { chat_mount?.panel?.stop_mic?.(); } catch {}
			stop_clog?.();
			stop_live?.();
		},
	});
}

/**
 * ONE SUB-CARD'S OWN PAGE — the third column: a task, a proposal or a transcript paragraph,
 * opened to the right of its card. Its composer talks INTO it (`re: "<card>/<sub>"`).
 * ⚠ THE LOG IS SHARED: `clog` is the parent card's own stream, never a second one.
 */
function sub_card_page(root, id, sub, clog){
	let $box, box, talk, sig = null, held = false, stop_clog;
	const re = () => id + "/" + sub;

	function draw(){
		talk?.sync();
		const it = sub_row(clog.entries, sub);
		const next = JSON.stringify(it);
		if (held || next === sig) return;
		sig = next;
		$box.empty(() => {
			if (it) sub_full(it);
			else small.c("muted").text("Still on its way, or it has scrolled out of the log.");
		});
	}

	return new Page({
		title: sub,
		url: root.url + id + "/" + sub + "/",
		classes: "ai2-card-page ai2-sub-page",

		content(){
			// Closes by a plain link back to the card; the third column then empties and the
			// shell drops back to two columns by itself (Inbox.css `:has()`).
			a.c("ai2-back ai2-sub-back page-link").href(root.url + id + "/").text("← " + id);
			$box = div.c("ai2-full");
			div.c("ai2-foot", () => {
				talk = chat({ source: () => clog.entries, keep: e => refs(e).includes(re()) });
				box = composer({ re, placeholder: "talk into this sub-card", on_text: text => talk.echo(text) });
			});
		},

		activated(){
			draw();
			stop_clog = clog.on(() => { sig = null; draw(); });
		},

		deactivated(){
			try { if (box?.mic && !["idle", "error"].includes(box.mic.state)) box.mic.stop(); } catch {}
			stop_clog?.();
		},
	});
}

/* ── the views: today, open, all, a tag ──
 * EACH VIEW IS AN ADDRESS — `<rail>/view/open/` — drawn in the detail column like a card.
 * The words mean what `GET /cards?view=` means (Servex/cards/Cards.js `list()`), filtered
 * from the list this rail already holds, so a view keeps up with no second request. */
const VIEW_TITLE = { today: "Today's cards", open: "Open cards", all: "Every card" };

function in_view(c, word){
	if (c.status === "archived" && word !== "all") return false;
	if (word === "all") return true;
	if (word === "open") return c.status !== "done";
	if (word === "today"){
		const d = new Date(), pad = n => String(n).padStart(2, "0");
		const day = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
		return [c.created, c.last].some(t => String(t ?? "").startsWith(day));
	}
	return (c.tags ?? []).includes(word);
}

function view_words(root, word){
	div.c("ai2-view-words flex wrap v-center gap-25", $row => {
		const draw = () => $row.empty(() => {
			const tags = [...new Set(root.ai2.cards.cards.flatMap(c => c.tags ?? []))].sort().slice(0, 12);
			["today", "open", "all", ...tags].forEach(w => {
				a.c("ai2-word page-link" + (w === word ? " on" : "")).href(root.url + "view/" + w + "/")
					.text(VIEW_TITLE[w] ? w : "#" + w);
			});
		});
		draw();
		root.ai2.cards.on(draw);
	});
}

function views_page(root){
	return new Page({
		title: "Views",
		url: root.url + "view/",
		classes: "ai2-index-page",
		content(){
			view_words(root, null);
			small.c("muted").text("Each view is its own address — pick one.");
		},
		route(word){ return word.includes(".") ? undefined : view_page(root, word); },
	});
}

function view_page(root, word){
	return new Page({
		title: VIEW_TITLE[word] ?? "#" + word,
		url: root.url + "view/" + word + "/",
		classes: "ai2-index-page",
		content(){
			view_words(root, word);
			div.c("ai2-index", $box => {
				const draw = () => $box.empty(() => {
					const list = root.ai2.cards.cards.filter(c => in_view(c, word));
					if (!root.ai2.cards.ok) return void small.c("muted").text("Servex is not answering, so there are no card folders to list.");
					if (!list.length) return void small.c("muted").text("No cards in this view.");
					list.forEach(c => card_link(c, root.url + c.id + "/"));
				});
				draw();
				root.ai2.cards.on(draw);
			});
		},
	});
}
