import { servex_url } from "/framework/dev/servex_url.js";
import { Page, div, span, small, p, a, button } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";
import { load as raw_transcript_lines } from "/framework/ai/AITask/replay.js";
import { AITask } from "/framework/ai/AITask/AITask.js";
import AISessionRows from "./AISessionRows.js";
import AISessionView from "./AISessionView.js";
import AISessionFollow from "./AISessionFollow.js";
import AISessionTrace from "./AISessionTrace.js";
import AISession from "./AISession.js";
import AISessionConversation from "./AISessionConversation.js";
import AISessionCoverage from "./AISessionCoverage.js";
import PromptLog from "./PromptLog.js";
import JSONL from "/framework/ext/JSONL/JSONL.js";
import VoiceFlow from "/framework/ext/Refine/stages/VoiceFlow.js";
import Item from "/framework/core/Item/Item.js";
import { fetch_names } from "/framework/core/Router/listing.js";
import Role from "/framework/core/Role/Role.js";
import RoleView from "/framework/core/Role/RoleView.js";
import Property from "/framework/core/Property/Property.js";
import SessionMenu from "/framework/core/Session/SessionMenu.js";
import SessionSettings from "/framework/core/Session/SessionSettings.js";
import SessionTasks from "/framework/core/Session/SessionTasks.js";
import SessionWork from "./SessionWork.js";
import SessionTasksGrid from "./SessionTasksGrid.js";
import SessionStats from "./SessionStats.js";
import AICost from "/framework/ai/AITask/AICost.js";
import Day from "/framework/core/Session/Day.js";
import SessionOverview from "./SessionOverview.js";
import SessionOutlineView from "./SessionOutlineView.js";
import SessionTimeline from "./SessionTimeline.js";
import ChatV2 from "/framework/ext/Chat/v2/ChatV2.js";
import SessionPopover from "./SessionPopover.js";
import "/framework/core/Page/parts/kinds.js";   // the kinds the page tool adds register themselves by import: one list

// One session's own page, opened at its dated folder /framework/ai/sessions/YYYY/MM/DD/<folder>/ (StoreFolder.child builds it with `segs`);
// /framework/ai/sessions/<id>/ redirects there, and is the page only for a session with no folder yet. `home` is the Sessions page it hangs under.
// The loaders are statics. Each degrades to null when its file is missing, and a missing piece just does not draw.
export default class AISessionDetail extends Page {

	/** `segs` (YYYY, MM, DD, folder) puts the page at its dated folder, the session's one url; `below(name)` routes the folder's own subfolders (StoreFolder.route: tasks, nested folders). With neither, the page is at home.url + id (a session with no folder yet). */
	constructor({ home, id, segs, below }){
		// The title is the page's path, so it is shown whole (the header line is compact; the row's tab title sits in the conversation's head).
		super({ home, id, width: "fill", title: AISessionDetail.first_title(home, id), url: segs ? home.url + segs.join("/") + "/" : home.url + id + "/" });
		this.segs = segs; this.below = below;
	}

	route(name){ return this.below?.(name); }

	/** The id (or Servex agent name) and uuid a session folder stands for, from line 1 of its record (`session` or `assign`; a task's launch line is not one), else from its `session-<id8>` name and the index. null: not a session folder. */
	static async id_of_folder(root_url, url){
		for (const file of ["session.jsonl", "task.jsonl"]){
			if (!AITask.has(url + file)) continue;
			const res = await fetch(url + file, { headers: { Range: "bytes=0-4095" } }).catch(() => null);
			if (!res?.ok) continue;
			try {
				const first = JSON.parse((await res.text()).split("\n")[0]), id = first.assign?.agent ?? first.session?.id ?? first.assign?.session_id;
				if (id) return { id, session_id: first.assign?.session_id ?? first.session?.id ?? id };
			} catch {}
		}
		const id8 = /\/session-([0-9a-f]{8})\/$/.exec(url)?.[1];
		const hit = id8 && Object.keys((await AISessionRows.load_index(root_url))?.rows ?? {}).find(k => k.startsWith(id8));
		return hit ? { id: hit, session_id: hit } : null;
	}

	/** The full uuid an 8-character hex short id stands for (the first index row that starts with it), else the name unchanged. */
	static async expand(root_url, name){
		if (!/^[0-9a-f]{8}$/.test(name)) return name;
		return Object.keys((await AISessionRows.load_index(root_url))?.rows ?? {}).find(k => k.startsWith(name + "-")) ?? name;
	}

	/** Where `/sessions/<id>/` should send the browser: the session's dated folder url, or null (no folder known, it is a task's deeper folder, or it holds no session record) and the id url stays the page. */
	static async folder_for(root_url, name){
		const row = await AISessionDetail.load_row(root_url, name), sid = row?.session_id ?? name;
		if (!/^[0-9a-f]{8}-/.test(sid)) return null;
		if (!AISession.slugs.has(sid)) await AISessionDetail.folder_from_day(row, sid);
		const url = AISession.page_url(sid, null);
		return url && await AISessionDetail.id_of_folder(root_url, url) ? url : null;
	}

