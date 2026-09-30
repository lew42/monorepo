import { Page, md, div, a, span, small, strong, icon, h2 } from "/app.js";
import { code } from "/framework/ext/highlight/highlight.js";
import { CONCEPTS, GROUPS, FLOW } from "./concepts.js";
import { Skill, Ask, Task } from "./objects.js";
import { cards, card, flow } from "/framework/ux/Content/structure/Structure.js";

/* THE FOUR TOP TABS of /framework/ai/ (the owner, 2026-09-30: "use the same docs kind
   of UI for top tabs"). Each tab is a routed page; ai/page.js calls tab_page(). */
export const TABS = ["overview", "skills", "objects", "authoring", "claude-md"];

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

export function tab_page(root, name){
	const base = root.url;
	const url = base + name + "/";
	const pages = {
		overview: {
			title: "Overview", icon: "hub",
			content(){
				md("**The AI system: who does the work, what it knows, how work is tracked, and how it lands.** Click any part for its own page.");
				for (const g of GROUPS){
					heading(g.title, g.gist);
					cards([...CONCEPTS.filter(c => c.group === g.id).map(c => concept_card(base, c)), ...(g.links ?? [])]);
				}
				heading("How it works together", "The path your words take, from the moment you speak to the card that shows the result.");
				flow(FLOW.map(([n, slug, text]) => [n, base + slug + "/", text]));
			},
		},
		skills: {
			title: "Skills", icon: "school",
			content(){
				md("**A skill is how to do one kind of job well.** An agent loads it by name when the moment comes. Each page below is built from its `.claude/skills/<name>/SKILL.md`.");
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
						"- **The four widths:** a page is checked at 400, 1400, 1920 and 3440.",
					].join("\n"));
				});
			}));
		},
	};

	// ⚠ title "" — the tab sits under the page's own h1 ("AI"); a second page-size
	// heading on top of the panel read as two titles. The strip reads `label`.
	const { title, ...cfg } = pages[name];
	return new Page({ ...cfg, label: title, title: "", url });
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
