import { Page, View, div, p, span, small, a, button, input, select, option } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { clock, flag_box, when } from "./faces.js";
import { task_of, task_region } from "./tasks.js";

/* The old board-card faces (the rail row, the whole board card) live in
   `faces.js`. These re-exports keep an older `import { clock } from "./card.js"`
   (live.js) working unchanged. */
export { clock, row, full, flag_box, toc, sub_full, who, is_you } from "./faces.js";
import chat from "./chat.js";
import composer from "./compose.js";
import agents_panel from "./agents.js";
import { author_word, type_icon, create_card, append_card, cards_ready } from "./inbox.js";

View.stylesheet(import.meta, "ai2.css");

/**
 * A CARD IS A FOLDER, AND THIS IS ITS PAGE (the owner, 2026-09-24: "we want the
 * agent to have a card.js or similar, that's basically like a page.js").
 *
 *   ai/2026/09/24/fix-the-sidebar/page.jsonl      line 1 names this class
 *   {"class": "/framework/ai2/card.js", "title": "Fix the sidebar", "type": "request", …}
 *   {"message": {"by": "assistant-fast", "text": "On it."}}
 *   {"type": "question"}                           ← the card is a question now
 *   {"file": "wider/page.jsonl"}                   ← a sub-card, one folder deeper
 *
 * `Page.jsonl()` (core/Page/Log.js) builds it from line 1 and calls `set()` with
 * every later line, live on localhost: a key that names a method below calls
 * it, anything else (`title`, `text`, `links`) is kept as data. So the methods
 * below ARE the card's vocabulary — a new kind of line is a new method.
 *
 * Inside AI 2 it draws into the page's own chrome: the card in the middle
 * column, its sub-cards (its `file` lines) as a table of contents, and the
 * pinned chat at the bottom, which you talk into. `shell` is AI 2's own page,
 * handed down by whoever built this one; without it the card still draws.
 */

/** What a card can be turned into. The type picker offers these. */
export const TYPES = ["question", "request", "sub-question", "note", "task"];

/* The words line 1 may carry that are METHODS here. ⚠ Line 1 goes through the
   constructor's `assign()`, which would REPLACE `type()` and `tags()` with
   data — Servex writes both on line 1 — so `assign()` below calls them instead. */
const VERBS = new Set(["type", "tags", "status", "message", "prompt", "attach", "detach", "legacy", "cites"]);

/** Today's time alone; any other day with its date — `faces.js` holds it now. */
export { when };

/** One card summary (`GET /cards`) as a row: icon, title, and what it is. */
export const summary_line = s => [s.type, s.status && s.status !== "open" && s.status,
	...(s.tags ?? []).map(t => "#" + t), when(s.last ?? s.created)].filter(Boolean).join(" · ");

export function card_link(s, href){
	a.c("ai2-toc-row page-link").href(href).append(() => {
		icon(type_icon(s.type));
		div.c("ai2-toc-body", () => {
			span.c("ai2-toc-title").text(s.title || s.id.split("/").at(-1));
			small.c("ai2-toc-line muted").text(summary_line(s));
		});
	});
}

export default class Card extends Page {

	static base = "/framework/ai/";

	assign(...args){
		for (const obj of args) if (obj) for (const key of Object.keys(obj))
			VERBS.has(key) ? this[key](obj[key]) : (this[key] = obj[key]);
		return this;
	}

	initialize(){ this.classes ??= "ai2-card-page"; }

	/* ── the vocabulary: one method per kind of line ─────────────────────── */

	/** The latest-wins labels. Kept apart because `type`, `tags` and `status` are methods. */
	facts(){ return this.info ??= { type: "card", tags: [], status: "open" }; }

	type(t){ this.facts().type = t; }
	tags(t){ this.facts().tags = [].concat(t ?? []); }
	status(s){ this.facts().status = s; }

	message(m){
		(this.messages ??= []).push(m);
		this.talk?.sync();
	}

