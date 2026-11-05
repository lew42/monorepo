// LIVE proof that a process runs by itself: 3 real Haiku steps, node starts each, finishing a step starts the next, the last step completes the process,
// and the parent session's completion score moves 0 -> 1/3 -> 2/3 -> 1. Needs the running Servex (its TaskLoop tick finds the new process within ~5 min).
// `node Servex/process-live.mjs [--root <repo>] [--minutes 25] [--keep] [--restart-at "step-2 started"]`   --restart-at runs `sustain --restart` the moment that timeline line appears (don't use it while anyone is merging).
import fs from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; };
const ROOT = path.resolve(arg("--root", path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")));
const MINUTES = Number(arg("--minutes", 25)), KEEP = argv.includes("--keep"), RESTART_AT = arg("--restart-at", "");
const CODE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");   // classes come from this checkout; ROOT is only where the data is written (the live Servex scans its own tree)
const imp = rel => import(pathToFileURL(path.join(CODE, rel)).href);
const { default: Process } = await imp("public/framework/core/Task/processes/index.js");
const { report } = await imp("Server/session-query.mjs");

const now = new Date(), pad = n => String(n).padStart(2, "0");
const P = randomUUID(), hex = P.slice(0, 8);
const day = path.join(ROOT, "public/framework/ai/sessions", String(now.getFullYear()), pad(now.getMonth() + 1), pad(now.getDate()));
const pdir = path.join(day, "session-" + hex), proc = path.join(pdir, "live-process");
const url = d => "/" + path.relative(path.join(ROOT, "public"), d).split(path.sep).join("/") + "/";
const write = (f, lines) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, lines.map(l => JSON.stringify(l)).join("\n") + "\n"); };
const lines = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));

const haiku = { run: "fresh", model: "claude-haiku-4-5-20251001", effort: "low" };
const steps = [1, 2, 3].map(n => ({ id: "step-" + n, title: `Step ${n}`, session: haiku,
	do: `Write the file step-${n}.txt in the process folder (${url(proc)}) containing the single word "${n}". Do nothing else. Then record the step complete exactly as the last paragraph says.` }));
const first = { ...Process.lines({ process: "steps", steps, title: "process-live: three Haiku steps", brief: "A rerunnable test. Do only what your step says." })[0], by: "process-live" };
const adds = Process.lines({ process: "steps", steps }).slice(1);

write(path.join(pdir, "session.jsonl"), [
	{ session: { id: P, kind: "vscode-tab", at: now.toISOString() } },
	{ task: url(proc), type: "Task", ts: now.toISOString() }
]);
write(path.join(proc, "task.jsonl"), [first, ...adds]);
console.log(`created ${url(proc)} (parent session ${P})`);

const file = path.join(proc, "task.jsonl"), seen = new Set(), t0 = Date.now(), timeline = [];
const mark = (what, score) => { const m = ((Date.now() - t0) / 60000).toFixed(1); timeline.push({ min: m, what, score }); console.log(`${m} min  ${what.padEnd(34)} parent score ${(score * 100).toFixed(1)}%`); };
const score = async () => (await report(P, { root: ROOT, rows: {}, cost: false })).score;
let last = -1, fail = null, restarted = false;
mark("process written, nothing started", await score());
for (;;){
	await new Promise(r => setTimeout(r, 4000));
	const L = lines(file);
	for (const [i, l] of L.entries()){
		if (seen.has(i)) continue;
		seen.add(i);
		const what = l.start ? "process started" : l.complete ? "process complete" : l.spawn ? `spawned ${l.spawn.step} (${l.spawn.agent})` : l.measure ? `measured ${l.measure.step} $${l.measure.usd}` :
			Object.entries(l).filter(([k, v]) => /^step-\d$/.test(k) && v && typeof v === "object" && (v.start || v.complete)).map(([k, v]) => `${k} ${v.start ? "started" : "complete"}`)[0];
		if (!what || /^measured/.test(what)) continue;
		const s = await score();
		if (s < last - 1e-9) fail = `the parent score went DOWN at "${what}"`;
		last = s; mark(what, s);
		if (RESTART_AT && !restarted && what.startsWith(RESTART_AT)){
			restarted = true; mark("restarting Servex (sustain --restart)", s);
			spawn(process.execPath, [path.join(CODE, "Servex/sustain.mjs"), "--restart"], { cwd: CODE, detached: true, stdio: "ignore", windowsHide: true }).unref();
		}
	}
	if (L.some(l => l.complete && !l.tasks)) break;
	if (Date.now() - t0 > MINUTES * 60000){ fail = `timed out after ${MINUTES} min; last line: ${JSON.stringify(L.at(-1)).slice(0, 200)}`; break; }
}
const L = lines(file), at = k => L.findIndex(l => k(l));
const order = [1, 2, 3].map(n => [at(l => l[`step-${n}`]?.start), at(l => l.spawn?.step === `step-${n}`), at(l => l[`step-${n}`]?.complete)]);
const flat = order.flat();
const ok = !fail && flat.every(i => i >= 0) && flat.every((v, i) => i === 0 || v > flat[i - 1]) && at(l => l.complete && !l.tasks) > flat[8] && Math.abs((await score()) - 1) < 1e-9;
const files = [1, 2, 3].map(n => fs.existsSync(path.join(proc, `step-${n}.txt`)));
console.log(ok && files.every(Boolean) ? "PASS: node started each step, each completion started the next, the last completed the process, the parent went to 100%"
	: `FAIL: ${fail ?? "order or completion wrong"} (line order [start, spawn, complete] per step: ${JSON.stringify(order)}; step files ${files})`);
console.log(`left in place: ${pdir}${KEEP ? "" : " (delete it when done reading)"}`);
process.exit(ok && files.every(Boolean) ? 0 : 1);
