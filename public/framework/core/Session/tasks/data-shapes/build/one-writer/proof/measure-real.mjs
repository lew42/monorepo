// usage: node measure-real.mjs <a real session.jsonl>  (copies it to a temp tree; nothing in public/ is written)
// Measure on a copy of a real record: the next item() call after a raw append vs after a one-writer append.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import http from "node:http";
const SRC = process.argv[2], WT = "C:/Code/lew42/worktrees/one-writer";
const ROOT = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "ow-real-")));
process.env.SERVEX_PUBLIC = path.join(ROOT, "public");
const REL = "framework/ai/sessions/2026/10/28/real", DIR = path.join(ROOT, "public", REL), FILE = path.join(DIR, "session.jsonl");
fs.mkdirSync(DIR, { recursive: true }); fs.copyFileSync(SRC, FILE);
const { run_item, serve_item } = await import(`file:///${WT}/Servex/agents/page_tools.js`);
const { default: RecordWriter } = await import(`file:///${WT}/public/framework/core/Item/RecordWriter.js`);
const server = http.createServer((q, s) => { let b = ""; q.on("data", d => b += d); q.on("end", async () => s.end(JSON.stringify(await serve_item(JSON.parse(b))))); });
await new Promise(r => server.listen(0, "127.0.0.1", r)); process.env.RECORD_ENTRY = `http://127.0.0.1:${server.address().port}/api/item`;
const URL = `/${REL}/`, call = async () => { const t = performance.now(); await run_item({ path: URL, delta: { log: { text: "agent" } } }, { caller: "agent-m" }); return performance.now() - t; };
await call(); await call();
const raw = [], one = [];
for (let i = 0; i < 5; i++){
	fs.appendFileSync(FILE, JSON.stringify({ log: { msg: "raw hook " + i } }) + "\n"); raw.push(await call());
	await RecordWriter.write(FILE, { log: { msg: "one writer " + i } }, { by: "ledger" }); one.push(await call());
}
const med = a => a.sort((x, y) => x - y)[2].toFixed(1);
console.log(JSON.stringify({ file: SRC.split("public/")[1], lines: fs.readFileSync(FILE, "utf8").split("\n").length - 1, after_raw_ms: med(raw), after_one_writer_ms: med(one) }));
server.close(); fs.rmSync(ROOT, { recursive: true, force: true });
