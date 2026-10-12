import { Page, p, h2, h3, div, details, summary, ui, a } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a child page of the CSS explorer.
   2 SIZE       one column, reading width.
   3 OWN LAYOUT headline, the top five, then everything else folded away.
   4 REGIONS    none.   5 PREVIEW default card.
   No stylesheet: card + flow + ui.table. Totals are computed from data/*.json. */

const here = f => new URL(f, import.meta.url).href;
const load = f => fetch(here(f)).then(r => r.ok ? r.json() : null).catch(() => null);
const MODULES = "ai2 ext-a demo-dev-ux core styles imagine layouts rest".split(" ");
const n = x => Number(x || 0).toLocaleString();

// The build-once components. `re` matches a GENERALIZE cluster's target or a generalize[] name.
const COMPONENTS = [
	["Progress bar / meter", /progress|meter|level/i, "ui/progress (exists, unstyled) — give it one shared look"],
	["Chip / pill / tag / badge", /chip|pill|tag|badge/i, "ui/badge — add ok / warn / error tones"],
	["List row (link row, status edge, hover)", /list-row|nav-row|nav-link|row-button/i, "ui/tree row or ext/tabs .tab — one row class"],
	["Status dot", /dot/i, "ui/badge — a dot variant"],
	["Toolbar / header bar", /toolbar|header-bar/i, "core/Layout — a .head row (title left, actions right)"],
	["Chat bubble / thread", /chat/i, "ext/Ask — the one chat component"],
	["Disclosure / twirl", /disclosure|twirl/i, "native details styled once in framework.css"],
	["Dictate widget", /dictate/i, "ux/Dictate — compact and overlay modes, not per-page overrides"],
];


export default new Page({
	meta: import.meta,
	title: "Reduction plan",
	icon: "format_list_numbered",
	description: "The CSS cuts ranked biggest first — what to delete, what to swap for a class we already have, what to build once — each with its risk.",

	content(){
		const $box = div.c("flow wide");
		Promise.all(MODULES.map(m => load(`../data/${m}.json`))).then(mods => {
			const found = mods.filter(Boolean);
			const sum = f => found.reduce((s, m) => s + f(m), 0);
			const total = sum(m => (m.lines?.css || 0) + (m.lines?.jsBlocks || 0));
			const del = sum(m => m.totals?.DELETE || 0);
			const dup = sum(m => m.totals?.DUPLICATE || 0);
			const cl = found.flatMap(m => (m.clusters || []).map(c => ({ ...c, m: m.module })));
			const genSave = cl.filter(c => c.verdict === "GENERALIZE").reduce((s, c) => s + (c.saves || 0), 0);
			const genLines = sum(m => m.totals?.GENERALIZE || 0);
			const upto = del + dup;
			const genNames = found.flatMap(m => m.generalize || []);
			const comp = COMPONENTS.map(([name, re, home]) => {
				const saves = cl.filter(c => c.verdict === "GENERALIZE" && re.test(c.target || "")).reduce((s, c) => s + (c.saves || 0), 0);
				const uses = genNames.filter(g => re.test(g.name)).reduce((s, g) => s + (g.wouldReplace?.length || 0), 0);
				return { name, home, saves, uses };
			}).sort((x, y) => y.saves - x.saves);
			const sw = c => cl.filter(x => x.verdict === "DUPLICATE" && !/imagine\/(decks|screens|shells)\//.test(x.file)).reduce((s, x) => s + (x.saves || 0), 0);

			const top = [
				["1. Delete the core/new sandbox", 1851, "medium — it is the 'read, never import' prior-art folder; only comments mention it, but the owner may want it kept for reference", "delete framework/core/new/1 (29 sheets)", "verified: 29 files, 1,851 lines, no imports"],
				["2. Delete the moved imagine/ twins", 1749, "low — each page there is a 'Moved' stub; the live copy sits in layouts/labs/ or styles/system/studies/", "imagine/blogx, mag, sections, design/themes, design/color, design/size", "blogx 528 verified (nothing outside its own folder loads it); others per audit"],
				["3. Repoint three importers, delete the copies", 949, "medium — paging/templates/families.js must import the layouts/labs copies first", "imagine/decks, screens, shells → layouts/labs/*", "decks.css verified byte-identical to its twin (391)"],
				["4. Delete Panel's unused toolbar.css", 142, "low — no importer found", "framework/ext/Panel/toolbar.css", "per audit"],
				[`5. Build the chip, once`, comp.find(c => c.name.startsWith("Chip"))?.saves || 0, "medium — 30+ sites change look slightly; needs a side-by-side check", "ui/badge with tones", `${comp.find(c => c.name.startsWith("Chip"))?.uses || 0} sites listed by the audits`],
			];
			const rest = [
				["Swap the remaining duplicates for classes that exist (.card, .cols, .tab-bar, Sidebar…)", sw(), "medium — 2 of the first 5 spot-checked verdicts were wrong; check each before cutting", "framework.css / ext/tabs / core/Sidebar", "up to"],
				...comp.filter(c => !c.name.startsWith("Chip")).map(c => [`Build once: ${c.name}`, c.saves, `medium — ${c.uses} places to migrate, one at a time`, c.home, `${c.uses} sites listed by the audits`]),
			];
			const rows = list => list.map(r => [r[0], () => { p(`${r[1] ? "up to " + n(r[1]) : "—"}`); }, r[2], r[3] + " — " + r[4]]);

			$box.append(() => {
				div.c("flex auto", () => {
				div.c("card", () => {
					h2(`${n(upto)} of ${n(total)} lines could go, and about ${n(genSave)} more by building once`);
					p(`public/ holds ${n(total)} lines of CSS. The eight audits say ${n(del)} are unused (DELETE), ${n(dup)} repeat something that already exists (DUPLICATE), and ${n(genLines)} follow a handful of patterns that could be built once as shared components (GENERALIZE, net saving about ${n(genSave)}). The first two numbers are ceilings, not promises — see the caveat below.`);
				});
				div.c("flow", () => {
				h3("The five biggest, in order");
				ui.table(["What to do", "Lines saved", "Risk", "Where, and how it was checked"], rows(top)).style({ display: "table", width: "100%" });
				});
				}).style({ alignItems: "flex-start" });
				p(a.c("page-link").href(here("../")).text("Open the CSS explorer"), " · ", a.c("page-link").href(here("../tokens/")).text("The token proposal"));
				details(() => {
					summary("The rest of the plan, and the caveat");
					p("Caveat: the first spot-check found 2 of 5 audit verdicts wrong — a DELETE of `.all-pad` that edric/style/spacing/page.js:64 still uses, and `.ai-ask`, which is not really `.card`. Treat every DUPLICATE and DELETE saving as 'up to' and re-run its grep before cutting.");
					p("Build-once components are where the owner's rule lands: stop making new CSS; where something isn't built yet, generalize it once and reuse it. Counts come from the audits' own generalize lists.");
					ui.table(["What to do", "Lines saved", "Risk", "Lives in, and how many sites"], rows(rest)).style({ display: "table", width: "100%" });
				});
			});
		});
	},
});
