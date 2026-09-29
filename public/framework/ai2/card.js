import { Page, View, div, p, span, small, a, button, input, select, option, details, summary } from "/app.js";
import { icon, table, thead, tbody, tr, th, td } from "/framework/core/View/View.js";
import { clock, flag_box, when } from "./faces.js";
import { money, cost_of, summary_line as cost_line } from "/framework/ext/AITask/cost.js";
import { task_of, task_region, face_row, group_faces } from "./tasks.js";

/* The old board-card faces (the rail row, the whole board card) live in
   `faces.js`. These re-exports keep an older `import { clock } from "./card.js"`
   (live.js) working unchanged. */
export { clock, row, full, flag_box, toc, sub_full, who, is_you } from "./faces.js";
import grip from "/framework/ext/grip/grip.js";
import Menu from "/framework/ux/Menu/Menu.js";
import chat, { md_into } from "./chat.js";
import composer from "./compose.js";
import agents_panel, { agent_cost } from "./agents.js";
import { items_of, about_line, outline, state_span, short } from "./outline.js";
import { author_word, role_word, type_icon, create_card, append_card, cards_ready } from "./inbox.js";
import "/framework/ext/tabs/tabs.js";   // for its stylesheet: a card's tab strip wears .tabs / .tab-bar / .tab
import { seen, mark_seen, card_events, activity_list } from "./activity.js";
import floating from "./floating.js";
import workspace from "./workspace.js";

View.stylesheet(import.meta, "ai2.css");

/** A top-level card's tabs. The words (the owner, 2026-09-25): a CARD is a topic,
 *  a REQUEST is one thing asked inside it, a TASK is what an agent does for a request.
 *  ACTIVITY is every line in the card, newest first, the unseen ones marked (activity.js). */
const TABS = { overview: "Overview", tasks: "Tasks", activity: "Activity" };
/* The two that are child urls (`…/<card>/tasks/`, `…/<card>/activity/`); Overview is the card itself.
   Tasks routes even while its tab is hidden: a group card knows it has tasks only once its groups load. */
const ROUTED = ["tasks", "activity"];

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
 * column, its sub-cards (its `file` lines) as a table of contents, and
 * its chat, which you talk into. `shell` is AI 2's own page,
 * handed down by whoever built this one; without it the card still draws.
 */

/** What a card can be turned into. The type picker offers these. */
export const TYPES = ["question", "request", "sub-question", "note", "task"];

/* The words line 1 may carry that are METHODS here. ⚠ Line 1 goes through the
   constructor's `assign()`, which would REPLACE `type()` and `tags()` with
   data — Servex writes both on line 1 — so `assign()` below calls them instead. */
const VERBS = new Set(["type", "tags", "status", "message", "prompt", "attach", "detach", "legacy", "cites", "item"]);

/** Today's time alone; any other day with its date — `faces.js` holds it now. */
export { when };

/** One card summary (`GET /cards`) as a row: icon, title, and what it is. */
export const summary_line = s => [s.type, s.status && s.status !== "open" && s.status,
	...(s.tags ?? []).map(t => "#" + t), when(s.last ?? s.created)].filter(Boolean).join(" · ");

const ASKS = new Set(["question", "request", "sub-question", "task"]);
const DONE = new Set(["done", "closed", "resolved", "answered", "landed", "complete", "completed"]);

