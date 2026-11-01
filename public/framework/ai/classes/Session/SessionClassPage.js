import { Page, View, div, h3, small, strong, button } from "/app.js";
import "/framework/ux/Content/ContentModule.js";   // the Content card styles (inspect() itself is the default view now, ux/Content/Object/DefaultView.js)
import { inspect } from "/framework/ux/Content/Object/Inspect.js";
import Session from "../../AISession/AISession.js";
import SessionView from "../../AISession/AISessionView.js";
import SessionLive from "../../AISession/AISessionLive.js";
import SessionRows from "../../AISession/AISessionRows.js";
import { SystemClasses } from "../../SystemClasses.js";

View.stylesheet("/framework/ai/sessions/sessions.css");
Session.View = SessionView;

// THE SESSION CLASS CARD with a live debug view. Left: one real Session drawn by its own View (session.render()).
// Right: the same instance as a property tree (inspect()). When the live index changes that session, both redraw,
// so you see which property moved. It follows the session that was active most recently.
// The class card (name, icon, core API) is the entry in ../../SystemClasses.js; nothing here is a second card system.
export default class SessionClassPage extends Page {
	constructor(...args){
		super({
			title: "Session",
			description: "One Claude session's cost and state, rendered, beside the live object behind it.",
			icon: "history_toggle_off",
		}, ...args);
	}

	content(){
		SystemClasses.card(SystemClasses.find("Session"));
		const demo = div.c("wide flex gap-100").style({ alignItems: "flex-start", flexWrap: "wrap" });
		const note = small.c("muted", "Loading the live session index…");
		demo.append(() => {
			this.$view = div.c("flex v gap-50 session-demo-view").style({ flex: "1 1 24rem", minWidth: 0, overflowX: "auto" });
			this.$tree = div.c("flex v gap-50 session-demo-tree").style({ flex: "1 1 24rem", minWidth: 0 });
		});
		this.start(note);
	}

	/** Load the index, pick the most recently active session, draw it, then redraw on every change to it. */
	async start(note){
		const root = Session.root_url().href;
		Session.use_index(await SessionRows.get_json(root + "session-index.json"));
		const today = SessionLive.ymd(new Date());
		this.live = new SessionLive(root + today + "/index.jsonl", () => {});
		await SessionLive.load_days(await SessionLive.days(root, today.replace(/\//g, "-"), today.replace(/\//g, "-")), () => {});
		await this.live.live();
		this.session = this.latest();
		if (!this.session) return void note.text("No sessions found.");
		note.text("");
		this.session.subscribe(() => this.draw());
		this.draw();
	}

	/** The Session whose index row says it was active last. */
	latest(){
		let best = null;
		for (const ses of Session.all.values()){
			const t = ses.ix.last_activity ?? ses.ix.first_at ?? "";
			if (!best || t > (best.ix.last_activity ?? best.ix.first_at ?? "")) best = ses;
		}
		return best;
	}

	draw(){
		const ses = this.session;
		this.$view.empty(() => { strong("Rendered: session.render()"); div.c("sessions-grid", () => { div.c("sessions-head", () => SessionRows.COLUMNS.forEach(c => div.c("sessions-cell sessions-head-cell", c.label))); ses.render(); }); });
		this.$tree.empty(() => {
			strong("Debug tree: inspect(session)"); inspect(ses, { variant: "card" });
			strong("session.ix: the fields the grid reads, live"); inspect(ses.ix, { variant: "card" });
		});
	}
}
