import { Page, View, div, p, span, small, a, button, input, select, option, details, summary } from "/app.js";
import { icon, table, thead, tbody, tr, th, td } from "/framework/core/View/View.js";
import List from "/framework/core/List/List.js";
import { Faces } from "./Faces.js";
import { money, cost_of, summary_line as cost_line } from "/framework/ai/AITask/cost.js";
import { Tasks } from "./Tasks.js";
import CardDir from "./CardDir.js";

import grip from "/framework/ext/grip/grip.js";
import Menu from "/framework/ux/Menu/Menu.js";
import { CardChat, md_into } from "./CardChat.js";
import { Compose } from "./Compose.js";
import { Agents } from "./Agents.js";
import { Outline } from "./Outline.js";
import { author_word, role_word, type_icon, create_card, append_card, cards_ready } from "../rail/inbox.js";
import { Needs } from "../rail/Needs.js";
import "/framework/ui/row/row.js";   // .ui-row: the sub-card list rows
import "/framework/ext/tabs/tabs.js";   // for its stylesheet: a card's tab strip wears .tabs / .tab-bar / .tab
import { Activity } from "./Activity.js";
import { Rules } from "./Rules.js";
import floating from "./floating.js";
import workspace from "./workspace.js";

View.stylesheet("/framework/ux/Card/Card.css");


const TABS = { overview: "Overview", tasks: "Tasks", activity: "Activity" };

const ROUTED = ["tasks", "activity"];



export const TYPES = ["question", "request", "sub-question", "note", "task"];


const VERBS = new Set(["type", "tags", "status", "message", "prompt", "attach", "detach", "legacy", "cites", "item", "chat", "state", "checklist", "objects", "preview"]);



export const summary_line = s => [s.type, s.status && s.status !== "open" && s.status,
	...(s.tags ?? []).map(t => "#" + t), Faces.when(s.last ?? s.created)].filter(Boolean).join(" · ");

const ASKS = new Set(["question", "request", "sub-question", "task"]);
const DONE = new Set(["done", "closed", "resolved", "answered", "landed", "complete", "completed"]);

// Local time with offset, like every other write on a card (not toISOString's UTC "Z").
const stamp = () => {
	const d = new Date(), off = -d.getTimezoneOffset(), p = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off < 0 ? "-" : "+") + p(Math.trunc(off / 60)) + ":" + p(off % 60);
};

export function card_link(s, href){
	const done = DONE.has(s.status);
	a.c("ui-row ai2-toc-row page-link" + (done ? " ai2-toc-done" : "")).href(href).append(() => {
		icon(done ? "check_box" : type_icon(s.type));
		div.c("ai2-toc-body", () => {
			span.c("ai2-toc-title").text(s.title || s.id.split("/").at(-1));
			small.c("ai2-toc-line muted").text(summary_line(s));
		});
	});
}

export default class Card extends Page {

	static base = "/framework/ai/";

	/* Off by default: the global AI talks into the card now. doc/notes.md#one-ai */
	static V1 = false;


	chat_v1(){ return !!this.constructor.V1 || new URLSearchParams(location.search).get("chat") === "v1"; }

	assign(...args){
		for (const obj of args) if (obj) for (const key of Object.keys(obj))
			VERBS.has(key) ? this[key](obj[key]) : (this[key] = obj[key]);
		return this;
	}

	initialize(){ this.classes ??= "ai2-card-page"; }

	// ⚠ A refined line is kept whole (latest wins), never assigned: its type/text/by would overwrite the card's own.

	set(obj){
		if (obj?.type === "refined"){ this.refined = obj; return this; }
		// ⚠ Redirect EVERY content line, not just the first: doc/notes.md#content-redirect
		if ("content" in obj){
			const { content, ...rest } = obj;
			if (!(this.dashboard instanceof List)){
				this.dashboard = new List({ owner: this, name: "dashboard" });
				["add", "remove", "move", "order"].forEach(verb => this.dashboard.on(verb, () => this.redraw()));
			}
			this.dashboard.set(content);
			return super.set(rest);
		}
		return super.set(obj);
	}


	dashboard_list(){
		if (!(this.dashboard instanceof List)) return;
		return this.render_content_list(this.dashboard);
	}


	facts(){ return this.info ??= { type: "card", tags: [], status: "open" }; }

