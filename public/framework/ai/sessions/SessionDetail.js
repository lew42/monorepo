import { Page, div, span, small, p, a } from "/app.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";
import { load as raw_transcript_lines } from "/framework/ext/AITask/replay.js";
import SessionRows from "./SessionRows.js";
import SessionView from "./SessionView.js";
import SessionFollow from "./SessionFollow.js";
import SessionTrace from "./SessionTrace.js";
import Session from "./Session.js";

// One session's own page, opened at /framework/ai/sessions/<id>/ (a real route, so a reload lands on the same
// view). Built with `new SessionDetail({ home, id })`: `home` is the Sessions page it hangs under.
// The loaders are statics. Each degrades to null when its file is missing, and a missing piece just does not draw.
export default class SessionDetail extends Page {

	constructor({ home, id }){
		// A uuid is too long to be a page title; the short form still tells two sessions apart, and the full id sits below it.
		super({ home, id, width: "fill", title: id.length > 24 ? id.slice(0, 8) + "…" : id, url: home.url + id + "/" });
	}

	deactivated(){ this.follow?.then(f => f.stop()); this.follow = null; }

	content(){
		const { home, id } = this, url = home.url;
		a.c("page-link", "← all sessions").href(url);
		small.c("muted sessions-full-id", id);
		small.c("muted", "Template: sessions/SessionDetail.js");   // which template draws this page (doc/templates.md)

		const $related = div.c("flow");   // the other records of this session: card, task, brief, report, parent, children
		const $box = div.c("flow");
		const $costs = div.c("flow");
		const $spawn = div.c("flow");     // who spawned this, why, and what it spawned
		const $session = div.c("flow");   // the Session class: cost tree, model + effort, tokens by purpose, audit
		const $trace = div.c("flow");     // the cost-over-time chart and the per-tool table

		// `row` first: for a Servex row the url's id is the AGENT's id, a different string from its session_id,
		// and the transcript and the date-path lookup both need the session_id.
		SessionDetail.load_row(url, id).then(async row => {
			const session_id = row?.session_id ?? id;
			if (!this.follow && /^[0-9a-f]{8}-/.test(session_id)) this.follow = new SessionFollow(session_id).start();   // tails the log and corrects the grid row (doc/realtime.md)
			Promise.all([SessionRows.load_index(url), SessionRows.load_tree(url)]).then(([index, tree]) => SessionView.detail_section($session, session_id, index, tree));
			SessionRows.load_index(url).then(async () => { const snap = await SessionDetail.load_snapshot(session_id); $related.empty(() => SessionDetail.render_related(snap, url)); });
			// the card's page.jsonl and trace.json live in the session's own folder now; the old card folder is the fallback until a checkout is migrated
			const own = Session.dir_url(session_id).pathname, old = SessionDetail.dir_of(await SessionDetail.dir_index(), session_id);
			const [costs, trace, prompts] = await Promise.all([
				SessionDetail.load_cost_log(own).then(c => c ?? SessionDetail.load_cost_log(old)),
				SessionRows.load_index(url).then(ix => ix?.traces?.includes(session_id) ? SessionDetail.load_trace(own).then(t => t ?? SessionDetail.load_trace(old)) : null),   // a trace.json exists for few sessions: ask only for those the index lists
				SessionDetail.load_transcript(session_id),
			]);

			$costs.empty(() => {
				if (!costs) return;
				small.c("muted", "Logged cost (Server/session-cost.mjs, after each turn)");
				costs.forEach(c => div.c("sessions-cost-row card flex gap-50 v-center", () => {
					small.c("muted", c.at ? age(c.at) : "");
					small(`${c.last_prompt_input ?? 0} in / ${c.last_prompt_output ?? 0} out`);
					small.c("sessions-row-title", "$" + (c.last_prompt_usd ?? 0).toFixed(4));
					small.c("muted", "running total $" + (c.total_usd ?? 0).toFixed(2));
				}));
				// the latest logged line already holds the whole session's totals, split by token kind
				const last = costs.at(-1);
				if (last?.usd_breakdown) div.c("sessions-cost-breakdown card flex gap-50 v-center muted", () => {
					const b = last.usd_breakdown, t = last.token_totals ?? {};
					small(`input ${t.input ?? "?"} tok $${b.in.toFixed(4)}`);
					small(`cache write ${t.cache_write ?? "?"} tok $${b.cache_write.toFixed(4)}`);
					small(`cache read ${t.cache_read ?? "?"} tok $${b.cache_read.toFixed(4)} (${last.cache_read_pct ?? 0}% of $)`);
					small(`output ${t.output ?? "?"} tok $${b.out.toFixed(4)}`);
				});
			});

			$box.empty(() => {
				if (row){
					const src = SessionRows.SOURCE[row.source] ?? { label: row.source };
					div.c("flex gap-50 v-center", () => {
						span.c("sessions-tag sessions-tag-" + row.source, src.label);
						span.c("sessions-row-title", row.tab_title || row.id);
						if (row.model) small.c("muted", row.model);
					});
				}
				if (prompts?.length){
					div.c("flow", () => prompts.forEach(pr => {
						div.c("sessions-prompt card", () => {
							small.c("muted", pr.at ? age(pr.at) : "");
							p(pr.text);
						});
					}));
				} else if (!costs) {
					p.c("muted", "No transcript for this session — either /ai-logs/ (the dev-server-only "
						+ "route this reads it through) isn't running, or this session's own file has no "
						+ "real prompt in it yet.");
				}
			});

			$trace.empty(() => { if (trace) SessionTrace.render(trace); });

			// Only a Servex agent is in the spend tree; any other row's section just stays empty.
			SessionRows.load_spend_tree(url).then(spend => {
				$spawn.empty(() => {
					const node = spend?.by_id.get(id);
					if (node) SessionTrace.render_spawn(node, spend, url);
				});
			});
		});
	}

