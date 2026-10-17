/* node Servex/TaskLoop-handover.test.mjs — handover_daily runs Server/HandoverNow.mjs --write once per UTC day, judged by the NOW block's own stamp. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const { default: TaskLoop } = await import("./TaskLoop.js");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "taskloop-handover-"));
fs.mkdirSync(path.join(dir, "Server"), { recursive: true });
fs.mkdirSync(path.join(dir, "public", "framework", "ai"), { recursive: true });
const hand = path.join(dir, "public", "framework", "ai", "handover.md"), ran = path.join(dir, "ran.txt");
fs.writeFileSync(path.join(dir, "Server", "HandoverNow.mjs"), `import fs from "node:fs"; fs.appendFileSync(${JSON.stringify(ran)}, process.argv[2] + ";");`);
const today = new Date().toISOString().slice(0, 10);
const wait = async () => { for (let i = 0; i < 100 && fs.existsSync(ran) === false; i++) await new Promise(r => setTimeout(r, 50)); await new Promise(r => setTimeout(r, 100)); };
const loop = new TaskLoop({ root: dir, servex: {}, quiet_min: 9999 });

fs.writeFileSync(hand, "# H\n## NOW (computed 2020-01-01 04:00 UTC, last 24 h)\n");
loop.handover_daily(); await wait();
assert.equal(fs.readFileSync(ran, "utf8"), "--write;", "stale stamp: ran once with --write");

fs.writeFileSync(hand, `# H\n## NOW (computed ${today} 04:00 UTC, last 24 h)\n`);
loop.handover_daily(); await wait();
assert.equal(fs.readFileSync(ran, "utf8"), "--write;", "today's stamp: did not run again");

fs.rmSync(hand);
loop.handover_daily(); await wait();
assert.equal(fs.readFileSync(ran, "utf8"), "--write;", "no handover.md: does nothing");
console.log("TaskLoop handover_daily: ok");
try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
process.exit(0);
