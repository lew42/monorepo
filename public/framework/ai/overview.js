import { Page, md, div, a, span, small, strong, icon, h2, h3 } from "/app.js";
import { code } from "/framework/ext/highlight/highlight.js";
import { CONCEPTS, GROUPS, FLOW } from "./concepts.js";
import { Skill, Ask, Task } from "./objects.js";
import { cards, card, flow } from "/framework/ux/Content/structure/Structure.js";
import { table } from "/framework/ui/table/table.js";

/* THE TOP TABS of /framework/ai/: Inbox (the default), Log and System (the owner, 2026-09-30:
   "log is everything. And inbox is only… priority… and above"). Inbox and Log are the SAME
   rail (`AIRail`, ai2/rail.js) at two floors, 90 and 0; System holds all the AI system docs and
   takes the whole width. Each tab is a routed page; ai/page.js draws the strip and calls tab_page(). */
export const TABS = ["inbox", "log", "system"];
// The System tab's own pages (/framework/ai/system/<name>/). Each still answers at its old
// url, /framework/ai/<name>/, so no link breaks (ai/page.js route()).
export const SYSTEM_PARTS = ["skills", "claude-md", "objects", "authoring", "models", "thinking"];

/* THE AUTHORING PIECES, used on every tab below and shown on the Authoring tab.
   A section is a heading, one gist line, then its items; nothing else. */

// cards() and flow() live in ux/Content/structure (Structure.js), shown on its page.
export { cards, card, flow };
// A heading and its gist line: the reader knows what the section is before any detail.
export function heading(title, gist){ h2(title); if (gist) md(gist); }
const concept_card = (base, c) => ({ name: c.name, icon: c.icon, gist: c.gist, href: base + c.slug + "/" });
// Fetch, then fill a box captured NOW (no DOM after an await: CLAUDE.md's traps).
const later = (box, url, parse, fill) => fetch(url).then(r => r.text()).then(t => box.append(() => fill(parse(t)))).catch(() => box.append(() => small.c("muted", "Could not load " + url)));
const jsonl = t => t.trim().split("\n").map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

// The groups the Skills tab draws, in order; a skill's `kind` (skills.json) picks its
// group, and a group with no skills is skipped. Regrouping is data: give a SKILL.md a
// `kind:` line (skills.mjs reads it first), add its group here. `aspect` and `companion`
// wait for the ui-skills proposal (ai/2026-09-30/servex-mastermind/ui-skills-proposal.md).
const KINDS = [
	["role", "Roles", "Become one of these agents. A role skill is the agent's whole job description."],
	["aspect", "Aspects", "One side of building UI: content, layout, controls, navigation, style."],
	["trigger", "Triggers", "Run at a moment: before the first edit, before a page, when a task lands."],
	["reference", "Reference", "Read before a kind of work, then again when it has been a while."],
	["companion", "Companions", "Small skills another skill reminds you of."],
];

// The detail column's empty state — the same two lines the rail's own shell shows.
const empty = (line, sub) => div.c("inbox-empty muted", () => { span(line); if (sub) small(sub); });