	type(t){ this.facts().type = t; }
	tags(t){ this.facts().tags = [].concat(t ?? []); }
	status(s){ this.facts().status = s; }

	message(m){
		(this.messages ??= []).push(m);
		this.talk?.sync();
	}


	prompt(pr){
		const list = this.prompts ??= [];
		const had = pr?.id && list.find(x => x.id === pr.id);
		if (had) Object.assign(had, pr);
		else list.push({ ...pr });
		this.talk?.sync();
	}


	item(it){
		if (!it?.id) return;
		const list = this.outline_items ??= new Map();
		list.set(it.id, { ...list.get(it.id), ...it });
		this.talk?.sync();
	}


	state(st){
		this._state = st;
		this.talk?.sync();
	}


	checklist(items){
		if (Array.isArray(items)){
			this.checklist_items = items;
			this.talk?.sync();
			return;
		}
		this.render_checklist(items);
	}


	objects(mod){
		this._objects = mod;
		this.talk?.sync();
	}


	preview(text){
		this._preview = String(text ?? "").slice(0, 60);
		this.talk?.sync();
	}


	chat(line){
		if (!line?.level) return;
		const list = this.chats ??= [];
		const had = line.at != null && list.find(c => c.at === line.at);
		had ? Object.assign(had, line) : list.push({ ...line });
		this.talk?.sync();
	}

	attach(agent){ const list = this.attached ??= []; if (!list.includes(agent)) list.push(agent); }
	detach(agent){ this.attached = (this.attached ?? []).filter(x => x !== agent); }
	legacy(id){ (this.legacies ??= []).push(id); }
	cites(refs){ const list = this.citing ??= []; [].concat(refs).forEach(r => { if (!list.includes(r)) list.push(r); }); }


	log_forget(){
		super.log_forget();
		this.info = null;
		this.messages = [];
		this.prompts = [];
		this.outline_items = new Map();
		this.attached = [];
		this.legacies = [];
		this.citing = [];
		this.refined = null;
		this.chats = [];
		this._state = null;
		this.checklist_items = null;
		this._objects = null;
		this._preview = null;
	}


	folder_url(){ return String(this.jsonl_url ?? "").replace(/page\.jsonl$/, ""); }


	md_dir(){ return this.folder_url(); }


	open_link(link){ return this.swap_link(link); }


	md_names(){
		const placed = (this.placed ?? []).map(e => typeof e === "string" ? e : e.module);
		return [...(this.listed?.values() ?? [])].filter(n => /\.md$/i.test(n) && !n.includes("/") && !placed.includes(n));
	}


	subs(){ return [...(this.child_kinds?.keys() ?? [])]; }

	// ⚠ Core reads a listed child from AI 2's address; a sub-card is read from its FOLDER: doc/notes.md#sub-cards

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


	content(){
		const shell = this.shell;
		const sub = this.parent instanceof Card;

		if (shell) this.$pages = shell.$sub;

		if (sub) this.breadcrumb();
		else a.c("ai2-back page-link").href(shell?.url ?? "/framework/ai2/").text("← all cards");


		div.c("ai2-full", () => {
			const body = () => {
				this.$box = div.c("ai2-full-card", () => { this.draw(); });
				if (this.tiny()) this.tab_panel();
				else if (!sub) this.tab_slot();
				this.$tasks = div.c(("ai2-tasks " + (this.tiny() ? this.tab_classes ?? "" : "")).trim());
			};
			if (this.in_workspace()) this.ws = floating(null, { nav: this.ws_nav(), content: body });
			else body();
		});
		this.fill_tasks();

		const fresh = !!shell && shell.opening === this.id;
		if (this.chat_v1()){
			div.c("ai2-foot", () => {
				this.talk = CardChat.chat({ source: () => this.chat_entries(), re: () => this.id });
				if (fresh) shell.opening = null;
				this.$composer = Compose.composer({
					re: () => this.id,
					placeholder: sub ? "talk into this request" : "talk into this card",
					on_text: text => this.talk.echo(text),

					on_send_start: text => { this.talk.live({ text }); this.talk.live({ text: "", sent: true }); },
					autostart: fresh && shell.auto_transcribe?.(),
				});

				Card.seam("--ai2-chat", "ai2-chat-w", 240, () => innerWidth * 0.5);
			});
		} else {
			this.properties_sidebar(sub);

			if (fresh){
				shell.opening = null;
				if (shell.auto_transcribe?.() && matchMedia?.("(max-width: 52em)")?.matches)
					import("/framework/ext/drawer/rail.js").then(m => m.default(this.app)?.open_sheet());
			}
		}

		if (sub) Card.seam("--ai2-subw", "ai2-sub-w", 320, () => innerWidth - 700, () => this.hold_chat());
		this.talk?.sync();
	}


