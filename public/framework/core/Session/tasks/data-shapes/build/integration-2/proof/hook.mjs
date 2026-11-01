// The hook with its entry point down: refused (nothing listens) and stalled (listens, never answers). Each: time and lines written.
import { spawn } from "node:child_process"; import fs from "node:fs"; import http from "node:http";
const WT = "C:/Code/lew42/worktrees/data-shapes-2", DIR = `${WT}/public/framework/core/Session/tasks/data-shapes/build/integration-2/hook-probe`, F = `${DIR}/task.jsonl`;
const LINE = "C:/Users/mike/AppData/Local/Temp/int2/hook-line.json";
fs.rmSync(DIR, { recursive: true, force: true }); fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(LINE, JSON.stringify([{ log: { msg: "hook probe" } }]));
const stall = http.createServer(() => {}); await new Promise(r => stall.listen(0, "127.0.0.1", r));
const count = () => fs.existsSync(F) ? fs.readFileSync(F, "utf8").split("\n").filter(Boolean).length : 0;
const out = {};
for (const [name, entry] of [["refused", "http://127.0.0.1:9/api/item"], ["stalled", `http://127.0.0.1:${stall.address().port}/api/item`]]){
	const n0 = count(), t = Date.now();
	const code = await new Promise(res => spawn(process.execPath, [`${WT}/.claude/hooks/append.mjs`, F, LINE], { cwd: WT, env: { ...process.env, RECORD_ENTRY: entry }, windowsHide: true, stdio: "ignore" }).on("close", res));
	out[name] = { ms: Date.now() - t, exit: code, lines_written: count() - n0 };
}
stall.close();
out.file = fs.readFileSync(F, "utf8").trim().split("\n");
fs.rmSync(DIR, { recursive: true, force: true });
console.log(JSON.stringify(out, null, 1));
