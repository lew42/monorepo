// history and reasons: doc/AITask-notes.md

import { Page } from "../../core/Page/Page.class.js";
import { View, div, span, p, button } from "../../core/View/View.js";
import { TaskJSONL } from "../../ext/JSONL/JSONL.js";
import md from "../../ext/markdown/md.js";
import { ui } from "../../ui/ui.js";
import { conversation, reveal, wanted_message } from "./conversation.js";
import { asks as ask_wall } from "./asks.js";
import { needs_of } from "./needs.js";
import { decisions as decision_wall } from "./decisions.js";
import { progress, spend } from "./stats.js";
import { names } from "./listing.js";
import { segments, current, links_row } from "./card.js";
import { shot_wall } from "./shots.js";
import { chat } from "../../ext/Ask/chat.js";
import { breakdown } from "./cost.js";
import { streamed as reply_streamed } from "../../ext/Ask/reply.js";
import { fold } from "./message.js";
import TaskViews from "./TaskViews.js";
import Task from "../../core/Task/Task.js";
import { tree_for_task } from "./tree.js";

View.stylesheet(import.meta, "ai.css");

const pct = v => v == null ? "—" : Math.round(v * 100) + "%";
const time = ms => ms == null ? "—" : ms < 60000 ? Math.round(ms / 1000) + "s" : Math.round(ms / 60000) + "m";

const first_sentence = s => (s.match(/^.*?[.!?](?=\s|$)/s)?.[0] ?? s).trim();
const outcome_cell = text => {
	const brief = first_sentence(text);
	return brief.length >= text.trim().length ? text : () => fold(brief + " …", () => p(text));
};

function tab_bar(sections, active){
	const panels = new Map();
	const built = new Set();
	let $bar;

	div.c("tabs", () => {
		$bar = div.c("tab-bar", () => sections.forEach(([name, label]) =>
			button.c("tab").ac(name === active && "active").text(label)
				.on("click", () => select(name))));

		// ⚠ Panels built only on first select (6MB+ transcript lazy-loaded)
		div.c("tab-panel", () => sections.forEach(([name]) => {
			const $panel = div();
			$panel.el.hidden = name !== active;
			panels.set(name, $panel);
		}));
	});

	fill(active);

	// ⚠ scrollIntoView() is a no-op on display:none; only active tab built visible
	function fill(name){
		if (built.has(name)) return;
		built.add(name);
		panels.get(name).append(sections.find(s => s[0] === name)[2]);
	}

	function select(name){
		fill(name);
		panels.forEach(($p, n) => $p.el.hidden = n !== name);
		[...$bar.el.children].forEach((el, i) => el.classList.toggle("active", sections[i][0] === name));
	}

	return { select };
}

export class AITask extends Page {

	static into(base, ...args){
		const task = new this({ title: base.split("/").filter(Boolean).at(-1), url: base, src: base + "session.json" }, ...args);
		task.content();
		return task;
	}

	route(sub){
		if (sub.includes(".")) return;
		const at = this.url?.match(/\/framework\/ai\/(\d{4}-\d{2}-\d{2}\/.+?)\/?$/)?.[1];
		const list = at ? names(`${at}/${sub}`) : null;
		if (list ? (!list.includes("task.jsonl") || list.includes("page.js"))
			: (!(AITask.has(this.url + sub + "/session.jsonl") || AITask.has(this.url + sub + "/task.jsonl")) || AITask.has(this.url + sub + "/page.js"))) return;   // the sessions store: no listing, so ask the server
		return new AITask({ title: sub, icon: "receipt_long", url: this.url + sub + "/", src: this.url + sub + "/session.json" });
	}

	static has(url){
		const x = new XMLHttpRequest();
		x.open("HEAD", url, false);
		try { x.send(); } catch { return false; }
		return x.status >= 200 && x.status < 300 && !(x.getResponseHeader("content-type") ?? "").includes("html");
	}

	content(){
		div.c("ai-task flow wide", async $s => {
			const [m, req, roots] = await Promise.all([this.session(), this.requirements(), this.subtasks()]);
			this.roots = roots;
			$s.append(() => m || req ? this.report(m, req) : md("No `task.jsonl` or `session.json` beside this page yet."));
		});
	}

	async session(){
		const t = new TaskJSONL({ url: this.base() + "task.jsonl" });
		// Keep the parsed lines the stream already read, so this.task replays them without a second fetch.
		const read = t.read.bind(t), reset = t.reset.bind(t);
		t.read = entries => { (t.entries ??= []).push(...entries); this.task = Task.replay(t.entries); return read(entries); };
		t.reset = () => { t.entries = []; return reset(); };
		await t.live(() => this.streamed(t));
		if (t.loaded) return t;

		// ⚠ Missing task.jsonl keeps stream open (about to be written)
		const old = await this.legacy();
		if (old) t.unsubscribe();
		return old;
	}

	// The task and the tasks inside its folder, or null when it has none (or off the dev server). Drawn by the Tree tab.
	async subtasks(){
		const roots = await tree_for_task(this.base()).catch(() => null);
		return roots && TaskViews.inner(roots) ? roots : null;
	}

	async legacy(){
		const res = await fetch(this.src ?? new URL("session.json", this.meta.url)).catch(() => null);
		return res?.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null;
	}

