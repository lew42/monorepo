import { Page } from "../../core/Page/Page.class.js";
import { View, div, span, p, details, summary } from "../../core/View/View.js";
import { TaskJSONL } from "../JSONL/JSONL.js";
import md from "../markdown/md.js";
import { ui } from "../../ui/ui.js";
import { replay } from "./replay.js";
import { feed } from "./feed.js";
import { progress, spend } from "./stats.js";
import { segments } from "./card.js";
import { chat } from "../Ask/chat.js";

View.stylesheet(import.meta, "ai.css");

const pct = v => v == null ? "—" : Math.round(v * 100) + "%";
const time = ms => ms == null ? "—" : ms < 60000 ? Math.round(ms / 1000) + "s" : Math.round(ms / 60000) + "m";

/**
 * A task's record: its `task.jsonl` (or a legacy `session.json`) rendered — the
 * request verbatim, the step checklist, the brief, the spend, one row per agent
 * — with a chat replay of any transcript the dev server can still serve.
 *
 * This class IS the master template, and `report()` is its outline. Every part
 * is a named method, so a task dir's own `page.js` overrides whichever it wants
 * and inherits the rest — assign-based OOP, no options:
 *
 *     export default new AITask({
 *         meta: import.meta,
 *         title: "panel",
 *         extra(m){ md("what this one uniquely needs to say"); },
 *     });
 *
 * Schema and design record: readme.md.
 */
export class AITask extends Page {

	content(){
		div.c("ai-task flow", async $s => {
			const [m, req] = await Promise.all([this.session(), this.requirements()]);
			$s.append(() => m || req ? this.report(m, req) : md("No `task.jsonl` or `session.json` beside this page yet."));
		});
	}

	// task.jsonl first, then the legacy session.json snapshot. It streams on the
	// dev server, so a running task's own page follows its log.
	async session(){
		const t = new TaskJSONL({ url: this.base() + "task.jsonl" });
		await t.live(() => this.$live && this.refresh(t));
		if (t.loaded) return t;

		// ⚠ A legacy task's task.jsonl never appears, so the probe would stand as a
		// dead subscription; a dir with NEITHER file keeps its stream — that log is
		// about to be written.
		const old = await this.legacy();
		if (old) t.unsubscribe();
		return old;
	}

	// `src` points the viewer at a manifest not beside its own meta — dynamic routes.
	// ⚠ The SPA fallback answers a miss with index.html; content-type is the 404.
	async legacy(){
		const res = await fetch(this.src ?? new URL("session.json", this.meta.url)).catch(() => null);
		return res?.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null;
	}

	base(){ return this.src ? this.src.replace(/[^/]*$/, "") : new URL(".", this.meta.url).pathname; }

	async requirements(){
		const res = await fetch(this.base() + "requirements.md").catch(() => null);
		return res?.ok && !res.headers.get("content-type")?.includes("html") ? res.text() : null;
	}

	/** The outline. Override a part, not this — unless you mean to reorder them. */
	report(m, req){
		this.head(m, req);
		if (!m) return;
		this.$live = div.c("ai-live flow");
		this.refresh(m);
		this.chat(m);
		this.log(m);
	}

	/* The manifest's own part of the page, redrawn in place on every streamed
	   append — the chat panel and the feed hold state a redraw would wipe. */
	refresh(m){
		this.$live.empty(() => {
			this.checklist(m);
			this.unparsed(m);
			this.extra(m);
			this.figures(m);
		});
	}

	/* Lines that failed `JSON.parse` — whatever state they carried is missing from
	   everything on this page, so say so instead of rendering a plausible record. */
	unparsed(m){
		if (m.unparsed) p.c("muted",
			`⚠ ${m.unparsed} unparsed line${m.unparsed > 1 ? "s" : ""} — this record is incomplete. The console has the first one.`);
	}

	head(m, req){
		if (m?.request) md("> " + m.request.trim().split("\n").join("\n> "));
		if (req) details.c("ai-brief", () => { summary("Requirements — the brief"); md(req); });
	}

	/** The step outline, checked off. Silent for a task that declared none. */
	checklist(m){
		const pr = progress(m);
		if (!pr) return;

		div.c("ai-checklist-head flex split v-baseline", () => {
			span.c("ai-group-title muted", "Steps");
			span.c("muted", pr.done + " of " + pr.total + " done");
		});
		segments(pr);
		div.c("ai-checklist", () => pr.steps.forEach((s, i) =>
			div.c("ai-check").ac(i < pr.done ? "done" : i === pr.done && !m.landed_at && "now")
				.append(() => { span.c("ai-box"); span(s); })));
	}

	/** Nothing by default — the hook a task's own page.js fills. */
	extra(m){}

	figures(m){
		const cost = spend(m);
		ui.table(
			["requested", "landed", "model", "window", "agents", cost?.[1] ?? "tokens"],
			[[m.requested_at ?? "—", m.landed_at ?? "—", m.model ?? "—",
				`${pct(m.window?.before)} → ${pct(m.window?.after)}`,
				String(m.agents?.length ?? 0), cost?.[0] ?? "—"]]
		);
		if (m.window?.note) md("*" + m.window.note + "*");

		if (m.usage) ui.table(
			["input", "cache write", "cache read", "output", "api calls"],
			[[m.usage.input, m.usage.cache_write, m.usage.cache_read, m.usage.output, m.usage.calls]
				.map(n => n?.toLocaleString() ?? "—")]
		);

		if (m.agents?.length) ui.table(
			["agent", "model", "tokens", "time", "cost", "outcome"],
			m.agents.map(a => [a.task ?? a.type ?? "—", a.model ?? "—",
				a.tokens?.toLocaleString() ?? "—", time(a.duration_ms),
				a.cost_usd != null ? "$" + a.cost_usd : "—", a.outcome ?? "—"])
		);

		if (m.outcome) md(m.outcome);
	}

	/* Talk to this task's session from the page. The first message FORKS the
	   task's own session — a headless turn must never share a transcript a human
	   still has open — and the fork's id lands as `chat_session_id`. See ext/Ask. */
	chat(m){
		div.c("ai-header", () => span.c("ai-group-title muted", "Chat with this session"));
		chat({
			// A thread's path under `public/` — the one shape every Ask RPC takes.
			task: this.base().replace(/^\/|\/$/g, ""),
			from: m.chat_session_id ? undefined : m.session_id,
			resume: m.chat_session_id,
			history: m.chats,
		});
	}

	/* ⚠ No `session_id` in the manifest means NO log at all — feed()/replay() both
	   return silently, which reads as "the server can't serve it". Say which. */
	log(m){
		if (!m.session_id) return p.c("muted", "No `session_id` in this manifest — the transcript can't be found. A task's first `assign` should carry it.");

		feed(m.session_id);
		replay(m.session_id, "this session — as threads");
		div.c("ai-nested", () => m.agents?.forEach(a => replay(a.session_id, a.task ?? "agent")));
	}
}

export default AITask;
