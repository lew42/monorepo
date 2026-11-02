// The whole suite in one command, with one dated result line in run-all.jsonl so a nightly run can be scheduled later.
//   node public/framework/core/Test/run-all.mjs [--browser]
// Runs every *.test.mjs (TestRunner), then with --browser the allow-listed browser scripts (browser-scripts.mjs).
// Exit 1 if a node test fails, or an allow-listed ("pass") browser script fails. Known-slow tests: timeouts.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import TestRunner from "./TestRunner.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const r = new TestRunner(), t0 = Date.now();
const node = await r.run(r.find());
const line = {
	at: new Date().toISOString(), trigger: process.env.RUN_ALL_TRIGGER || "manual", site: r.site_url(),
	node: { total: node.length, passed: node.filter(x => x.ok).length, red: node.filter(x => !x.ok).map(x => x.file) },
};
let bad = node.some(x => !x.ok);
if (process.argv.includes("--browser")) {
	const b = await r.browser();
	line.browser = { total: b.results.length, passed: b.results.filter(x => x.ok).length, red: b.must.map(x => x.file), known_red: b.results.filter(x => x.status === "red" && !x.ok).map(x => x.file), promote: b.red_now_passes };
	bad ||= b.must.length > 0;
}
line.ms = Date.now() - t0; line.ok = !bad;
fs.appendFileSync(path.join(HERE, "run-all.jsonl"), JSON.stringify(line) + "\n");
console.log(`run-all: ${bad ? "RED" : "green"} in ${Math.round(line.ms / 1000)} s -> core/Test/run-all.jsonl`);
process.exitCode = bad ? 1 : 0;
