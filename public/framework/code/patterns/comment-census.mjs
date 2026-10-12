import fs from "node:fs"; import path from "node:path";
const root = new URL("../..", import.meta.url).pathname.replace(/^/(w:)/, "$1");
const rows = [];
(function walk(d){ for (const e of fs.readdirSync(d, { withFileTypes: true })){
	const p = path.join(d, e.name);
	if (e.isDirectory()){ if (!/^(node_modules|\.git|20\d\d-)/.test(e.name)) walk(p); continue; }
	if (!e.name.endsWith(".js")) continue;
	const lines = fs.readFileSync(p, "utf8").split("\n"); let c = 0, inb = false, run = 0, para = 0;
	for (const l of lines){ const t = l.trim(); let isc = false;
		if (inb){ isc = true; if (t.includes("*/")) inb = false; }
		else if (t.startsWith("//")) isc = true;
		else if (t.startsWith("/*")){ isc = true; if (!t.includes("*/")) inb = true; }
		if (isc){ c++; run++; } else { if (run >= 4) para++; run = 0; } }
	rows.push({ f: path.relative(root, p), n: lines.length, c, para });
}})(root);
const tot = rows.reduce((a, r) => (a.n += r.n, a.c += r.c, a.p += r.para, a), { n: 0, c: 0, p: 0 });
console.log(`${rows.length} files, ${tot.n} lines, ${tot.c} comment (${Math.round(100*tot.c/tot.n)}%), ${tot.p} comment blocks of 4+ lines`);
rows.sort((a, b) => b.c - a.c).slice(0, 8).forEach(r => console.log(r.c, `${Math.round(100*r.c/r.n)}%`, r.para, r.f));
