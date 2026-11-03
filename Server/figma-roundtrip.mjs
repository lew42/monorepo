// Figma ↔ code round trip, computed: node Server/figma-roundtrip.mjs
// 1. every Figma page (data/<key>/live-pages.json, read from the file) → is a code page/CSS built from it? (evidence = files naming its node id or DS tag)
// 2. every Figma variable (tokens/variables.json) → the site's custom property (framework.css), by value / by role / one-sided → tokens/map.json
// Writes data/<key>/roundtrip.jsonl, tokens/map.json, and refreshes the generated blocks in doc/round-trip.md. Why: ext/Figma/doc/round-trip.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fw = path.join(root, "public/framework"), fig = path.join(fw, "ext/Figma");
const KEY = "QYN0G2URSBHYH5I06MOjxU";
const read = f => fs.readFileSync(f, "utf8");
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (["data", "screenshots", "node_modules"].includes(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);

// ---- 1. inventory ----
const live = JSON.parse(read(path.join(fig, "data", KEY, "live-pages.json"))).pages;
const tracked = new Set(read(path.join(fig, "data", KEY, "pages.jsonl")).trim().split("\n").map(l => JSON.parse(l).page?.id).filter(Boolean));
const built = read(path.join(fig, "data", KEY, "built.jsonl")).trim().split("\n").map(l => JSON.parse(l));
const files = walk(fig).filter(f => /\.(js|mjs|css|md)$/.test(f) && !/round-trip\.md$|next\.md$/.test(f));
const texts = files.map(f => ({ rel: path.relative(fw, f).replaceAll("\\", "/"), code: /\.(js|mjs|css)$/.test(f), text: read(f) }));
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function matcher(id, name) {
	const alts = [esc(id), esc(name)];
	const ds = /^DS · (\d+(?:\.\d+)?)\b/.exec(name);
	if (ds) alts.push(`DS\\s*·?\\s*${esc(ds[1])}(?![.\\d])`);
	return new RegExp(alts.join("|"));
}
const rows = live.map(([id, name]) => {
	const re = name === "Index" ? new RegExp(esc(id)) : matcher(id, name);
	const hits = texts.filter(t => re.test(t.text));
	const code = hits.filter(h => h.code).map(h => h.rel), docs = hits.filter(h => !h.code).map(h => h.rel);
	return { id, name, status: code.length ? "coded" : docs.length ? "documented" : "none", code, docs };
});
const liveIds = new Set(live.map(p => p[0]));
const builtGone = built.filter(b => !liveIds.has(b.node));
fs.writeFileSync(path.join(fig, "data", KEY, "roundtrip.jsonl"), rows.map(r => JSON.stringify(r)).join("\n") + "\n");
const count = s => rows.filter(r => r.status === s).length;
// the second, independent count: node ids the kit reports name (Figma side), all of which must be live pages
const kit = path.join(root, "public/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs");
const reportIds = new Set(walk(kit).filter(f => f.endsWith(".md")).flatMap(f => read(f).match(/\b\d{3}:\d{3,5}\b/g) || []));
const trackedGone = [...tracked].filter(i => !liveIds.has(i));

// ---- 2. token map ----
const css = read(path.join(fw, "framework.css"));
const site = {};
for (const m of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gm)) site[m[1]] ??= m[2].trim();
const hex = v => { const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v.trim()); if (!m) return null; let h = m[1].toLowerCase(); if (h.length === 3) h = [...h].map(c => c + c).join(""); return "#" + h; };
const siteHexes = v => [...v.matchAll(/#[0-9a-fA-F]{3,6}\b/g)].map(m => hex(m[0])).filter(Boolean);
// role pairs: same job under another name (declared, each with the reason)
const roles = {
	text: ["--ink", "body text"], muted: ["--subtle", "second text colour"], surface: ["--surface", "content ground"],
	accent: ["--prime", "the accent; the site never swaps it per ground"], "on-accent": [null, "no site token: text on an accent fill is picked per component"],
	"pad-x": ["--pad-card", "card inset; fluid on the site, fixed per mode in Figma"], "pad-y": ["--pad-card", "same"],
	gap: ["--gap", "fluid on the site"], radius: ["--radius", "0.5em on the site, 4/4/6px in Figma"],
	"section-pad-x": ["--pad", "page edge pad; fluid"], "section-pad-y": ["--flow", "vertical flow between sections; fluid"],
};
const vars = JSON.parse(read(path.join(fig, "tokens/variables.json")));
const map = [];
for (const col of vars.collections) for (const [name, v] of Object.entries(col.vars)) {
	if (["size", "ref"].includes(name)) { map.push({ figma: name, collection: col.name, relation: "skipped", note: "unfinished experiment in the file" }); continue; }
	const modes = Object.fromEntries(Object.entries(v.values).map(([m, x]) => [m, typeof x === "object" ? "alias:" + x.alias : x]));
	const row = { figma: name, collection: col.name, type: v.type, modes };
	const same = site["--" + name];
	if (same !== undefined && v.type === "COLOR") {
		const fh = Object.values(v.values).map(x => typeof x === "string" ? hex(x) : null).filter(Boolean);
		const eq = fh.some(h => siteHexes(same).includes(h));
		Object.assign(row, { site: "--" + name, siteValue: same, relation: eq ? "same name, same value" : "same name, different value" });
		// one mode in Figma = safe to alias (FigmaTokens writes var(--site)); a per-ground colour keeps its own values
		if (eq) Object.assign(row, Object.keys(v.values).length === 1 ? { alias: true } : { alias: false, note: "agrees in one ground only; each Figma ground keeps its own value" });
	} else if (roles[name]) {
		const [prop, why] = roles[name];
		Object.assign(row, prop ? { site: prop, siteValue: site[prop], relation: "same role, other name", note: why } : { relation: "figma only", note: why });
	} else Object.assign(row, { relation: "figma only", note: "no site token (the site has no " + name + ")" });
	map.push(row);
}
const mapped = new Set(map.map(r => r.site).filter(Boolean));
const siteOnly = Object.keys(site).filter(k => !mapped.has(k) && /^--(prime-ink|tint|wash|line|hot|shadow|light|dark|ink|surface|subtle|error|ok|warn)$/.test(k));
const tally = r => map.filter(x => x.relation === r).length;
const summary = { same_value: tally("same name, same value"), aliased: map.filter(x => x.alias).length, same_name_other_value: tally("same name, different value"), same_role: tally("same role, other name"), figma_only: tally("figma only"), skipped: tally("skipped"), total: map.length, site_only_colour_tokens: siteOnly };
fs.writeFileSync(path.join(fig, "tokens/map.json"), JSON.stringify({ generated: "node Server/figma-roundtrip.mjs", figma: KEY, summary, map }, null, 1) + "\n");

// ---- --check: an agreeing colour has one value. Two numbers must agree: aliases written in tokens.css vs map rows marked alias ----
if (process.argv.includes("--check")) {
	const tcss = read(path.join(fig, "tokens/tokens.css"));
	const agree = map.filter(r => r.relation === "same name, same value");
	const want = map.filter(r => r.alias);
	const bad = [];
	for (const r of want) {
		const m = new RegExp(String.raw`--fig-${r.figma}:\s*([^;]+);`).exec(tcss);
		if (!m || m[1].trim() !== `var(${r.site})`) bad.push(`${r.figma}: tokens.css has "${m ? m[1].trim() : "nothing"}", want var(${r.site})`);
	}
	const written = [...tcss.matchAll(/--fig-([a-z-]+):\s*var\((--[a-z-]+)\)\s*;/g)].filter(m => map.some(r => r.figma === m[1] && r.site === m[2] && r.relation === "same name, same value"));
	if (written.length !== want.length) bad.push(`aliases written ${written.length} != map rows marked alias ${want.length}`);
	// no second literal value: no --fig-<agreeing name> or site --<name> defined with a literal outside framework.css and styles/ themes
	const hits = walk(fw).filter(f => /\.css$/.test(f) && !/[\\/]core[\\/]new[\\/]|[\\/]styles[\\/]/.test(f) && !/framework\.css$/.test(f));
	for (const f of hits) for (const r of agree) for (const m of read(f).matchAll(new RegExp(String.raw`^\s*(--fig-${r.figma}|--${r.figma})\s*:\s*([^;]+);`, "gm")))
		if (!/^var\(/.test(m[2].trim()) && !(r.alias === false)) bad.push(`${path.relative(fw, f)}: ${m[1]} = ${m[2].trim()} (second value)`);
	console.log(JSON.stringify({ agreeByName: agree.length, aliasRows: want.length, aliasesWritten: written.length, exceptions: agree.filter(r => !r.alias).map(r => r.figma), problems: bad }));
	process.exit(bad.length ? 1 : 0);
}

// ---- doc blocks ----
const link = p => `[${p.replace(/^ext\/Figma\//, "")}](/framework/${p})`;
const inv = [`| Figma page | Node | In code |`, `|---|---|---|`, ...rows.map(r => `| ${r.name} | \`${r.id}\` | ${r.status === "coded" ? "coded: " + r.code.slice(0, 2).map(link).join(", ") : r.status === "documented" ? "doc only: " + link(r.docs[0]) : "no"} |`)].join("\n");
const tok = [`| Figma variable | Site property | Relation |`, `|---|---|---|`, ...map.map(r => `| \`${r.figma}\` (${r.collection}) | ${r.site ? "`" + r.site + "`" : "-"} | ${r.relation}${r.note ? ": " + r.note : ""} |`)].join("\n");
const out = path.join(fig, "doc/round-trip.md");
if (fs.existsSync(out)) {
	let md = read(out);
	const put = (tag, body) => { md = md.replace(new RegExp(`(<!-- ${tag} -->)[\\s\\S]*?(<!-- /${tag} -->)`), `$1\n${body}\n$2`); };
	put("tokens", tok);
	fs.writeFileSync(path.join(fig, "doc/figma-pages.md"), `# Every Figma page, and whether code exists for it

Generated by node Server/figma-roundtrip.mjs (never edit). The story and the counts: [round-trip.md](./round-trip.md).

${inv}
`);
	put("counts", `Figma file lists **${live.length}** pages; this inventory lists **${rows.length}**; they agree. Coded **${count("coded")}**, doc only **${count("documented")}**, not coded **${count("none")}**. Cross-check: the Figma agents' reports name ${live.filter(p => reportIds.has(p[0])).length} of those ${live.length} page ids (the rest are named by title only). Tracked in \`data/\` since 2026-10-10: ${tracked.size} pages, **${trackedGone.length}** no longer in the file (the owner's Page 1-8); ${built.length} site pages were built from them (${builtGone.length} from nodes no longer in the page list: the Palette sections are frames inside the old Page 7).\n\nTokens: ${summary.total} Figma variables: ${summary.same_value} same name and value, ${summary.same_name_other_value} same name other value, ${summary.same_role} same role other name, ${summary.figma_only} Figma only, ${summary.skipped} skipped.`);
	fs.writeFileSync(out, md);
}
console.log(JSON.stringify({ livePages: live.length, inventoryRows: rows.length, coded: count("coded"), documented: count("documented"), none: count("none"), trackedGone: trackedGone.length, builtFromOldPages: built.length, tokens: summary }, null, 1));