	/** The dated folder url of a session folder named `folder` (`session-<id8>`, or a voice record's own `v-…`, `cloud-voice-…`), found by asking each of the last 21 days for its session.jsonl; null when none has it. The fallback for a session the index has not met yet. */
	static async dated_folder(root_url, folder){
		const days = Array.from({ length: 21 }, (_, i) => AISession.day(new Date(Date.now() - i * 864e5)));
		const hits = await Promise.all(days.map(day => fetch(`${root_url}${day}/${folder}/session.jsonl`, { headers: { Range: "bytes=0-0" } })
			.then(res => res.ok && !(res.headers.get("content-type") ?? "").includes("html") ? `${root_url}${day}/${folder}/` : null).catch(() => null)));
		return hits.find(Boolean) ?? null;
	}

	/** Whether `/sessions/<name>/` names a session: a row (sessions.json, the live agent list, the index or the tree) or a session folder `folder_for` finds. A bare name that is none of these has no record to read, so it is "not found". */
	static async known(root_url, name){
		if (await AISessionDetail.load_row(root_url, name)) return true;
		if (name in ((await AISessionRows.load_index(root_url))?.rows ?? {})) return true;
		return !!await AISessionDetail.folder_for(root_url, name);
	}

	/** The name from rows AISessionsPage.child() preloaded, so the first paint already shows it; the id only when there is no row. */
	static first_title(home, id){
		const row = AISessionRows.snapshot?.rows?.find(r => r.id === id || r.session_id === id);
		return AISessionRows.display_name(row ?? { id, session_id: id }, AISessionRows.tree).text;   // a VS Code tab has no row; the index names it
	}

	/** Fetch sessions.json, the index and the tree once, before the detail page is built (called from AISessionsPage.child()). */
	static preload(root_url, id){
		return (async () => {
			AISessionDetail._rows ??= Promise.all([
				AISessionRows.get_json(root_url + "sessions.json"),
				AISessionRows.load_index(root_url),
				AISessionRows.load_tree(root_url),
			]);
			const [snap, , tree] = await AISessionDetail._rows;
			AISessionRows.snapshot = snap; AISessionRows.tree ??= tree;
			// The name lives in the day index snapshot (session-index.json can be days stale): fold in the row's own snapshot, as the live feed would.
			const row = snap?.rows?.find(r => r.id === id || r.session_id === id), sid = row?.session_id ?? id;
			if (!AISession.all.get(sid)?.ix?.title){
				const days = [...new Set([AISession.days.get(sid), ...[row?.last_activity, new Date().toISOString(), row?.started_at].map(at => at && AISession.day(new Date(at)))].filter(Boolean))];   // the day the feed already gave the session comes first: a session sessions.json has no row for is found there
				for (const day of days){
					const hit = (await AISessionRows.get_json(new URL(`./${day}/index.json`, AISession.root_url()).pathname))?.snapshots?.find(x => x.id === sid);
					if (hit){ AISession.apply_delta(hit); break; }
				}
			}
		})();
	}

	/** Show the session's name (the grid's Name column) instead of its id, once the row is known: the column head and the crumb were drawn with the id. */
	retitle(name){
		if (!name || name === this.title) return;
		this.title = name;
		this.view?.el.querySelector(".page-column-title")?.replaceChildren(name);
		for (const crumb of document.querySelectorAll(`.page-crumbs a[href="${this.url}"]`)) crumb.replaceChildren(name);
	}

	// With tabs on (a `tab` line in the session's page.jsonl), the template itself is the first tab.
	home_tab = "Conversation";

	deactivated(){ this.tasks_log?.unsubscribe(); this.tasks_log = null; this.chat_v2?.then(c => c?.unsubscribe?.()); this.chat_v2 = null; this.follow?.then(f => f.stop()); this.follow = null; this.live_off?.(); this.live_off = null; this.logs?.forEach(log => log.unsubscribe()); this.logs = null; }

	/* THE SESSION'S OWN PAGE LOG (2026-10-09, the page tool): `page.jsonl` in the session's folder can
	   reshape this page on top of the template — tabs, the six layout words — and carries the cards the
	   AI posts. Found once (log_url), read before a child is resolved (so `/<id>/notes/` survives a
	   reload), and streamed while the page is open (content()). core/Page/doc/architecture.md. */
	// The SAME file the page tool writes (Servex/agents/page_tools.js → AISession.locate()): the session's own
	// dated folder; a session the index has not seen yet gets the folder locate() makes, today's `session-<id8>/`.
	// The old card folder (ai/YYYY/MM/DD/<slug>-<id8>/, where prompt-relay.mjs still writes the owner's prompts)
	// is read as well, while it exists — found through directory.json, which is big and slow, so it never
	// holds up the own log. Returns [own] at once, then [own, old] once the old folder is known.
	log_urls(){
		return this._log_urls ??= AISessionDetail.load_row(this.home.url, this.id).then(async row => {
			const session_id = row?.session_id ?? this.id;
			if (this.segs) return [this.url + "page.jsonl"];   // the url already names the dated folder (a voice session's "v-…" id fails the uuid check below, but needs no lookup to find its own folder)
			if (!/^[0-9a-f]{8}-/.test(session_id)) return [];
			await AISessionRows.load_index(this.home.url);   // fills AISession.days, so the dated folder is known
			if (!AISession.slugs.has(session_id)) await AISessionDetail.folder_from_day(row, session_id);   // a named folder (2026/10/07/can-you-check-usage/): without it the log is looked for at <day>/<uuid>/ and 404s
			const own = AISession.days.has(session_id) ? AISession.dir_url(session_id).pathname
				: new URL(`./${AISession.day(new Date())}/${AISessionDetail.slug(row, session_id)}/`, AISession.root_url()).pathname;
			this._old_url = AISessionDetail.dir_index().then(index => {
				const old = AISessionDetail.dir_of(index, session_id);
				return old && old !== own ? old + "page.jsonl" : null;
			});
			return [own + "page.jsonl"];
		});
	}

