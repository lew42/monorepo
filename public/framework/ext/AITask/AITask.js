import { Page } from "../../core/Page/Page.class.js";
import { View, div, span, p, button } from "../../core/View/View.js";
import { TaskJSONL } from "../JSONL/JSONL.js";
import md from "../markdown/md.js";
import { ui } from "../../ui/ui.js";
import { conversation, reveal, wanted_message } from "./conversation.js";
import { asks as ask_wall } from "./asks.js";
import { needs_of } from "./needs.js";
import { decisions as decision_wall } from "./decisions.js";
import { progress, spend } from "./stats.js";
import { segments, current, links_row } from "./card.js";
import { shot_wall } from "./shots.js";
import { chat } from "../Ask/chat.js";
import { streamed as reply_streamed } from "../Ask/reply.js";
import { fold } from "./message.js";

View.stylesheet(import.meta, "ai.css");

const pct = v => v == null ? "—" : Math.round(v * 100) + "%";
const time = ms => ms == null ? "—" : ms < 60000 ? Math.round(ms / 1000) + "s" : Math.round(ms / 60000) + "m";

/* A row's outcome, trimmed to its first sentence — full text a click away
   (`fold`, the same expando `message.js` uses for a thinking block), so 21
   agents don't cost 12,000px of paragraph. */
const first_sentence = s => (s.match(/^.*?[.!?](?=\s|$)/s)?.[0] ?? s).trim();
const outcome_cell = text => {
	const brief = first_sentence(text);
	return brief.length >= text.trim().length ? text : () => fold(brief + " …", () => p(text));
};

/* A local Asks · Requirements · Report · Session toggle, built from `ext/tabs`'s
   own CSS classes by hand (`web/nav/tabs/page.js` sets the precedent) — this is a
   JS-only swap between named sections of ONE page, not a routed page set, so
   `Page.prototype.tabs` (linkable urls over declared children) doesn't fit.

   Returns `{ select }` so one tab can send the reader to another: the Asks tab's
   "the prompt" link opens Session at the message the ask was made in. */