export function card_link(s, href){
	const done = DONE.has(s.status);
	a.c("ai2-toc-row page-link" + (done ? " ai2-toc-done" : "")).href(href).append(() => {
		// A finished item shows a ticked box in place of its type icon.
		icon(done ? "check_box" : type_icon(s.type));
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

	/* ⚠ A REFINED READING IS NOT A RETYPE. Servex (agents/Layers.js) appends
	   `{"type": "refined", "text", "by", "at", …}` to a card; through core's `set()`
	   its `type` would turn the card into a "refined" and its `text` and `by` would
	   overwrite the card's own. It is kept whole instead, the latest wins. */
	set(obj){
		if (obj?.type === "refined"){ this.refined = obj; return this; }
		return super.set(obj);
	}

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

	/** One outline line, `{"item": {"id", "title", "asked_at", "done", "proof"}}`; the same id again updates it. */
	item(it){
		if (!it?.id) return;
		const list = this.items ??= new Map();
		list.set(it.id, { ...list.get(it.id), ...it });
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
		this.items = new Map();
		this.attached = [];
		this.legacies = [];
		this.citing = [];
		this.refined = null;
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
	md_names(){
		const placed = (this.placed ?? []).map(e => typeof e === "string" ? e : e.module);
		return [...(this.listed?.values() ?? [])].filter(n => /\.md$/i.test(n) && !n.includes("/") && !placed.includes(n));
	}

	/** The sub-card folders, from the `file` lines (Page's own `file()` records them). */
	subs(){ return [...(this.child_kinds?.keys() ?? [])]; }

	/* ⚠ Core would read a listed child from `this.url + name` — AI 2's address,
	   where no file is. A sub-card is read from the FOLDER instead, listed or
	   not, so any depth works and a link to a sub-card made a second ago too. */
	/** A tiny card's tab name, and not one of its requests (a request keeps its name). */
	is_tab(name){
		if (!this.tabbed() || this.subs().includes(name)) return false;
		return this.tiny() ? this.tab_list().some(t => t.key === name) : ROUTED.includes(name);
	}

	async child(name, levels){
		if (this.children.get(name) || name === "md" || this.is_tab(name)) return super.child(name, levels);   // md/ is core's; a tab goes through route()
		const kid = await this.constructor.jsonl(this.folder_url() + name + "/");
		if (!kid) return null;
		// ⚠ A sub-card whose line 1 has no id (a topic stub) would talk into NO card: its chat's `re` is its id.
		kid.id ??= this.id + "/" + name;
		kid.assign({ shell: this.shell, classes: "ai2-card-page ai2-sub-page" });
		return this.add(name, kid).load_all_children(levels);
	}

	/* ── drawing ─────────────────────────────────────────────────────────────── */

	/* TWO FIXED REGIONS: the card, scrolling in its own box, and its chat — the
	   right-hand column on a screen 40em and wider, the footer on a phone. A
	   top-level card's sub-cards open in AI 2's third column, beside it, and the
	   deepest open card's chat is the one on screen (ai2.css, the last block). */
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
			const body = () => {
				this.$box = div.c("ai2-full-card", () => { this.draw(); });
				if (this.tiny()) this.tab_panel();
				else if (!sub) this.tab_slot();
				this.$tasks = div.c(("ai2-tasks " + (this.tiny() ? this.tab_classes ?? "" : "")).trim());
			};
			// The workspace view (workspace.js): the same boxes, inside a Floating page.
			if (this.in_workspace()) this.ws = floating(null, { nav: this.ws_nav(), content: body });
			else body();
		});
		this.fill_tasks();

		div.c("ai2-foot", () => {
			this.talk = chat({ source: () => this.chat_entries(), re: () => this.id });
			const fresh = !!shell && shell.opening === this.id;
			if (fresh) shell.opening = null;
			this.$composer = composer({
				re: () => this.id,
				placeholder: sub ? "talk into this request" : "talk into this card",
				on_text: text => this.talk.echo(text),
				autostart: fresh && shell.auto_transcribe?.(),
			});
			// The chat's own inline-start edge. ONE chat column on screen at a time (the
			// deepest open card's), so one token for every card: the chat keeps its width
			// as you move between a card and its sub-cards (layout-unify, 2026-09-24).
			Card.seam("--ai2-chat", "ai2-chat-w", 240, () => innerWidth * 0.5);
		});
		// A sub-card is a column of its own: its seam is its own inline-start edge. The
		// column also holds the chat, so the chat is held at its current width while you
		// drag — the seam then moves only the card and the sub-card, the two beside it.
		if (sub) Card.seam("--ai2-subw", "ai2-sub-w", 320, () => innerWidth - 700, () => this.hold_chat());
		this.talk.sync();
	}

	/** Pin the chat column at the width it has now, if nothing has set it yet. For this
	 *  session only — what is remembered is still only a width you dragged the chat to. */
	hold_chat(){
		const shell = document.querySelector(".ai2");
		const foot = this.view?.el.querySelector(":scope > .ai2-foot");
		if (!shell || !foot?.offsetWidth || shell.style.getPropertyValue("--ai2-chat")) return;
		shell.style.setProperty("--ai2-chat", foot.offsetWidth + "px");
	}

	/* THE COLUMN SEAMS — one path for every card at every depth, called from `content()`.
	   They are the site's own `ext/grip` (the rail's handle) and write one token on the AI 2
	   shell, so every card shares the width: `--ai2-chat` (card | chat) and `--ai2-subw`
	   (card | sub-card column). Double-click puts the default back. Made where it is called,
	   so it lands in whatever box is being built. `before()` runs on every drag move,
	   before the width is written. */
	static seam(token, key, lo, hi_of, before){
		const shell = () => document.querySelector(".ai2");
		const write = px => {
			const w = px ? Math.round(Math.max(lo, Math.min(px, hi_of()))) : null;
			shell()?.style.setProperty(token, w ? w + "px" : "");
			return w;
		};
		try { write(parseInt(localStorage.getItem(key), 10) || null); } catch {}
		return grip({ write: px => { before?.(); return write(px); },
			done: w => { try { localStorage.setItem(key, w + "px"); } catch {} },
			reset: () => { try { localStorage.removeItem(key); } catch {} write(); } });
	}

	/** What `Page.jsonl()` calls after every live batch of lines — the list
	 *  hears too, because a title, a type or a new sub-card changed. */
	log_redraw(){
		this.redraw();
		this.shell?.ai2?.cards_changed?.();
	}

	/** Everything `draw()` reads — a redraw with the same signature would paint the
	 *  same pixels, so it is skipped: a live batch that changed nothing here (another
	 *  card's line, a task's `now`, a list poll) no longer tears the card down. */
	draw_sig(){
		const cards = this.shell?.ai2?.cards;
		return JSON.stringify([this.layout, this.facts(), this.title, this.name, this.icon, this.by, this.created, this.text,
			this.description, this.links, this.flag_note, this.attached?.length, this.md_names(), this.placed, [...this.listed?.values() ?? []], cards_ready.known,
			this.group_info(), this.subs().map(s => cards?.card(this.id + "/" + s) ?? s), this.cost_model(this.group_info()),
			agent_cost(this.id, () => this.redraw()), this.shell?.ai2?.groups?.task_member(task_of(this))?.landed_at,
			!this.tiny() && this.shows_tabs() && this.open_tab(), [...(this.sub_group ?? [])], [...(this.sub_done ?? [])], [...(this.sub_meta ?? [])], this.refined?.text, this.prompts?.[0]?.text, [...(this.items?.values() ?? [])]]);
	}

	redraw(){
		if (this.held) return;
		const sig = this.draw_sig();
		if (sig !== this.drawn_sig){
			this.drawn_sig = sig;
			this.$box?.empty(() => { this.draw(); });
			if (this.tiny()) this.tab_redraw();
			this.ws?.nav(this.ws_nav());
		}
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
		// A group's tasks are the faces in the card; only its member CARDS follow below.
		const g = this.group_info();
		// The task pages are what agents did for this card's requests: the Tasks tab.
		// With no Tasks tab, a card's one task page still follows its Overview, never its Activity.
		if (this.$tasks) this.$tasks.el.hidden = this.shows_tabs() && (this.has_tasks() ? this.open_tab() !== "tasks" : this.open_tab() === "activity");
		if (this.$tasks) task_region(this.$tasks, this.task_list().filter(m => !g || m.kind !== "task"), this.task_state ??= {}, { head: !!g });
	}

	/* A TOP-LEVEL CARD HAS TWO TABS (the owner, 2026-09-25): Overview — what the card
	   is, its state, its summary — and Tasks — its requests, grouped, and the task pages
	   of the agents working on them. A request (a sub-card) is one page, no tabs.
	   The strip wears `ext/tabs`' classes, but it is not `Page.tabs()`: that one routes
	   each tab to a child url, and a card's children are its requests. */
	draw(){
		const f = this.facts();
		const g = this.group_info();
		const items = this.overview_items(g);
		this.head(f, g, items);
		// In the workspace view the Floating page's nav IS the tab strip, so the strip is not drawn.
		if (this.tiny()){ if (!this.in_workspace()) this.tiny_tabs(); return; }
		if (!this.shows_tabs()) return void this.overview(f, g, items, true);
		const tab = this.open_tab();
		div.c("tabs ai2-card-tabs", () => {
			if (!this.in_workspace()) div.c("tab-bar", () => { this.tab_names().forEach(name => { this.tab_link(name); }); });
			div.c("tab-panel", () => {
				if (tab === "tasks") this.tasks_tab(g);
				else if (tab === "activity") this.activity_tab();
				else this.overview(f, g, items, !this.has_tasks());
			});
		});
	}

	/* THE ACTIVITY TAB (activity.js). The marks are against the seen time from BEFORE
	   this visit (`seen_from`, reset in `activated()`), so they stay while you read;
	   what is stored is the card's newest time, which takes the bar off its rail row. */
	activity_tab(){
		const since = this.seen_from ??= seen(this.id);
		const g = this.group_info();
		div.c("ai2-activity-box", $box => {
			small.c("muted").text("Reading this card's log…");
			card_events(this.id, this.drawn_sig).then(evs => {
				const all = [...evs, ...(g ? this.member_events(g) : [])];
				$box.empty(() => { activity_list(all, since); });
				this.saw(...all.map(e => e.at), this.row_at, g && this.shell?.ai2?.groups?.at(g));
			});
		});
	}

	/** A group's member tasks and cards as events — what its rail row's bar reads from. */
	member_events(g){
		return this.shell.ai2.groups.members(g.id).filter(m => m.kind !== "said").map(m => ({
			at: m.at, where: m.kind === "task" && m.landed ? null : m.title,
			who: m.kind === "task" ? (m.landed ? "task landed" : "task") : "card",
			what: m.kind === "task" && m.landed ? m.title : (m.words || "updated"),
		}));
	}

	/** Store the newest of these times as seen; the rail repaints when it moved. */
	saw(...ats){
		const t = Math.max(0, ...ats.map(a => Date.parse(a ?? 0) || 0));
		if (t && mark_seen(this.id, new Date(t).toISOString())) this.shell?.ai2?.repaint?.();
	}

	/** The Tasks tab: the requests, then what each cost and who worked on it, then the task pages below. */
	tasks_tab(g){
		this.contents();
		this.cost_block(g);
		agents_panel(this.id);
	}

	/** The card's dollars: a group's from its tasks, else its task's, else its own agents'. */
	cost_now(g){
		const groups = this.shell?.ai2?.groups;
		if (g){ const s = groups?.cost(g.id); return s?.tracked ? { usd: s.usd, open: !!s.open } : {}; }
		const c = cost_of(groups?.task_member(task_of(this)));
		return c ? { usd: c.usd, open: !!c.open } : { usd: agent_cost(this.id, () => this.redraw()) };
	}

	tabbed(){ return !(this.parent instanceof Card); }

	/* The tab bar only when the Tasks tab has something in it (ai2-lead audit, 2026-09-25: "two
	   tabs, and I don't even know if I want to click either"). A card with no requests and no
	   group is one page: the outline, with its cost and agents in the fold below. */
	/* Activity is always there, so a top-level card always has its strip (2026-09-25); the
	   Tasks tab still only when it has something in it. */
	shows_tabs(){ return this.tabbed(); }
	has_tasks(){ return this.tabbed() && (this.tiny() || !!this.group_info() || this.subs().length > 0); }
	tab_names(){ return Object.keys(TABS).filter(name => name !== "tasks" || this.has_tasks()); }

	/* TINY TOP TABS, FULL BLEED (the owner, 2026-09-25: "put everything on this page into a
	   tab system… without padding, make it full bleed and use like, kind of tiny top tabs").
	   Opt-in per card: one `{"layout": "tabs"}` line in its page.jsonl (plain data, kept by
	   core's `set()`). Every section is a tab — the outline, each placed thing, the tasks —
	   and one shows at a time. The chat is NOT a tab: it stays the right sidebar (the owner:
	   "Make chat a persistent right sidebar").
	   EACH TAB IS A REAL PAGE (the owner: "Why not just make those actual pages?… dynamic
	   routed pages… use the page route mechanism"): `route()` below builds it on demand,
	   so `…/now/usage/` is a child page like any other, and the tabs are plain links.
	   It mounts in the card's `regions` panel — core's own claim for a named child, the
	   one ext/tabs uses — and the outline sits in that panel as its `.default`. No folder
	   per tab: a tab lives only in the card's own page.jsonl, as its `place` line. */
	tiny(){ return this.layout === "tabs" && this.tabbed(); }

	/** `[{ key, label, draw }]`, in order. A placed thing is named after its file.
	 *  ⚠ A request (a sub-card) is a child url too, so a tab never takes a request's
	 *  name: the request keeps it, and the tab becomes `<name>-tab`. */
	tab_list(){
		const list = [{ key: "outline", label: "Outline", draw: () => {
			const g = this.group_info();
			this.overview(this.facts(), g, items_of(this, g), false, false);
		} }];
		const keys = new Set(["outline", "tasks", "activity", "md", ...this.subs()]);
		const free = key => { let k = key, n = 1; if (keys.has(k)) k = key + "-tab"; while (keys.has(k)) k = key + "-tab-" + ++n; keys.add(k); return k; };
		(this.placed ?? []).forEach(entry => {
			const { module, stack } = typeof entry === "string" ? { module: entry } : entry;
			const word = stack ?? String(module).split("/").at(-1).replace(/\.m?(js|md)$/i, "");
			const key = free(word.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
			const label = word.length <= 3 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1);
			list.push({ key, label, draw: () => { div.c("page-log flow", () => { this.draw_placed(entry); }); } });
		});
		const n = this.subs().length;
		list.push({ key: "tasks", label: "Tasks" + (n ? " · " + n : ""), draw: () => { this.tasks_tab(this.group_info()); } });
		list.push({ key: "activity", label: "Activity", draw: () => { this.activity_tab(); } });
		return list;
	}

	/** The strip: one link per tab. The outline's link is the card's own url. */
	tiny_tabs(){
		const tab = this.open_tab();
		div.c("ai2-tiny-tabs", () => {
			div.c("ai2-tiny-bar", () => { this.tab_list().forEach(t => { this.tiny_link(t, t.key === tab); }); }).attr("role", "tablist");
		});
	}

	tiny_link(t, on){
		a.c("ai2-tiny-tab").href(t.key === "outline" ? this.url : this.url + t.key + "/")
			.attr("role", "tab").attr("aria-selected", String(on)).attr("data-tab", t.key).text(t.label);
	}

	/* ── the tab pages ── */

	/** Core's route(): tried only for a name no one declared, so it never shadows a request. */
	route(name){
		if (!this.tiny()) return this.tab_route(name);
		const t = this.tab_list().find(t => t.key === name);
		if (!t) return null;
		const card = this;
		(this.regions ??= new Map()).set(name, this.$tab_panel);
		return new Page({
			title: t.label, classes: card.tab_classes_of(),
			content(){ this.$body = div.c("ai2-tab-body", () => { card.tab_fill(name); }); },
			activated(){ card.tab_shown(name); },
			deactivated(){ if (card.tab === name) card.tab_shown(null); },
		});
	}

	/** The classes a tab page wears. Padding is NOT a default (the owner: "sometimes no padding
	 *  is wanted and it shouldn't have to be fought off"): a card asks for it with a
	 *  `{"tab_classes": "pad"}` line, and gets exactly what it names. */
	tab_classes_of(){ return ("ai2-tab-page " + (this.tab_classes ?? "")).trim(); }

	/** One tab's content, from the list as it is now (a live line may have renamed it). */
	tab_fill(name){ this.tab_list().find(t => t.key === name)?.draw(); }

	/** The panel the tab pages mount in, and the outline as its default. Called once, from `content()`. */
	tab_panel(){
		this.$tab_panel = div.c("ai2-tiny-panel").attr("role", "tabpanel");
		this.regions ??= new Map();
		this.tab_list().forEach(t => this.regions.set(t.key, this.$tab_panel));
		const outline = this.children.get("outline") ?? this.add("outline", this.route("outline"));
		this.$tab_panel.append(() => { outline.assign({ app: this.app }).render().ac("default"); });
	}

	/** A tab page arrived (or left): mark its link, show or hide the task pages. No redraw. */
	tab_shown(name){
		this.tab = name ?? "outline";
		this.view?.el.querySelectorAll(":scope > .ai2-full > .ai2-full-card .ai2-tiny-tab").forEach(el =>
			el.setAttribute("aria-selected", String(el.dataset.tab === this.tab)));
		this.ws?.nav(this.ws_nav());
		this.fill_tasks();
	}

	/* ── the workspace view (workspace.js, floating.js) ── */

	/** A top-level card, with `?view=workspace` on. A request (a sub-card) keeps its own look. */
	in_workspace(){ return workspace.on && this.tabbed(); }

	/** The Floating page's nav: the card's tabs, the open one marked, then its sub-cards. */
	ws_nav(){
		const tab = this.open_tab(), n = this.subs().length;
		const tabs = this.tiny()
			? this.tab_list().map(t => ({ label: t.label, href: t.key === "outline" ? this.url : this.url + t.key + "/", active: t.key === tab }))
			: this.tab_names().map(name => ({ label: TABS[name] + (name === "tasks" && n ? " · " + n : ""),
				href: name === "overview" ? this.url : this.url + name + "/", active: name === tab }));
		const subs = this.subs().map(s => ({ label: this.sub_title(s), href: this.url + s + "/" }));
		return [...tabs, ...(subs.length ? [{ label: "Sub-cards" }, ...subs] : [])];
	}

	/** A live line changed the card: every tab page drawn so far redraws its body. */
	tab_redraw(){
		this.children.forEach((page, name) => {
			if (page?.$body) page.$body.empty(() => { this.tab_fill(name); });
		});
	}

	/* A CARD'S OWN TABS ARE ROUTED THE SAME WAY (2026-09-25, ai2-resurface-bar): Overview is the
	   card's own url, and Tasks and Activity are child pages — `…/<card>/activity/` — so a
	   reload, Back and the rail's "what happened" bar all land on the tab by url alone, the
	   same shape as the tiny tabs above. The page draws nothing: the card draws the tab in its
	   own panel, and the page is only how the url names it. It mounts in `$tab_slot`, a
	   hidden box `content()` makes. A request with the same name keeps the name. */
	tab_route(name){
		if (!this.tabbed() || !ROUTED.includes(name)) return null;
		const card = this;
		return new Page({
			title: TABS[name], classes: "ai2-tab-slot-page",
			activated(){ card.tab = name; card.redraw(); },
			deactivated(){ if (card.tab === name){ card.tab = "overview"; card.redraw(); } },
		});
	}

	/** Where those tab pages mount: a hidden box, so a tab url never moves anything on screen. */
	tab_slot(){
		this.$tab_slot = div.c("ai2-tab-slot").attr("hidden", "");
		this.regions ??= new Map();
		ROUTED.forEach(name => this.regions.set(name, this.$tab_slot));
	}

	/** The open tab: whichever tab page is routed — a tiny card's own list, or Overview · Tasks · Activity. */
	open_tab(){
		if (this.tiny()) return this.tab ?? "outline";
		return this.tab_names().includes(this.tab) ? this.tab : "overview";
	}

	/* A plain link: `tab_route()` makes Tasks and Activity real child urls, and the Router
	   does the rest. `.active` is drawn here from `open_tab()`, and `mark_links()` agrees. */
	tab_link(name){
		const n = name === "tasks" ? this.subs().length : 0;
		const on = this.open_tab() === name;
		a.c("tab" + (on ? " active" : "")).href(name === "overview" ? this.url : this.url + name + "/")
			.attr("role", "tab").attr("aria-selected", String(on))
			.text(TABS[name] + (n ? " · " + n : ""));
	}

	head(f, g, items){
		div.c("ai2-full-head flex v-center gap-25", () => {
			icon(this.icon ?? g?.icon ?? type_icon(f.type));
			div.c("ai2-full-name", () => {
				span.c("ai2-full-title").md(this.title ?? this.name);
				const { usd, open } = this.cost_now(g);
				state_span(items, usd, open);
			});
			// The picker, "clear" and "+ sub-card" write through Servex's card
			// routes; a Servex without them (not restarted yet) shows none of the three.
			this.actions();
		});
	}

	/* ONE MENU FOR WHAT YOU CAN DO TO A CARD (ai2-lead audit, 2026-09-25). The owner, on the
	   header it replaced: "a dropdown that says 'group': what is a group? If I switch it to
	   question, what does that do? I don't want to try." The kind picker, the lone ⚑ and
	   "clear" were three unlabelled controls; here each is a plain sentence. A card that IS
	   flagged still shows it in the head, since that is state, not an action. */
	actions(){
		const flag = this.flag_note, ready = cards_ready.known;
		if (flag) button.c("ai2-flag on").attr("type", "button").attr("title", "you flagged this — press to withdraw")
			.text("⚑ flagged").click(() => this.face().unflag());
		const now = this.facts().type;
		const items = [
			!flag && { text: "Flag it: this is wrong, say why", act: () => this.$box.append(() => { flag_box(this.face()); }) },
			ready && this.shell && { text: "Archive this card (nothing is deleted)", act: () => this.clear() },
			...(ready && !this.group_info() ? TYPES.filter(t => t !== now).map(t => ({ text: "Mark it as a " + t, act: () => this.retype(t) })) : []),
		].filter(Boolean);
		if (items.length) new Menu({ label: "Actions", items, onPick: it => it.act() }).ac("ai2-actions");
	}

	/** The outline: what it is, where it stands, what was asked and delivered. Everything
	 *  else — words, links, the folder — is one fold down. A request lists its own requests below. */
	overview(f, g, items, with_contents, with_placed = true){
		const line = about_line(this, g);
		if (line) p.c("ai2-ol-about").text(line);
		if (this.by_request()) this.request_outline(items);
		else outline(this, items);
		// A card nothing was asked in yet (a topic stub, a new sub-card) says so, instead of a blank page.
		if (!line && !items.length && !this.prompts?.length && !this.messages?.length)
			p.c("ai2-ol-about muted").text("Nothing has been asked here yet. Talk into this " + (this.parent instanceof Card ? "request" : "card") + " and your words land here.");
		if (this.flag_note) small.c("ai2-flag-said muted")
			.text("flagged" + (this.flag_note.quote ? " on “" + this.flag_note.quote + "”" : "") + " — " + (this.flag_note.note ?? ""));

		// A `place` line is drawn where it is placed, by the page's own log_draw().
		if (with_placed && this.placed?.length) div.c("page-log flow", () => { this.log_draw(); });

		const docs = this.md_names();
		if (docs.length) this.md_files(docs);

		this.more(f, g);
		if (with_contents) this.contents();
	}

	/* A CARD WITH REQUESTS IS SUMMED UP BY ITS REQUESTS (the owner, 2026-09-25: a day of landed
	   work read "0 Delivered"). Old cards have no `item` lines, so the checklist is the
	   requests themselves, each ticked by `load_groups()`'s delivered rule, under its group. */
	by_request(){ return !this.items?.size && this.subs().length > 0; }

	/* ⚠ A SUB-CARD IS NOT ALWAYS A REQUEST. System design's are topic stubs, `{"title", "icon"}`
	   and nothing else: no id, no class, nothing asked. So a row's title is read from the
	   sub-card's OWN file (`load_groups()`), and a sub-card nothing was asked in is a TOPIC —
	   listed, never counted as "to do". The card's own task pages (a group's members) are
	   counted beside its requests, as outline.js always did. */
	overview_items(g){
		if (!this.by_request()) return items_of(this, g);
		const subs = new Set(this.subs().map(s => this.id + "/" + s));
		const tasks = items_of(this, g).filter(i => !subs.has(i.id) && !/^p-/.test(i.id));
		return [...tasks.map(t => ({ ...t, proof: this.task_href(t.proof) })), ...this.request_items().filter(i => i.asked)];
	}

	/** A task's base (`2026-09-24/recipe-lab`) as the url of its task page. */
	task_href(base){ return !base || /^(\/|https?:)/.test(base) ? base : "/framework/ai/" + base + "/"; }

	/** A sub-card's title: its own title line, else the card list's, else its slug in words. */
	sub_title(slug){
		const s = this.shell?.ai2?.cards?.card(this.id + "/" + slug);
		const own = this.sub_meta?.get(slug)?.title ?? s?.title;
		return own ? String(own) : slug.replace(/-+/g, " ").replace(/^./, c => c.toUpperCase());
	}

	request_items(){
		const cards = this.shell?.ai2?.cards;
		return this.subs().map(slug => {
			const id = this.id + "/" + slug, s = cards?.card(id), m = this.sub_meta?.get(slug) ?? {};
			return { id, slug, title: short(this.sub_title(slug)), asked_at: m.created ?? s?.created, asked: !!m.asked,
				done: !!this.sub_done?.get(slug), proof: this.url + slug + "/" };
		});
	}

	/** Delivered · To do · All (the filter, as in outline.js), then each group with its rows, to do first. */
	request_outline(items){
		const subs = this.subs();
		this.load_groups(subs);
		if (!subs.every(s => this.sub_group?.has(s))) return void small.c("muted").text("Reading " + subs.length + " sub-cards…");
		if (items.length) this.checklist(items);
		// Topics: listed where nothing else lists them (System design's Concepts tiles already do).
		const topics = this.request_items().filter(i => !i.asked);
		if (topics.length && !this.placed?.length) div.c("ai2-toc-section ai2-topics", () => {
			div.c("ai2-toc-group muted").text("Topics · " + topics.length);
			div.c("ai2-ol-list", () => { topics.forEach(r => { this.request_row({ ...r, topic: true }); }); });
		});
	}

	checklist(items){
		const done = items.filter(i => i.done).length;
		const show = this.req_show ??= "all";
		div.c("ai2-ol ai2-ol-requests show-" + show, $box => {
			div.c("ai2-ol-grid", () => {
				[["done", "Delivered", done], ["open", "To do", items.length - done], ["all", "All", items.length]]
					.forEach(([k, name, n]) => { this.count_button($box, k, name, n); });
			});
			div.c("ai2-toc-groups", () => {
				this.item_sections(items).forEach(([name, rows]) => {
					rows.sort((x, y) => x.done - y.done);
					div.c("ai2-toc-section", () => {
						if (name) div.c("ai2-toc-group muted").text(name + " · " + rows.filter(r => r.done).length + " of " + rows.length + " delivered");
						div.c("ai2-ol-list", () => { rows.forEach(r => { this.request_row(r); }); });
					});
				});
			});
		});
	}

	/** `[[heading, rows], …]`: requests under their group in first-seen order, then the task pages, then the ungrouped. */
	item_sections(items){
		const by = new Map();
		const put = (k, it) => { if (!by.has(k)) by.set(k, []); by.get(k).push(it); };
		items.filter(i => i.slug).forEach(i => put(this.sub_group?.get(i.slug) ?? "", i));
		const loose = by.get("") ?? [];
		by.delete("");
		const tasks = items.filter(i => !i.slug);
		const out = [...by];
		if (tasks.length) out.push(["Task pages", tasks]);
		if (loose.length) out.push([out.length ? "Other" : "", loose]);
		return out.length === 1 && !by.size ? [["", out[0][1]]] : out;
	}

	/** One number that is also the filter: pressing it shows only those rows, redrawing nothing. */
	count_button($box, k, name, n){
		button.c("ai2-ol-count" + (this.req_show === k ? " on" : "")).attr("type", "button").attr("data-show", k)
			.attr("title", "show " + (k === "all" ? "everything" : name.toLowerCase()) + " in the list below")
			.append(() => { span.c("ai2-ol-n").text(String(n)); span.c("ai2-ol-name").text(name); })
			.click(() => {
				this.req_show = k;
				$box.el.classList.remove("show-all", "show-open", "show-done");
				$box.el.classList.add("show-" + k);
				$box.el.querySelectorAll(".ai2-ol-count").forEach(b => b.classList.toggle("on", b.dataset.show === k));
			});
	}

	request_row(r){
		div.c("ai2-ol-row" + (r.topic ? " topic" : r.done ? " done" : " open") + (r.live ? " live" : ""), () => {
			span.c("ai2-ol-mark").text(r.topic ? "•" : r.done ? "✓" : "☐");
			if (r.proof) a.c("ai2-ol-title page-link").href(r.proof).text(r.title);
			else span.c("ai2-ol-title").text(r.title);
			small.c("ai2-ol-time muted").text(r.asked_at ? when(r.asked_at) : "");
		});
	}

	/** One fold for what the outline leaves out: the tidied dictation, the full words, links, the card's folder. */
	more(f, g){
		details.c("ai2-more", () => {
			summary.c("ai2-more-head muted").text(this.more_label());
			if (this.refined?.text) div.c("ai2-text md", $t => { md_into($t.el, this.refined.text); });
			if (this.text) div.c("ai2-text md", $t => { md_into($t.el, this.text); });
			if (this.description) div.c("ai2-text md", $t => { md_into($t.el, this.description); });
			if (this.links?.length) div.c("ai2-links flex wrap gap-25", () => {
				this.links.forEach(l => { a.c("ai2-link page-link").href(l.url).text(l.label ?? l.url); });
			});
			small.c("muted").text([!g && role_word(this.by), when(this.created), ...f.tags.map(t => "#" + t)].filter(Boolean).join(" · "));
			if (!this.has_tasks()){ this.cost_block(g); agents_panel(this.id); }
			this.draw_folder();
		});
	}

	/* THE FOLD SAYS WHAT IS IN IT (the owner, 2026-09-25, on "More: this card's files, its full
	   words, what it cost": "what does that mean… when I click this what am I supposed to expect").
	   Built from what is actually inside, so it never promises something absent. */
	more_label(){
		const words = [this.refined?.text, this.text, this.description].filter(Boolean).join(" ").split(/s+/).filter(Boolean).length;
		const n = this.links?.length ?? 0;
		return "Show " + [words && "the full text (" + words + " words)", n && n + (n === 1 ? " link" : " links"),
			!this.has_tasks() && "who worked on it", "the files in this card's folder"].filter(Boolean).join(", ");
	}

	/* WHAT THIS CARD COST (the owner, 2026-09-24: "What took so many tokens?").
	   A group: one row per member task — its mastermind, its minions, its total —
	   and the group's sum, each dollar once. A task card: its one line. Who spent
	   it, agent by agent with each model, is the task page's own Report tab just
	   below (`ext/AITask/cost.js` `breakdown()`), so it is drawn once, not twice.
	   A card with no task shows nothing: nothing measured it. */
	/* ⚠ WHAT THE COST BLOCK DRAWS, AS DATA — and `draw_sig()` reads it too. The
	     signature skips a redraw that would paint the same pixels, and it did not
	     list cost: the card drew once before the group's task logs had loaded (no
	     rows, so no table), and when the cost lines arrived the signature said
	     "unchanged" and the table never appeared (live, 2026-09-24).
	   Rows sort by cost, largest first: that answers the question, and a task's
	   `now` moving (which reorders `members()`) is no reason to redraw. */
	cost_model(g){
		const groups = this.shell?.ai2?.groups;
		if (!groups) return null;
		if (!g) return { line: cost_line(groups.task_member(task_of(this))) };
		const rows = groups.members(g.id).filter(m => m.kind === "task").map(m => face_row(groups, m))
			.sort((a, b) => (b.usd ?? -1) - (a.usd ?? -1) || a.title.localeCompare(b.title));
		const s = groups.cost(g.id);
		return { rows, sum: { usd: s.usd, tracked: s.tracked, untracked: s.untracked, open: !!s.open } };
	}

	cost_block(g){
		const model = this.cost_model(g);
		if (!model) return;
		if (!g) return;
		const { rows, sum } = model;
		if (!rows.length) return;
		group_faces(rows, sum, this.face_state ??= {});
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

	/* THE TABLE OF CONTENTS — this card's requests (its sub-cards), each a row that
	   opens beside it, and the one button that makes another. Grouped under a heading
	   per `{"group": …}` line on each request; with no groups, one flat list. */
	contents(){
		const subs = this.subs();
		this.load_groups(subs);
		div.c("ai2-toc ai2-card-toc", () => {
			div.c("ai2-toc-head flex v-center gap-25", () => {
				small.c("muted").text(subs.length ? subs.length + (subs.length === 1 ? " request" : " requests") : this.parent instanceof Card ? "" : "no requests yet");
				if (cards_ready.known) this.sub_adder();
			});
			// Drawn once every request's group is known, so the rows never reshuffle under you.
			// Each group is a column of its own; a wide screen sets them side by side.
			if (subs.length && subs.every(s => this.sub_group?.has(s))) div.c("ai2-toc-groups", () => {
				this.sections(subs).forEach(([name, slugs]) => { div.c("ai2-toc-section", () => {
					if (name) div.c("ai2-toc-group muted").text(name + " · " + slugs.length);
					div.c("ai2-toc-rows", () => {
						slugs.forEach(slug => {
							const id = this.id + "/" + slug;
							const known = this.shell?.ai2?.cards?.card(id), m = this.sub_meta?.get(slug) ?? {};
							const s = { id, type: m.asked ? "request" : "note", created: m.created, ...known, title: this.sub_title(slug) };
							card_link(this.sub_done?.get(slug) ? { ...s, status: "done" } : s, this.url + slug + "/");
						});
					});
				}); });
			});
		});
	}

	/** `[[heading, slugs], …]` in the order the groups first appear; the ungrouped last, as "Other". */
	sections(subs){
		const by = new Map();
		subs.forEach(s => {
			const name = this.sub_group.get(s) ?? "";
			if (!by.has(name)) by.set(name, []);
			by.get(name).push(s);
		});
		if (by.size === 1) return [["", subs]];
		const loose = by.get("");
		by.delete("");
		return [...by, ...(loose ? [["Other", loose]] : [])];
	}

	/* A request's group is a line in its OWN log, so each is read from its file,
	   latest wins. Only the unknown are fetched; `activated()` re-reads them all,
	   so a group line written while you were away shows when you come back.
	   ⚠ Only a line that is `{"group": "…"}` alone counts — the same test groups.js uses.
	   The same read says whether the request was DELIVERED (the owner, 2026-09-25): its
	   latest status is done, or a manager's message begins "Landed" (or "Done"), or an item line is done. */
	load_groups(subs, all){
		const known = this.sub_group ??= new Map();
		const delivered = this.sub_done ??= new Map();
		const meta = this.sub_meta ??= new Map();
		const want = all ? subs : subs.filter(s => !known.has(s));
		if (!want.length || this.groups_loading) return;
		const read = slug => fetch(this.folder_url() + slug + "/page.jsonl", { cache: "no-store" })
			.then(r => (r.ok ? r.text() : "")).catch(() => "")
			.then(text => {
				let name = null, status = null, done = false, asked = false, title = null, created = null;
				for (const line of text.split("\n")){
					let o;
					try { o = JSON.parse(line); } catch { continue; }
					if (!o || typeof o !== "object") continue;
					if (typeof o.group === "string" && Object.keys(o).length === 1) name = o.group;
					if (typeof o.status === "string") status = o.status;
					// The title is the latest plain title line, never a refined reading's.
					if (typeof o.title === "string" && o.type !== "refined") title = o.title;
					created ??= o.created ?? null;
					// Asked: someone's words, a reply, an outline item, or a card made AS an ask.
					if (o.prompt || o.message || o.item || ASKS.has(o.type)) asked = true;
					const m = o.message;
					if (m && /^manager-/.test(m.by ?? "") && /^\s*(Landed|Done)\b/i.test(m.text ?? "")) done = true;
					if (o.item?.done) done = true;
				}
				known.set(slug, name);
				meta.set(slug, { title, created, asked: asked || !!status });
				delivered.set(slug, done || DONE.has(status));
			});
		this.groups_loading = Promise.all(want.map(read)).then(() => { this.groups_loading = null; this.redraw(); });
	}

	/* ⚠ `held` stops every redraw while the title is being typed — a live line
	   landing mid-sentence would otherwise tear the input down under you. */
	sub_adder(){
		const $slot = span.c("ai2-sub-add");
		const idle = () => $slot.empty(() => {
			button.c("ai2-word").attr("type", "button")
				.attr("title", "one thing to ask inside this card — it opens beside it").text("+ request").click(ask);
		});
		const ask = () => {
			this.held = true;
			$slot.empty(() => {
				const $in = input().attr("placeholder", "what is it? Enter makes it, Esc cancels").ac("ai2-sub-input");
				$in.on("keydown", e => {
					if (e.key === "Escape"){ this.held = false; idle(); return; }
					if (e.key !== "Enter") return;
					$in.el.disabled = true;
					this.add_sub($in.el.value.trim() || "New request");
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
		this.app?.router?.go(workspace.url(this.url + made.id.split("/").at(-1) + "/"));
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
		if (kind === "task" || kind === "update" || kind === "clear" || kind === "ask") return { ...m, type: kind };
		return { type: "reply", id: m.id, at: m.at, by: m.by, heading: m.heading, text: m.text ?? m.name ?? m.title };
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
		// The rail's own time for this card: while you are ON Activity, a newer one is seen too.
		this.row_at = it?.at;
		if (this.shows_tabs() && this.tab === "activity" && this.seen_from) this.saw(it?.at);
		const flag = it?.flag ?? null;
		if (JSON.stringify(flag) === JSON.stringify(this.flag_note ?? null)) return;
		this.flag_note = flag;
		this.redraw();
	}

	// ⚠ `activated()`, not `content()`: the view is cached, so a card you come
	// back to has to re-register and pick up titles that changed meanwhile.
	activated(){
		this.seen_from = null;   // each visit marks what is new since the last one (activity_tab)
		this.handle = this.shell?.ai2?.open({ id: this.id, draw: it => this.flag_changed(it), on: this.face(), $box: this.$box });
		// The sub-cards' titles come off AI 2's card list, which refreshes on its own clock.
		this.stop_list = this.shell?.ai2?.cards?.on(() => this.redraw());
		// A member landing, or a task's `now` moving, reorders a group's sections.
		this.stop_groups = this.shell?.ai2?.groups?.on(() => this.redraw());
		if (this.tabbed()) this.load_groups(this.subs(), true);
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
		kid.id ??= id;
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
			// A day's cards are KEYED rows: a card whose summary changed is replaced
			// alone, one that is gone is removed, the rest are never touched. The
			// coarser levels (month, year) are a few count rows, redrawn whole — but
			// only when their own cards changed.
			let sig;
			const rows = new Map();
			const draw = () => {
				const mine = (this.shell?.ai2?.cards?.cards ?? []).filter(c => c.id.startsWith(this.id + "/"));
				// month and year rows only show counts, so only the ids matter there
				const next = this.level() < 3 ? mine.map(c => c.id).join() : JSON.stringify(mine);
				if (next === sig) return;
				sig = next;
				if (this.level() < 3 || !mine.length){ rows.clear(); return void $box.empty(() => { this.folder_rows(); }); }
				const want = mine.filter(c => c.id.split("/").length === 4);
				if (!rows.size) $box.empty();
				const ids = new Set(want.map(c => c.id));
				rows.forEach((rec, id) => { if (!ids.has(id)){ rec.el.remove(); rows.delete(id); } });
				want.forEach(c => {
					const s = JSON.stringify(c), old = rows.get(c.id);
					if (old?.sig === s) return;
					$box.append(() => { card_link(c, this.url + c.id.split("/").at(-1) + "/"); });
					const el = $box.el.lastElementChild;
					if (old) old.el.replaceWith(el);
					rows.set(c.id, { sig: s, el });
				});
				const have = [...$box.el.children];
				const order = want.map(c => rows.get(c.id).el);
				if (have.length !== order.length || order.some((el, i) => el !== have[i])) order.forEach(el => $box.el.appendChild(el));
			};
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