	/** The owner's own words. A later line with the SAME id is the cleaned reading, merged in. */
	prompt(pr){
		const list = this.prompts ??= [];
		const had = pr?.id && list.find(x => x.id === pr.id);
		if (had) Object.assign(had, pr);
		else list.push({ ...pr });
		this.talk?.sync();
	}

	attach(agent){ const list = this.attached ??= []; if (!list.includes(agent)) list.push(agent); }
	detach(agent){ this.attached = (this.attached ?? []).filter(x => x !== agent); }
	legacy(id){ (this.legacies ??= []).push(id); }
	cites(refs){ const list = this.citing ??= []; [].concat(refs).forEach(r => { if (!list.includes(r)) list.push(r); }); }

	// A rewritten (not appended) log replays from line 1 onto a clean slate.
	log_forget(){
		super.log_forget();
		this.info = null;
		this.messages = [];
		this.prompts = [];
		this.attached = [];
		this.legacies = [];
		this.citing = [];
	}

	/* ── sub-cards ─────────────────────────────────────────────────────────── */

	/** Where the log lives — this page's own url is AI 2's, not the folder's. */
	folder_url(){ return String(this.jsonl_url ?? "").replace(/page\.jsonl$/, ""); }

	/** Where this card's .md files really are: its folder, not AI 2's address. */
	md_dir(){ return this.folder_url(); }

	/** A doc opens inside the card, with a Back button. It lives in `this.view`, outside
	 *  `$box`, so a redraw (a new chat line, a new title) leaves it in place. */
	open_link(link){ return this.swap_link(link); }

	/** The bare .md names from the card's own `{"file": "notes.md"}` lines. */
	md_names(){ return [...(this.listed?.values() ?? [])].filter(n => /\.md$/i.test(n) && !n.includes("/")); }

	/** The sub-card folders, from the `file` lines (Page's own `file()` records them). */
	subs(){ return [...(this.child_kinds?.keys() ?? [])]; }

	/* ⚠ Core would read a listed child from `this.url + name` — AI 2's address,
	   where no file is. A sub-card is read from the FOLDER instead, listed or
	   not, so any depth works and a link to a sub-card made a second ago too. */
	async child(name, levels){
		if (this.children.get(name)) return super.child(name, levels);
		const kid = await this.constructor.jsonl(this.folder_url() + name + "/");
		if (!kid) return null;
		kid.assign({ shell: this.shell, classes: "ai2-card-page ai2-sub-page" });
		return this.add(name, kid).load_all_children(levels);
	}

	/* ── drawing ─────────────────────────────────────────────────────────────── */

	/* TWO FIXED REGIONS, as every card page here has had since 2026-09-22: the
	   card above, scrolling in its own box, and the chat pinned below it. A
	   top-level card's sub-cards open in AI 2's third column, beside it. */
	content(){
		const shell = this.shell;
		const sub = this.parent instanceof Card;
		if (shell && !sub) this.$pages = shell.$sub;

		if (sub) a.c("ai2-back ai2-sub-back page-link").href(this.parent.url).text("← " + (this.parent.title ?? this.parent.name));
		else a.c("ai2-back page-link").href(shell?.url ?? "/framework/ai2/").text("← all cards");

		// The scrolling region holds two boxes: the card, redrawn on every line,
		// and the task pages below it, which are drawn only when WHICH tasks
		// changes — a task page streams its own log and keeps its own open tab.
		div.c("ai2-full", () => {
			this.$box = div.c("ai2-full-card", () => { this.draw(); });
			this.$tasks = div.c("ai2-tasks");
		});
		this.fill_tasks();

		div.c("ai2-foot", () => {
			this.talk = chat({ source: () => this.chat_entries() });
			const fresh = !!shell && shell.opening === this.id;
			if (fresh) shell.opening = null;
			this.$composer = composer({
				re: () => this.id,
				placeholder: sub ? "talk into this sub-card" : "talk into this card",
				on_text: text => this.talk.echo(text),
				on_partial: text => this.talk.partial(text),
				autostart: fresh && shell.auto_transcribe?.(),
			});
		});
		this.talk.sync();
	}

