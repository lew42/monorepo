// Audit probe: node public/framework/ai/sessions/2026/11/06/spawned/mastermind-method-audit/probe.mjs
// Lists LivePage.describe() methods by the class that declares each, and counts uses across the repo.
import { register } from "node:module";
import path from "node:path"; import fs from "node:fs"; import { pathToFileURL } from "node:url";
const ROOT = path.resolve(import.meta.dirname, "../../../../../../../../.."), HERE = import.meta.dirname;
register(pathToFileURL(path.join(ROOT, "Servex/agents/site-hooks.mjs")).href);
const imp = rel => import(pathToFileURL(path.join(ROOT, rel)).href);
await imp("public/framework/core/Page/Page.class.js"); await imp("public/framework/core/Page/parts/kinds.js");
const Live = (await imp("public/live/LivePage.js")).default;
const d = Live.describe();
const by = {};
for (let proto = Live.prototype; proto && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)){
	const cn = proto.constructor.name || "(Events mixin)"; by[cn] ??= [];
	for (const n of Object.getOwnPropertyNames(proto)){
		if (n === "constructor" || n.startsWith("_")) continue;
		const dd = Object.getOwnPropertyDescriptor(proto, n);
		if (typeof dd.value === "function") by[cn].push(n);
	}
}
const seen = new Set(), eff = {};
for (const [c, ns] of Object.entries(by)){ eff[c] = ns.filter(n => !seen.has(n)); ns.forEach(n => seen.add(n)); }
console.log("LivePage.describe(): methods", d.methods.length, "fields", d.fields.length, "queries", d.queries.length, "| declared on the Live class itself:", Live.declared);
for (const c in eff) console.log(c, eff[c].length);

const files = [];
for (const r of ["public", "Servex", "Server"]) (function walk(dir){
	for (const e of fs.readdirSync(dir, { withFileTypes: true })){
		if (["node_modules", ".git", "sessions", "archive", "old"].includes(e.name)) continue;
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walk(p); else if (/\.m?js$/.test(e.name)) files.push(p);
	}
})(path.join(ROOT, r));
const texts = files.map(f => [path.relative(ROOT, f).split(path.sep).join("/"), fs.readFileSync(f, "utf8")]);
const usage = {};
for (const [c, ns] of Object.entries(eff)) for (const n of ns){
	// a call: .name( or ._helper("X").name( ; a string key: "name" in a delta; exclude the line that defines it
	const call = new RegExp(`\\.${n}\\s*\\(`, "g"), key = new RegExp(`["']${n}["']\\s*:|["']${n}["']`, "g");
	let calls = 0, keys = 0; const where = new Set();
	for (const [f, t] of texts){
		const m = t.match(call), k = t.match(key);
		if (m){ calls += m.length; where.add(f); }
		if (k) keys += k.length;
	}
	usage[n] = { cls: c, calls, keys, files: [...where].slice(0, 6), n_files: where.size };
}
fs.writeFileSync(path.join(HERE, "usage.json"), JSON.stringify({ methods: eff, usage }, null, 1));
console.log("wrote usage.json");