	breadcrumb(){
		const chain = [];
		for (let p = this.parent; p instanceof Card; p = p.parent) chain.unshift(p);
		div.c("ai2-crumbs", () => {
			chain.forEach(p => { a.c("ai2-back ai2-sub-back page-link").href(p.url).text("← " + (p.title ?? p.name)); });
		});
	}


	properties_sidebar(sub){
		const f = this.facts();

		const { usd, open } = this.cost_now(this.group_info());
		div.c("ai2-foot ai2-foot-chat ai2-props", () => {
			div.c("ai2-props-row", () => { span.c("muted").text("Type"); this.type_picker(); });
			div.c("ai2-props-row", () => { span.c("muted").text("Status"); span(f.status ?? "open"); });
			div.c("ai2-props-row", () => { span.c("muted").text("Cost"); span(usd != null ? money(usd) + (open ? "+" : "") : "not tracked"); });
			if (f.tags.length) div.c("ai2-props-row", () => {
				span.c("muted").text("Tags");
				div.c("flex wrap gap-25", () => { f.tags.forEach(t => { span.c("ai2-chip").text("#" + t); }); });
			});
			div.c("ai2-props-section", () => {
				div.c("ai2-props-head muted").text("Who worked on it");
				Agents.panel(this.id);
			});
			div.c("ai2-props-section", () => {
				div.c("ai2-props-head muted").text("Files in this " + (sub ? "request's" : "card's") + " folder");
				this.draw_folder();
			});
			div.c("ai2-props-section ai2-props-actions", () => { this.actions(); });
			Card.seam("--ai2-chat", "ai2-chat-w", 200, () => innerWidth * 0.3);
		});
	}


	hold_chat(){
		const shell = document.querySelector(".ai2");
		const foot = this.view?.el.querySelector(":scope > .ai2-foot");
		if (!shell || !foot?.offsetWidth || shell.style.getPropertyValue("--ai2-chat")) return;
		shell.style.setProperty("--ai2-chat", foot.offsetWidth + "px");
	}


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


	log_redraw(){
		this.redraw();
		this.shell?.ai2?.cards_changed?.();
	}


	draw_sig(){
		const cards = this.shell?.ai2?.cards;
		return JSON.stringify([this.layout, this.facts(), this.title, this.name, this.icon, this.by, this.created, this.text,

			Needs.for_card(this.id).map(n => n.ask).join(","),
			this.description, this.links, this.flag_note, this.attached?.length, this.md_names(), this.placed, [...this.listed?.values() ?? []], cards_ready.known,
			this.group_info(), this.subs().map(s => cards?.card(this.id + "/" + s) ?? s), this.cost_model(this.group_info()),
			Agents.agent_cost(this.id, () => this.redraw()), this.shell?.ai2?.groups?.task_member(Tasks.task_of(this))?.landed_at,
			!this.tiny() && this.shows_tabs() && this.open_tab(), [...(this.sub_group ?? [])], [...(this.sub_done ?? [])], [...(this.sub_meta ?? [])], this.refined?.text, this.prompts?.[0]?.text, [...(this.outline_items?.values() ?? [])], this.chats]);
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
		if (!this.chat_v1()) this.sync_global_ai();
	}


	sync_global_ai(){
		import("/framework/ext/drawer/rail.js").then(m => {
			const sheet = m.default(this.app)?.$sheet;
			if (sheet?.card_id === this.id) sheet.talk?.sync();
		});

		import("/framework/ext/drawer/tabs/ai.js").then(m => m.sync_card_thread?.(this.id));
	}

	/** This card's groups.json row, else null. ⚠ Not group(): a {"group": …} data line would overwrite that method. */
	group_info(){ return this.shell?.ai2?.groups?.by_card?.get(this.id) ?? null; }


	task_list(){
		const g = this.group_info();
		if (g) return this.shell.ai2.groups.members(g.id).filter(m => m.kind !== "said");
		return this.shell?.ai2?.groups?.task_at(Tasks.task_of(this)) ?? [];
	}

