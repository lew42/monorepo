import { View, div, p, a, h2, small } from "/app.js";
import DataGrid from "/framework/ext/DataGrid/DataGrid.js";

View.stylesheet(import.meta, "TrackingView.css");

const pct = x => `${Math.round(x * 100)}%`;
const usd = x => `$${x.toFixed(2)}`;

/** TrackingView — the four tracking checks from report.json (written by `node Server/TrackingCheck.mjs`). Readme: readme.md. */
export default class TrackingView extends View {
	get classes(){ return "tr-view"; }

	// ⚠ render() runs inside View's constructor, before class fields exist: state is set in render().
	render(){
		this.$body = div.c("tr-body");
		this.load();
	}

	async load(){
		const res = await fetch(new URL("./report.json", import.meta.url));
		const r = res.ok ? await res.json() : null;
		this.$body.empty(() => this.draw(r));   // the box is held: nothing is drawn after an await outside it
	}

	draw(r){
		if (!r) { p("No report yet. Run `node Server/TrackingCheck.mjs`."); return; }
		const t = r.untracked.totals, c = r.children, n = r.numbers, idn = r.identity;

		p(`Report written ${r.generated_at.replace("T", " ").slice(0, 16)} UTC, over the last ${r.days} days. Re-run \`node Server/TrackingCheck.mjs\` to refresh it.`);
		a.c("tr-rule").href("/framework/ai/doc/task-buckets.md").text("The rule being checked: task buckets");

		div.c("tr-cards", () => {
			this.card(pct(t.share_usd), "of spend had no task open", `${usd(t.untracked_usd)} of ${usd(t.usd)}, ${t.sessions} sessions`);
			this.card(`${c.problems} of ${c.checked}`, "child sessions with a link problem", `${c.no_parent} no parent, ${c.parent_is_name} parent is a name, ${c.not_listed} not listed by the parent`);
			this.card(String(n.count), "stored numbers that disagree", "with what the transcript or the children compute now");
			if (idn) this.card(`${idn.failing} of ${idn.checked}`, "recent sessions with an identity problem", "one id, one folder, cost agrees, no shared messages, children linked");
		});

		h2("1. Work with no task open");
		p("Per day, the share of dollars spent while no task bucket was open. Below, the sessions with the most untracked dollars.");
		new DataGrid({
			columns: [
				{ key: "day", label: "Day", width: "8em" },
				{ key: "usd", label: "Spend", type: "number", width: "7em", format: usd },
				{ key: "untracked_usd", label: "Untracked", type: "number", width: "7em", format: usd },
				{ key: "share_usd", label: "Share", type: "number", width: "6em", format: pct },
			],
			rows: r.untracked.by_day, filters: false,
		});
		new DataGrid({
			columns: [
				{ key: "label", label: "Session", width: "3fr", min: "14em" },
				{ key: "day", label: "Day", width: "8em" },
				{ key: "usd", label: "Spend", type: "number", width: "7em", format: usd },
				{ key: "untracked_usd", label: "Untracked", type: "number", width: "7em", format: usd },
				{ key: "share_usd", label: "Share", type: "number", width: "6em", format: pct },
				{ key: "task_events", label: "Task events", type: "number", width: "7em" },
			],
			rows: r.untracked.sessions.map(s => ({ ...s, label: s.title || s.agent || s.id.slice(0, 8) })), filters: false,
		});

		h2("2. Child sessions without a parent link");
		p("A child needs a `parent` that is the parent's session id, and the parent's `tasks` list should name it. Routine roles (clarity, reviewer, checkers) are not counted.");
		new DataGrid({
			columns: [
				{ key: "agent", label: "Agent", width: "2fr", min: "12em" },
				{ key: "role", label: "Role", width: "8em" },
				{ key: "started_at", label: "Started", width: "10em", format: v => v?.replace("T", " ").slice(0, 16) },
				{ key: "parent", label: "Parent", width: "2fr", min: "10em" },
				{ key: "problem", label: "Problem", width: "3fr", min: "14em" },
			],
			rows: c.rows.map(x => ({ ...x, problem: x.problems.join("; ") })), filters: false,
		});

		h2("3. Stored numbers the children disagree with");
		p(n.count ? "These sessions store a figure that a fresh computation does not give." : "No stored number disagrees.");
		if (n.count) new DataGrid({
			columns: [
				{ key: "agent", label: "Agent", width: "2fr", min: "12em" },
				{ key: "what", label: "Number", width: "7em" },
				{ key: "stored", label: "Stored", type: "number", width: "7em" },
				{ key: "computed", label: "Computed", type: "number", width: "7em" },
				{ key: "why", label: "Why", width: "3fr", min: "14em" },
			],
			rows: n.rows, filters: false,
		});

		h2("4. Session identity");
		p("For the most recent sessions: the transcript holds only this session's id, there is one dated folder, the stored cost matches a recount from the transcript, no message is shared with another transcript, and every child session is linked from its parent. A ✅ means all five hold.");
		if (!idn) p("No identity rows yet. Re-run `node Server/TrackingCheck.mjs`.");
		else new DataGrid({
			columns: [
				{ key: "label", label: "Session", width: "3fr", min: "14em" },
				{ key: "check", label: "Check", width: "4fr", min: "16em" },
				{ key: "cache_usd", label: "Stored cost", type: "number", width: "8em", format: v => v == null ? "none" : usd(v) },
				{ key: "recount_usd", label: "Recount", type: "number", width: "7em", format: v => v == null ? "none" : usd(v) },
				{ key: "shared_messages", label: "Shared msgs", type: "number", width: "8em" },
				{ key: "folders", label: "Folders", type: "number", width: "6em" },
				{ key: "unlinked", label: "Unlinked", type: "number", width: "7em" },
			],
			rows: idn.rows.map(x => ({ ...x, label: x.title || x.id.slice(0, 8), check: x.ok ? "✅" : x.first_problem })), filters: false,
		});
	}

	card(big, label, detail){
		div.c("tr-card", () => {
			div.c("tr-big", big);
			div.c("tr-label", label);
			small.c("muted", detail);
		});
	}
}
