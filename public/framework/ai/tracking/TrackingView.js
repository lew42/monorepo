import { View, div, p, a, h2, small } from "/app.js";
import DataGrid from "/framework/ext/DataGrid/DataGrid.js";

View.stylesheet(import.meta, "TrackingView.css");

const pct = x => `${Math.round(x * 100)}%`;
const usd = x => `$${x.toFixed(2)}`;

/** TrackingView — the five tracking checks from report.json (written by `node Server/TrackingCheck.mjs`). Readme: readme.md. */
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
		const t = r.untracked.totals, c = r.children, n = r.numbers, pc = r.prompts, pf = r.perf;

		p(`Report written ${r.generated_at.replace("T", " ").slice(0, 16)} UTC, over the last ${r.days} days. Re-run \`node Server/TrackingCheck.mjs\` to refresh it.`);
		a.c("tr-rule").href("/framework/ai/doc/task-buckets.md").text("The rule being checked: task buckets");

		div.c("tr-cards", () => {
			this.card(pct(t.share_usd), "of spend had no task open", `${usd(t.untracked_usd)} of ${usd(t.usd)}, ${t.sessions} sessions`);
			this.card(`${c.problems} of ${c.checked}`, "child sessions with a link problem", `${c.no_parent} no parent, ${c.parent_is_name} parent is a name, ${c.not_listed} not listed by the parent`);
			this.card(String(n.count), "stored numbers that disagree", "with what the transcript or the children compute now");
			if (pc) this.card(pc.pct == null ? "n/a" : pct(pc.pct), "of owner prompts have refinement parts", `${pc.recorded} of ${pc.unique} unique prompts, ${pc.sessions} sessions`);
			if (pf) { const slow = pf.files.filter(f => f.over).length, w = [...(pf.item?.writes ?? []), ...(pf.http?.writes ?? [])], worst = Math.max(0, ...w.map(x => x.ms)); this.card(`${slow} slow`, "records over the read limit", `limits: read+parse ${pf.limits.read_ms} ms, write ${pf.limits.write_ms} ms; slowest write seen ${w.length ? Math.round(worst) + " ms" : "not measured"}`); }
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
		if (pc) {
			h2("4. Owner prompts without a refinement record");
			p("Per session with a `prompts.jsonl`: the owner's unique prompts in the transcript (a compaction replays old ones; they count once) against those with parts. The last column lists the transcript lines of the prompts with none.");
			new DataGrid({
				columns: [
					{ key: "folder", label: "Session", width: "3fr", min: "14em" },
					{ key: "unique", label: "Unique prompts", type: "number", width: "10em" },
					{ key: "recorded", label: "With parts", type: "number", width: "8em" },
					{ key: "share", label: "Covered", type: "number", width: "6em", format: v => v == null ? "n/a" : pct(v) },
					{ key: "log_lines", label: "Log lines", type: "number", width: "6em" },
					{ key: "missing", label: "Unrecorded transcript lines", width: "3fr", min: "12em" },
				],
				rows: pc.rows.map(x => ({ ...x, share: x.pct, missing: x.no_transcript ? "(no transcript on this machine)" : x.unrecorded.map(u => "L" + u.line).join(" ") })), filters: false,
			});
		}

		if (pf) {
			h2("5. JSONL read and write time");
			p(`The largest records, read and parsed on every run (over ${pf.limits.read_ms} ms is flagged), then three item-tool writes on a copy (over ${pf.limits.write_ms} ms is flagged). ${pf.verdict}.`);
			new DataGrid({
				columns: [
					{ key: "file", label: "Record", width: "4fr", min: "24em" },
					{ key: "kb", label: "KB", type: "number", width: "6em" },
					{ key: "lines", label: "Lines", type: "number", width: "6em" },
					{ key: "read_ms", label: "Read ms", type: "number", width: "7em" },
					{ key: "parse_ms", label: "Parse ms", type: "number", width: "7em" },
					{ key: "append_ms", label: "Append ms", type: "number", width: "7em" },
					{ key: "flag", label: "Limit", width: "6em" },
				],
				rows: pf.files.map(f => ({ ...f, flag: f.over ? "OVER" : "ok" })), filters: false,
			});
			const writes = [...(pf.item?.writes ?? []).map(w => ({ ...w, via: "item tool in-process, on " + pf.item.source, at: pf.item.measured_at })), ...(pf.http?.writes ?? []).map(w => ({ ...w, via: "Servex HTTP, on " + pf.http.source, at: pf.http.measured_at }))];
			if (writes.length) new DataGrid({
				columns: [
					{ key: "via", label: "Item write", width: "4fr", min: "16em" },
					{ key: "ms", label: "ms", type: "number", width: "8em" },
					{ key: "flag", label: "Limit", width: "6em" },
					{ key: "at", label: "Measured", width: "10em", format: v => v?.replace("T", " ").slice(0, 16) },
				],
				rows: writes.map(w => ({ ...w, flag: w.ms > pf.limits.write_ms ? "OVER" : "ok" })), filters: false,
			});
			else p("No write timing yet: run `node Server/TrackingCheck.mjs --item` (add `--http <page url>` to time Servex's door).");
		}
	}

	card(big, label, detail){
		div.c("tr-card", () => {
			div.c("tr-big", big);
			div.c("tr-label", label);
			small.c("muted", detail);
		});
	}
}