	fill_tasks(){

		const g = this.group_info();

		if (this.$tasks) this.$tasks.el.hidden = this.shows_tabs() && (this.has_tasks() ? this.open_tab() !== "tasks" : this.open_tab() === "activity");
		if (this.$tasks) Tasks.task_region(this.$tasks, this.task_list().filter(m => !g || m.kind !== "task"), this.task_state ??= {}, { head: !!g });
	}


	draw(){
		const f = this.facts();
		const g = this.group_info();
		const items = this.overview_items(g);
		this.head(f, g, items);

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


	activity_tab(){
		const since = this.seen_from ??= Activity.seen(this.id);
		const g = this.group_info();
		div.c("ai2-activity-box", $box => {
			small.c("muted").text("Reading this card's log…");
			Activity.card_events(this.id, this.drawn_sig).then(evs => {
				const all = [...evs, ...(g ? this.member_events(g) : [])];
				$box.empty(() => { Activity.activity_list(all, since); });
				this.saw(...all.map(e => e.at), this.row_at, g && this.shell?.ai2?.groups?.at(g));
			});
		});
	}


	member_events(g){
		return this.shell.ai2.groups.members(g.id).filter(m => m.kind !== "said").map(m => ({
			at: m.at, where: m.kind === "task" && m.landed ? null : m.title,
			who: m.kind === "task" ? (m.landed ? "task landed" : "task") : "card",
			what: m.kind === "task" && m.landed ? m.title : (m.words || "updated"),
		}));
	}


	saw(...ats){
		const t = Math.max(0, ...ats.map(a => Date.parse(a ?? 0) || 0));
		if (t && Activity.mark_seen(this.id, new Date(t).toISOString())) this.shell?.ai2?.repaint?.();
	}


	tasks_tab(g){
		this.contents();
		this.cost_block(g);
		Agents.panel(this.id);
	}


	cost_now(g){
		const groups = this.shell?.ai2?.groups;
		if (g){ const s = groups?.cost(g.id); return s?.tracked ? { usd: s.usd, open: !!s.open } : {}; }
		const c = cost_of(groups?.task_member(Tasks.task_of(this)));
		return c ? { usd: c.usd, open: !!c.open } : { usd: Agents.agent_cost(this.id, () => this.redraw()) };
	}

	tabbed(){ return !(this.parent instanceof Card); }


	shows_tabs(){ return this.tabbed(); }
	has_tasks(){ return this.tabbed() && (this.tiny() || !!this.group_info() || this.subs().length > 0); }
	tab_names(){ return Object.keys(TABS).filter(name => name !== "tasks" || this.has_tasks()); }


	tiny(){ return this.layout === "tabs" && this.tabbed(); }

	/** `[{ key, label, draw }]`, in order. ⚠ A tab never takes a request's name; it becomes `<name>-tab`. */
	tab_list(){
		const list = [{ key: "outline", label: "Outline", draw: () => {
			const g = this.group_info();
			this.overview(this.facts(), g, Outline.items_of(this, g), false, false);
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


	tab_classes_of(){ return ("ai2-tab-page " + (this.tab_classes ?? "")).trim(); }


	tab_fill(name){ this.tab_list().find(t => t.key === name)?.draw(); }


	tab_panel(){
		this.$tab_panel = div.c("ai2-tiny-panel").attr("role", "tabpanel");
		this.regions ??= new Map();
		this.tab_list().forEach(t => this.regions.set(t.key, this.$tab_panel));
		const outline = this.children.get("outline") ?? this.add("outline", this.route("outline"));
		this.$tab_panel.append(() => { outline.assign({ app: this.app }).render().ac("default"); });
	}


	tab_shown(name){
		this.tab = name ?? "outline";
		this.view?.el.querySelectorAll(":scope > .ai2-full > .ai2-full-card .ai2-tiny-tab").forEach(el =>
			el.setAttribute("aria-selected", String(el.dataset.tab === this.tab)));
		this.ws?.nav(this.ws_nav());
		this.fill_tasks();
	}


	in_workspace(){ return workspace.on && this.tabbed(); }


	ws_nav(){
		const tab = this.open_tab(), n = this.subs().length;
		const tabs = this.tiny()
			? this.tab_list().map(t => ({ label: t.label, href: t.key === "outline" ? this.url : this.url + t.key + "/", active: t.key === tab }))
			: this.tab_names().map(name => ({ label: TABS[name] + (name === "tasks" && n ? " · " + n : ""),
				href: name === "overview" ? this.url : this.url + name + "/", active: name === tab }));
		const subs = this.subs().map(s => ({ label: this.sub_title(s), href: this.url + s + "/" }));
		return [...tabs, ...(subs.length ? [{ label: "Sub-cards" }, ...subs] : [])];
	}


	tab_redraw(){
		this.children.forEach((page, name) => {
			if (page?.$body) page.$body.empty(() => { this.tab_fill(name); });
		});
	}


	tab_route(name){
		if (!this.tabbed() || !ROUTED.includes(name)) return null;
		const card = this;
		return new Page({
			title: TABS[name], classes: "ai2-tab-slot-page",
			activated(){ card.tab = name; card.redraw(); },
			deactivated(){ if (card.tab === name){ card.tab = "overview"; card.redraw(); } },
		});
	}


	tab_slot(){
		this.$tab_slot = div.c("ai2-tab-slot").attr("hidden", "");
		this.regions ??= new Map();
		ROUTED.forEach(name => this.regions.set(name, this.$tab_slot));
	}


	open_tab(){
		if (this.tiny()) return this.tab ?? "outline";
		return this.tab_names().includes(this.tab) ? this.tab : "overview";
	}


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
				Outline.state_span(items, usd, open);
			});
			this.reviewed_control();
		});
	}


