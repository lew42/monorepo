import { View, div, span, a, input } from "/app.js";
import SessionStore from "./SessionStore.js";
import SessionTree from "./SessionTree.js";
import SessionRow from "./SessionRow.js";
import DayStrip from "./DayStrip.js";
import OriginChips from "./OriginChips.js";
import UsageLine from "./UsageLine.js";
import PageNav from "./PageNav.js";

View.stylesheet(import.meta, "AIDashboard.css");

/** AIDashboard — the default /framework/ai/ page: one day's sessions grouped by origin (cloud voice, VS Code / remote, Servex), nested by who spawned whom, each cost rolled up.
 *  It reads the one store through SessionStore and keeps its state in the url (`?day=&origin=&live&open=&find=`). Plan and class table: ai/doc/ai-dashboard-plan.md */
export default class AIDashboard extends View {
	static AI = "/framework/ai/";
	static DAY = /^\d{4}-\d{2}-\d{2}$/;
	// This page is a leaf, so `children:` draws no links: every page below that people need is linked here. Merge first, it is the one that needs a decision.
	static NAV = [
		PageNav.merge_link(),
		{ href: "/framework/ai/now/", label: "Now", title: "Every session active in the last hour" },
		{ href: "/framework/ai/tasks/", label: "Tasks", title: "The task log and board" },
		{ href: "/framework/ai/queue/", label: "Queue", title: "Every accepted task, ranked: what it is, why, its cost and its priority" },
		{ href: "/framework/ai/sessions/", label: "Sessions", title: "Every session, newest first, with filters" },
		{ href: "/framework/ai/asks/", label: "Asks", title: "Every ask, who owns it, whether it landed" },
		{ href: "/framework/ai/review/", label: "Review", title: "Review pages" },
		{ href: "/framework/ai/readmes/", label: "Readmes", title: "What an agent in each folder is given to read" },
		{ href: "/framework/ai/usage/", label: "Usage", title: "Usage pace against each limit" },
		{ href: "/framework/ai/quick-fix/", label: "Quick fix", title: "The quick-fix pool" },
		{ href: "/framework/ai/process/", label: "Processes", title: "Tasks run as ordered steps" },
	];

	get classes(){ return "ad-dash"; }

	// ⚠ render() runs inside View's constructor, before class fields exist: set up here, then draw.
	initialize(){
		this.store = new SessionStore();
		this.days = SessionStore.days();
		this.q = this.read();
		super.initialize();
	}

	/** The query the url names. `open` is the set of session ids unfolded. */
	read(){
		const p = new URLSearchParams(location.search), day = p.get("day");
		return { day: AIDashboard.DAY.test(day ?? "") ? day : this.days[0], origin: p.get("origin"), live: p.has("live"), find: p.get("find") ?? "", open: new Set((p.get("open") ?? "").split(",").filter(Boolean)) };
	}
	write(){
		const { day, origin, live, find, open } = this.q, p = new URLSearchParams();
		if (day !== this.days[0]) p.set("day", day);
		if (origin) p.set("origin", origin);
		if (find) p.set("find", find);
		if (open.size) p.set("open", [...open].join(","));
		const rest = p.toString(), s = [live && "live", rest].filter(Boolean).join("&");
		history.replaceState(history.state, "", location.pathname + (s ? "?" + s : ""));
	}
	set(change){ Object.assign(this.q, change); this.write(); "day" in change ? this.store.open(this.q.day) : this.paint(); }
	toggle(id){ this.q.open.has(id) ? this.q.open.delete(id) : this.q.open.add(id); this.write(); this.paint(); }

	render(){
		new UsageLine();
		div.c("ad-body", () => {
			div.c("ad-days", () => {
				new DayStrip({ dash: this });
				input.c("ad-date").attr("type", "date").attr("max", this.days[0]).attr("value", this.q.day).attr("title", "Any day").on("change", e => e.target.value && this.set({ day: e.target.value }));
			});
			div.c("ad-main", () => {
				new PageNav({ links: AIDashboard.NAV });
				this.$sum = div.c("ad-sum");
				this.$chips = div.c("ad-chips");
				input.c("ad-find").attr("type", "search").attr("placeholder", "Find a session…").attr("value", this.q.find).on("input", e => { this.q.find = e.target.value; this.write(); this.paint(); });
				this.$list = div.c("ad-list");
			});
		});
		div.c("ad-foot", () => a.c("ad-link").href(AIDashboard.AI + "inbox/").attr("target", "_self").attr("title", "The old Inbox, with its tabs, tasks and sessions").text("Old Inbox →"));
		this.store.on(() => this.paint());
		this.store.open(this.q.day);
	}

	/** The roots the query keeps: by origin, live and find (a root stays when any session under it matches). */
	visible(){
		const find = this.q.find.trim().toLowerCase(), hit = n => `${n.s.title} ${n.s.agent} ${n.s.folder} ${n.s.id}`.toLowerCase().includes(find) || n.kids.some(hit);
		return this.store.tree.roots.filter(r => (!this.q.origin || r.origin === this.q.origin) && (!this.q.live || r.live) && (!find || hit(r)));
	}

	/** The computed header line: counts that must add up, red when they do not. */
	summary(tree){
		const all = [...tree.nodes.values()], usd = tree.roots.reduce((s, r) => s + r.rolled, 0), own = all.reduce((s, n) => s + n.own, 0);
		const lost = tree.unattached().length, tasks = this.store.tasks, live = tree.roots.filter(r => r.live).length;
		const bits = [`${all.length} sessions`, SessionRow.usd(usd), live && `${live} live`, lost && `${lost} unattached`, tasks?.in_flight && `${tasks.in_flight} task${tasks.in_flight > 1 ? "s" : ""} in flight`].filter(Boolean);
		return { text: bits.join(" · "), bad: Math.abs(usd - own) > 0.01 || tree.roots.reduce((s, r) => s + r.count, 0) !== all.length };
	}

	paint(){
		const { tree, ok } = this.store;
		if (!tree) return;
		const sum = this.summary(tree);
		this.$sum.empty(() => { const t = span(sum.text); if (sum.bad) t.el.style.color = "var(--error)"; });
		this.$chips.empty(() => new OriginChips({ dash: this }));
		this.$list.empty(() => {
			const rows = this.visible();
			if (!ok) return div.c("ad-none", "No session index for this day.");
			if (!rows.length) return div.c("ad-none", "Nothing matches.");
			Object.entries(SessionTree.ORIGINS).forEach(([k, o]) => {
				const list = rows.filter(r => r.origin === k);
				if (!list.length) return;
				// Routine is cheap and plentiful: one folded line until you open it (or pick its chip).
				const folded = k === "routine" && !this.q.open.has("routine") && this.q.origin !== "routine" && !this.q.find;
				div.c("ad-col", () => {
					const usd = list.reduce((sum, r) => sum + r.rolled, 0);
					const head = div.c("ad-group", () => { span(`${folded ? "▸ " : ""}${o.icon} ${o.label}`).attr("title", o.hint); span.c("ad-usd", `${list.length} · ${SessionRow.usd(usd)}`); });
					if (k === "routine") head.on("click", () => this.toggle("routine")).ac("ad-group-fold");
					if (!folded) list.forEach(node => new SessionRow({ node, dash: this }));
				});
			});
		});
	}
}
