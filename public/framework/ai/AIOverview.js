import { details, summary } from "/framework/core/View/View.js";
import { SystemClasses } from "./SystemClasses.js";
import AISystem from "./AISystem.js";
import { Page, md, div, a, span, small, strong, icon, h2, h3 } from "/app.js";
import { code } from "/framework/ext/highlight/highlight.js";
import { file_link } from "/framework/ext/filesystem/file_link.js";
import { CONCEPTS, GROUPS, FLOW } from "./concepts.js";
import { Skill, Ask } from "./objects.js";
import Task from "../core/Task/Task.js";
import TaskView from "../core/Task/TaskView.js";
import { cards, card, flow } from "/framework/ux/Content/structure/Structure.js";
import { table } from "/framework/ui/table/table.js";
import { page_settings } from "/framework/core/Page/settings/settings.js";
import DataGrid from "/framework/ext/DataGrid/DataGrid.js";

/* THE TOP TABS of /framework/ai/: Inbox (the default), Log and System (the owner, 2026-09-30:
   "log is everything. And inbox is only… priority… and above"). Inbox and Log are the SAME
   rail (`AIRail`, ai2/rail.js) at two floors, 90 and 0; System holds all the AI system docs and
   takes the whole width. Each tab is a routed page; ai/page.js draws the strip and calls tabPage().
   Inbox and Log and System are the three VIRTUAL built-ins: ai/page.js's route() always answers
   these three names itself (tabPage(), below), so Page.child()'s usual filesystem probe never
   runs for them — that is still true, hardcoded, and does not change with a new subsystem page. */
const VIRTUAL_TABS = ["inbox", "log", "system"];
// The System tab's own pages (/framework/ai/system/<name>/). Each still answers at its old
// url, /framework/ai/<name>/, so no link breaks (ai/page.js route()).
const SYSTEM_PARTS = ["skills", "claude-md", "objects", "authoring", "models", "thinking", "data", "saving"];

/* THE REST OF THE TAB BAR IS DETECTED, NOT HAND-LISTED (the owner, relayed 2026-10-01): a
   child joins the strip when its OWN page.jsonl says `{"settings":{"tab":true}}` — optionally
   with a `weight` (default 1) to say where it sits. Adding a new subsystem page (local,
   images, models, …) is then one file, never a code change here or in ai/page.js.
   Inbox is not a candidate at all — it has no folder of its own; ai/page.js's band always
   draws it first, hardcoded. "log" and "system" are built-ins that need the SAME declaration
   as everyone else (their folders hold only this one page.jsonl line — they never actually
   render FROM it, since route() answers their name before any file is ever read as content). */
const BUILT_IN_CANDIDATES = ["log", "system"];

// The groups the Skills tab draws, in order; a skill's `kind` (skills.json) picks its
// group, and a group with no skills is skipped. Regrouping is data: give a SKILL.md a
// `kind:` line (skills.mjs reads it first), add its group here. `aspect` and `companion`
// wait for the ui-skills proposal (ai/sessions/2026/09/30/servex-mastermind/ui-skills-proposal.md).
const KINDS = [
	["role", "Roles", "Become one of these agents. A role skill is the agent's whole job description."],
	["aspect", "Aspects", "One side of building UI: content, layout, controls, navigation, style."],
	["trigger", "Triggers", "Run at a moment: before the first edit, before a page, when a task lands."],
	["reference", "Reference", "Read before a kind of work, then again when it has been a while."],
	["companion", "Companions", "Small skills another skill reminds you of."],
];


// Fixed hue per model (never cycled: CLAUDE.md "color follows the entity"), colorblind-safe
// (Okabe-Ito). Claude is the baseline control, drawn in ink grey rather than a competing hue.
const MODEL_COLOR = {
	"openai/gpt-6-luna": "#E69F00",
	"deepseek/deepseek-v4.1-flash": "#0072B2",
	"google/gemini-3.8-flash": "#009E73",
	"google/gemini-3.1-pro-preview": "#CC79A7",
};

// Phase 15 adds Sonnet and Opus runs alongside Haiku's (the test library), so the three Claude
// models need their own names here, not one label shared by all of them.
const CLAUDE_NAME = {
	"claude-opus-5-5": "Claude Opus (control)",
	"claude-sonnet-5": "Claude Sonnet (control)",
	"claude-haiku-4-5-20251001": "Claude Haiku (control)",
};

/* "Data: how it's written" — ai/system/data/ (the owner, 2026-10-02, on mobile: "how is data
   written... does code enforce it"). Checked against the code on 2026-10-02 by reading each file,
   not copied from any one audit — a table like this goes stale the moment a file changes, so it
   says so and names the one route (jsonl-schema.mjs's `check()`) that decides "validated". */
const WRITERS = [
	{ name: "append.mjs", path: ".claude/hooks/append.mjs", who: "AI running a script", ok: true,
		note: "the route every skill tells you to use; stamps `at`, checks the shape, re-parses the whole file after." },
	{ name: "append_log", path: "Servex/Log.js", who: "AI tool call (MCP)", ok: true,
		note: "Servex's own tool; the same `check()` runs inside Log.js before the line is kept." },
	{ name: "store.mjs", path: "public/framework/ext/Research/store.mjs", who: "AI running a script", ok: true,
		note: "a research entry's shape is enforced in the function itself, not by calling jsonl-schema.mjs." },
	{ name: "Decide.mjs", path: "Server/Decide.mjs", who: "node script (the decision wizard)", ok: true,
		note: "walks one decision into being field by field — there's no raw line a caller could hand it." },
	{ name: "Cards.js", path: "Servex/cards/Cards.js", who: "node, inside Servex", ok: true,
		note: "the one place a card's page.jsonl is ever written; every card write is queued through it." },
	{ name: "ledger.mjs", path: ".claude/hooks/ledger.mjs", who: "an AI hook (fires after every tool call)", ok: true,
		note: "closed 2026-10-02: a bad line is still written, with `unchecked: \"<reason>\"` added, so a page never loses a line — see the rule below." },
	{ name: "rpc:append (Append.js)", path: "Server/plugins/SocketServer/Append.js", who: "browser UI (any page's save)", ok: true,
		note: "closed 2026-10-02: every line is checked before it's written; one bad line refuses the whole batch." },
	{ name: "PageFiles.js", path: "Server/plugins/PageFiles.js", who: "node — the file watcher, on every save under public/", ok: false,
		note: "writes each folder's files.jsonl automatically; still open." },
	{ name: "Usage.js", path: "Servex/Usage.js", who: "node — a 15-minute timer", ok: false,
		note: "writes usage.jsonl and usage.json from the usage snapshot; still open." },
];