	reviewed_control(){
		if (!Needs.for_card(this.id).some(n => n.ask === "card" || n.ask === "last")) return;
		button.c("ai2-reviewed").attr("type", "button")
			.attr("title", "clear this — it no longer needs your review")
			.text("Reviewed ✓")
			.click(async () => {
				await append_card(this.id, { reviewed: { at: stamp(), by: "owner" } });
				await Needs.soon();
				this.redraw();
			});
	}


	actions(){
		const flag = this.flag_note, ready = cards_ready.known;
		if (flag) button.c("ai2-flag on").attr("type", "button").attr("title", "you flagged this — press to withdraw")
			.text("⚑ flagged").click(() => this.face().unflag());
		const now = this.facts().type;
		const items = [
			!flag && { text: "Flag it: this is wrong, say why", act: () => this.$box.append(() => { Faces.flag_box(this.face()); }) },
			ready && this.shell && { text: "Archive this card (nothing is deleted)", act: () => this.clear() },
			...(ready && !this.group_info() ? TYPES.filter(t => t !== now).map(t => ({ text: "Mark it as a " + t, act: () => this.retype(t) })) : []),
		].filter(Boolean);
		if (items.length) new Menu({ label: "Actions", items, onPick: it => it.act() }).ac("ai2-actions");
	}


	refinements(){
		const chats = this.chats ?? [];
		if (!chats.length) return;
		// `at` is an ISO string from Servex (a number in older lines): compare as times, never subtract strings.
		const t = c => typeof c.at === "number" ? c.at : Date.parse(c.at) || 0;
		const by_time = (a, b) => t(b) - t(a);
		const points = chats.filter(c => c.level === "summary" || c.level === "edit").sort(by_time);
		const clean = chats.filter(c => c.level === "clean").sort(by_time);
		if (!points.length && !clean.length) return;
		if (points.length) div.c("flow", () => {
			points.forEach(c => div.c("ai2-refined md", $t => { md_into($t.el, c.text); }));
		});
		if (clean.length) details.c("ai2-more", () => {
			summary.c("ai2-more-head muted").text("What was said, cleaned up");
			clean.forEach(c => div.c("ai2-text md", $t => { md_into($t.el, c.text); }));
		});
	}