	/** What `Page.jsonl()` calls after every live batch of lines — the list
	 *  hears too, because a title, a type or a new sub-card changed. */
	log_redraw(){
		this.redraw();
		this.shell?.ai2?.cards_changed?.();
	}

	redraw(){
		if (this.held) return;
		this.$box?.empty(() => { this.draw(); });
		this.talk?.sync();
		this.fill_tasks();
	}

	/* ── the task pages ──────────────────────────────────────────────────── */

	/** This card's row in `groups.json` when it is a group card, else null.
	    ⚠ Not `group()`: a member card carries a `{"group": …}` DATA line, which
	    `assign()` would copy over a method of that name. */
	group_info(){ return this.shell?.ai2?.groups?.by_card?.get(this.id) ?? null; }

	/** The tasks this card shows whole: a group's members, newest first, or the one task a card points at. */
	task_list(){
		const g = this.group_info();
		if (g) return this.shell.ai2.groups.members(g.id).filter(m => m.kind !== "said");
		return this.shell?.ai2?.groups?.task_at(task_of(this)) ?? [];
	}

	fill_tasks(){
		if (this.$tasks) task_region(this.$tasks, this.task_list(), this.task_state ??= {}, { head: !!this.group_info() });
	}

	draw(){
		const f = this.facts();
		const g = this.group_info();

		div.c("ai2-full-head flex v-center gap-25", () => {
			icon(this.icon ?? g?.icon ?? type_icon(f.type));
			span.c("ai2-full-title").md(this.title ?? this.name);
			// The picker, "clear" and "+ sub-card" write through Servex's card
			// routes; a Servex without them (not restarted yet) shows none of the three.
			if (cards_ready.known) this.type_picker();
			const flag = this.flag_note;
			button.c("ai2-flag" + (flag ? " on" : "")).attr("type", "button")
				.attr("title", flag ? "flagged — press to withdraw" : "not this — say why")
				.text("⚑").click(() => (flag ? this.face().unflag() : this.$box.append(() => { flag_box(this.face()); })));
			if (this.shell && cards_ready.known) button.c("ai2-clear").attr("type", "button")
				.attr("title", "archive this card — nothing is deleted").text("clear").click(() => this.clear());
		});

		div.c("ai2-meta flex v-center wrap gap-25", () => {
			if (this.by) span.c("ai2-who" + (this.by === "owner" ? " ai2-who-you" : "")).text(author_word(this.by));
			small.c("muted").text(when(this.created));
			if (f.status && f.status !== "open") span.c("ai2-chip").text(f.status);
			f.tags.forEach(t => { span.c("ai2-chip").text("#" + t); });
			if (this.attached?.length) small.c("muted").text("on it: " + this.attached.join(", "));
		});
		agents_panel(this.id);

		// A group says what belongs in it; its members' task pages follow below.
		if (g) p.c("ai2-text").text(g.about);
		if (this.text) p.c("ai2-text").text(this.text);
		if (this.description) p.c("ai2-text").text(this.description);
		if (this.links?.length) div.c("ai2-links flex wrap gap-25", () => {
			this.links.forEach(l => { a.c("ai2-link page-link").href(l.url).text(l.label ?? l.url); });
		});
		if (this.flag_note) small.c("ai2-flag-said muted")
			.text("flagged" + (this.flag_note.quote ? " on “" + this.flag_note.quote + "”" : "") + " — " + (this.flag_note.note ?? ""));

		const docs = this.md_names();
		if (docs.length) this.md_files(docs);

		this.contents();
	}

	/** Turn this card into another kind: one `{"type": …}` line, and the latest wins. */
	type_picker(){
		const now = this.facts().type;
		const words = TYPES.includes(now) ? TYPES : [now, ...TYPES];
		const $pick = select.c("ai2-type", () => { words.forEach(w => { option(w).attr("value", w); }); });
		$pick.attr("title", "turn this card into another kind");
		$pick.el.value = now;
		$pick.on("change", e => this.retype(e.target.value));
	}