	base(){ return this.src ? this.src.replace(/[^/]*$/, "") : new URL(".", this.meta.url).pathname; }

	async requirements(){
		if (Array.isArray(this.known_files) && !this.known_files.includes("requirements.md")) return null;
		const res = await fetch(this.base() + "requirements.md").catch(() => null);
		return res?.ok && !res.headers.get("content-type")?.includes("html") ? res.text() : null;
	}

	report(m, req){
		if (!m) return this.head(m, req);

		let tabs;
		const to_prompt = uuid => { tabs.select("session"); reveal(uuid); };

		const sections = [
			["requirements", "Requirements", () => this.head(m, req)],
			["report", "Report", () => { this.$live = div.c("ai-live flow"); this.refresh(m); }],
			["session", "Session", () => { this.chat(m); this.log(m); }],
		];
		// After Asks, before Report: what was wanted, the brief, what was chosen, the answer.
		if (this.roots) sections.splice(sections.length - 1, 0, ["tree", "Tree", () => TaskViews.from_url(this.roots).draw()]);
		if (m.decisions?.length) sections.splice(1, 0, ["decisions", "Decisions", () => this.decisions(m)]);
		if (m.asks?.length) sections.unshift(["asks", "Asks", () => this.asks(m, to_prompt)]);

		const message = wanted_message();
		tabs = tab_bar(sections, message ? "session" : this.roots && new URLSearchParams(location.search).has("view") ? "tree" : m.asks?.length ? "asks" : "report");
		if (message) reveal(message);
	}

	asks(m, to_prompt){
		const sign = () => JSON.stringify([m.ranks ?? {}, needs_of(m, this.base()).map(n => n.id + n.minutes)]);

		// ⚠ A statement not expression: return value is appended
		const state = this.asks_state = {
			was: sign(),
			redraw: () => this.$asks?.empty(() => { ask_wall(m, this.base(), to_prompt, state.redraw); }),
			streamed: () => {
				const now = sign();
				if (now === state.was) return;
				state.was = now;
				state.redraw();
			},
		};

		return this.$asks = div.c("ai-asks-panel", () => { ask_wall(m, this.base(), to_prompt, state.redraw); });
	}

	decisions(m){
		// ⚠ A statement not expression: return value is appended
		const state = this.decision_state = {
			open: null,
			improving: null,
			redraw: () => this.$decisions?.empty(() => { decision_wall(m, state); }),
		};
		return this.$decisions = div.c("ai-decisions-panel", () => { decision_wall(m, state); });
	}

	streamed(m){
		if (this.$live) this.refresh(m);
		this.decision_state?.redraw();
		this.asks_state?.streamed();
		reply_streamed();
	}

	status(m){
		if (this.task) span.c("ai-task-state muted", this.task.state);
		const now = !m.landed_at && current(m);
		if (now && now !== progress(m)?.current) div.c("flex gap v-center", () => {
			span.c("ai-dot live");
			span(now);
		});
	}

	refresh(m){
		this.$live.empty(() => {
			this.cost(m);
			this.outcome(m);
			this.links(m);
			this.status(m);
			this.checklist(m);
			this.unparsed(m);
			this.extra(m);
			this.shots(m);
			this.figures(m);
		});
	}

	outcome(m){
		if (m.outcome) md(m.outcome).ac("ai-outcome");
	}

	links(m){ return links_row(m); }

	unparsed(m){
		if (m.unparsed) p.c("muted",
			`⚠ ${m.unparsed} unparsed line${m.unparsed > 1 ? "s" : ""} — this record is incomplete. The console has the first one.`);
	}

	head(m, req){
		if (req) return md(req);
		if (m?.request) md("> " + m.request.trim().split("\n").join("\n> "));
	}

	checklist(m){
		const pr = progress(m);
		if (!pr) return;

		div.c("ai-checklist-head flex split v-baseline", () => {
			span.c("ai-group-title muted", "Steps");
			span.c("muted", pr.done + " of " + pr.total + " done" + (this.task ? " · " + Math.round(this.task.completion * 100) + "%" : ""));
		});
		segments(pr);
		div.c("ai-checklist", () => pr.steps.forEach((s, i) =>
			div.c("ai-check").ac(i < pr.done ? "done" : i === pr.done && !m.landed_at && "now")
				.append(() => { span.c("ai-box"); span(s); })));
	}

	cost(m){ return breakdown(m); }

	extra(m){}

	shots(m){ shot_wall(m.shots); }

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
				a.cost_usd != null ? "$" + a.cost_usd : "—", a.outcome ? outcome_cell(a.outcome) : "—"])
		);
	}

	chat(m){
		return fold("chat with this session", () => this.composer(m));
	}

	composer(m){
		chat({
			task: this.base().replace(/^\/|\/$/g, ""),
			from: m.chat_session_id ? undefined : m.session_id,
			resume: m.chat_session_id,
			history: m.chats,
		});
	}

	log(m){
		if (!m.session_id) return p.c("muted", "No `session_id` in this manifest — the transcript can't be found. A task's first `assign` should carry it.");

		conversation(m.session_id);

		const own = (m.agents ?? []).filter(a => a.session_id && a.session_id !== m.session_id);
		own.forEach(a => fold("agent — " + (a.task ?? "agent"), () => conversation(a.session_id)));
	}
}

export default AITask;
