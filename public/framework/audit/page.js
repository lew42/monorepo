import { Doc, md } from "/app.js";

/* One page per module report. The slug is the module path with its slash flattened,
 * so the title puts it back — and overriding `docs()` for that is the whole reason
 * `Doc` is a class. */
class AuditDoc extends Doc {
	docs(section){
		Doc.names(this.notes).forEach(name => this.member_page(section, name, {
			title: name.replace(/^(core|ext|dev)-/, "$1/"),
			file: `doc/${name}.md`,
		}));

		return section;
	}
}

export default new AuditDoc({
	meta: import.meta,
	title: "Audit",
	description: "Every framework module read end to end by its own agent, 2026-08-15 — what the docs were, what they are, and what to do next.",
	icon: "fact_check",

	// The framework sidebar lists a section's children as sub-entries; my children are
	// tab sections, not navigation. `leaf` is how a page says "I present myself".
	leaf: true,

	overview: "priorities organization",
	children: "browsable",
	files:    "page.js readme.md",

	notes: `core-View core-Page core-App core-Router core-Sidebar core-Item-List core-new
	        dev util styles ui
	        ext-doc ext-markdown ext-highlight ext-files ext-tabs ext-catalog ext-toc
	        ext-demo ext-layout ext-Panel ext-editor ext-Saver ext-Draggable
	        ext-DesignTool ext-AITask ext-JSONL ext-Timeline ext-Ask decisions`,

	content(){

		md("On **2026-08-15** every module under `/framework/` was read end to end by a dedicated agent following the new `documentation` skill — which was being tested by the exercise. Each agent rewrote its module's docs and filed a report. **[Priorities](/framework/audit/overview/priorities/)** is the ranked fix list; **[Organization](/framework/audit/overview/organization/)** answers the question this was really for; the **Docs** tab above is one report per module.");

		md("A newer, narrower measurement lives in the **[Browsable](/framework/audit/browsable/)** tab: is the site organized, visual, and browsable — computed from source, not eyeballed, and regenerated rather than transcribed.");

		md("## What the audit was for");

		md("Not \"are the docs written\" — most were. **Are they still true?** That turned out to be a different question with a much worse answer.");

		md("## The systemic finding: citation rot");

		md(`| module | stale \`file.js:N\` citations |
|---|---|
| \`core/Router\` | ~30, some drifted 17+ lines, three pointing at a deleted \`console.log\` |
| \`core/App\` | ~20, one naming a call site that exists nowhere |
| \`core/Page\` | 9 of 13 spot-checked wrong — one claimed \`Router.js\` calls \`log_label()\` **8 times** where the live file calls it **zero** |
| \`core/Sidebar\` | 6 |`);

		md("Nobody wrote these carelessly. Every one was correct the day it was typed, and every one reads as **precise** — which is exactly what makes it expensive, because a confident wrong number costs more than a missing one. Nothing detects the drift; the file it points into does not know it is being pointed at.");

		md("The rule is now in the skill: **cite the enclosing method, selector or export, never a line number.** Those move with the thing they name. If you must point at a line, quote it — a quote that no longer matches is greppable.");

		md("## The second finding: docs that were confidently wrong");

		md("Worse than stale numbers, rarer, and only findable by reading the code beside the prose. `core/Page`'s `doc/property/description.md` said `Page` never reads `description` — while `nav()` and `preview_card()` both do, a fix the module's own readme had already recorded. The doc and the readme disagreed, in the same directory, and nothing noticed.");

		md("## What was fixed, and what was not");

		md("Every agent was fenced to `readme.md`, `doc/**/*.md` and `page.js` **inside its own directory**. No `.js` that is not a `page.js`, no `.css`, nothing outside. So the docs were rewritten wholesale and **every code change came back as a ranked recommendation, unapplied** — twenty-eight agents editing shared seams in parallel is a merge, not a refactor.");

		md("Three exceptions were applied by the orchestrator, all one line, all bugs in code written the same day: `ext/files`' no-highlight fallback never checked `resp.ok` (a missing file rendered the SPA fallback's `index.html` **as the file's contents**); `ext/Doc`'s *Replaced at runtime* banner false-positived on every non-class subject; and four CSS comments still named `ext/classdoc`, which the rename pass missed by globbing only `*.js` and `*.md`.");

		md("## The skill was the real subject");

		md("Five holes in the `documentation` skill were found by agents using it and folded back the same day — whether `readme.md` documents itself (three agents, two answers), that the Improvements heading is never omitted, the line-number rule, what a module with two classes does, and that \"one screen\" governs the overview rather than the design record.");

		md("**A skill written by the person who built the system cannot be tested by that person.** Every one of those was invisible from the inside and obvious to the first outsider who hit it.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
