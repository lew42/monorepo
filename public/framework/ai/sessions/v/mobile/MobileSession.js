import { Page } from "/app.js";
import { div, span, a, small, strong, p, h1, icon } from "/framework/core/View/View.js";
import AISessionDetail from "../../../AISession/AISessionDetail.js";
import AISessionConversation from "../../../AISession/AISessionConversation.js";
import AISessionFollow from "../../../AISession/AISessionFollow.js";
import SessionTree from "../../doc/variants/SessionTree.js";
import MobileData from "./MobileData.js";
import MobileTaskRow from "./MobileTaskRow.js";
import SwipeTabs from "./SwipeTabs.js";

/* Page 3, one session, design B: open work first; the big title scrolls away and a compact bar slides in; tabs Overview,
   Tasks and Chat swipe. Extends the real session page for its data loaders and its session menu (head_tools). */
export default class MobileSession extends AISessionDetail {

	static OPEN = 6;   // open tasks listed on Overview before "all in Tasks"

	constructor({ id }){
		super({ home: { url: MobileData.SESSIONS }, id });   // the loaders read home.url; the page's own url is set when it is added under v/mobile/
	}

	/** A task path under this session opens the task page (page 4). */
	route(name){
		if (name.includes(".")) return;
		return new this.constructor.Task({ sid: this.id, segs: [name] });
	}
	child(name, levels){ return Page.prototype.child.call(this, name, levels); }

	content(){
		const root = div.c("mob-session");
		const top = div.c("mob-title");
		const bar = div.c("mob-bar-wrap", () => div.c("mob-bar", () => { a.c("mob-back", icon("arrow_back")).href(MobileData.HOME).attr("title", "all sessions"); this.$bar_title = strong.c("mob-bar-title", this.title); this.head_tools(); }));
		this.tabs = new SwipeTabs({ tabs: [["overview", "Overview"], ["tasks", "Tasks"], ["chat", "Chat"]] });
		new IntersectionObserver(([e]) => bar.el.classList.toggle("is-on", !e.isIntersecting)).observe(top.el);
		this.fill(top);
		this.chat(this.tabs.panes.chat);
	}

	async fill(top){
		const snap = await MobileData.find(this.id), tree_ids = await MobileData.tree();
		const { overview, tasks } = this.tabs.panes;
		if (!snap){ top.empty(() => p.c("mob-empty", "This session is not in the last 14 days of day indexes.")); return; }
		const tree = await MobileData.tasks(snap).catch(() => null), kind = MobileData.kind(snap, tree_ids), up = MobileData.parent(snap, tree_ids);
		this.$bar_title?.el.replaceChildren(snap.title || snap.id);
		top.empty(() => {
			small.c("mob-kind", kind + (up ? " · spawned by " : ""));
			if (up) a.c("mob-parent", up.slice(0, 8)).href(MobileData.session_url(up));
			h1.c("mob-h1", snap.title || snap.id);
			small.c("mob-head-sub", `${MobileData.ago(snap.last_activity)} · ${MobileData.usd(snap.tree_usd || snap.usd)} · ${snap.model ?? "no model"}`);
		});
		const nodes = tree?.root.all().slice(1) ?? [];
		const open = nodes.filter(n => !["complete", "stopped"].includes(n.state) && !n.kids.some(k => !["complete", "stopped"].includes(k.state)));
		overview.empty(() => {
			div.c("mob-card", () => {
				div.c("mob-card-head", () => { icon("pending_actions").ac("mob-group-icon"); strong("Open work"); small.c("mob-count", String(open.length)); });
				open.slice(0, this.constructor.OPEN).forEach(n => new MobileTaskRow({ node: n, sid: this.id }));
				if (!open.length) div.c("mob-empty", nodes.length ? "Nothing open: every task is done." : "No tasks recorded in this session.");
				if (open.length > this.constructor.OPEN) a.c("mob-more", `${open.length - this.constructor.OPEN} more in Tasks`).on("click", () => this.tabs.go("tasks"));
			});
			div.c("mob-card", () => {
				div.c("mob-card-head", () => { icon("info").ac("mob-group-icon"); strong("About"); });
				div.c("mob-facts", () => (tree?.facts() ?? [["cost", MobileData.usd(snap.usd)]]).forEach(([k, v]) => div.c("mob-fact", () => { small.c("mob-fact-k", k); span(v); })));
				if (tree) tree.bullets().slice(0, 6).forEach(t => div.c("mob-bullet", t));
			});
		});
		tasks.empty(() => div.c("mob-card", () => {
			div.c("mob-card-head", () => { icon("checklist").ac("mob-group-icon"); strong("Tasks"); small.c("mob-count", String(nodes.length)); });
			if (!tree) div.c("mob-empty", "No tasks recorded in this session.");
			else this.rows(tree.root.kids);
		}));
	}

	/** Top-level tasks, each with its children one indent in and a 2 px rail; deeper levels open their own page. */
	rows(list){
		list.forEach(n => {
			new MobileTaskRow({ node: n, sid: this.id });
			if (n.kids.length) div.c("mob-nest-kids", () => n.kids.forEach(k => new MobileTaskRow({ node: k, sid: this.id })));
		});
	}

	/** The conversation, as the real page shows it (AISessionConversation fed by AISessionFollow). */
	chat(pane){
		const conv = new AISessionConversation();
		conv.session = this.id;
		pane.append(conv.view);
		if (!/^[0-9a-f]{8}-/.test(this.id)) return void pane.append(() => p.c("mob-empty", "No transcript for this kind of session."));
		const f = new AISessionFollow(this.id);
		f.on_lines = lines => conv.add(lines);
		this.follow = f.start();
	}
}