	/** The session's folder name, read from the day index of its last activity (where AISessionIndex writes its snapshot), folded in so AISession.dir_url() knows it. */
	static async folder_from_day(row, session_id){
		// sessions.json can be days stale, so its last activity, then today, then the start day: the first index naming the folder wins.
		const days = [...new Set([...[row?.last_activity, new Date().toISOString(), row?.started_at].map(at => at && AISession.day(new Date(at))), ...Day.range(AISession.days.get(session_id)).reverse()].filter(Boolean))];   // a session sessions.json has no row for: every day from the one the feed gave it (its first) to today
		const indexes = await Promise.all(days.map(day => AISessionRows.get_json(new URL(`./${day}/index.json`, AISession.root_url()).pathname)));   // all at once; the first day in the list that names the folder wins
		for (const ix of indexes){
			const snap = ix?.snapshots?.find(x => x.id === session_id);
			if (snap?.folder) return AISession.apply_delta({ id: session_id, folder: snap.folder, ...(snap.day ? { day: snap.day } : {}) });
		}
	}

	/** The folder name the page tool gives a session it makes a folder for: the Servex agent's id + id8, else session-<id8> (Servex/agents/page_tools.js). */
	static slug(row, session_id){
		const name = row?.id !== session_id && /^[a-z0-9][a-z0-9-]{2,60}$/.test(row?.id ?? "") ? row.id : "session";
		return `${name}-${session_id.slice(0, 8)}`;
	}

	/* THE SESSION MENU (core/Session/doc/menu.md): a button at the right end of the name line, listing AISession.MENU. */
	head_tools(){ return new SessionMenu({ session: new AISession(this.id), url: this.url, page: this }).draw(); }
	// The session's record, session.jsonl, beside its page.jsonl in the same folder.
	async record_url(){ const [own] = await this.log_urls(); return own ? own.replace(/page\.jsonl$/, "session.jsonl") : null; }
	/** The record only when its folder holds one: a VS Code tab's folder can have page.jsonl and no session.jsonl, and reading it would 404. Off the dev server the listing is null, so it is read as before. */
	async record_if_there(){ const file = await this.record_url(); if (!file) return null; const listed = await fetch_names(file.replace(/[^/]*$/, "")); return !listed || listed.includes("session.jsonl") ? file : null; }
	/** The session's role: the word on line 1 of its record (new sessions), else the registry's. Shown as core/Role does on the roles page. */
	async show_role($el, row, session_id){
		const file = await this.record_if_there();
		const first = file ? await fetch(file).then(r => r.ok ? r.text() : "").then(t => { try { return JSON.parse(t.match(/^.*/)[0]); } catch { return null; } }).catch(() => null) : null;
		const agents = await Role.agents();
		const live = agents.find(x => x.session_id === session_id);
		const word = first?.assign?.role ?? first?.session?.role ?? row?.role ?? live?.role;
		const roles = await Role.load();
		const agent_id = first?.assign?.agent ?? row?.agent ?? row?.id ?? live?.id;
		const role = word ? Role.find(roles, word) : Role.from_agent_id(roles, agent_id);
		if (!word && !role) return;
		await AISessionRows.load_index(this.home.url);
		const ix = AISession.of(session_id).ix;
		const real = { model: live?.model ?? row?.model ?? ix?.model, effort: ix?.effort ?? row?.effort ?? live?.effort };
		$el.empty(() => {
			small.c("muted", word ? "Role (recorded when the session started, else from the Servex registry):" : "Role (guessed from the agent id: this session recorded none):");
			if (role){
				const diff = RoleView.differs(role, real);
				RoleView.draw(role, agents.filter(x => (x.session_id ?? x.id) === session_id), { defaults: true, this_session: diff, path: live?.path ?? row?.path ?? first?.assign?.path });
			} else p("Role: " + word + " (not a row in roles.js)");
		});
	}
	async open_log(){ const url = await this.record_url(); if (url) window.open(url, "_blank"); }
	copy_link(){ return navigator.clipboard?.writeText(new URL(this.url, location.href).href); }

	log_loaded(){ return this._log_loaded ??= this.log_urls().then(urls => Promise.all(urls.map(url => new AISessionDetail.Log({ url, page: this }).load()))); }

	/* A subpage made by the page tool (`pages.add`) is a folder inside the session's own folder; the log's
	   `file` lines say which (SessionPageLog.read → sub_dirs). It is read from there and shown at this route. */
	async child(name, levels){
		if (name === "settings" && !this.children.get(name)){   // the session menu's first entry (core/Session/doc/menu.md)
			const file = await this.record_url();
			if (file) return this.add(name, new SessionSettings({ file, session_class: AISession, url: this.url + name + "/" }));
		}
		await this.log_loaded();
		const dir = this.sub_dirs?.get(name);
		if (dir && !(this.children.get(name) instanceof Page)){
			const page = await Page.jsonl(dir);
			if (page){
				page.url = this.url + name + "/";
				if (this.below && typeof page.route !== "function") page.route = sub => this.below(sub, [name]);   // a project folder drawn from its own page.jsonl: its task folders still open as tasks (StoreFolder.route)
				return this.add(name, page).load_all_children(levels);
			}
		}
		return super.child(name, levels);
	}