	/** What each kind of record is, in one line (the same words as doc/patterns.md). */
	static RELATED = {
		summary: { icon: "🧾", label: "Accounting summary", what: "this session's own folder: tokens, cost parts, models, tools; no conversation text" },
		card: { icon: "🗂", label: "Inbox card", what: "the dashboard card (Asked / Status / Next step): page.jsonl in this session's folder" },
		task: { icon: "📋", label: "Task folder", what: "the task's brief, report and task.jsonl: the task/ folder inside this session's folder" },
		brief: { icon: "📝", label: "Brief", what: "what the task was asked to do (requirements.md)" },
		report: { icon: "✅", label: "Report", what: "what the task found or built (report.md or findings.md)" },
		parent: { icon: "⬆", label: "Parent session", what: "the session that spawned this one" },
		child: { icon: "⬇", label: "Child session", what: "a session this one spawned" },
	};

	/** This session's own index.json (its snapshot), from its dated folder; null when it has none yet. */
	static async load_snapshot(id){
		const ix = Session.all.get(id)?.ix;   // the live copy the grid already holds (it carries `folder`, so the folder is findable)
		return ix?.links ? { id, ...ix } : SessionRows.get_json(Session.dir_url(id).href + "index.json");
	}

	/** The "Related" section: one line per record of the session: its kind, what it is, and where it lives. */
	static render_related(snap, url){
		if (!snap) return;
		const L = snap.links ?? {}, R = SessionDetail.RELATED, items = [["summary", Session.dir_url(snap.id).pathname]];
		if (L.card) items.push(["card", L.card]);
		if (L.task) items.push(["task", L.task]);
		if (L.brief) items.push(["brief", L.brief]);
		if (L.report) items.push(["report", L.report]);
		if (L.parent) items.push(["parent", url + L.parent + "/"]);
		L.children?.forEach(c => items.push(["child", url + c + "/"]));
		small.c("muted", "Related — the records that belong to this session");
		div.c("flow", () => items.forEach(([kind, href]) => div.c("flex gap-50 v-center", () => {
			a.c("page-link", `${R[kind].icon} ${R[kind].label}`).href(href);
			small.c("muted", R[kind].what + " · " + href.replace("/framework/", ""));
		})));
	}

	// ---- loaders -------------------------------------------------------------------------------------

	/** This session's row (tab_title, model, source...) from sessions.json, which is a computed cache and never the record. */
	static async load_row(root_url, id){
		const snap = await SessionRows.get_json(root_url + "sessions.json");
		return snap?.rows?.find(r => r.id === id || r.session_id === id) ?? null;
	}

	/** A session's prompts, fetched live through /ai-logs/<session_id> (Server/plugins/AILogs.js); nothing is copied anywhere. The last 50. */
	static async load_transcript(session_id){
		const lines = await raw_transcript_lines(session_id);
		if (!lines) return null;
		const prompts = lines
			.filter(l => l.type === "user" && !l.isMeta && !l.isSidechain && l.turnOrigin !== "task_notification")
			.map(l => {
				const c = l.message?.content;
				const text = typeof c === "string" ? c : Array.isArray(c) ? c.find(b => b?.type === "text")?.text : null;
				return text ? { at: l.timestamp, text } : null;
			})
			.filter(Boolean);
		return prompts.length ? prompts.slice(-50) : null;
	}

	/** Every `ai/<Y>/<M>/<D>/<slug>-<id8>/` folder, keyed by its id8: one walk of /framework/directory.json, shared by the grid and the detail page. */
	static async dir_index(){
		const dir = await SessionRows.get_json("/framework/directory.json");
		const ai = dir?.files?.find(f => f.name === "ai")?.children ?? [];
		const index = new Map();
		for (const y of ai){
			if (y.type !== "dir" || !/^\d{4}$/.test(y.name)) continue;
			for (const m of y.children ?? []){
				if (m.type !== "dir" || !/^\d{2}$/.test(m.name)) continue;
				for (const d of m.children ?? []){
					if (d.type !== "dir" || !/^\d{2}$/.test(d.name)) continue;
					for (const s of d.children ?? []){
						if (s.type !== "dir") continue;
						const hit = /-([0-9a-f]{8})$/.exec(s.name);
						if (hit) index.set(hit[1], `/framework/ai/${y.name}/${m.name}/${d.name}/${s.name}/`);
					}
				}
			}
		}
		return index;
	}

	static dir_of(index, id){ return index.get((id || "").slice(0, 8)) ?? null; }

	/** The cost lines the Stop hook logged into the session's page.jsonl, oldest first; null when there are none. */
	static async load_cost_log(dir){
		if (!dir) return null;
		const lines = await SessionRows.get_jsonl(dir + "page.jsonl");
		const costs = (lines ?? []).filter(l => l.cost).map(l => l.cost);
		return costs.length ? costs : null;
	}

	/** `<session-dir>/trace.json`, written by hand (doc/decisions.md says why it is not in the Stop hook). Missing means no chart. */
	static async load_trace(dir){
		if (!dir) return null;
		const trace = await SessionRows.get_json(dir + "trace.json");
		return trace?.calls && trace?.turns ? trace : null;
	}
}
