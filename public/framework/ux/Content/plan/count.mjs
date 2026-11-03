// Recount plan.json: every merge's files and pages, the migration order, and the two
// "after" numbers. Run from the repo root: node public/framework/ux/Content/plan/count.mjs
// A file counts when its `grep` pattern appears on a line that is not a comment.
// Its page is the nearest folder above it that has a page.js.
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const root = path.resolve(here, "../../../../..");
const pub = path.join(root, "public");
const plan_file = path.join(here, "plan.json");
const plan = JSON.parse(fs.readFileSync(plan_file, "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(here, "../catalog/catalog.json"), "utf8"));

// Task logs, the catalog and this plan describe cards; they do not draw them.
const SKIP = [/[\\/]node_modules[\\/]/, /[\\/]framework[\\/]ai[\\/]20\d\d/, /[\\/]ux[\\/]Content[\\/](catalog|plan)[\\/]/, /\.min\./, /three\./];
const rel = f => path.relative(root, f).split(path.sep).join("/");

const files = [];
(function walk(dir){
	for (const e of fs.readdirSync(dir, { withFileTypes: true })){
		const f = path.join(dir, e.name);
		if (SKIP.some(r => r.test(f + (e.isDirectory() ? path.sep : "")))) continue;
		if (e.isDirectory()) walk(f);
		else if (/\.(js|css)$/.test(e.name)) files.push(f);
	}
})(pub);

const code = new Map(files.map(f => [f, fs.readFileSync(f, "utf8").split(/\r?\n/)
	.filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l)).join("\n")]));

const page_of = f => {
	for (let d = path.dirname(f); d.startsWith(pub); d = path.dirname(d))
		if (fs.existsSync(path.join(d, "page.js"))) return "/" + path.relative(pub, d).split(path.sep).join("/") + (d === pub ? "" : "/");
	return "/";
};

for (const m of plan.merges){
	const re = new RegExp(m.grep);
	const hit = files.filter(f => re.test(code.get(f)))
		.filter(f => !m.within || m.within.some(w => rel(f).startsWith(w)))
		.filter(f => !m.without || !m.without.some(w => rel(f).startsWith(w)));
	m.files = hit.map(rel).sort();
	m.pages = [...new Set(hit.map(page_of))].sort();
}

const RANK = { low: 0, med: 1, high: 2 };
plan.order = [...plan.merges]
	.sort((a, b) => RANK[a.risk] - RANK[b.risk] || a.pages.length - b.pages.length || a.files.length - b.files.length)
	.map((m, i) => ({ step: i + 1, merge: m.id, title: m.title, risk: m.risk, screenshot: m.pages }));

// Check: every catalog kind appears exactly once, with exactly one of into / keep / drop.
const names = catalog.map(k => k.name);
const seen = plan.kinds.map(k => k.name);
const problems = [
	...names.filter(n => !seen.includes(n)).map(n => `missing: ${n}`),
	...seen.filter(n => !names.includes(n)).map(n => `not in the catalog: ${n}`),
	...seen.filter((n, i) => seen.indexOf(n) !== i).map(n => `twice: ${n}`),
	...plan.kinds.filter(k => ["into", "keep", "drop"].filter(w => k[w]).length !== 1).map(k => `not exactly one verdict: ${k.name}`),
	...plan.kinds.filter(k => k.into && !plan.targets.some(t => t.name === k.into)).map(k => `unknown target: ${k.name} -> ${k.into}`),
];

// The two numbers. Kinds left = the targets plus the kept widgets. Padding rules left =
// every distinct rule a remaining kind pads by (the catalog's own method, which counts
// "own rule" once and leaves "unknown" out).
const kept = plan.kinds.filter(k => k.keep);
const rules = new Set([...plan.targets.map(t => t.padding), ...kept.map(k => k.padding)]);
plan.to = {
	kinds: plan.targets.length + kept.length,
	targets: plan.targets.length,
	kept: kept.length,
	dropped: plan.kinds.filter(k => k.drop).length,
	merged: plan.kinds.filter(k => k.into).length,
	padding_rules: rules.size,
	rules: [...rules],
};

fs.writeFileSync(plan_file, JSON.stringify(plan, null, "\t") + "\n");
console.log(JSON.stringify(plan.to));
plan.order.forEach(o => console.log(o.step, o.merge, o.risk, "pages", o.screenshot.length, "files", plan.merges.find(m => m.id === o.merge).files.length));
if (problems.length){ console.log(problems.join("\n")); process.exit(1); }
