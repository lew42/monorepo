import { Page } from "/app.js";
import { div, span, a, small, strong, details, summary, icon } from "/framework/core/View/View.js";
import AISessionsPage from "../../../AISession/AISessionsPage.js";
import Day from "/framework/core/Session/Day.js";
import MobileData from "./MobileData.js";
import MobileRow from "./MobileRow.js";
import MobilePath from "./MobilePath.js";

/* Page 1, the day list: that day's sessions, grouped by what needs you. Extends the real sessions page (its route() and
   child() are overridden to hand out the mobile pages); the ground, cards and rows are mobile.css. Doc: readme.md here. */
export default class MobileHome extends AISessionsPage {

	static GROUPS = [["needs", "Needs you", "error"], ["running", "Running", "play_circle"], ["done", "Done", "check_circle"], ["rest", "Everything else", "unfold_more"]];

	constructor(...args){
		super({ title: "Sessions", icon: "smartphone", classes: "mob-page", description: "The sessions of one day, for a phone." }, ...args);
	}

	initialize(){}     // not the wide Panel2 columns of the real page
	activated(){}      // the real page's live poll; this one reads the day file once
	deactivated(){}

	/** The day shown: the url's, else today. */
	get shown_day(){ return this.day ?? Day.path(new Date()); }

	/** `2026/10/22/` opens a day by path; `all/` (page 2) and a session id (page 3) are added as those pages land. */
	route(name){
		if (/^\d{4}$/.test(name)) return new MobilePath({ segs: [name], home: this });
		if (name.includes(".")) return;
	}

	/** The real page preloads a session's rows in child(); the mobile pages read their own files, so go straight to Page. */
	child(name, levels){ return Page.prototype.child.call(this, name, levels); }

	content(){
		const out = div.c("mob-day");
		this.load(out);
	}

	async load(out){
		const [snaps, tree] = await Promise.all([MobileData.day(this.shown_day), MobileData.tree()]);
		const rows = await Promise.all(snaps.map(async s => { const snap = { ...s, _day: s._day ?? this.shown_day }, tasks = await MobileData.tasks(snap).catch(() => null); return { snap, tasks, group: MobileData.group(snap, tasks) }; }));
		rows.sort((a, b) => String(b.snap.last_activity).localeCompare(String(a.snap.last_activity)));
		out.empty(() => {
			this.header(rows);
			for (const [key, label, glyph] of this.constructor.GROUPS){
				const mine = rows.filter(r => r.group === key);
				if (key === "rest") this.folded(label, mine, tree);
				else if (mine.length) this.card(label, glyph, key, mine, tree);
			}
			if (!rows.length) div.c("mob-card", () => div.c("mob-empty", "No sessions were recorded on this day."));
		});
	}

	header(rows){
		const [y, m, d] = this.shown_day.split("/").map(Number), date = new Date(y, m - 1, d);
		const step = n => Day.path(new Date(y, m - 1, d + n)).split("/").join("/");
		div.c("mob-card mob-daybar", () => {
			div.c("mob-card-head", () => {
				a.c("mob-step", icon("chevron_left")).href(MobileData.HOME + step(-1) + "/").attr("title", "the day before");
				div.c("mob-head-main", () => {
					strong(date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }));
					small.c("mob-head-sub", `${rows.length} sessions · ${MobileData.usd(rows.reduce((t, r) => t + (r.snap.usd ?? 0), 0))}`);
				});
				a.c("mob-step", icon("chevron_right")).href(MobileData.HOME + step(1) + "/").attr("title", "the day after");
			});
			div.c("mob-switch", () => { span.c("mob-switch-on", "Day"); a("Nested").href(MobileData.HOME + "all/"); });
		});
	}

	card(label, glyph, key, rows, tree){
		div.c("mob-card mob-group-" + key, () => {
			div.c("mob-card-head", () => { icon(glyph).ac("mob-group-icon"); strong(label); small.c("mob-count", String(rows.length)); });
			rows.forEach(r => new MobileRow({ ...r, tree }));
		});
	}

	folded(label, rows, tree){
		if (!rows.length) return;
		details.c("mob-card mob-fold", () => {
			summary.c("mob-card-head", () => { icon("unfold_more").ac("mob-group-icon"); strong(label); small.c("mob-count", String(rows.length)); });
			rows.forEach(r => new MobileRow({ ...r, tree }));
		});
	}
}