export class AIOverview {

	static async detectTabs(root){
		// The page's own index (files.jsonl, read by core/Page's one reader, PageLog.listing())
		// names every folder the watcher saw, so a new ai/local/ needs no children: edit either.
		const listing = await Page.listing(root.url);
		const candidates = [...new Set([...BUILT_IN_CANDIDATES, ...root.children.keys(),
			...(listing?.dirs ?? []), ...(listing?.pages.keys() ?? [])])];
		const found = await Promise.all(candidates.map(async name => {
			const settings = await page_settings(root.url + name + "/");
			return settings.tab === true ? { name, weight: settings.weight } : null;
		}));
		// Ascending weight, ties broken by name — the owner's own words for the order.
		return found.filter(Boolean).sort((a, b) => a.weight - b.weight || a.name.localeCompare(b.name));
	}

	/* THE AUTHORING PIECES, used on every tab below and shown on the Authoring tab.
	   A section is a heading, one gist line, then its items; nothing else. */

	// A heading and its gist line: the reader knows what the section is before any detail.
	/* A bordered section: heading and its one-line gist on one row, then the cards straight under it (no paragraph between). */
	static section(title, gist, body){
		return div.c("wide card ai-section flex v gap-50", () => { div.c("flex wrap gap-50", () => { h2(title); if (gist) small.c("muted", gist); }).style({ alignItems: "baseline" }); body(); });
	}
	static heading(title, gist){ h2(title); if (gist) md(gist); }
	static concept_card(base, c){ return ({ name: c.name, icon: c.icon, gist: c.gist, href: base + c.slug + "/" }); }
	// Fetch, then fill a box captured NOW (no DOM after an await: the framework readme's traps).
	static later(box, url, parse, fill){ return fetch(url).then(r => r.text()).then(t => box.append(() => fill(parse(t)))).catch(() => box.append(() => small.c("muted", "Could not load " + url))); }
	static jsonl(t){ return t.trim().split("\n").map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }

	// The detail column's empty state — the same two lines the rail's own shell shows.
	static empty(line, sub){ return div.c("inbox-empty muted", () => { span(line); if (sub) small(sub); }); }