	overview(f, g, items, with_contents, with_placed = true){
		this.dashboard_list();

		// The card standard: ai/doc/ai2/card-standard.md
		const line = Outline.about_line(this, g);
		if (line) p.c("ai2-ol-about").text(line);

		if (this._state) div.c("ai2-card-state", () => {
			span.c("ai2-state-dot").text("●");
			span.c("ai2-state-text").text(" " + this._state);
		});

		if (this.listed?.size || this.jsonl_url) div.c("ai2-card-folder", () => {
			this.draw_folder();
		});

		if (this._objects) div.c("ai2-card-objects", $box => {
			div.c("ai2-objects-head muted").text("Objects");
			const objPath = String(this._objects);
			if (objPath === "/Servex/" || objPath === "/Servex"){
				import("/framework/ux/Objects/Objects.js").then(({ default: Objects }) => {
					fetch("/api/objects").then(r => r.ok ? r.json() : null).then(data => {
						if (data) $box.append(() => Objects.of(data));
						else $box.append(() => a.c("ai2-objects-link page-link").href("/api/objects").text("Servex (offline)"));
					}).catch(() => {
						$box.append(() => a.c("ai2-objects-link page-link").href("/api/objects").text("Servex"));
					});
				}).catch(() => {
					$box.append(() => a.c("ai2-objects-link page-link").href(objPath).text(objPath));
				});
			} else if (!objPath.startsWith("/")){
				import("/framework/ux/Objects/Objects.js").then(({ default: Objects }) => {
					import(objPath).then(mod => {
						$box.append(() => Objects.of(mod.default ?? mod));
					}).catch(() => {
						$box.append(() => a.c("ai2-objects-link page-link").href(objPath).text(objPath));
					});
				}).catch(() => {
					$box.append(() => a.c("ai2-objects-link page-link").href(objPath).text(objPath));
				});
			} else {
				a.c("ai2-objects-link page-link").href(objPath).text(objPath);
			}
		});

		if (this.checklist_items?.length) this.render_checklist();
		else if (this.by_request()) this.request_outline(items);
		else Outline.outline(this, items);


		if (!line && !this._state && !this._objects && !items.length && !this.prompts?.length && !this.messages?.length && !this.chats?.length)
			p.c("ai2-ol-about muted").text("Nothing has been asked here yet. Talk into this " + (this.parent instanceof Card ? "request" : "card") + " and your words land here.");
		if (this.flag_note) small.c("ai2-flag-said muted")
			.text("flagged" + (this.flag_note.quote ? " on “" + this.flag_note.quote + "”" : "") + " — " + (this.flag_note.note ?? ""));


		if (with_placed && this.placed?.length) div.c("page-log flow", () => { this.log_draw(); });

		const docs = this.md_names();
		if (docs.length) this.md_files(docs);

		this.refinements();
		this.more(f, g);
		if (with_contents) this.contents();
	}


	by_request(){ return !this.outline_items?.size && this.subs().length > 0; }

	/* ⚠ A sub-card is not always a request (topic stubs have no id, nothing asked): doc/notes.md#topics */
	overview_items(g){
		if (!this.by_request()) return Outline.items_of(this, g);
		const subs = new Set(this.subs().map(s => this.id + "/" + s));
		const tasks = Outline.items_of(this, g).filter(i => !subs.has(i.id) && !/^p-/.test(i.id));
		return [...tasks.map(t => ({ ...t, proof: this.task_href(t.proof) })), ...this.request_items().filter(i => i.asked)];
	}


	task_href(base){ return !base || /^(\/|https?:)/.test(base) ? base : "/framework/ai/" + base + "/"; }


	sub_title(slug){
		const s = this.shell?.ai2?.cards?.card(this.id + "/" + slug);
		const own = this.sub_meta?.get(slug)?.title ?? s?.title;
		return own ? String(own) : slug.replace(/-+/g, " ").replace(/^./, c => c.toUpperCase());
	}

	request_items(){
		const cards = this.shell?.ai2?.cards;
		return this.subs().map(slug => {
			const id = this.id + "/" + slug, s = cards?.card(id), m = this.sub_meta?.get(slug) ?? {};
			return { id, slug, title: Outline.short(this.sub_title(slug)), asked_at: m.created ?? s?.created, asked: !!m.asked,
				done: !!this.sub_done?.get(slug), proof: this.url + slug + "/" };
		});
	}


	request_outline(items){
		const subs = this.subs();
		this.load_groups(subs);
		if (!subs.every(s => this.sub_group?.has(s))) return void small.c("muted").text("Reading " + subs.length + " sub-cards…");
		if (items.length) this.checklist(items);

		const topics = this.request_items().filter(i => !i.asked);
		if (topics.length && !this.placed?.length) div.c("ai2-toc-section ai2-topics", () => {
			div.c("ai2-toc-group muted").text("Topics · " + topics.length);
			div.c("ai2-ol-list", () => { topics.forEach(r => { this.request_row({ ...r, topic: true }); }); });
		});
	}

