// Reads every day's index.json under ai/sessions, builds the bucket indexes, prints a measured summary, writes
// ai/sessions/session-buckets.json. Doc: public/framework/ai/sessions/doc/buckets.md   Usage: node Server/session-buckets.mjs [--no-write]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AISessionBuckets from "../public/framework/ai/AISession/AISessionBuckets.js";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/framework/ai/sessions");
const rows = [];
for (const y of fs.readdirSync(dir).filter(x => /^\d{4}$/.test(x)))
	for (const m of fs.readdirSync(path.join(dir, y)).filter(x => /^\d\d$/.test(x)))
		for (const d of fs.readdirSync(path.join(dir, y, m)).filter(x => /^\d\d$/.test(x))){
			const f = path.join(dir, y, m, d, "index.json");
			if (fs.existsSync(f)) rows.push(...JSON.parse(fs.readFileSync(f, "utf8")).snapshots);
		}
const by_id = new Map(); rows.forEach(r => by_id.set(r.id, r));   // a session can appear on two days: newest wins
const uniq = [...by_id.values()];

const time = (fn, n = 1) => { const t = performance.now(); for (let i = 0; i < n; i++) fn(); return (performance.now() - t) / n; };
let b;
const build_ms = time(() => { b = new AISessionBuckets(uniq); }, 20);
const sample = uniq[Math.floor(uniq.length / 2)];
const update_ms = time(() => b.put({ ...sample, usd: (sample.usd ?? 0) + 0.01 }), 2000);
const scan_ms = time(() => { const t = {}; for (const r of uniq){ const k = AISessionBuckets.kind_of(r); t[k] = (t[k] ?? 0) + (r.usd ?? 0); } }, 200);
const json = JSON.stringify(new AISessionBuckets(uniq));
const result = { rows: uniq.length, build_ms: +build_ms.toFixed(2), update_one_row_ms: +update_ms.toFixed(4), rescan_all_rows_ms: +scan_ms.toFixed(2), bucket_json_kb: +(json.length / 1024).toFixed(1), check: b.check() };
const kinds = Object.entries(new AISessionBuckets(uniq).index.kind).sort((a, c) => c[1].n - a[1].n).map(([k, v]) => `${k}: ${v.n} rows $${v.usd.toFixed(0)}`);
console.log(JSON.stringify(result, null, 1)); console.log(kinds.join("\n"));
if (!process.argv.includes("--no-write")) fs.writeFileSync(path.join(dir, "session-buckets.json"), json);