	retype(type){ return append_card(this.id, { type }); }

	/** Archive, never delete — one `{"status": "archived"}` line; the list then hides it. */
	clear(){ return append_card(this.id, { status: "archived" }).then(() => this.shell?.ai2?.cards_changed?.()); }

	/* THE TABLE OF CONTENTS — this card's sub-cards, each a row that opens beside
	   it, and the one button that makes another. */
	contents(){
		const subs = this.subs();
		div.c("ai2-toc ai2-card-toc", () => {
			div.c("ai2-toc-head flex v-center gap-25", () => {
				small.c("muted").text(subs.length ? subs.length + (subs.length === 1 ? " sub-card" : " sub-cards") : "no sub-cards yet");
				if (cards_ready.known) this.sub_adder();
			});
			if (subs.length) div.c("ai2-toc-rows", () => {
				subs.forEach(slug => {
					const id = this.id + "/" + slug;
					card_link(this.shell?.ai2?.cards?.card(id) ?? { id, title: slug }, this.url + slug + "/");
				});
			});
		});
	}

	/* ⚠ `held` stops every redraw while the title is being typed — a live line
	   landing mid-sentence would otherwise tear the input down under you. */
	sub_adder(){
		const $slot = span.c("ai2-sub-add");
		const idle = () => $slot.empty(() => {
			button.c("ai2-word").attr("type", "button")
				.attr("title", "a card inside this one — it opens beside it").text("+ sub-card").click(ask);
		});
		const ask = () => {
			this.held = true;
			$slot.empty(() => {
				const $in = input().attr("placeholder", "what is it? Enter makes it, Esc cancels").ac("ai2-sub-input");
				$in.on("keydown", e => {
					if (e.key === "Escape"){ this.held = false; idle(); return; }
					if (e.key !== "Enter") return;
					$in.el.disabled = true;
					this.add_sub($in.el.value.trim() || "New sub-card");
				});
				setTimeout(() => $in.el.focus(), 0);
			});
		};
		idle();
	}

	async add_sub(title){
		const made = await create_card({ parent: this.id, title });
		this.held = false;
		// Lines that landed while the title was being typed (its own `file` line
		// among them) were held back — draw them now.
		this.redraw();
		if (!made?.ok) return;
		if (this.shell) this.shell.opening = made.id;   // a new sub-card opens listening, like a new card
		this.shell?.ai2?.cards_changed?.();
		this.app?.router?.go(this.url + made.id.split("/").at(-1) + "/");
	}

	/* ── the chat ──────────────────────────────────────────────────────────── */

	/** The card's own lines as a conversation, in `chat.js`'s shape. */
	chat_entries(){
		return [
			...(this.prompts ?? []).map(pr => ({ type: "prompt", id: pr.id, at: pr.at, by: pr.by, text: pr.raw ?? pr.text })),
			...(this.messages ?? []).map(m => this.chat_line(m)),
		];
	}

	chat_line(m){
		const kind = m.kind ?? "reply";
		if (m.raw && !m.text) return { type: "update", at: m.at, text: m.raw };
		if (kind === "task" || kind === "update" || kind === "clear") return { ...m, type: kind };
		return { type: "reply", id: m.id, at: m.at, by: m.by, text: m.text ?? m.name ?? m.title };
	}

	/* ── living inside AI 2 ────────────────────────────────────────────────── */

	/** What the flag, the selection flagger and `clear` ask of this card. */
	face(){
		return this.acts ??= {
			held: v => { this.held = v; if (!v) this.redraw(); },
			flag: (note, quote) => {
				this.shell?.ai2?.flag(this.id, note, quote);
				setTimeout(() => { this.held = false; this.redraw(); }, 1200);
			},
			unflag: () => this.shell?.ai2?.unflag(this.id),
			clear: () => this.clear(),
		};
	}