	render_checklist(items){
		if (Array.isArray(this.checklist_items) && this.checklist_items.length){
			const items_list = this.checklist_items;
			div.c("ai2-ol ai2-ol-checklist", () => {
				div.c("ai2-ol-list", () => {
					items_list.forEach(it => {
						div.c("ai2-ol-row" + (it.done ? " done" : " open"), () => {
							span.c("ai2-ol-mark").text(it.done ? "✓" : "☐");
							if (it.href) a.c("ai2-ol-title page-link").href(it.href).text(it.text || it.title || "");
							else span.c("ai2-ol-title").text(it.text || it.title || "");
						});
					});
				});
			});
			return;
		}
		if (!items || !items.length) return;
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

		const fresh = r.topic && !Rules.is_read(r.id);
		div.c("ai2-ol-row" + (r.topic ? " topic" : r.done ? " done" : " open") + (r.live ? " live" : ""), () => {
			span.c("ai2-ol-mark").text(r.topic ? "•" : r.done ? "✓" : "☐");
			if (r.proof) a.c("ai2-ol-title page-link").href(r.proof).text(r.title);
			else span.c("ai2-ol-title").text(r.title);
			if (fresh) small.c("ai2-ol-new").text("new");
			small.c("ai2-ol-time muted").text(r.asked_at ? Faces.when(r.asked_at) : "");
		});
	}


	more(f, g){
		if (!this.refined?.text && !this.text && !this.description && !this.links?.length) return;
		details.c("ai2-more", () => {
			summary.c("ai2-more-head muted").text(this.more_label());
			if (this.refined?.text) div.c("ai2-text md", $t => { md_into($t.el, this.refined.text); });
			if (this.text) div.c("ai2-text md", $t => { md_into($t.el, this.text); });
			if (this.description) div.c("ai2-text md", $t => { md_into($t.el, this.description); });
			if (this.links?.length) div.c("ai2-links flex wrap gap-25", () => {
				this.links.forEach(l => { a.c("ai2-link page-link").href(l.url).text(l.label ?? l.url); });
			});
			small.c("muted").text([!g && role_word(this.by), Faces.when(this.created), ...f.tags.map(t => "#" + t)].filter(Boolean).join(" · "));
		});
	}


	more_label(){
		const words = [this.refined?.text, this.text, this.description].filter(Boolean).join(" ").split(/s+/).filter(Boolean).length;
		const n = this.links?.length ?? 0;
		return "Show " + [words && "the full text (" + words + " words)", n && n + (n === 1 ? " link" : " links")].filter(Boolean).join(", ");
	}


	/* ⚠ Cost as data, because draw_sig() reads it too: doc/notes.md#cost. Rows sort by cost, largest first. */
	cost_model(g){
		const groups = this.shell?.ai2?.groups;
		if (!groups) return null;
		if (!g) return { line: cost_line(groups.task_member(Tasks.task_of(this))) };
		const rows = groups.members(g.id).filter(m => m.kind === "task").map(m => Tasks.face_row(groups, m))
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
		Tasks.group_faces(rows, sum, this.face_state ??= {});
	}


	type_picker(){
		const now = this.facts().type;
		const words = TYPES.includes(now) ? TYPES : [now, ...TYPES];
		const $pick = select.c("ai2-type", () => { words.forEach(w => { option(w).attr("value", w); }); });
		$pick.attr("title", "turn this card into another kind");
		$pick.el.value = now;
		$pick.on("change", e => this.retype(e.target.value));
	}

	retype(type){ return append_card(this.id, { type }); }


	clear(){ return append_card(this.id, { status: "archived" }).then(() => this.shell?.ai2?.cards_changed?.()); }


