import { Page, md, div, a, span, small, strong, icon, h2, h3, ol, li } from "/app.js";
import { CONCEPTS, GROUPS, FLOW } from "./concepts.js";
import { Skill, Ask, Task } from "./objects.js";

/* THE FOUR TOP TABS of /framework/ai/ (the owner, 2026-09-30: "use the same docs kind
   of UI for top tabs"). Each tab is a routed page; ai/page.js calls tab_page(). */
export const TABS = ["overview", "skills", "objects", "authoring"];

/* THE AUTHORING PIECES, used on every tab below and shown on the Authoring tab.
   A section is a heading, one gist line, then its items; nothing else. */

// A grid of gist cards: big icon, name, one line. The default way to show a few things.
export function cards(items){
	return div.c("wide flex auto gap", () => items.forEach(it => card(it))).style("--column", "16rem");
}
export function card({ name, icon: ic, gist, href }){
	return a.c("card flex v gap-35").href(href)
		.style({ textDecoration: "none", color: "var(--ink)" })
		.append(() => {
			if (ic) icon(ic).style({ fontSize: "2rem" });
			span(name).style({ fontWeight: "700" });
			if (gist) small.c("muted", gist);
		});
}
// A heading and its gist line: the reader knows what the section is before any detail.
export function heading(title, gist){ h2(title); if (gist) md(gist); }
// Numbered steps, each a linked name and one line: for anything that happens in order.
export function flow(steps){
	return ol.c("flex v gap-35", () => steps.forEach(([name, href, text]) =>
		li(() => { (href ? a(name).attr("href", href) : strong(name)).style({ fontWeight: "700" }); span(" — " + text); })));
}

const concept_card = (base, c) => ({ name: c.name, icon: c.icon, gist: c.gist, href: base + c.slug + "/" });
// Fetch, then fill a box captured NOW (no DOM after an await: CLAUDE.md's traps).
const later = (box, url, parse, fill) => fetch(url).then(r => r.text()).then(t => box.append(() => fill(parse(t)))).catch(() => box.append(() => small.c("muted", "Could not load " + url)));
const jsonl = t => t.trim().split("\n").map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

const KINDS = [
	["role", "Roles", "Become one of these agents. A role skill is the agent's whole job description."],
	["trigger", "Triggers", "Run at a moment: before the first edit, before a page, when a task lands."],
	["reference", "Reference", "Read before a kind of work, then again when it has been a while."],
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
				md("**How these pages are written: a hierarchy you can see.** Title, then a heading with its gist line, then a few items in the right form. Four pieces, all in `ai/overview.js`, and every tab here uses them.");
				heading("The four pieces", "Each shown live, smallest first.");
				flow([
					["heading(title, gist)", null, "a section's name, then one line saying what it is."],
					["cards(items)", null, "a few things side by side: icon, name, one line, a link each."],
					["flow(steps)", null, "things that happen in order, numbered, each a link."],
					["obj.chip() · row() · panel()", url.replace("authoring/", "objects/"), "one object, at the size the place needs."],
				]);
				heading("A card grid, live", "Three of the system's parts, as `cards()` draws them.");
				cards(CONCEPTS.slice(0, 3).map(c => concept_card(base, c)));
				heading("The rules they follow", "The `content` and `page` skills. The live catalog of structured pieces is ux/Content/structure.");
				cards([
					{ name: "content", icon: "school", gist: "Show the structure first, then as few words as it takes.", href: base + "skills/content/" },
					{ name: "page", icon: "school", gist: "A page from the top down: what, where, layout, content, in that order.", href: base + "skills/page/" },
					{ name: "Structured content", icon: "account_tree", gist: "Icon cards, sections and outlines: the shared widgets.", href: "/framework/ux/Content/structure/" },
				]);
			},
		},
	};
	const cfg = pages[name];
	return new Page({ ...cfg, url });
}