	static tabPage(root, name, url = root.url + name + "/"){
		const base = root.url;
		const pages = {
			/* THE DEFAULT TAB IS THE INBOX (the owner, 2026-09-30): the rail beside it, at the
			   Inbox's floor — only rows scoring 90 and up. Its own page is just the empty detail. */
			inbox: {
				title: "Inbox", icon: "inbox", classes: "inbox-page inbox-tab",
				activated(){ root.ai2?.tab_floor(90); },
				content(){ AIOverview.empty("Pick something on the left.", "It opens here, and the list stays where it is."); },
			},
			/* THE LOG IS THE SAME RAIL AT 0: every row, newest first (the owner, 2026-09-30: "log is
			   everything"). Leaving it puts the Inbox's floor back, unless the url names one. */
			log: {
				title: "Log", icon: "history", classes: "inbox-page inbox-tab",
				activated(){ root.ai2?.tab_floor(0, "AI log"); },
				deactivated(){ root.ai2?.tab_floor(90); },
				content(){
					AIOverview.empty("Everything, newest first. Pick something on the left.", "");
					md("Every task by day, in flight first: [the task log](" + base + "all-tasks/).");
				},
			},
			/* THE SYSTEM TAB holds all the AI system docs (the owner, 2026-09-30): the parts,
			   then the docs pages (its route() below), then design and code, linked not copied. */
			system: {
				title: "System", icon: "account_tree", classes: "inbox-takeover inbox-tab",
				content(){
					AIOverview.section("The AI system", "Its components, one card each, read from the index in ai/readme.md. Why it is shaped this way: doc/architecture.md.", () => {
						const box = div.c("wide");
						new AISystem().show(box);
						a("Decisions: doc/architecture.md").attr("href", base + "doc/architecture.md");
						a("What a System is (class card, live instances)").attr("href", "/framework/ext/System/");
					});
					AIOverview.section("AI system classes", "Servex is the one always-on process; each card is one of its classes.", () => {
						SystemClasses.cards(["Servex", "Agents", "Dispatcher", "Sessions", "Pool", "Usage", "Budget"]);
						a("Class cards with a live debug view").attr("href", "/framework/ai/classes/");
						details(() => { summary("Servex also watches itself"); SystemClasses.cards(["Heartbeat", "TaskLoop", "Worktrees", "Monitor", "Assistant"]); });
					});
					AIOverview.section("Documentation and readmes", "How agents and you find what is true: readmes are the index, doc/ holds the detail, skills say how to write both.", () => cards([
						{ name: "Readmes", icon: "menu_book", gist: "Every folder's index, and the chain a fresh agent reads root first.", href: base + "readmes/" },
						{ name: "Documentation skill", icon: "school", gist: "How to keep a module's readme, page and doc/ true before a task lands.", href: url + "skills/documentation/" },
						{ name: "Skills", icon: "school", gist: "How to do one kind of job well, one page per skill.", href: url + "skills/" },
						{ name: "CLAUDE.md", icon: "gavel", gist: "The file every agent loads first, and an audit of what it names.", href: url + "claude-md/" },
						{ name: "Data: how it's written", icon: "fact_check", gist: "Every JSONL writer, and whether code checks the line before it lands.", href: url + "data/" },
						{ name: "How a page saves", icon: "save", gist: "page.jsonl, set(delta), and the live stream to every open tab.", href: url + "saving/" },
						{ name: "Objects", icon: "category", gist: "Each thing as a chip, a row and a panel.", href: url + "objects/" },
						{ name: "Authoring", icon: "edit_note", gist: "The pieces these pages are built from, simple to complex.", href: url + "authoring/" },
						{ name: "Models", icon: "query_stats", gist: "Which model is best value, for which kind of work.", href: url + "models/" },
						{ name: "Servex", icon: "hub", gist: "The process that runs the agents. Its own docs.", href: "/framework/servex/" },
						{ name: "Design system", icon: "palette", gist: "How a page looks: layout, spacing, colour, controls, content.", href: "/framework/design/" },
						{ name: "Code system", icon: "code", gist: "How the code is written: objects, pages, views, the traps.", href: "/framework/code/" },
						{ name: "Per-module ai/ folders", icon: "folder_special", gist: "What writes log.jsonl and the voice transcripts beside each module.", href: file_link("public/framework/ai/doc/design/module-ai-dirs.md") },
					]));
					AIOverview.section("Running now", "The agents this Servex holds right now.", () => SystemClasses.liveAgents());
					AIOverview.section("Where each piece lives", "Agents start through the Claude Agent SDK; models come from Anthropic, OpenRouter or a local server.", () => cards([
						{ name: "Servex", icon: "hub", gist: "The process: agents, dev servers, logs, port 80.", href: "/framework/servex/" },
						{ name: "Agent SDK", icon: "terminal", gist: "How an agent is started, how its tools arrive, where its session is saved.", href: file_link("Servex/doc/sdk.md") },
						{ name: "Models", icon: "query_stats", gist: "Anthropic, OpenRouter and local models, by value for the job.", href: url + "models/" },
						{ name: "Sessions", icon: "forum", gist: "Voice and chat sessions, resumable.", href: "/framework/ai/sessions/" },
						{ name: "Dashboard", icon: "dashboard", gist: "Talk to the assistants, see tasks and cost.", href: "/framework/ai2/" },
						{ name: "Inbox and tasks", icon: "inbox", gist: "What needs you, and every task by day.", href: base + "all-tasks/" },
					]));
					AIOverview.section("Concepts", "The same system in words: who works, what they know, how work lands.", () => {
						for (const g of GROUPS){
							AIOverview.heading(g.title, g.gist);
							cards([...CONCEPTS.filter(c => c.group === g.id).map(c => AIOverview.concept_card(base, c)), ...(g.links ?? [])]);
						}
					});
					AIOverview.section("How a page becomes a tab", "Declared, not crawled: one line in its own page.jsonl.", () => md("A page joins this strip (Inbox, Log, System, and whatever shows up next to them) by writing one line in its own `page.jsonl` (or `settings.jsonl`, when the folder has a `page.js`): `{\"settings\":{\"tab\":true,\"weight\":5}}`. `weight` orders it, smallest first (default 1), and Inbox always sits first no matter what. Adding a tab is that one line — nobody has to remember to list it anywhere else."));
					AIOverview.section("How it works together", "The path your words take, from speech to the card that shows the result.", () => flow(FLOW.map(([n, slug, text]) => [n, base + slug + "/", text])));
					AIOverview.section("Where AI data lives", "Everything is a page; its data is a line in its own page.jsonl.", () => md("The rule and the table: [Page inboxes](" + base + "inboxes/)."));
				},
				route(name){ if (SYSTEM_PARTS.includes(name)) return AIOverview.tabPage(root, name, url + name + "/"); },
			},
			skills: {
				title: "Skills", icon: "school",
				content(){
					md("**A skill is how to do one kind of job well.** An agent loads it by name when the moment comes. Each page below is built from its `.claude/skills/<name>/SKILL.md`.");
					md("What a skill knows lives on the site: design at [/framework/design/](/framework/design/), code at [/framework/code/](/framework/code/). A skill points there. Servex facts a skill used to carry live here, such as the [page inbox](" + base + "inboxes/).");
					const box = div.c("wide");   // the card grids arrive inside it, so it takes the wide track
					AIOverview.later(box, base + "skills.json", JSON.parse, list => KINDS.forEach(([k, title, gist]) => {
						if (!list.some(s => s.kind === k)) return;
						AIOverview.heading(title, gist);
						cards(list.filter(s => s.kind === k).map(s => ({ name: s.id, icon: "school", gist: s.for, href: url + s.id + "/" })));
					}));
				},
				route(id){
					if (!/^[\w-]+$/.test(id)) return;
					return new Page({
						title: id, icon: "school", url: url + id + "/",
						content(){
							const box = div();
							AIOverview.later(box, base + "skills.json", JSON.parse, list => {
								const s = list.find(x => x.id === id);
								if (!s) return md("No skill named `" + id + "`. [All skills](" + url + ")");
								md(`**${s.for}**`);
								if (s.when) md(s.when);
								AIOverview.heading("At a glance");
								md([`- **Kind:** ${s.kind}`, `- **Source:** \`.claude/skills/${s.id}/SKILL.md\` (${s.lines} lines)`, `- **Improvements log:** ${s.improvements ? "yes, `improvements.md` beside it" : "none yet"}`, `- Who changes it: the Servex mastermind`].join("\n"));
								if (s.questions?.length){
									AIOverview.heading("The check", "`review` asks these after the work, from `questions.md` beside the skill.");
									md(s.questions.map(([sec, n]) => `- **${sec}:** ${n} questions`).join("\n"));
								}
								md(`[All skills](${url})`);
							});
						},
					});
				},
			},
			objects: {
				title: "Objects", icon: "category",
				content(){
					md("**Each thing in the AI system is an object with three views:** a chip (icon and name), a row (one line), and a panel (a card with every fact). One class, `AIObject` in `ai/objects.js`; each kind says only what it knows.");
					const show = (title, gist, box_fill) => {
						AIOverview.heading(title, gist);
						const box = div.c("wide flex auto gap").style("--column", "18rem");
						box_fill(box);
					};
					const three = o => { div.c("flex v gap-50", () => { small.c("muted", "chip"); o.chip(); small.c("muted", "row"); o.row(); small.c("muted", "panel"); o.panel(); }); };
					show("Skill", "One `.claude/skills/<name>/SKILL.md`.", box => AIOverview.later(box, base + "skills.json", JSON.parse, list => list.slice(0, 3).forEach(s => three(new Skill(s)))));
					show("Ask", "One line of `ai/asks.jsonl`: what you asked, and who owns it.", box => AIOverview.later(box, base + "asks.jsonl", AIOverview.jsonl, lines => lines.map(l => l.ask).filter(Boolean).slice(-3).reverse().forEach(x => three(new Ask(x)))));
					show("Task", "The first line of a task's `task.jsonl`: the ask, the plan, the step.", box => AIOverview.later(box, base + "2026-09-30/ai-page/task.jsonl", AIOverview.jsonl, lines => {
						const task = Task.replay(lines);
						div.c("flex v gap-50", () => { small.c("muted", "chip"); TaskView.chip(task); small.c("muted", "row"); TaskView.row(task); small.c("muted", "card"); TaskView.card(task); });
					}));
					AIOverview.heading("Next: Agent and Card", "Their data lives in Servex while they run; they get the same three views next. Proposed with a skill for designing objects this way: [the proposal](" + base + "2026-09-30/ai-page/object-design-proposal.md).");
				},
			},
			authoring: {
				title: "Authoring", icon: "edit_note",
				content(){
					md("**Every page here is built from four pieces. Each is shown working below, simplest first.** The rules are in the [content skill](" + base + "skills/content/); this page only shows their effect.");
					AIOverview.heading("The four pieces", "Smallest first. cards() and flow() live in [Structure](/framework/ux/Content/structure/).");
					flow([
						["heading(title, gist)", null, "a section's name, then one line saying what it is."],
						["cards(items)", null, "a few things side by side: icon, name, one line, a link each."],
						["flow(steps)", null, "things that happen in order, numbered, each a link."],
						["obj.chip() · row() · panel()", url.replace("authoring/", "objects/"), "one object, at the size the place needs."],
					]);
					AIOverview.heading("Simple: a card grid", "Three of the system's parts, as `cards()` draws them.");
					cards(CONCEPTS.slice(0, 3).map(c => AIOverview.concept_card(base, c)));
					AIOverview.heading("Complex: a whole system, shown by its effect", "The readme chain an agent gets in `public/framework/ai/`, drawn live from the files. Its page explains it: [Readmes](" + base + "readmes/).");
					AIOverview.readmeChain("public/framework/ai/");
					AIOverview.heading("The rules they follow", "The `content` and `page` skills. The live catalog of structured pieces is ux/Content/structure.");
					cards([
						{ name: "content", icon: "school", gist: "Show the structure first, then as few words as it takes.", href: base + "skills/content/" },
						{ name: "page", icon: "school", gist: "A page from the top down: what, where, layout, content, in that order.", href: base + "skills/page/" },
						{ name: "Structured content", icon: "account_tree", gist: "Icon cards, sections and outlines: the shared widgets.", href: "/framework/ux/Content/structure/" },
					]);
				},
			},
		};
		pages["claude-md"] = {
			title: "CLAUDE.md", icon: "description",
			content(){
				md("**CLAUDE.md is the one skill every agent loads by itself.** It is all an agent knows before it asks, so it holds the laws, and one line for each system that has an effect, with a link. How to do anything goes one click down, in a skill.");
				div.c("wide", () => div().style({ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 30rem), 1fr))", alignItems: "start" }).append(() => {
					div(() => { small.c("muted", "The file, as agents get it. It is a copy: node public/framework/ai/skills.mjs refreshes it."); const $file = div(); code.file(import.meta, "CLAUDE.copy.md", { lang: "markdown", lines: true }).then(v => $file.append(v)); });
					div.c("flex v gap", () => {
						AIOverview.heading("What goes in it", "Anything that changes what an agent does on its first turn.");
						md("- The laws, the presentation rule, the ask-before list, the traps that never throw.\n- One line per system that has an effect: its name, the effect, a link.");
						AIOverview.heading("What goes one click down", "Anything that matters only once an agent is doing that kind of work.");
						md("- How to do it: the skill. Why it is that way: the doc. What it looks like: the page.");
						AIOverview.heading("Audit: the systems it names", "Each links to its page.");
						cards([
							{ name: "Server", icon: "dns", gist: "The dev server.", href: "/framework/servex/fs/?file=Server/readme.md" },
							{ name: "Servex", icon: "hub", gist: "Agents, the pool, the heartbeat, merge and review.", href: "/framework/servex/" },
							{ name: "The ai/ log", icon: "receipt_long", gist: "Every task, open to landed.", href: base + "tasks/" },
							{ name: "The asks ledger", icon: "record_voice_over", gist: "Every routed ask and its owner.", href: base + "asks/" },
							{ name: "Readmes and doc/", icon: "menu_book", gist: "Docs point, they don't explain.", href: base + "readmes/" },
							{ name: "Live-reload hold", icon: "pause_circle", gist: "One reload per batch of writes.", href: "/framework/servex/fs/?file=Server/doc/watch.md" },
						]);
						AIOverview.heading("Audit: systems with an effect it doesn't name", "Proposed one-liners. mastermind-servex-9 drafts the edit; the owner applies it.");
						md([
							"- **`#Page` references:** `#Name`, `@agent` and `/path` in text become links (ext/Mention).",
							"- **The page inbox:** a note left on a page reaches the agent that owns it.",
							"- **Cards and the object log:** every task reports on its card; the card is what the owner reads.",
							"- **The review gate:** a page change with no review report is refused by merge.",
							"- **The readme chain:** read the readmes root to leaf before working, and again on switching directory ([Readmes](" + base + "readmes/)).",
							"- **Budgets and dormancy:** Servex stops an agent over budget and parks a quiet one.",
							"- **The four widths:** a page is checked at 400, 1200, 1920 and 3440.",
						].join("\n"));
					});
				}));
			},
		};

		pages["models"] = {
			title: "Models", icon: "query_stats",
			content(){
				md("**Which model is best value, for which kind of task?** Value = how often it gets the work right, divided by what a run costs — higher is better. The `effort` knob this depends on, and what it costs in tool-call round trips, is explained in [How thinking works](" + base + "system/thinking/).");
				const box = div.c("wide");
				AIOverview.later(box, base + "system/models/models.json", JSON.parse, AIOverview.render_models);
			},
		};
		pages["thinking"] = {
			title: "How thinking works", icon: "psychology",
			content(){ AIOverview.render_thinking(); },
		};
		pages["data"] = {
			title: "Data: how it's written", icon: "fact_check",
			content(){ AIOverview.render_writers(base); },
		};
		pages["saving"] = {
			title: "How a page saves", icon: "save",
			content(){ AIOverview.render_saving(base); },
		};

		// ⚠ title "" — the tab sits under the page's own h1 ("AI"); a second page-size
		// heading on top of the panel read as two titles. The strip reads `label`.
		const { title, ...cfg } = pages[name];
		const top = VIRTUAL_TABS.includes(name) && url === root.url + name + "/";
		return new Page({ ...cfg, label: title, title: top ? "" : title, url });
	}

	/* AIOverview.readmeChain(dir) — the chain a fresh agent in `dir` is handed (Servex/agents/readme-chain.js),
	   drawn live: every folder from the repo root down to `dir` that has a readme.md, root → leaf,
	   each with its first line. The chain file is not served, so this walks the same rule by path. */
	static readmeChain(dir = "public/framework/ai/"){
		const parts = dir.split("/").filter(Boolean);
		const levels = [""].concat(parts.map((_, i) => parts.slice(0, i + 1).join("/") + "/"));
		const box = div.c("wide").style({ display: "grid", gap: ".5rem" });
		const url_of = d => d.startsWith("public/") && d !== "public/" ? d.slice("public".length) + "readme.md" : null;   // public/ is the site root
		const fs = d => "/framework/servex/fs/?file=" + d + "readme.md";
		Promise.all(levels.map(d => url_of(d)
			? fetch(url_of(d)).then(r => r.ok ? r.text() : null).catch(() => null)
			: Promise.resolve(d === "" ? "# setup, branches, deploy" : null)))
		.then(texts => box.append(() => {
			const kept = levels.map((d, i) => [d, texts[i]]).filter(([, t]) => t);
			kept.forEach(([d, t], i) => {
				const end = i === 0 || i === kept.length - 1;
				const first = (t.replace(/\r/g, "").split("\n").find(l => l.trim() && !/^#+\s*\S{1,20}$/.test(l.trim())) ?? "").replace(/^#+\s*/, "");
				a.c("card flex gap-50").attr("href", url_of(d) ? url_of(d).replace(/readme\.md$/, "") : fs(d))
					.style({ textDecoration: "none", color: "var(--ink)", alignItems: "center", marginLeft: (i * 1.25) + "rem" })
					.append(() => {
						icon(end ? "lock" : "content_cut");
						strong((d || "repo root/") + "readme.md");
						small.c("muted", first.slice(0, 90));
						small.c("muted", end ? "· always kept" : "· cut first over the cap").style({ marginLeft: "auto", whiteSpace: "nowrap" });
					});
			});
		}));
		return box;
	}

	/* THE MODELS PAGE (ai/system/models/, Phase 8–11 of 2026-09-30/openrouter-harness). All the
	   numbers come from Servex/ext/openrouter/evals/models.mjs — this just draws what it found. */

	static model_color(model){ return MODEL_COLOR[model] ?? (model.startsWith("claude-") ? "#767676" : "#999"); }
	static model_name(model){ return CLAUDE_NAME[model] ?? (model.startsWith("claude-") ? "Claude (control)" : (model.split("/")[1] ?? model)); }
	static fmt_usd(n){ return n == null ? "—" : n < 0.001 ? "<$0.001" : "$" + n.toFixed(n < 1 ? 3 : 2); }
	static fmt_pct(n){ return n == null ? "—" : Math.round(n * 100) + "%"; }

	// One facet (small multiple) per kind — kinds differ wildly in scale (a rule test's value is in
	// the tens, a probe's is near zero), so each gets its own x-axis rather than one shared scale
	// that would crush the small ones to invisible (dataviz: "two measures of different scale -> two
	// charts or small multiples").
	static bar_facet_svg(rows){
		// Phase 15: a below-the-bar row never appears in the chart, only ranked ones do.
		const real = rows.filter(r => r.value != null && !r.belowBar);
		if (!real.length) return null;
		const max = Math.max(...real.map(r => r.value), 0.01);
		const rowH = 28, pad = 8, L = 190, R = 60, W = 640, H = real.length * rowH + pad * 2;
		let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Value per configuration, best first">`;
		real.forEach((r, i) => {
			const y = pad + i * rowH, bw = Math.max(2, (r.value / max) * (W - L - R));
			const label = AIOverview.model_name(r.model) + (r.effort ? " · " + r.effort : "");
			s += `<text x="${L - 8}" y="${y + 15}" text-anchor="end" style="fill:var(--ink);font-size:.8rem">${label}</text>`;
			s += `<rect x="${L}" y="${y + 3}" width="${bw}" height="16" rx="4" fill="${AIOverview.model_color(r.model)}"></rect>`;
			s += `<text x="${L + bw + 6}" y="${y + 15}" style="fill:var(--ink-muted,#666);font-size:.8rem">${r.value}</text>`;
		});
		s += `</svg>`;
		return s;
	}

	static render_models(data){
		// Review finding 3 (2026-10-04): the owner's own ask — one row per model, everything about IT —
		// is the main thing this tab is FOR, so it comes first, above the fold. The value-per-task-kind
		// analysis below it (which model to use for which JOB) is detail, one scroll down.
		if (data.accounting) AIOverview.render_accounting(data.accounting);
		if (data.quick?.rows?.length) AIOverview.render_quick(data.quick);
		if (data.catalog?.length) AIOverview.render_catalog(data.catalog, data.catalog_note);

		AIOverview.heading("Value per task kind", "Which model to pick for which kind of work — rule tests, probes, and the test library's rungs, not a per-model catalog (that's above).");
				// --- The cheap ladder: which models pass the four simple rungs, cheapest first? ---
			if (data.ladder && data.ladder.rows.length){
				AIOverview.heading("The cheap ladder", "Which models pass four simple tests? Cheapest first — free models at the top.");
				md(data.ladder.summary);
				const rungIds = data.ladder.rungs.map(r => r.id);
				const rungNames = data.ladder.rungs.map(r => r.title);
				const head = ["model", "$/1M in", "$/1M out", ...rungNames, "$/run", "×Sonnet"];
				const ladder_price = n => n == null ? "—" : n === 0 ? "free" : "$" + (n < 1 ? n.toFixed(4) : n.toFixed(2));
				const fmt_rung = r => r === "pass" ? span.c("pass", "pass") : r === "fail" ? span.c("fail", "fail") : span.c("muted", "—");
				const rows = data.ladder.rows.map(r => {
					const cells = [
						AIOverview.model_name(r.model),
						ladder_price(r.price_in_per_m),
						ladder_price(r.price_out_per_m),
						...rungIds.map(slug => fmt_rung(r.rungs[slug])),
						r.mean_cost == null ? "—" : AIOverview.fmt_usd(r.mean_cost),
						r.xSonnet == null ? "—" : r.xSonnet + "×",
					];
					return cells;
				});
				table(head, rows);
			}
			
			AIOverview.heading("Value per configuration, by kind", "Best first in each row group. One bar is one model at one effort level; the number is value (performance ÷ $/run).");
		md("A model must do the job about as well as Sonnet before its price counts.");
		div.c("card").append(() => {
			data.kinds.filter(k => k.rows.some(r => r.value != null)).forEach(k => {
				const svgText = AIOverview.bar_facet_svg(k.rows);
				if (!svgText) return;
				h3(k.label.split(" — ")[0]).style({ fontSize: "1rem", marginTop: "1.25rem" });
				div().html_unsafe(svgText);
			});
			small.c("muted", data.weighting_note || "Each test is weighted by how well it separates strong models from weak ones.");
		});

		AIOverview.heading("Every configuration tried", "×Sonnet is a price ratio, not this run's cost: each model's list price per token, divided by claude-sonnet-5's. Claude rows use Anthropic's list prices; the rest use OpenRouter's.");
		const head = ["kind", "model", "effort", "performance", "$/run", "×Sonnet", "value"];
		// Phase 15: a row below its kind's quality bar stays in the table — it's still a real result —
		// but greyed, and its value cell says why it isn't ranked instead of showing a number.
		const allRows = data.kinds.flatMap(k => k.rows.map(r => {
			const cells = [
				k.kind, AIOverview.model_name(r.model), r.effort ?? "—", AIOverview.fmt_pct(r.performance), AIOverview.fmt_usd(r.cost),
				r.xSonnet == null ? "—" : r.xSonnet + "×",
				r.belowBar ? "below the bar" : (r.value == null ? "—" : String(r.value)),
			];
			return r.belowBar ? cells.map(text => () => small.c("muted", text)) : cells;
		}));
		table(head, allRows);

		AIOverview.heading("Best value, per kind, in plain words");
		data.kinds.forEach(k => {
			const line = k.best
				? `**${k.label.split(" — ")[0]}:** ${AIOverview.model_name(k.best.model)}${k.best.effort ? " at " + k.best.effort + " effort" : ""} — ${k.best.value} value per dollar.`
				: k.rows.length
					? `**${k.label.split(" — ")[0]}:** No model passes this yet (the check itself is under review).`
					: `**${k.label.split(" — ")[0]}:** not enough real runs yet to say.`;
			md(line);
		});
		md("*Rows with no cost or no real run are left out of the chart and the best-value line, not shown as zero.*");
	}

	static fmt_ctx(n){
		if (n == null) return "—";
		if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1") + "M";
		if (n >= 1000) return Math.round(n / 1000) + "K";
		return String(n);
	}
	static fmt_ms(s){ return s == null ? "—" : s + "s"; }
	static fmt_tok(n){ return n == null ? "—" : n >= 1000 ? Math.round(n / 1000) + "K" : String(n); }
	// Catalog prices can be a real, published $0 (a local model, self-hosted) — fmt_usd's own
	// "<$0.001" reads as "almost nothing" for those, so this one says "free" instead.
	static fmt_price(n){ return n === 0 ? "free" : AIOverview.fmt_usd(n); }

	static render_accounting(a){
		AIOverview.heading("Does our log match OpenRouter's bill?", "Two numbers: what OpenRouter says the key has spent, and what Servex logged per agent. The difference is the gap.");
		md([
			`- **OpenRouter account:** $${a.account_usd.toFixed(2)}`,
			`- **Servex ledger (sum of agents):** $${a.ledger_usd.toFixed(2)}`,
			`- **Difference:** ${a.difference_usd >= 0 ? "ledger is $" + a.difference_usd.toFixed(2) + " above the account" : "$" + (-a.difference_usd).toFixed(2) + " is on the account but in no agent row"} (as of ${a.at.slice(0, 10)})`,
			`- Cause of the overcount: overlapping agents each booked the same key-total change ($${a.key_diff_repeat_usd.toFixed(2)} repeated). Fixed going forward in \`Agents.js\` (the change is now split). Detail: [openrouter-gap.md](/framework/ai/sessions/doc/cost/openrouter-gap.md)`,
		].join("\n"));
	}

	static render_quick(q){
		AIOverview.heading("Known-answer tests", `${q.tasks.length} small tasks in the shapes our agents do (code edits with a test, readme checks, card classification, transcript clean, refine steps, plus a summary, extraction and reasoning) whose answers a script checks. Same prompt to each model at two thinking levels; cost is OpenRouter's own figure. Rerun: node Servex/ext/openrouter/evals/quick.mjs`);
		new DataGrid({
			columns: [
				{ key: "model", label: "Model", min: 200, width: 240 },
				{ key: "effort", label: "Thinking", min: 80 },
				{ key: "passed", label: "Passed", type: "number", min: 70, filter: false },
				{ key: "of", label: "Of", type: "number", min: 50, filter: false },
				{ key: "seconds", label: "Seconds each", type: "number", min: 100, filter: false },
				{ key: "cost_usd", label: "Total $", type: "number", min: 80, format: v => "$" + v.toFixed(4), filter: false },
				{ key: "cost_per_task", label: "$ per task", type: "number", min: 90, format: v => "$" + v.toFixed(5), filter: false },
				{ key: "by_kind", label: "Passed, by job shape", min: 320, filter: false },
			],
			rows: q.rows,
		}).ac("wide").style("--datagrid-height", "none");
	}

	static render_catalog(rows, note){
		AIOverview.heading("Every model, one row each", "Provider, context window, price (including a cached read), and our own test scores on the same prompt. Click a header to sort; the controls above the grid filter it.");
		new DataGrid({
			columns: [
				{ key: "label", label: "Model", min: 160, width: 200 },
				{ key: "provider", label: "Provider", min: 100 },
				// Review finding 6: a `type: "number"` column gets its own min/max filter box, automatically —
				// fine for one or two, noise for eleven stacked above a 17-row grid. Only Context keeps one;
				// the rest opt out with `filter: false` (sort still works on every column).
				{ key: "context", label: "Context", type: "number", min: 90, format: AIOverview.fmt_ctx },
				{ key: "price_in_per_m", label: "$/M in", type: "number", min: 80, format: AIOverview.fmt_price, filter: false },
				{ key: "price_out_per_m", label: "$/M out", type: "number", min: 80, format: AIOverview.fmt_price, filter: false },
				{ key: "price_cache_in_per_m", label: "$/M cached in", type: "number", min: 90, format: AIOverview.fmt_price, filter: false },
				{ key: "docs", label: "Docs", type: "number", min: 70, format: AIOverview.fmt_pct, filter: false },
				{ key: "reasoning", label: "Reasoning", type: "number", min: 80, format: AIOverview.fmt_pct, filter: false },
				{ key: "refine", label: "Refine", type: "number", min: 70, format: AIOverview.fmt_pct, filter: false },
				{ key: "seconds", label: "Seconds", type: "number", min: 70, format: AIOverview.fmt_ms, filter: false },
				{ key: "tokens_in", label: "Tokens in", type: "number", min: 80, format: AIOverview.fmt_tok, filter: false },
				{ key: "tokens_out", label: "Tokens out", type: "number", min: 85, format: AIOverview.fmt_tok, filter: false },
				{ key: "typical_minion_usd", label: "Typical minion $", type: "number", min: 110, format: AIOverview.fmt_price, filter: false },
			],
			rows,
		}).ac("wide").style("--datagrid-height", "none");
		if (note) small.c("muted", note);

		AIOverview.heading("Why the numbers look the way they do", "Five things worth knowing before you compare models by price.");
		md([
			"- **A \"read\" is huge because every turn re-sends the whole conversation.** An agent's context doesn't shrink between turns — turn 10 re-reads everything turns 1 through 9 already said. So the total tokens read grows roughly as *(number of turns) × (context size)*, which is why a long task's read count can be 10–100× its write count. Measured across real minions this week, 93–99% of that reread is served from the prompt cache, not billed at full price.",
			"- **Cache prices differ by provider.** Anthropic charges a cache *read* at about 10% of its normal input price (and a cache *write*, the first time a prefix is seen, at about 125% of it). OpenRouter publishes each model's own `input_cache_read` price in its catalog — some models have none at all, and this table charges those rows the full input price for their \"cached\" share rather than inventing a discount.",
			"- **Forking a session only reuses the cache on the SAME model.** The cache key is tied to the exact model (and provider) that wrote it, so a fork that switches models pays full price for the whole context again, even though the words are identical.",
			"- **A local model's file size is roughly its VRAM need.** The weights have to fit in VRAM, plus about 1–2 GB more for the context window itself — a 7B model's ~5 GB file needs about 6–7 GB of VRAM to run with room for a real conversation.",
			"- **`qwen2.5-coder` struggles with tool calls** — fine for a one-shot \"write this file\" job, weak as a multi-step agent that has to call tools correctly in a loop.",
		].join("\n"));
	}

	/* "How thinking works" — ai/system/thinking/ (Phase 9 + 10). One screen, one picture: what runs on
	   the PROVIDER's server (inside one billed API call) vs. what runs on OUR machine (the harness's
	   own tool loop, each round trip its own billed call). */
	static render_thinking(){
		md("**A \"turn\" is many separate calls to the model, and only the thinking inside each one is free to watch.** The picture: one box is the provider's server, the other is this machine.");
		div.c("card").html_unsafe(`
			<svg viewBox="0 0 640 220" width="100%" height="220" role="img" aria-label="The provider's server runs the model's thinking inside one API call; our machine runs the tool loop between calls">
				<rect x="10" y="20" width="270" height="180" rx="10" fill="none" stroke="var(--ink-muted,#888)"></rect>
				<text x="145" y="44" text-anchor="middle" style="fill:var(--ink);font-weight:700">Provider's server</text>
				<rect x="35" y="70" width="220" height="50" rx="8" fill="#0072B2" opacity=".18"></rect>
				<text x="145" y="100" text-anchor="middle" style="fill:var(--ink)">thinking + answer</text>
				<text x="145" y="150" text-anchor="middle" style="fill:var(--ink-muted,#666);font-size:.8rem">one billed API call</text>
				<text x="145" y="170" text-anchor="middle" style="fill:var(--ink-muted,#666);font-size:.8rem">effort sets how much thinking</text>
				<rect x="360" y="20" width="270" height="180" rx="10" fill="none" stroke="var(--ink-muted,#888)"></rect>
				<text x="495" y="44" text-anchor="middle" style="fill:var(--ink);font-weight:700">Our machine</text>
				<rect x="385" y="70" width="220" height="50" rx="8" fill="#E69F00" opacity=".18"></rect>
				<text x="495" y="100" text-anchor="middle" style="fill:var(--ink)">the tool loop</text>
				<text x="495" y="150" text-anchor="middle" style="fill:var(--ink-muted,#666);font-size:.8rem">runs the tool, sends the result back</text>
				<text x="495" y="170" text-anchor="middle" style="fill:var(--ink-muted,#666);font-size:.8rem">each round trip = one more call</text>
				<line x1="282" y1="95" x2="358" y2="95" stroke="var(--ink-muted,#888)" marker-end="url(#arrow)"></line>
				<line x1="358" y1="115" x2="282" y2="115" stroke="var(--ink-muted,#888)" marker-end="url(#arrow)"></line>
				<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-muted,#888)"></path></marker></defs>
			</svg>
		`);
		md("**What that means for cost:** a turn with 8 tool calls is about 8 billed model calls, not one — the model asks for a tool, the harness runs it on our machine, and sends the result back as a fresh call. `effort` only sets how much the provider thinks *inside* one of those calls.");
		AIOverview.heading("How thinking spends tokens", "Four points, each checked against the provider's own docs.");
		md([
			"1. **Thinking is billed as OUTPUT tokens** — at the output rate, same as the answer text. [Anthropic: extended thinking](https://docs.claude.com/en/docs/build-with-claude/extended-thinking) · [OpenRouter: reasoning tokens](https://openrouter.ai/docs/use-cases/reasoning-tokens)",
			"2. **In a tool loop, earlier thinking is sent back as input** on the next call (the model needs its own prior reasoning to keep using a tool's result) — mostly served from the prompt cache, and providers trim or drop older thinking blocks rather than re-billing them in full. Same links as above.",
			"3. **Streaming can be cancelled, but a thought can't be steered mid-way** — you can stop generation early, but there's no way to inject a correction into a thinking block while it's still being written; the next steer has to wait for a fresh call.",
			"4. **With interleaved thinking, the model thinks between tool calls** (Anthropic's interleaved-thinking mode) — e.g. it can reason again right after a web search comes back, inside the same turn, instead of only once at the start.",
			"**Where OpenRouter differs:** it passes a model's reasoning through as a normalized `reasoning` field, but not every upstream provider exposes the raw thinking text (some summarize or redact it) — check a model's own page on openrouter.ai before assuming you can read it.",
		].join("\n"));
	}

	static render_writers(base){
		md("**Every `.jsonl` file is one object's history, and a line that skips the check can corrupt the page that reads it.** This table names who can write one, and whether `jsonl-schema.mjs`'s `check()` runs on the line first. The rule that outranks all of it: **a guard must never go silent** — a broken checker still writes the line (marked, if it can tell) rather than dropping it.");
		table(["writer", "who runs it", "checked?"], WRITERS.map(w => [
			w.name,
			w.who,
			() => w.ok ? span.c("pass", "yes") : span.c("fail", "no"),
		]));
		md(WRITERS.map(w => `- **[${w.name}](${file_link(w.path)})**: ${w.note}`).join("\n"));
		AIOverview.heading("Where this came from", "The owner's 2026-10-02 ask cited an audit of \"12 writers,\" but only 9 were ever named (5 already solid, 4 gaps, listed above) — the other 3 were never written down anywhere this page could find. [jsonl-writers](" + base + "2026-10-02/jsonl-writers/) closed 2 of the 4 named gaps the same day. **Re-check this against the code, don't trust either number** — a repo-wide grep for `appendFileSync` the same day found 20-plus further call sites outside both counts (several inside Servex's own agent code). Those are lower-risk — they write Servex's own internal logs, not a page a reader loads — but nobody has swept them yet.");
		AIOverview.heading("The one rule above the table", "A validator that fails must never take the writer down with it.");
		md("`ledger.mjs` and `Append.js` both follow it: if `check()` itself throws (a bug in the checker, not the line), the line is written anyway and the failure is logged, never swallowed. The write/edit guard (`.claude/hooks/jsonl-guard.mjs`) adds a second layer: a hand `Write`/`Edit` onto a `.jsonl` file that already exists is refused outright — a brand-new file is still allowed, so opening a task's log still works.");
	}

	/* "How a page saves" — ai/system/saving/ (deliverable 3: page.jsonl lines, set(delta), Store,
	   List, the dev socket's append and tail). This is a converging design, not a finished one —
	   the page says so and points at the one proposal instead of re-explaining it three times. */
	static render_saving(base){
		md("**A page's data is lines in its own `page.jsonl`.** Change something on a page, and one line is appended — never a whole-file rewrite. Every other open tab on that same page hears the new line within milliseconds, no reload.");
		AIOverview.heading("The path one edit takes", "Six steps, in order.");
		flow([
			["You change something", null, "type a word, drag a card, check a box."],
			["set(delta)", null, "the page's own method — a method name runs it, a settable value is merged in, anything else is data."],
			["one line is appended", "/framework/ext/JSONL/", "`{\"set\": {...}}`, never a rewrite of the whole file — ext/JSONL's format."],
			["the dev socket sends it", "/framework/dev/Socket/", "`rpc:append`, checked (see \"Data: how it's written\")."],
			["the file grows one line", null, "`page.jsonl` on disk — the whole history of that page, replayable from line one."],
			["every open tab hears it", "/framework/dev/Socket/", "the socket's `tail`: new lines only, pushed the moment they land — see `Server/plugins/SocketServer/Tail.js`."],
		]);
		AIOverview.heading("Converging today", "Not finished: file and saving code is still spread across four places, being pulled into one.");
		md([
			"- [ext/Saver](/framework/ext/Saver/) — whole-JSON rewrites (`FileSaver`, `LocalStorageSaver`).",
			"- [ext/filesystem](/framework/ext/filesystem/) — `FsFile`/`FsDir`, reading and writing a path on disk.",
			"- [ext/JSONL](/framework/ext/JSONL/) — the append-only line format every log here uses (`assign`, `log`, `set`, …).",
			"- [dev/Socket](/framework/dev/Socket/) — the one WebSocket every save, reload and live stream rides.",
			"**The plan:** one file object as the only caller of the dev socket, so these four stop being four. Full design: [page-item-design.md](" + base + "2026-09-30/proposal-flow/page-item-design.md) — read its LATEST section first, the rest is superseded passes kept for the record. The build: [page-extends-item](" + base + "2026-10-02/page-extends-item/requirements.md).",
		].join("\n"));
	}

	// cards() and flow() live in ux/Content/structure (Structure.js), shown on its page.
	static VIRTUAL_TABS = VIRTUAL_TABS;
	static SYSTEM_PARTS = SYSTEM_PARTS;
	static cards = cards;
	static card = card;
	static flow = flow;

}

export default AIOverview;
