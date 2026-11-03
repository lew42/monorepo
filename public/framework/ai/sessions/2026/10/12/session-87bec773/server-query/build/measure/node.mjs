// node node.mjs - Query.run over every session in memory (median of 20) and heap, from the main tree's snapshots
import fs from "node:fs"; import path from "node:path";
import AISessionIndex from "../../../../../../../../../../../public/framework/ai/AISession/AISessionIndex.mjs";
import Query from "../../../../../../../../../../../public/framework/ext/Query/Query.js";
const h0 = process.memoryUsage().heapUsed;
const ix = new AISessionIndex({ root: "C:/Code/lew42/monorepo/public/framework/ai/sessions", base: "C:/nonexistent" });
await ix.load();
global.gc?.(); const h1 = process.memoryUsage().heapUsed;
const q = new Query({ where: [{ field: "last_activity", op: "gte", value: "2026-10-01T00:00:00" }, { fields: ["title", "agent", "id", "folder", "model"], op: "contains", value: "session" }], sort: { by: "usd", dir: "desc" }, sum: ["usd", "tokens"], limit: 50 });
const t = [];
for (let i = 0; i < 20; i++) { const s = performance.now(); q.run(ix.snaps.values()); t.push(performance.now() - s); }
t.sort((a, b) => a - b);
const rec = { sessions: ix.snaps.size, median_ms: +t[10].toFixed(2), heap_before_mb: +(h0 / 1048576).toFixed(1), heap_after_mb: +(h1 / 1048576).toFixed(1), at: new Date().toISOString() };
fs.appendFileSync("node.jsonl", JSON.stringify(rec) + "\n"); console.log(rec);
process.exit(0);