	/** AI 2 hands every open card its list row on each repaint; only a flag change redraws. */
	flag_changed(it){
		const flag = it?.flag ?? null;
		if (JSON.stringify(flag) === JSON.stringify(this.flag_note ?? null)) return;
		this.flag_note = flag;
		this.redraw();
	}

	// ⚠ `activated()`, not `content()`: the view is cached, so a card you come
	// back to has to re-register and pick up titles that changed meanwhile.
	activated(){
		this.handle = this.shell?.ai2?.open({ id: this.id, draw: it => this.flag_changed(it), on: this.face(), $box: this.$box });
		// The sub-cards' titles come off AI 2's card list, which refreshes on its own clock.
		this.stop_list = this.shell?.ai2?.cards?.on(() => this.redraw());
		// A member landing, or a task's `now` moving, reorders a group's sections.
		this.stop_groups = this.shell?.ai2?.groups?.on(() => this.redraw());
		this.redraw();
		if (!cards_ready.known) cards_ready().then(ok => ok && this.redraw());
	}

	/* ⚠ AND THE MICROPHONE STOPS — a cached page stays in the DOM with its own
	   composer, and a mic left on would keep talking into a card you left. */
	deactivated(){
		this.shell?.ai2?.close(this.handle);
		this.stop_list?.();
		this.stop_groups?.();
		const mic = this.$composer?.mic;
		try { if (mic && !["idle", "error"].includes(mic.state)) mic.stop(); } catch {}
		this.talk?.partial("");
	}
}

/**
 * A YEAR, A MONTH OR A DAY — the folders above the cards (`2026/`, `2026/09/`,
 * `2026/09/24/`). Each lists what is inside it; a day lists its cards. Their
 * child is read from the folder, so `/framework/ai2/2026/09/24/<slug>/` walks
 * straight down to the card with nothing probed.
 */
Card.Folder = class CardFolder extends Page {

	initialize(){ this.classes ??= "ai2-index-page"; }

	level(){ return this.id.split("/").length; }

	async child(name, levels){
		if (this.children.get(name)) return super.child(name, levels);
		const id = this.id + "/" + name;
		const kid = this.level() < 3
			? new this.constructor({ id, title: this.constructor.title_of(id), shell: this.shell })
			: await Card.jsonl(Card.base + id + "/");
		if (!kid) return null;
		kid.assign({ shell: this.shell });
		return this.add(name, kid).load_all_children(levels);
	}

	/** "2026", "September 2026", "Thursday 24 September". */
	static title_of(id){
		const [y, m, d] = id.split("/").map(Number);
		if (!m) return String(y);
		if (!d) return new Date(y, m - 1, 1).toLocaleDateString([], { month: "long", year: "numeric" });
		return new Date(y, m - 1, d).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
	}

	content(){
		div.c("ai2-index", $box => {
			const draw = () => $box.empty(() => { this.folder_rows(); });
			draw();
			this.shell?.ai2?.cards?.on(draw);
		});
	}

	/** A day lists its cards; a month its days, a year its months, each with a count. */
	folder_rows(){
		const all = this.shell?.ai2?.cards?.cards ?? [];
		const mine = all.filter(c => c.id.startsWith(this.id + "/"));
		if (!mine.length) return void small.c("muted").text("Nothing here yet.");

		if (this.level() >= 3) return mine.filter(c => c.id.split("/").length === 4)
			.forEach(c => card_link(c, this.url + c.id.split("/").at(-1) + "/"));

		const groups = new Map();
		mine.forEach(c => { const seg = c.id.split("/")[this.level()]; groups.set(seg, (groups.get(seg) ?? 0) + 1); });
		[...groups].sort((x, y) => y[0].localeCompare(x[0])).forEach(([seg, n]) => {
			a.c("ai2-toc-row page-link").href(this.url + seg + "/").append(() => {
				icon("folder");
				div.c("ai2-toc-body", () => {
					span.c("ai2-toc-title").text(this.constructor.title_of(this.id + "/" + seg));
					small.c("ai2-toc-line muted").text(n + (n === 1 ? " card" : " cards"));
				});
			});
		});
	}
};