	/** Full screen: the page covers the window, the title and tabs scroll, and two buttons float (back out, session menu). `?full` keeps it across a reload. */
	full_screen(on){
		const el = this.view?.el; el?.parentElement?.scrollTo?.(0, 0); el?.classList.toggle("sov-full", on);
		const q = new URLSearchParams(location.search); on ? q.set("full", "") : q.delete("full");
		history.replaceState(history.state, "", location.pathname + (q.size ? "?" + String(q).replace(/full=(&|$)/, "full$1") : "") + location.hash);
	}

	content(){
		const { home, id } = this, url = home.url;
		const $parts = div.c("flow session-parts");   // the heading, text and card parts the page tool adds (SessionParts)
		this.parts = new AISessionDetail.Parts($parts);
		let $role, $box, $voice, $conv, $related, $costs, $spawn, $session, $trace, $coverage, $tasks, $work, $tgrid, work;
		const ready = new Promise(resolve => this.work_ready = resolve);   // the loaded SessionWork, for the stats bar and the Overview
		// Tabs, not columns: one full-width panel at a time, so no table is ever squeezed (doc/detail-layout.md). The tab is in ?tab= so a reload lands on it.
		const MAIN = [["overview", "Overview"], ["timeline", "Timeline"], ["chat", "Chat"], ["tasks", "Tasks"]], MORE = [["board", "Board"], ["coverage", "Coverage"], ["cost", "Cost"], ["models", "Models and tokens"], ["related", "Related"]], TABS = [...MAIN, ...MORE];
		const old_keys = { work: "tasks", conversation: "chat" }, asked = new URLSearchParams(location.search).get("tab"), want = old_keys[asked] ?? asked, panels = {}, buttons = {};
		let $more;
		const show = key => {
			if (!this.chat_ok && (key === "chat" || key === "coverage")) key = "overview";   // a child session has no chat or coverage: only a VS Code tab (or a session with prompts.jsonl) does
			for (const [k] of TABS){ panels[k].el.hidden = k !== key; buttons[k].el.classList.toggle(MORE.some(([m]) => m === k) ? "sov-menu-on" : "sessions-chip-on", k === key); }
			$more?.el.classList.toggle("sessions-chip-on", MORE.some(([k]) => k === key));
			if (key === "timeline") this.timeline?.shown();
			const q = new URLSearchParams(location.search); key === "overview" ? q.delete("tab") : q.set("tab", key);
			history.replaceState(history.state, "", location.pathname + (q.size ? "?" + q : "") + location.hash);
		};
		const row_p = AISessionDetail.load_row(url, id);   // this session's sessions.json row: the stats bar says "this tab" from its source
		new SessionStats({ ready, row: row_p, open_cost: () => show("cost") });   // Figma band E: stats first, sticky, on every tab
		div.c("sessions-tabs flex gap-50", () => {   // one line: Overview · Timeline · Chat · Tasks · More ▾ (the rest, in a SessionPopover)
			MAIN.forEach(([k, label]) => buttons[k] = button.c("sessions-chip", label).on("click", () => show(k)));
			$more = button.c("sessions-chip sov-more", "More ▾").attr("type", "button");
			const page = this;
			SessionPopover.open($more, function(){   // the Popover draws this once, right now: the More buttons exist from the start, so show() and buttons.coverage.el.hidden work. Never make it lazy.
				div.c("sov-menu", () => {
					MORE.forEach(([k, label]) => buttons[k] = button.c("sov-menu-item", label).attr("type", "button").on("click", () => { show(k); this.close(); }));
					a.c("sov-menu-item", "Task queue →").href("/framework/ai/queue/").attr("target", "_self");
					button.c("sov-menu-item", () => { icon("fullscreen"); span(" Full screen"); }).attr("type", "button").on("click", () => { page.full_screen(true); this.close(); });
				});
			}, "sov-more-pop");
		});
		div.c("sov-float", () => {   // Figma band E, C: in full screen the head is gone, so back and the session menu float over the page
			button.c("sov-float-btn", icon("arrow_back")).attr("title", "Leave full screen").on("click", () => this.full_screen(false));
			this.head_tools();
		});
		if (new URLSearchParams(location.search).has("full")) setTimeout(() => this.full_screen(true));
		div.c("sessions-detail-body", () => {
			panels.overview = div.c("flow sessions-panel", () => { this.feed = new SessionOutlineView({ ready, sid: id, on_draw: o => this.timeline?.children(o.found.list) }); });   // child sessions as groups, then this session's own work by prompt (SessionOutline)
			panels.timeline = div.c("flow sessions-panel", () => { this.timeline = new SessionTimeline({ sid: id }); });   // everything in the record and the prompt log, in time order (SessionTimeline)
			panels.board = div.c("flow sessions-panel", () => new SessionOverview({ ready, sid: id, go: show }));   // four cards: open, project, done, dropped (Figma band E)
			panels.tasks = div.c("flow sessions-panel", () => { $tgrid = div.c("flow"); $work = div.c("flow"); });   // the tasks as a grid with filters (SessionTasksGrid); its Nested chip shows $work, the nested view with Approve (SessionWork)
			panels.chat = div.c("flow sessions-panel sov-chat", () => {
				// Chat v1 (below) or Chat v2 (the session's Prompts from session.jsonl, ext/Chat/v2); ?chat_view=v2 keeps the choice on reload (?chat= belongs to the DevBar assistant). v1 stays the default until v2 replaces it.
				const pick = {};
				div.c("flex gap-50 wrap", () => { pick.v1 = button.c("sessions-chip", "Chat").on("click", () => choose(false)); pick.v2 = button.c("sessions-chip", "Chat v2").on("click", () => choose(true)); });
				const $v1 = div.c("flow", () => {
					$tasks = div.c("flow session-tasks");   // the session's tasks, live; an owner prompt's asks arrive here as proposals (core/Session/SessionTasks.js)
					$box = div.c("flow");     // which session this is (source tag, tab title, model)
					$voice = div.c("flow");   // spoken prompts, stage by stage, live (ext/Refine/stages)
					$conv = div.c("flow sessions-conv");   // the live conversation
				});
				const $v2 = div.c("flow chat-v2");
				const choose = v2 => {
					$v1.el.hidden = v2; $v2.el.hidden = !v2;
					pick.v1.el.classList.toggle("sessions-chip-on", !v2); pick.v2.el.classList.toggle("sessions-chip-on", v2);
					const q = new URLSearchParams(location.search); v2 ? q.set("chat_view", "v2") : q.delete("chat_view");
					history.replaceState(history.state, "", location.pathname + (q.size ? "?" + q : "") + location.hash);
					if (v2) this.chat_v2 ??= this.record_if_there().then(file => file ? new ChatV2({ url: file, $box: $v2 }).live() : $v2.append(() => p.c("muted", "This session has no session.jsonl yet, so Chat v2 has nothing to draw.")));
				};
				choose(new URLSearchParams(location.search).get("chat_view") === "v2");
			});
			panels.coverage = div.c("flow sessions-panel", () => { $coverage = div.c("flow"); });   // every ask in the owner's prompts, its status, the raw words one click down (AISessionCoverage)
			panels.cost = div.c("flow sessions-panel", () => { const $sum = div.c("flow"); ready.then(w => $sum.empty(() => AICost.report(w.id ? AICost.session_url(w.id) : w.dir))); $costs = div.c("flow"); $trace = div.c("flow"); });   // the summary first (the cost line's total and every child session behind it), then the logged cost, the cost-over-time chart and the per-tool table
			panels.models = div.c("flow sessions-panel", () => { $role = div.c("flow session-role"); $session = div.c("flow"); });   // the Session class: cost tree, model + effort, tokens by purpose, audit
			panels.related = div.c("flow sessions-panel", () => { $spawn = div.c("flow"); $related = div.c("flow"); });   // who spawned this and what it spawned; the other records of this session
		});
		show(TABS.some(([k]) => k === want) ? want : "overview");
		["chat", "coverage"].forEach(k => buttons[k].el.hidden = true);   // shown again below once the row says this is a VS Code tab
		const conv = new AISessionConversation();
		const voice = new VoiceFlow();
		$voice.append(voice.view);
		$conv.append(conv.view);

		// `row` first: for a Servex row the url's id is the AGENT's id, a different string from its session_id,
		// and the transcript and the date-path lookup both need the session_id.
		row_p.then(async row => {
			const session_id = row?.session_id ?? id;
			await AISessionRows.load_index(url).catch(() => {});
			const snap = await AISessionDetail.load_snapshot(session_id).catch(() => null), has_prompts = await PromptLog.read(session_id).then(l => l.length > 0).catch(() => false);
			this.chat_ok = has_prompts || AICost.is_tab(row ?? (snap ? { id: snap.agent, role: snap.agent } : null));
			if (this.chat_ok){ ["chat", "coverage"].forEach(k => buttons[k].el.hidden = false); if (want === "chat" || want === "coverage") show(want); }
			AISessionRows.load_index(url).then(() => this.retitle(AISessionRows.display_name(row ?? { id, session_id }, AISessionRows.tree).text));   // a VS Code tab has no sessions.json row; its title is in the index
			const is_uuid = /^[0-9a-f]{8}-/.test(session_id);   // a voice session's id ("v-…") is not a uuid, but it still has a folder, a record and tasks: only the Claude-Code transcript below needs the uuid form
			if (!is_uuid) $conv.append(() => p.c("muted", "This agent has no session id yet, so there is no transcript or log to show."));
			else conv.session = session_id;
			const coverage = new AISessionCoverage(session_id);
			$coverage.append(coverage.view);
			this.show_role($role, row, session_id);   // the Role class: this session's role and its properties
			voice.follow(session_id);   // a phone has no dev socket: it follows Servex's voice stream
			this.record_if_there().then(file => { if (file && !this.tasks_log) this.tasks_log = new SessionTasks({ url: file, $box: $tasks, on_session: (s, lines) => { this.feed?.record(s); this.timeline?.record(lines); } }).live(); else if (!file) this.timeline?.settle("record"); });
			// FIRST, before the slow loads below: the session's own page log (tabs, layout words, AI cards), live.
			this.log_urls().then(urls => {
				if (this.logs) return;
				const open = url => new AISessionDetail.Log({ url, page: this, parts: this.parts, on_card: c => conv.add_card(c), on_lines: lines => { voice.read(lines); coverage.read(lines); } }).live();   // cards inline, tabs and words onto the page, live (doc/session-cards.md)
				const logs = this.logs = urls.map(open);
				this._old_url?.then(old => { if (old && this.logs === logs) logs.push(open(old)); });
			});
			if (!this.follow && is_uuid){
				const f = new AISessionFollow(session_id); f.on_lines = lines => { conv.add(lines); coverage.add_raw(lines); };   // the first pull draws the history, later pulls append live
				this.follow = f.start();   // tails the log and corrects the grid row (doc/realtime.md)
				this.follow.then(() => { if (!conv.count) $conv.append(() => p.c("muted", AISessionDetail.NO_TRANSCRIPT)); });
			} else if (!this.follow && is_uuid) AISessionDetail.load_lines(session_id).then(lines => { if (lines){ conv.add(lines); coverage.add_raw(lines); } else $conv.append(() => p.c("muted", AISessionDetail.NO_TRANSCRIPT)); });   // a voice session's id never has a transcript (the "no session id yet" message above already says so); asking /ai-logs/ for it only earns a 400
			if (is_uuid) Promise.all([AISessionRows.load_index(url), AISessionRows.load_tree(url)]).then(([index, tree]) => AISessionView.detail_section($session, session_id, index, tree));
			else $session.empty(() => p.c("muted", "Voice sessions have no Claude Code transcript, so there are no Session class numbers to show here."));   // same is_uuid guard the transcript load above uses; was fetched unconditionally, which only ever earned a 400
			AISessionRows.load_index(url).then(async () => { const snap = await AISessionDetail.load_snapshot(session_id); $related.empty(() => AISessionDetail.render_related(snap, url)); });
			// the card's page.jsonl and trace.json live in the session's own folder now; the old card folder is the fallback until a checkout is migrated
			await AISessionRows.load_index(url);   // fills AISession.days; without this wait own_dir was computed before the index arrived, so the cost log and trace silently never showed
			const fill = async () => {
			await this.follow?.catch(() => {});   // the first feed pull names the real folder (a card-slug folder is not <id>/) via AISession.slugs
			if (!AISession.slugs.has(session_id)) await AISessionDetail.folder_from_day(row, session_id).catch(() => {});   // the day index names the folder; without it the work tree below was read from <day>/<uuid>/ and the Overview stayed empty
			const own_dir = AISession.dir_url(session_id).pathname, own = own_dir;   // the slug's folder, or <day>/<uuid>/ when the day index has none
			if (this.filled === own_dir) return;   // the folder event folder_from_day raises runs fill() again: once per folder
			this.filled = own_dir;
			if (!this.prompt_tail) this.prompt_tail = new SessionTimeline.Tail({ url: own_dir + "prompts.jsonl", on_lines: lines => { this.timeline?.prompts(lines); coverage.read_records(PromptLog.fold(lines)); } }).live();   // the prompt log, followed live: the Timeline rows and the Coverage records both read this one tail (ext/Refine/doc/prompt-records.md)
			if (!this.work){ this.work = true; work = new SessionWork({ dir: own_dir, id: session_id, snap: AISession.all.get(session_id)?.ix ? { id: session_id, ...AISession.all.get(session_id).ix } : null }); $work.append(work); $tgrid.append(new SessionTasksGrid({ work, sid: session_id, nested: $work.el })); work.loaded.then(() => this.work_ready(work)); }
			const old_dir = () => AISessionDetail.dir_index().then(index => AISessionDetail.dir_of(index, session_id));   // the slow directory.json walk is only the fallback, never in front of the own folder
			const [costs, trace] = await Promise.all([
				AISessionDetail.load_cost_log(own).then(async c => c ?? AISessionDetail.load_cost_log(await old_dir())),
				AISessionRows.load_index(url).then(ix => ix?.traces?.includes(session_id) ? AISessionDetail.load_trace(own_dir).then(async t => t ?? AISessionDetail.load_trace(await old_dir())) : null),   // a trace.json exists for few sessions: ask only for those the index lists
			]);

			$costs.empty(() => {
				if (!costs) return;
				small.c("muted", "Logged cost, one row per hour, newest first (AISessionAudit.mjs logs each turn)");
				// One row per hour (newest first), not per turn: turns, tokens, dollars in that hour and the running total at its end.
				div.c("sessions-cost-table", () => {
					div.c("sessions-cost-line sessions-cost-headline", () => ["Hour", "Turns", "In tok", "Out tok", "Cost", "Running total"].forEach(h => small.c("muted", h)));
					AISessionDetail.by_hour(costs).forEach(h => div.c("sessions-cost-line", () => {
						small(h.label); small(String(h.turns)); small(h.input.toLocaleString()); small(h.output.toLocaleString());
						small.c("sessions-cost-main", "$" + h.usd.toFixed(2)); small.c("muted", "$" + h.total.toFixed(2));
					}));
				});
				// the latest logged line already holds the whole session's totals, split by token kind
				const last = costs.at(-1);
				if (last?.usd_breakdown) div.c("sessions-cost-breakdown card flex gap-50 wrap muted", () => {
					const b = last.usd_breakdown, t = last.token_totals ?? {};
					small(`input ${t.input ?? "?"} tok $${b.in.toFixed(4)}`);
					small(`cache write ${t.cache_write ?? "?"} tok $${b.cache_write.toFixed(4)}`);
					small(`cache read ${t.cache_read ?? "?"} tok $${b.cache_read.toFixed(4)} (${last.cache_read_pct ?? 0}% of $)`);
					small(`output ${t.output ?? "?"} tok $${b.out.toFixed(4)}`);
				});
			});

			$box.empty(() => {
				if (row){
					const src = AISessionRows.SOURCE[row.source] ?? { label: row.source };
					div.c("flex gap-50 v-center", () => {
						span.c("sessions-tag sessions-tag-" + row.source, src.label);
						span.c("sessions-row-title", row.tab_title || row.id);
						// Model, effort and cost are bound to the live session (Property.of), so a new turn redraws them: doc/binding.md
						this.live_off?.();
						const live = AISessionDetail.live_item(row.session_id ?? id, row), el = small.c("muted", ""), draw = () => {
							const model = live.item.get("model"), effort = live.item.get("effort"), usd = live.item.get("usd");
							el.el.textContent = [model, effort && !String(model).includes(effort) ? effort : null, usd != null && "$" + (+usd).toFixed(2)].filter(Boolean).join(" · ");
						};
						el.el.classList.add("session-live");
						const offs = ["model", "effort", "usd"].map(k => Property.of(live.item, k).bind(draw));
						this.live_off = () => { offs.forEach(off => off()); live.off(); };
					});
				}
			});

			// Raw: the session's own task log and its transcript (/ai-logs is dev-server only), on every session, row or not
				$box.append(() => div.c("flex gap-50 v-center muted", () => {
					small("Raw");
					const record = AISession.slugs.has(session_id) && !AITask.has(own_dir + "session.jsonl") ? "task.jsonl" : "session.jsonl";   // no probe until the dated folder is known (own_dir is a flat path that 404s before then)
					a.c("", record).href(own_dir + record);
					a.c("", "transcript").href("/ai-logs/" + session_id);
				}));
				$box.append(() => div.c("flex gap-50 v-center muted", () => {
					small("Landing");
					a.c("page-link", "Ready to merge →").href("/framework/ai/merge/").attr("target", "_self").attr("title", "Branches agents marked ready, each with a Merge button");
				}));
				$trace.empty(() => { if (trace) AISessionTrace.render(trace); });
			};
			// the folder name (a card slug, not the id) arrives with the live feed; draw again the moment it does
			fill();
			if (!AISession.slugs.has(session_id)){ const off = AISession.of(session_id).subscribe((_, fields) => { if (fields.includes("folder")){ off(); fill(); } }); }

			// Only a Servex agent is in the spend tree; any other row's section just stays empty.
			AISessionRows.load_spend_tree(url).then(spend => {
				$spawn.empty(() => {
					const node = spend?.by_id.get(id);
					if (node) AISessionTrace.render_spawn(node, spend, url);
				});
			});
		});
	}

