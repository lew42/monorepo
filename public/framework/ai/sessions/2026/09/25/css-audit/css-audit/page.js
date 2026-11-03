import { Page, p, h2, h3, div, span, meter, ui, a } from "/app.js";
import Tree from "/framework/ux/Tree/Tree.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a page in the day board's grid.
   2 SIZE       two panes side by side: the tree (fixed share) and the detail.
   3 OWN LAYOUT one screen — headline on top, the tree left, what you clicked right.
   4 REGIONS    none.   5 PREVIEW default card.
   No stylesheet: flex + gap + card + native <meter> bars. */

const here = f => new URL(f, import.meta.url).href;
const load = f => fetch(here(f)).then(r => r.ok ? r.json() : null).catch(() => null);
const MODULES = "ai2 ext-a demo-dev-ux core styles imagine layouts rest".split(" ");
const VERDICTS = "DUPLICATE GENERALIZE KEEP DELETE".split(" ");
const WORDS = {
	DUPLICATE: "an existing class or token already does this",
	GENERALIZE: "build it once as a shared component",
	KEEP: "genuinely specific to this page",
	DELETE: "unused",
};
const n = x => Number(x || 0).toLocaleString();
const clean = s => String(s).replace(/\s*\(.*$/, "");

export default new Page({
	meta: import.meta,
	title: "CSS explorer",
	icon: "folder_open",
	children: "plan tokens",
	description: "Every directory of public/, twirl it open, click it: how much CSS is inside, and what the audit proposes.",

	content(){
		const $top = div.c("card wide flex auto");
		p(a.c("page-link").href(new URL("plan/", import.meta.url).href).text("Ranked reduction plan"), " · ", a.c("page-link").href(new URL("tokens/", import.meta.url).href).text("Token proposal"));
		let $tree, $detail;
		div.c("flex gap wide", () => {
			$tree = div.c("card").style({ flex: "0 0 28em", minWidth: "0" });
			$detail = div.c("card").style({ flex: "1 1 0", minWidth: "0" });
		}).style({ alignItems: "flex-start" });

		Promise.all([load("data/tree.json"), ...MODULES.map(m => load(`data/${m}.json`))]).then(([tree, ...mods]) => {
			const found = mods.filter(Boolean);
			const owner = path => {
				let best, len = -1;
				found.forEach(m => (m.paths || []).forEach(pa => {
					const c = clean(pa);
					if ((path === c || path.startsWith(c + "/")) && c.length > len){ best = m; len = c.length; }
				}));
				return best;
			};
			const total = {};
			found.forEach(m => VERDICTS.forEach(v => total[v] = (total[v] || 0) + (m.totals?.[v] || 0)));

			$top.append(() => {
				if (!tree) return void p("The tree data is missing — run css-audit-tree.mjs.");
				div.c("flow", () => {
					h2(`${n(tree.rolled)} lines of CSS across public/`);
					p(found.length
						? `${found.length} of ${MODULES.length} modules audited so far. Click a directory to see its verdicts.`
						: "The audit is still running — the tree works now, the verdicts arrive as each module finishes.");
				});
				div.c("", () => this.verdicts(total));
			});
			if (!tree) return;

			const max = tree.children[0]?.rolled || 1;
			const node = d => ({
				text: `${d.name}   ${n(d.rolled)}`,
				dir: d,
				open: false,
				children: d.children.length ? () => d.children.map(node) : undefined,
			});
			const root = node(tree);
			root.open = true;
			$tree.append(() => {
				new Tree({ nodes: [root], selected_change: nd => this.show($detail, nd.dir, owner(nd.dir.path), max) });
			});
			this.show($detail, tree, owner(""), max);
		});

	},

	verdicts(t){
		const sum = VERDICTS.reduce((a, v) => a + (t[v] || 0), 0);
		if (!sum) return;
		ui.table(["Verdict", "Share", "Lines", "Meaning"], VERDICTS.map(v => [v, () => { meter.c("").attr("value", t[v] || 0).attr("max", sum); }, n(t[v]), WORDS[v]])).style({ display: "table", width: "100%" });
	},

	show($detail, d, m, max){
		$detail.empty(() => {
			h2(d.path || "public/");
			p(`${n(d.own)} lines directly in this directory · ${n(d.rolled)} including everything below it.`);
			div.c("cols half", () => {
				div.c("", () => {
				if (d.children.length) ui.table(["Inside", "Share", "Lines"], d.children.slice(0, 6).map(c => [c.name, () => { meter.c("").attr("value", c.rolled).attr("max", d.rolled || 1); }, n(c.rolled)])).style({ display: "table", width: "100%" });
			});
				div.c("", () => {
				if (!m) return void p("Audit pending — no verdicts for this directory yet.");
				h3(`Audit: ${m.module}`);
			this.verdicts(m.totals || {});
			p(m.proposal || "");
			if (m.risk) p(`Risk: ${m.risk}`);
				});
			});
			const rows = (m?.clusters || [])
				.filter(c => (c.file || "").startsWith(d.path || ""))
				.map(c => [`${c.file}:${c.from}-${c.to}`, c.verdict, c.target || "", String(c.saves ?? "")]);
			if (rows.length) ui.table(["Where", "Verdict", "Target", "Saves"], rows).style({ display: "table", width: "100%" });
		});
	},
});
