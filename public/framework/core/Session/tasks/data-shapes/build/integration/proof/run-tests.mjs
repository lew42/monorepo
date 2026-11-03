// node run-tests.mjs <repo root> <out file> — runs every *.test.mjs / *.test.js under the four trees, one at a time, 60 s each
import fs from "node:fs"; import path from "node:path"; import { spawnSync } from "node:child_process";
const [root, out] = process.argv.slice(2);
const trees = ["public/framework/core", "public/framework/ext/Doc", "public/framework/ux/Content/Object", "Servex/agents"];
const files = [];
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })){ const p = path.join(d, e.name);
	if (e.isDirectory()){ if (e.name === "node_modules" || e.name === "tasks") continue; walk(p); }
	else if (/\.test\.m?js$/.test(e.name)) files.push(p); } };
for (const t of trees){ const d = path.join(root, t); if (fs.existsSync(d)) walk(d); }
const rows = [];
for (const f of files.sort()){
	const t0 = Date.now();
	const r = spawnSync(process.execPath, [f], { cwd: path.dirname(f), timeout: 60000, encoding: "utf8", windowsHide: true });
	const rel = path.relative(root, f).replace(/\\/g, "/");
	const row = { file: rel, ok: r.status === 0, status: r.status, signal: r.signal, ms: Date.now() - t0, tail: ((r.stderr || "") + (r.stdout || "")).trim().split("\n").slice(-4).join("\n").slice(0, 600) };
	rows.push(row); process.stdout.write(row.ok ? "." : "F");
}
fs.writeFileSync(out, rows.map(r => JSON.stringify(r)).join("\n") + "\n");
console.log(`\n${rows.filter(r => r.ok).length} of ${rows.length} pass`);
for (const r of rows.filter(r => !r.ok)) console.log("FAIL", r.file, r.status, r.signal ?? "", "\n   ", r.tail.replace(/\n/g, "\n    "));