	/** An Item holding the live model, effort and cost of one session: the index row first, then every change the feed folds in. `off()` ends it. */
	static live_item(session_id, row){
		const ses = AISession.of(session_id), pick = (src, keys) => Object.fromEntries(keys.filter(k => src?.[k] != null).map(k => [k, src[k]]));
		const KEYS = ["model", "effort", "usd"], item = new Item({ data: { ...pick(row, KEYS), ...pick(ses.ix, KEYS) } });
		const off = ses.subscribe((_, fields) => item.set(pick(ses.ix, fields.filter(k => KEYS.includes(k)))));
		return { item, off };
	}

	/** The logged turns folded to one row per local hour, newest hour first: turns, tokens, dollars, and the running total at the hour's end. */
	static by_hour(costs){
		const hours = new Map();
		for (const c of costs){
			const d = c.at ? new Date(c.at) : null, key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:00` : "undated";
			const h = hours.get(key) ?? hours.set(key, { label: key, turns: 0, input: 0, output: 0, usd: 0, total: 0 }).get(key);
			h.turns++; h.input += c.last_prompt_input ?? 0; h.output += c.last_prompt_output ?? 0; h.usd += c.last_prompt_usd ?? 0; h.total = c.total_usd ?? h.total;
		}
		return [...hours.values()].reverse();
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
		const ix = AISession.all.get(id)?.ix;   // the live copy the grid already holds (it carries `folder`, so the folder is findable)
		return ix ? { id, ...ix } : null;   // never probe index.json: the grid already holds the snapshot, and a probe for a missing file is a 404
	}

	/** The "Related" section: one line per record of the session: its kind, what it is, and where it lives. */
	static render_related(snap, url){
		if (!snap) return;
		const L = snap.links ?? {}, R = AISessionDetail.RELATED, items = [["summary", AISession.dir_url(snap.id).pathname]];
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
		const snap = await AISessionRows.get_json(root_url + "sessions.json");
		return snap?.rows?.find(r => r.id === id || r.session_id === id) ?? await AISessionDetail.agent_row(id) ?? await AISessionDetail.tree_row(root_url, id);
	}

	/** A stopped agent the live list no longer holds but session-tree.json (uuid -> { agent, role }) still names: its uuid finds the dated folder. */
	static async tree_row(root_url, id){
		if (/^[0-9a-f]{8}-/.test(id)) return null;
		const tree = await AISessionRows.load_tree(root_url), hit = Object.entries(tree ?? {}).find(([, n]) => n?.agent === id);
		return hit ? { id, session_id: hit[0], source: "servex", role: hit[1].role, tab_title: id } : null;
	}

	/** A named Servex agent (`reviewer-x`, `minion-y`) is a grid row before sessions.json knows it: its uuid comes from the live agent list, else null (a name is never a transcript id). */
	static async agent_row(id){
		if (/^[0-9a-f]{8}-/.test(id)) return null;
		const agents = (await AISessionRows.get_json(servex_url("/api/agents"))) ?? [];
		const a = Array.isArray(agents) ? agents.find(x => x.id === id) : null;
		return a ? { id: a.id, session_id: a.session_id ?? null, source: "servex", role: a.role, model: a.model, tab_title: a.id, started_at: a.started_at } : null;
	}

	/** The raw transcript lines of a session whose id the live tail cannot follow (null when there are none). */
	static load_lines(session_id){ return raw_transcript_lines(session_id); }

	static NO_TRANSCRIPT = "No transcript for this session yet: either /ai-logs/ (the dev-server-only route this reads it through) isn't running, or this session's own file has no real prompt in it yet.";

	/** Every `ai/<Y>/<M>/<D>/<slug>-<id8>/` folder, keyed by its id8: one walk of /framework/directory.json, shared by the grid and the detail page. */
	static async dir_index(){
		const dir = await AISessionRows.get_json("/framework/directory.json");
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
						if (hit && s.children?.some(c => c.name === "page.jsonl")) index.set(hit[1], `/framework/ai/${y.name}/${m.name}/${d.name}/${s.name}/`);
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
		const lines = await AISessionRows.get_jsonl(dir + "page.jsonl");
		const costs = (lines ?? []).filter(l => l.cost).map(l => l.cost);
		return costs.length ? costs : null;
	}

	/** `<session-dir>/trace.json`, written by hand (doc/decisions.md says why it is not in the Stop hook). Missing means no chart. */
	static async load_trace(dir){
		if (!dir) return null;
		const trace = await AISessionRows.get_json(dir + "trace.json");
		return trace?.calls && trace?.turns ? trace : null;
	}
}

/** The session folder's page.jsonl, read or streamed: a `page_add` item with a title is a card the AI posted here
 *  (doc/session-cards.md); the shape of every line (tabs, layout words) goes onto the page through `Page.overlay()`. */
AISessionDetail.Log = class SessionPageLog extends JSONL {
	cards = new Set();
	read(entries){
		this.on_lines?.(entries);
		for (const e of entries){
			const item = e.content?.add;
			this.parts?.apply(e);
			this.link(e.file, e.gone);
			if (item?.title && item.id && !String(item.type).startsWith("part-") && this.on_card && !this.cards.has(item.id)){ this.cards.add(item.id); this.on_card(item); }
			this.page?.overlay(e);
		}
		return this;
	}
	live(){ super.live(() => {}); return this; }

	/** A `{"file":"notes/page.jsonl"}` line names a subpage folder beside this log; `gone` drops it. */
	link(file, gone){
		const name = /^([^/]+)\/page\.jsonl$/.exec(file ?? "")?.[1];
		if (!name || !this.page) return;
		const dirs = this.page.sub_dirs ??= new Map();
		if (gone){ dirs.delete(name); this.page.unlink_child(name); this.page.children.delete(name); }
		else { dirs.set(name, this.url.replace(/page\.jsonl$/, "") + name + "/"); this.page.link_child(name + "/page.jsonl"); }
		this.parts?.link(name, gone ? null : this.page.url + name + "/");
	}
};

/** The parts the page tool put on this page (`content.add` of a part-heading, part-text or part-card), drawn
 *  live in one box: the same Items and Views a Page's own content list uses. Add, change by id, remove, move, order. */
AISessionDetail.Parts = class SessionParts {
	items = new Map();
	order = [];
	pages = new Map();   // subpage name → url, drawn as links under the parts
	constructor($box){ this.$box = $box; }

	apply(e){
		if (!e || typeof e !== "object") return;
		let dirty = false;
		const verbs = e.content;
		if (verbs && typeof verbs === "object"){
			const add = verbs.add;
			if (add?.id && String(add.type).startsWith("part-")){
				const { after, type, id, ...data } = add;
				this.items.set(id, Item.hydrate({ type, id, data }));
				this.place(id, after);
				dirty = true;
			}
			if (typeof verbs.remove === "string" && this.items.delete(verbs.remove)){ this.order = this.order.filter(x => x !== verbs.remove); dirty = true; }
			if (verbs.move && this.items.has(verbs.move.id)){ this.place(verbs.move.id, verbs.move.after); dirty = true; }
			if (Array.isArray(verbs.order)){
				const listed = verbs.order.filter(id => this.items.has(id));
				this.order = [...listed, ...this.order.filter(id => !listed.includes(id))];
				dirty = true;
			}
		}
		for (const [key, value] of Object.entries(e)){
			const item = this.items.get(key);
			if (item && value && typeof value === "object" && !Array.isArray(value)){
				const { by, ts, ...delta } = value;
				item.set(delta);
				dirty = true;
			}
		}
		if (dirty) this.draw();
	}

	link(name, url){ url ? this.pages.set(name, url) : this.pages.delete(name); this.draw(); }

	place(id, after){
		this.order = this.order.filter(x => x !== id);
		const at = after === null ? -1 : after === undefined ? this.order.length - 1 : this.order.indexOf(after);
		this.order.splice(at === -1 && after !== null ? this.order.length : at + 1, 0, id);
	}

	// One redraw per batch: the next microtask, so a replay of 50 lines paints once.
	draw(){
		if (this.pending) return;
		this.pending = true;
		queueMicrotask(() => {
			this.pending = false;
			this.$box.empty(() => {
				this.order.forEach(id => { const item = this.items.get(id); if (item?.constructor.View) new item.constructor.View({ item }); });
				if (this.pages.size) div.c("session-subpages flex gap-50 wrap", () => { small("Subpages:"); for (const [name, url] of this.pages) a.c("page-link", name).href(url); });
			});
		});
	}
};
