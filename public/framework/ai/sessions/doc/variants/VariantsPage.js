import { Page } from "/app.js";
import { div, span, a, small, strong, h2, h3, p, ul, li, select, option, button, icon } from "/framework/core/View/View.js";
import SessionTree from "./SessionTree.js";
import SegBar from "./SegBar.js";

/* Three ways to show one session and its tasks, side by side, on real 2026-10-20 data: A inline expansion, B a drop-down
   switcher, C two panes. A prototype for choosing (doc/views-plan.md §6); the real sessions pages are not changed.
   The url holds every choice: ?s=<session folder>&a=<open task>&b=<shown task>&c=<selected task>. */
export default class VariantsPage extends Page {

	static DAY = "2026/10/20";
	static SESSIONS = [
		["session-e00f55c9", "This tab (VS Code mastermind)"],
		["voice-20261020", "Voice mastermind"],
		["session-e4971f1a", "A small agent (fixer-1)"],
	];

	initialize(){
		super.initialize?.();
		addEventListener("popstate", () => this.draw());
	}

	q(k){ return new URLSearchParams(location.search).get(k); }
	go(k, v){
		const u = new URL(location.href);
		v == null || v === "" ? u.searchParams.delete(k) : u.searchParams.set(k, v);
		history.pushState(null, "", u);
		this.draw();
	}

	content(){
		p("Three layouts of the same session, each reading the same two index files. Pick a session, then click around in each. Every choice is in the url.");
		div.c("svv-picks", () => this.constructor.SESSIONS.forEach(([f, label]) =>
			button(label).ac("svv-pick", (this.q("s") ?? this.constructor.SESSIONS[0][0]) === f ? "is-on" : "").click(() => { const u = new URL(location.href); u.search = "?s=" + f; history.pushState(null, "", u); this.draw(); })));
		this.$out = div.c("svv-grid");
		this.draw();
	}

	async draw(){
		const out = this.$out; if (!out) return;
		const folder = this.q("s") ?? this.constructor.SESSIONS[0][0];
		const tree = await SessionTree.load(this.constructor.DAY, folder);
		this.el?.querySelectorAll?.(".svv-pick").forEach((b, i) => b.classList.toggle("is-on", this.constructor.SESSIONS[i][0] === folder));
		out.empty(() => {
			this.variant("A · Inline", "Tasks open in place, under their row.", () => this.inline(tree));
			this.variant("B · Drop-down", "One thing at a time; the drop-down switches it.", () => this.dropdown(tree));
			this.variant("C · Two panes", "The tree on the left, the chosen task on the right.", () => this.panes(tree));
		});
	}

	variant(title, gist, fill){
		div.c("svv-variant", () => { h3(title); small.c("muted svv-gist", gist); div.c("svv-body", fill); });
	}

	// The top of every view, session or task: name, nickname, bar, essentials.
	head(tree, node){
		const session = node.session;
		div.c("svv-head", () => {
			h2(node.title).ac("svv-title");
			small.c("svv-slug", session ? tree.folder : node.rel);
			new SegBar({ node });
			div.c("svv-facts", () => (session ? tree.facts() : this.task_facts(node)).forEach(([k, v]) => span(() => { small.c("muted", k + " "); strong(v); })));
		});
		if (session && node.kids.length) ul.c("svv-bullets", () => tree.bullets().slice(0, 6).forEach(t => li(t)));
		if (!session && node.line) p(node.line).ac("svv-line");
	}

	task_facts(n){
		return [["state", n.state], ["duration", SessionTree.dur(n.ms())], ...(n.usd != null ? [["cost", "$" + n.usd.toFixed(2)]] : []), ...(n.agent ? [["by", n.agent]] : [])];
	}

	// One task row: project or task icon, title, bar. Short titles keep the bar beside them; long ones wrap it below.
	row(node, { pick, on } = {}){
		return div.c("svv-row", () => {
			icon(node.project ? "folder" : node.done ? "check_box" : "check_box_outline_blank").ac("svv-icon", node.project ? "is-project" : "is-task");
			span.c("svv-row-title", node.title);
			if (node.project) new SegBar({ node });   // a leaf's checkbox already says done; only a project gets a bar
		}).ac(on ? "is-on" : "").attr("style", `--depth:${Math.max(0, node.depth() - 1)}`).click(() => pick?.(node));
	}

	inline(tree){
		const open = this.q("a");
		this.head(tree, tree.root);
		const walk = n => n.kids.forEach(k => {
			this.row(k, { on: open === k.rel, pick: x => this.go("a", open === x.rel ? null : x.rel) });
			if (open === k.rel) div.c("svv-inline", () => this.head(tree, k));
			walk(k);
		});
		div.c("svv-rows", () => walk(tree.root));
		if (!tree.root.kids.length) p("No tasks recorded in this session.").ac("muted");
	}

	dropdown(tree){
		const shown = tree.nodes.get(this.q("b") ?? "") ?? tree.root;
		select(() => tree.root.all().forEach(n => option((n.session ? "Session: " : "  ".repeat(n.depth()) + (n.project ? "▸ " : "")) + n.title).attr("value", n.rel).attr(n === shown ? "selected" : "data-x", "")))
			.ac("svv-switch").on("change", e => this.go("b", e.target.value));
		this.head(tree, shown);
		div.c("svv-rows", () => shown.kids.forEach(k => this.row(k, { pick: x => this.go("b", x.rel) })));
		if (shown.parent) a("↑ " + shown.parent.title).ac("svv-up").click(() => this.go("b", shown.parent.rel));
	}

	panes(tree){
		const sel = tree.nodes.get(this.q("c") ?? "") ?? tree.root;
		div.c("svv-panes", () => {
			div.c("svv-left", () => {
				this.row(tree.root, { on: sel === tree.root, pick: () => this.go("c", null) }).ac("svv-root-row");
				tree.root.all().slice(1).forEach(n => this.row(n, { on: sel === n, pick: x => this.go("c", x.rel) }));
			});
			div.c("svv-right", () => this.head(tree, sel));
		});
	}
}