export function tab_page(root, name, url = root.url + name + "/"){
	const base = root.url;
	const pages = {
		/* THE DEFAULT TAB IS THE INBOX (the owner, 2026-09-30): the rail beside it, at the
		   Inbox's floor — only rows scoring 90 and up. Its own page is just the empty detail. */
		inbox: {
			title: "Inbox", icon: "inbox", classes: "inbox-page inbox-tab",
			activated(){ root.ai2?.tab_floor(90); },
			content(){ empty("Pick something on the left.", "It opens here, and the list stays where it is."); },
		},
		/* THE LOG IS THE SAME RAIL AT 0: every row, newest first (the owner, 2026-09-30: "log is
		   everything"). Leaving it puts the Inbox's floor back, unless the url names one. */
		log: {
			title: "Log", icon: "history", classes: "inbox-page inbox-tab",
			activated(){ root.ai2?.tab_floor(0, "AI log"); },
			deactivated(){ root.ai2?.tab_floor(90); },
			content(){
				empty("Everything, newest first. Pick something on the left.", "");
				md("Every task by day, in flight first: [the task log](" + base + "all-tasks/).");
			},
		},
		/* THE SYSTEM TAB holds all the AI system docs (the owner, 2026-09-30): the parts,
		   then the docs pages (its route() below), then design and code, linked not copied. */
		system: {
			title: "System", icon: "account_tree", classes: "inbox-takeover inbox-tab",
			content(){
				md("**The AI system: who does the work, what it knows, how work is tracked, and how it lands.** Click any part for its own page.");
				for (const g of GROUPS){
					heading(g.title, g.gist);
					cards([...CONCEPTS.filter(c => c.group === g.id).map(c => concept_card(base, c)), ...(g.links ?? [])]);
					if (g.id === "who"){
						// WHO SPAWNS AGENTS, WHERE AND HOW (the owner via vscode-mastermind, 2026-10-01).
						heading("Who starts the agents", "Servex starts almost every agent, through the Claude Agent SDK. The one exception is the VS Code sidebar session, which you start by hand.");
						cards([
							{ name: "Servex, through the Agent SDK", icon: "hub", gist: "Masterminds, minions, reviewers and both assistants. The spawn_agent tool starts each one (Servex/agents/Agents.js), and its tools run inside Servex.", href: "/framework/servex/" },
							{ name: "OpenRouter minions", icon: "alt_route", gist: "The same SDK loop, sent to OpenRouter's address instead of Anthropic's, so another model family does the work (Servex/ext/openrouter/).", href: "/framework/servex/" },
							{ name: "You, by hand", icon: "person", gist: "The VS Code sidebar session, vscode-mastermind. You start it yourself; Servex does not spawn it." },
						]);
						md("More: [Servex](/framework/servex/) · [its lifecycle](/framework/servex/lifecycle/) · [roles](/framework/servex/doc/roles.md)");
					}
				}
				heading("How it works together", "The path your words take, from the moment you speak to the card that shows the result.");
				flow(FLOW.map(([n, slug, text]) => [n, base + slug + "/", text]));
				heading("Its documentation", "One page each. Servex, design and code have their own pages; these cards link there.");
				cards([
					{ name: "Skills", icon: "school", gist: "How to do one kind of job well, one page per skill.", href: url + "skills/" },
					{ name: "CLAUDE.md", icon: "gavel", gist: "The file every agent loads first, and an audit of what it names.", href: url + "claude-md/" },
					{ name: "Readmes", icon: "menu_book", gist: "The chain of readmes an agent reads, root first.", href: base + "readmes/" },
					{ name: "Objects", icon: "category", gist: "Each thing as a chip, a row and a panel.", href: url + "objects/" },
					{ name: "Authoring", icon: "edit_note", gist: "The pieces these pages are built from, simple to complex.", href: url + "authoring/" },
					{ name: "Models", icon: "query_stats", gist: "Which model is best value, for which kind of work.", href: url + "models/" },
					{ name: "Servex", icon: "hub", gist: "The process that runs the agents. Its own docs.", href: "/framework/servex/" },
					{ name: "Design system", icon: "palette", gist: "How a page looks: layout, spacing, colour, controls, content.", href: "/framework/design/" },
					{ name: "Code system", icon: "code", gist: "How the code is written: objects, pages, views, the traps.", href: "/framework/code/" },
				]);
				heading("Where AI data lives", "Everything is a page; a page's data is a line in its own page.jsonl until it grows. The rule and the table: [Page inboxes](" + base + "inboxes/).");
			},
			route(name){ if (SYSTEM_PARTS.includes(name)) return tab_page(root, name, url + name + "/"); },
		},
		skills: {
			title: "Skills", icon: "school",
			content(){
				md("**A skill is how to do one kind of job well.** An agent loads it by name when the moment comes. Each page below is built from its `.claude/skills/<name>/SKILL.md`.");
				md("What a skill knows lives on the site: design at [/framework/design/](/framework/design/), code at [/framework/code/](/framework/code/). A skill points there. Servex facts a skill used to carry live here, such as the [page inbox](" + base + "inboxes/).");
				const box = div.c("wide");   // the card grids arrive inside it, so it takes the wide track
				later(box, base + "skills.json", JSON.parse, list => KINDS.forEach(([k, title, gist]) => {
					if (!list.some(s => s.kind === k)) return;
					heading(title, gist);
					cards(list.filter(s => s.kind === k).map(s => ({ name: s.id, icon: "school", gist: s.for, href: url + s.id + "/" })));
				}));
			},
			route(id){
				if (!/^[\w-]+$/.test(id)) return;
				return new Page({
					title: id, icon: "school", url: url + id + "/",
					content(){
						const box = div();
						later(box, base + "skills.json", JSON.parse, list => {
							const s = list.find(x => x.id === id);
							if (!s) return md("No skill named `" + id + "`. [All skills](" + url + ")");
							md(`**${s.for}**`);
							if (s.when) md(s.when);
							heading("At a glance");
							md([`- **Kind:** ${s.kind}`, `- **Source:** \`.claude/skills/${s.id}/SKILL.md\` (${s.lines} lines)`, `- **Improvements log:** ${s.improvements ? "yes, `improvements.md` beside it" : "none yet"}`, `- Who changes it: the Servex mastermind`].join("\n"));
							if (s.questions?.length){
								heading("The check", "`review` asks these after the work, from `questions.md` beside the skill.");
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
					heading(title, gist);
					const box = div.c("wide flex auto gap").style("--column", "18rem");
					box_fill(box);
				};
				const three = o => { div.c("flex v gap-50", () => { small.c("muted", "chip"); o.chip(); small.c("muted", "row"); o.row(); small.c("muted", "panel"); o.panel(); }); };
				show("Skill", "One `.claude/skills/<name>/SKILL.md`.", box => later(box, base + "skills.json", JSON.parse, list => list.slice(0, 3).forEach(s => three(new Skill(s)))));
				show("Ask", "One line of `ai/asks.jsonl`: what you asked, and who owns it.", box => later(box, base + "asks.jsonl", jsonl, lines => lines.map(l => l.ask).filter(Boolean).slice(-3).reverse().forEach(x => three(new Ask(x)))));
				show("Task", "The first line of a task's `task.jsonl`: the ask, the plan, the step.", box => later(box, base + "2026-09-30/ai-page/task.jsonl", jsonl, lines => {
					const first = lines.find(l => l.assign)?.assign ?? {};
					const last = lines.filter(l => l.assign).map(l => l.assign).reduce((o, x) => ({ ...o, ...x }), {});
					three(new Task({ ...first, ...last, date: "2026-09-30", slug: "ai-page" }));
				}));
				heading("Next: Agent and Card", "Their data lives in Servex while they run; they get the same three views next. Proposed with a skill for designing objects this way: [the proposal](" + base + "2026-09-30/ai-page/object-design-proposal.md).");
			},
		},
		authoring: {
			title: "Authoring", icon: "edit_note",
			content(){
				md("**Every page here is built from four pieces. Each is shown working below, simplest first.** The rules are in the [content skill](" + base + "skills/content/); this page only shows their effect.");
				heading("The four pieces", "Smallest first. cards() and flow() live in [Structure](/framework/ux/Content/structure/).");
				flow([
					["heading(title, gist)", null, "a section's name, then one line saying what it is."],
					["cards(items)", null, "a few things side by side: icon, name, one line, a link each."],
					["flow(steps)", null, "things that happen in order, numbered, each a link."],
					["obj.chip() · row() · panel()", url.replace("authoring/", "objects/"), "one object, at the size the place needs."],
				]);
				heading("Simple: a card grid", "Three of the system's parts, as `cards()` draws them.");
				cards(CONCEPTS.slice(0, 3).map(c => concept_card(base, c)));
				heading("Complex: a whole system, shown by its effect", "The readme chain an agent gets in `public/framework/ai/`, drawn live from the files. Its page explains it: [Readmes](" + base + "readmes/).");
				readme_chain("public/framework/ai/");
				heading("The rules they follow", "The `content` and `page` skills. The live catalog of structured pieces is ux/Content/structure.");
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
				div(() => { small.c("muted", "The file, as agents get it. It is a copy: node public/framework/ai/skills.mjs refreshes it."); const $file = div(); code.file(import.meta, "CLAUDE.md", { lang: "markdown", lines: true }).then(v => $file.append(v)); });
				div.c("flex v gap", () => {
					heading("What goes in it", "Anything that changes what an agent does on its first turn.");
					md("- The laws, the presentation rule, the ask-before list, the traps that never throw.\n- One line per system that has an effect: its name, the effect, a link.");
					heading("What goes one click down", "Anything that matters only once an agent is doing that kind of work.");
					md("- How to do it: the skill. Why it is that way: the doc. What it looks like: the page.");
					heading("Audit: the systems it names", "Each links to its page.");
					cards([
						{ name: "Server", icon: "dns", gist: "The dev server.", href: "/framework/servex/fs/?file=Server/readme.md" },
						{ name: "Servex", icon: "hub", gist: "Agents, the pool, the heartbeat, merge and review.", href: "/framework/servex/" },
						{ name: "The ai/ log", icon: "receipt_long", gist: "Every task, open to landed.", href: base + "tasks/" },
						{ name: "The asks ledger", icon: "record_voice_over", gist: "Every routed ask and its owner.", href: base + "asks/" },
						{ name: "Readmes and doc/", icon: "menu_book", gist: "Docs point, they don't explain.", href: base + "readmes/" },
						{ name: "Live-reload hold", icon: "pause_circle", gist: "One reload per batch of writes.", href: "/framework/servex/fs/?file=Server/doc/watch.md" },
					]);
					heading("Audit: systems with an effect it doesn't name", "Proposed one-liners. mastermind-servex-9 drafts the edit; the owner applies it.");
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
			later(box, base + "system/models/models.json", JSON.parse, render_models);
		},
	};
	pages["thinking"] = {
		title: "How thinking works", icon: "psychology",
		content(){ render_thinking(); },
	};

	// ⚠ title "" — the tab sits under the page's own h1 ("AI"); a second page-size
	// heading on top of the panel read as two titles. The strip reads `label`.
	const { title, ...cfg } = pages[name];
	const top = TABS.includes(name) && url === root.url + name + "/";
	return new Page({ ...cfg, label: title, title: top ? "" : title, url });
}

/* readme_chain(dir) — the chain a fresh agent in `dir` is handed (Servex/agents/readme-chain.js),
   drawn live: every folder from the repo root down to `dir` that has a readme.md, root → leaf,
   each with its first line. The chain file is not served, so this walks the same rule by path. */
export function readme_chain(dir = "public/framework/ai/"){
	const parts = dir.split("/").filter(Boolean);
	const levels = [""].concat(parts.map((_, i) => parts.slice(0, i + 1).join("/") + "/"));
	const box = div.c("wide").style({ display: "grid", gap: ".5rem" });
	const url_of = d => d.startsWith("public/") ? d.slice("public".length) + "readme.md" : null;   // public/ is the site root
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

// Fixed hue per model (never cycled: CLAUDE.md "color follows the entity"), colorblind-safe
// (Okabe-Ito). Claude is the baseline control, drawn in ink grey rather than a competing hue.
const MODEL_COLOR = {
	"openai/gpt-6-luna": "#E69F00",
	"deepseek/deepseek-v4.1-flash": "#0072B2",
	"google/gemini-3.8-flash": "#009E73",
	"google/gemini-3.1-pro-preview": "#CC79A7",
};
const model_color = model => MODEL_COLOR[model] ?? (model.startsWith("claude-") ? "#767676" : "#999");
// Phase 15 adds Sonnet and Opus runs alongside Haiku's (the test library), so the three Claude
// models need their own names here, not one label shared by all of them.
const CLAUDE_NAME = {
	"claude-opus-5-5": "Claude Opus (control)",
	"claude-sonnet-5": "Claude Sonnet (control)",
	"claude-haiku-4-5-20251001": "Claude Haiku (control)",
};
const model_name = model => CLAUDE_NAME[model] ?? (model.startsWith("claude-") ? "Claude (control)" : (model.split("/")[1] ?? model));
const fmt_usd = n => n == null ? "—" : n < 0.001 ? "<$0.001" : "$" + n.toFixed(n < 1 ? 3 : 2);
const fmt_pct = n => n == null ? "—" : Math.round(n * 100) + "%";

// One facet (small multiple) per kind — kinds differ wildly in scale (a rule test's value is in
// the tens, a probe's is near zero), so each gets its own x-axis rather than one shared scale
// that would crush the small ones to invisible (dataviz: "two measures of different scale -> two
// charts or small multiples").
function bar_facet_svg(rows){
	// Phase 15: a below-the-bar row never appears in the chart, only ranked ones do.
	const real = rows.filter(r => r.value != null && !r.belowBar);
	if (!real.length) return null;
	const max = Math.max(...real.map(r => r.value), 0.01);
	const rowH = 28, pad = 8, L = 190, R = 60, W = 640, H = real.length * rowH + pad * 2;
	let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Value per configuration, best first">`;
	real.forEach((r, i) => {
		const y = pad + i * rowH, bw = Math.max(2, (r.value / max) * (W - L - R));
		const label = model_name(r.model) + (r.effort ? " · " + r.effort : "");
		s += `<text x="${L - 8}" y="${y + 15}" text-anchor="end" style="fill:var(--ink);font-size:.8rem">${label}</text>`;
		s += `<rect x="${L}" y="${y + 3}" width="${bw}" height="16" rx="4" fill="${model_color(r.model)}"></rect>`;
		s += `<text x="${L + bw + 6}" y="${y + 15}" style="fill:var(--ink-muted,#666);font-size:.8rem">${r.value}</text>`;
	});
	s += `</svg>`;
	return s;
}

function render_models(data){
	heading("Value per configuration, by kind", "Best first in each row group. One bar is one model at one effort level; the number is value (performance ÷ $/run).");
	md("A model must do the job about as well as Sonnet before its price counts.");
	div.c("card").append(() => {
		data.kinds.filter(k => k.rows.some(r => r.value != null)).forEach(k => {
			const svgText = bar_facet_svg(k.rows);
			if (!svgText) return;
			h3(k.label.split(" — ")[0]).style({ fontSize: "1rem", marginTop: "1.25rem" });
			div().html_unsafe(svgText);
		});
		small.c("muted", data.weighting_note || "Each test is weighted by how well it separates strong models from weak ones.");
	});

	heading("Every configuration tried", "×Sonnet is a price ratio, not this run's cost: each model's list price per token, divided by claude-sonnet-5's. Claude rows use Anthropic's list prices; the rest use OpenRouter's.");
	const head = ["kind", "model", "effort", "performance", "$/run", "×Sonnet", "value"];
	// Phase 15: a row below its kind's quality bar stays in the table — it's still a real result —
	// but greyed, and its value cell says why it isn't ranked instead of showing a number.
	const allRows = data.kinds.flatMap(k => k.rows.map(r => {
		const cells = [
			k.kind, model_name(r.model), r.effort ?? "—", fmt_pct(r.performance), fmt_usd(r.cost),
			r.xSonnet == null ? "—" : r.xSonnet + "×",
			r.belowBar ? "below the bar" : (r.value == null ? "—" : String(r.value)),
		];
		return r.belowBar ? cells.map(text => () => small.c("muted", text)) : cells;
	}));
	table(head, allRows);

	heading("Best value, per kind, in plain words");
	data.kinds.forEach(k => {
		const line = k.best
			? `**${k.label.split(" — ")[0]}:** ${model_name(k.best.model)}${k.best.effort ? " at " + k.best.effort + " effort" : ""} — ${k.best.value} value per dollar.`
			: k.rows.length
				? `**${k.label.split(" — ")[0]}:** No model passes this yet (the check itself is under review).`
				: `**${k.label.split(" — ")[0]}:** not enough real runs yet to say.`;
		md(line);
	});
	md("*Rows with no cost or no real run are left out of the chart and the best-value line, not shown as zero.*");
}

/* "How thinking works" — ai/system/thinking/ (Phase 9 + 10). One screen, one picture: what runs on
   the PROVIDER's server (inside one billed API call) vs. what runs on OUR machine (the harness's
   own tool loop, each round trip its own billed call). */
function render_thinking(){
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
	heading("How thinking spends tokens", "Four points, each checked against the provider's own docs.");
	md([
		"1. **Thinking is billed as OUTPUT tokens** — at the output rate, same as the answer text. [Anthropic: extended thinking](https://docs.claude.com/en/docs/build-with-claude/extended-thinking) · [OpenRouter: reasoning tokens](https://openrouter.ai/docs/use-cases/reasoning-tokens)",
		"2. **In a tool loop, earlier thinking is sent back as input** on the next call (the model needs its own prior reasoning to keep using a tool's result) — mostly served from the prompt cache, and providers trim or drop older thinking blocks rather than re-billing them in full. Same links as above.",
		"3. **Streaming can be cancelled, but a thought can't be steered mid-way** — you can stop generation early, but there's no way to inject a correction into a thinking block while it's still being written; the next steer has to wait for a fresh call.",
		"4. **With interleaved thinking, the model thinks between tool calls** (Anthropic's interleaved-thinking mode) — e.g. it can reason again right after a web search comes back, inside the same turn, instead of only once at the start.",
		"**Where OpenRouter differs:** it passes a model's reasoning through as a normalized `reasoning` field, but not every upstream provider exposes the raw thinking text (some summarize or redact it) — check a model's own page on openrouter.ai before assuming you can read it.",
	].join("\n"));
}
