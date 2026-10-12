// node node2.mjs - the same query as node.mjs, now through the sessions source's shape + arrange (parity branch); appends to node.jsonl
import fs from "node:fs";
const W = "file:///C:/Code/lew42/worktrees/server-query-parity/public/framework/";
const { default: AISessionIndex } = await import(W + "ai/AISession/AISessionIndex.mjs");
const { default: AISessionSource } = await import(W + "ai/AISession/AISessionSource.mjs");
const { default: Query } = await import(W + "ext/Query/Query.js");
const root = "C:/Code/lew42/monorepo/public/framework/ai/sessions";
const ix = new AISessionIndex({ root, base: "C:/nonexistent" });
await ix.load(); AISessionSource.load(root);
const spec = { where: [{ field: "last_activity", op: "gte", value: "2026-10-01T00:00:00" }, { field: "closed", op: "eq", value: false }, { fields: ["title", "agent", "id", "folder", "model"], op: "contains", value: "session" }], sort: { by: "last_activity", dir: "desc" }, sum: ["claude_usd", "tokens", "attention"], limit: 50 };
const run = () => new Query(spec).run((function* () { for (const s of ix.snaps.values()) yield AISessionSource.shape(s); })(), AISessionSource.arrange);
const t = [];
for (let i = 0; i < 20; i++) { const s = performance.now(); run(); t.push(performance.now() - s); }
t.sort((a, b) => a - b);
const rec = { label: "parity (shape + arrange)", sessions: ix.snaps.size, median_ms: +t[10].toFixed(2), at: new Date().toISOString() };
fs.appendFileSync(new URL("./node.jsonl", import.meta.url), JSON.stringify(rec) + "\n"); console.log(rec);
process.exit(0);