function tab_bar(sections, active){
	const panels = new Map();
	const built = new Set();
	let $bar;

	div.c("tabs", () => {
		$bar = div.c("tab-bar", () => sections.forEach(([name, label]) =>
			button.c("tab").ac(name === active && "active").text(label)
				.on("click", () => select(name))));

		// ⚠ Every panel is created EMPTY, hidden, but not yet built — a tab's
		// content builds on its own first select() only. Session's fn() pulls
		// chat.js's history and feed.js's /ai-logs/ transcript (measured:
		// 6MB+ on a long session) — nothing under it fetches until clicked.
		div.c("tab-panel", () => sections.forEach(([name]) => {
			const $panel = div();
			$panel.el.hidden = name !== active;
			panels.set(name, $panel);
		}));
	});

	fill(active);

	// ⚠ A non-active panel is still hidden when this fills it, so chat.js's
	// bubble() — scrollIntoView() on every history line, unconditionally — is
	// a no-op on the `display:none` subtree. The active tab (Report) has no
	// such call, so building it visible at start-up is fine.
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

/**
 * A task's record: its `task.jsonl` (or a legacy `session.json`) rendered as
 * three tabs — **Report** (the answer first: outcome, links, status, the step
 * checklist, then the tables), **Session** (chat + the transcript), and
 * **Requirements** (the brief) — so the answer is what a task page leads with.
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

	/* ⚠ `wide`, not the default `main` track. A task page is not prose: it is a
	   wall of ask cards, a conversation with a rail beside it, and four tables of
	   figures, and at 1280 the reading column gave all of that 602px — two of the
	   three tabs were squeezed into a third of the screen. `wide` is main plus the
	   breakout (890px at 1280, 1419 at 1920), and `ai.css` keeps every paragraph,
	   heading and list inside it on `--measure`, exactly the way a page column does
	   — so the prose is unchanged and only the things that wanted room get it. */
	content(){
		div.c("ai-task flow wide", async $s => {
			const [m, req] = await Promise.all([this.session(), this.requirements()]);
			$s.append(() => m || req ? this.report(m, req) : md("No `task.jsonl` or `session.json` beside this page yet."));
		});
	}

	// task.jsonl first, then the legacy session.json snapshot. It streams on the
	// dev server, so a running task's own page follows its log.
	async session(){
		const t = new TaskJSONL({ url: this.base() + "task.jsonl" });
		await t.live(() => this.streamed(t));
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

	/** The outline: Asks · Requirements · Report · Session.
	 *
	 *  **Asks comes first and opens by default whenever the log carries any** —
	 *  what the owner asked for outranks what a session did about it. Without
	 *  asks the page is what it always was: Report open, the answer before the
	 *  brief. A task with only a brief (proposed, not yet running) has nothing
	 *  to tab between.
	 *
	 *  A url carrying `?m=<uuid>` or `#m-<uuid>` names one message of the
	 *  transcript, so it opens Session instead and scrolls there.
	 *  Override a part, not this — unless you mean to reorder them. */
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
		if (m.decisions?.length) sections.splice(1, 0, ["decisions", "Decisions", () => this.decisions(m)]);
		if (m.asks?.length) sections.unshift(["asks", "Asks", () => this.asks(m, to_prompt)]);

		const message = wanted_message();
		tabs = tab_bar(sections, message ? "session" : m.asks?.length ? "asks" : "report");
		if (message) reveal(message);
	}

	/**
	 * Everything the owner asked for, as preview cards, with the "needs you"
	 * strip above them. See `asks.js`.
	 *
	 * ⚠ Redrawn on a streamed append only when something this tab SHOWS has
	 *   changed — the owner's order, or the set of items waiting on the owner.
	 *   Every other append (a log line, an agent landing) leaves it alone,
	 *   because rebuilding the wall re-fetches every serving task's manifest and
	 *   closes whatever sheet the reader had open. `sign()` is that test.
	 */
	asks(m, to_prompt){
		const sign = () => JSON.stringify([m.ranks ?? {}, needs_of(m, this.base()).map(n => n.id + n.minutes)]);

		// ⚠ A statement, not an expression: a captured callback's RETURN VALUE is
		//   appended too, which would move the tab to the end of its own wrapper.
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

	/**
	 * Every choice this task made, with Approve / Improve on each. See
	 * `decisions.js`.
	 *
	 * The open row and the note box are held HERE, not in the module, so a
	 * verdict arriving over the socket can redraw the whole tab without closing
	 * what the reader had open — `state.redraw` is the seam that does it.
	 */
	decisions(m){
		// ⚠ A statement, not an expression: a captured callback's RETURN VALUE is
		//   appended too, which would move the tab to the end of its own wrapper.
		const state = this.decision_state = {
			open: null,
			improving: null,
			redraw: () => this.$decisions?.empty(() => { decision_wall(m, state); }),
		};
		return this.$decisions = div.c("ai-decisions-panel", () => { decision_wall(m, state); });
	}

	/**
	 * Every panel that draws from the manifest, redrawn on each appended line.
	 *
	 * ⚠ Each one is guarded because a tab's panel is not built until the reader
	 *   first selects it (`tab_bar`) — before this existed the callback said
	 *   `this.$live && …`, so on a task that opens on Asks NOTHING streamed.
	 */
	streamed(m){
		if (this.$live) this.refresh(m);
		this.decision_state?.redraw();
		this.asks_state?.streamed();
		// A reply filed from ANY tab arrives here as an appended `chat` line, so
		// every reply thread on this page redraws itself from the log — no
		// reload, and a second window follows along. `ext/Ask/reply.js`.
		reply_streamed();
	}

	/* Where this is right now — the same `now` the card shows, above the checklist
	   so it reads before any history. Redrawn with the rest of $live: a live task
	   streams new `now` lines in place, not just on first paint.
	   Landed: `outcome` below is the truth, a stale `now` is not shown. No `now`
	   and no open agent: nothing, since a placeholder would lie just as loudly. */
	status(m){
		const now = !m.landed_at && current(m);
		if (now && now !== progress(m)?.current) div.c("flex gap v-center", () => {
			span.c("ai-dot live");
			span(now);
		});
	}

	/* The manifest's own part of the page, redrawn in place on every streamed
	   append — the chat panel and the feed hold state a redraw would wipe.
	   Outcome and links lead: they're the answer, above the 12,000px of tables
	   below them. */
	refresh(m){
		this.$live.empty(() => {
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

	/** The answer. Silent until the task has landed and said one. */
	outcome(m){
		if (m.outcome) md(m.outcome).ac("ai-outcome");
	}

	/** The pill row of this task's own deliverable links — `card.js`'s row,
	    reused so the task page never drops what the card already shows. */
	links(m){ return links_row(m); }

	/* Lines that failed `JSON.parse` — whatever state they carried is missing from
	   everything on this page, so say so instead of rendering a plausible record. */
	unparsed(m){
		if (m.unparsed) p.c("muted",
			`⚠ ${m.unparsed} unparsed line${m.unparsed > 1 ? "s" : ""} — this record is incomplete. The console has the first one.`);
	}

	/** Requirements — `requirements.md` rendered whole when there is one,
	    else the request verbatim. Its own tab, so the plan never competes
	    with the answer for the fold. */
	head(m, req){
		if (req) return md(req);
		if (m?.request) md("> " + m.request.trim().split("\n").join("\n> "));
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

	/** Screenshots this run logged — ext/JSONL's `shot` verb. Silent without any. */
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

	/* Talk to this task's session from the page. The first message FORKS the
	   task's own session — a headless turn must never share a transcript a human
	   still has open — and the fork's id lands as `chat_session_id`. See ext/Ask.
	   ⚠ Folded, and it is the fold that matters: open, the composer and its
	   history were the whole first screen of the Session tab and the conversation
	   the tab is FOR began below the fold. Talking to a session is a tool you
	   reach for; reading it is why you came. */
	chat(m){
		return fold("chat with this session", () => this.composer(m));
	}

	composer(m){
		chat({
			// A thread's path under `public/` — the one shape every Ask RPC takes.
			task: this.base().replace(/^\/|\/$/g, ""),
			from: m.chat_session_id ? undefined : m.session_id,
			resume: m.chat_session_id,
			history: m.chats,
		});
	}

	/* The transcript, read as a conversation — `conversation.js`.
	   ⚠ No `session_id` in the manifest means NO log at all, and the renderer
	   would just return silently, which reads as "the server can't serve it".
	   Say which. */
	log(m){
		if (!m.session_id) return p.c("muted", "No `session_id` in this manifest — the transcript can't be found. A task's first `assign` should carry it.");

		conversation(m.session_id);

		/* An agent that ran in its OWN session has its own transcript; one spawned
		   inside this session is a sidechain and is already folded into the steps
		   above, so it is not listed twice. */
		const own = (m.agents ?? []).filter(a => a.session_id && a.session_id !== m.session_id);
		own.forEach(a => fold("agent — " + (a.task ?? "agent"), () => conversation(a.session_id)));
	}
}

export default AITask;