	contents(){
		const subs = this.subs();
		this.load_groups(subs);
		div.c("ai2-toc ai2-card-toc", () => {
			div.c("ai2-toc-head flex v-center gap-25", () => {
				small.c("muted").text(subs.length ? subs.length + (subs.length === 1 ? " request" : " requests") : this.parent instanceof Card ? "" : "no requests yet");
				if (cards_ready.known) this.sub_adder();
			});

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

	/* Each request's group, delivered state and title are read from its own log, latest wins: doc/notes.md#load-groups. ⚠ Only a lone {"group"} line counts. */
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

					if (typeof o.title === "string" && o.type !== "refined") title = o.title;
					created ??= o.created ?? null;

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

	/* ⚠ held stops every redraw while the title is typed. */
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

		this.redraw();
		if (!made?.ok) return;
		if (this.shell) this.shell.opening = made.id;   // a new sub-card opens listening, like a new card
		this.shell?.ai2?.cards_changed?.();
		this.app?.router?.go(workspace.url(this.url + made.id.split("/").at(-1) + "/"));
	}


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


	flag_changed(it){

		this.row_at = it?.at;
		if (this.shows_tabs() && this.tab === "activity" && this.seen_from) this.saw(it?.at);
		const flag = it?.flag ?? null;
		if (JSON.stringify(flag) === JSON.stringify(this.flag_note ?? null)) return;
		this.flag_note = flag;
		this.redraw();
	}

	// ⚠ activated(), not content(): the view is cached.
	activated(){
		this.seen_from = null;   // each visit marks what is new since the last one (activity_tab)

		Rules.mark_read(this.id);

		if (this.shell?.ai2?.cards?.by_id?.get(this.id)?.tags?.includes("owner-note")) append_card(this.id, { reviewed: { at: stamp(), by: "owner" } });
		this.shell?.ai2?.repaint?.();

		this.handle = this.shell?.ai2?.open({ id: this.id, draw: it => this.flag_changed(it), on: this.face(), $box: this.$box, top: this.tabbed(), ws: this.tabbed() });

		this.stop_list = this.shell?.ai2?.cards?.on(() => this.redraw());

		this.stop_needs = Needs.watch(() => this.redraw());

		this.stop_groups = this.shell?.ai2?.groups?.on(() => this.redraw());
		if (this.tabbed()) this.load_groups(this.subs(), true);
		this.redraw();
		if (!cards_ready.known) cards_ready().then(ok => ok && this.redraw());
	}

	/* ⚠ Stop the mic: a cached page keeps its composer. */
	deactivated(){
		this.shell?.ai2?.close(this.handle);
		this.stop_list?.();
		this.stop_groups?.();
		this.stop_needs?.();
		const mic = this.$composer?.mic;
		try { if (mic && !["idle", "error"].includes(mic.state)) mic.stop(); } catch {}
	}
}


Card.Folder = class CardFolder extends Page {

	initialize(){ this.classes ??= "ai2-index-page"; }

	level(){ return this.id.split("/").length; }

	async child(name, levels){
		if (this.children.get(name)) return super.child(name, levels);
		const id = this.id + "/" + name;
		const kid = this.level() < 3
			? new this.constructor({ id, title: this.constructor.title_of(id), shell: this.shell })
			: await Card.jsonl(CardDir.url(id));   // the card's folder is in the sessions store; its page stays at this route
		if (!kid) return null;
		kid.id ??= id;
		kid.url = this.url + name + "/";
		kid.assign({ shell: this.shell });
		return this.add(name, kid).load_all_children(levels);
	}


	static title_of(id){
		const [y, m, d] = id.split("/").map(Number);
		if (!m) return String(y);
		if (!d) return new Date(y, m - 1, 1).toLocaleDateString([], { month: "long", year: "numeric" });
		return new Date(y, m - 1, d).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
	}

	content(){
		div.c("ai2-index", $box => {

			let sig;
			const rows = new Map();
			const draw = () => {
				const mine = (this.shell?.ai2?.cards?.cards ?? []).filter(c => c.id.startsWith(this.id + "/"));

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


	folder_rows(){
		const all = this.shell?.ai2?.cards?.cards ?? [];
		const mine = all.filter(c => c.id.startsWith(this.id + "/"));
		if (!mine.length) return void small.c("muted").text("Nothing here yet.");

		if (this.level() >= 3) return mine.filter(c => c.id.split("/").length === 4)
			.forEach(c => card_link(c, this.url + c.id.split("/").at(-1) + "/"));

		const groups = new Map();
		mine.forEach(c => { const seg = c.id.split("/")[this.level()]; groups.set(seg, (groups.get(seg) ?? 0) + 1); });
		[...groups].sort((x, y) => y[0].localeCompare(x[0])).forEach(([seg, n]) => {
			a.c("ui-row ai2-toc-row page-link").href(this.url + seg + "/").append(() => {
				icon("folder");
				div.c("ai2-toc-body", () => {
					span.c("ai2-toc-title").text(this.constructor.title_of(this.id + "/" + seg));
					small.c("ai2-toc-line muted").text(n + (n === 1 ? " card" : " cards"));
				});
			});
		});
	}
};
