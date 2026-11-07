/* node Servex/chrome-pin.test.mjs — every path that ends a process (Lifecycle: resources / why / kill; Processes.reap; Relief; Pool.kill; the browser
 * watchdog; Browser.mjs's exit hook) is fed a process list holding the owner's plain Chrome, VS Code and Figma. None of them is ever chosen; a Playwright
 * chrome (ms-playwright / chrome-for-testing / one of our --user-data-dirs) is. Also: a forced kill of a tree writes the end lines of what died in it.
 * Everything runs against a scratch SERVEX_HOME and a Servex port nobody listens on, so nothing reaches the real logs. The only processes killed are
 * harmless `node -e setInterval` children that the test starts itself. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "chrome-pin-"));
process.env.SERVEX_HOME = path.join(tmp, "home");   // before home.js loads
process.env.SERVEX_PORT = "1";                      // record() would otherwise post to the real Servex
process.env.SERVEX_LINEAGE = "0";
fs.mkdirSync(path.join(tmp, "home", "logs"), { recursive: true });
const { default: Lifecycle, OUR_CHROME, owners_own, record } = await import("./Lifecycle.js");
const { default: Processes } = await import("./Processes.js");
const { default: Relief } = await import("./Relief.js");
const { default: Pool } = await import("./Pool.js");
const lifecycle_log = path.join(tmp, "home", "logs", "lifecycle.jsonl");
const log_lines = () => fs.existsSync(lifecycle_log) ? fs.readFileSync(lifecycle_log, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];

const OWNER = {
	chrome: { name: "chrome.exe", cmd: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --profile-directory="Default"' },
	chrome_child: { name: "chrome.exe", cmd: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --type=renderer --user-data-dir="C:\\Users\\x\\AppData\\Local\\Google\\Chrome\\User Data"' },
	code: { name: "Code.exe", cmd: '"C:\\Users\\x\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"' },
	figma: { name: "Figma.exe", cmd: '"C:\\Users\\x\\AppData\\Local\\Figma\\app-124\\Figma.exe"' },
};
const OURS = {
	playwright: { name: "chrome.exe", cmd: '"C:\\Users\\x\\AppData\\Local\\ms-playwright\\chromium-1181\\chrome-win\\chrome.exe" --headless --remote-debugging-pipe' },
	testing: { name: "chrome.exe", cmd: '"C:\\Users\\x\\.cache\\chrome-for-testing\\chrome.exe" --headless' },
	profile: { name: "chrome.exe", cmd: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless --user-data-dir=C:\\Users\\x\\AppData\\Local\\Temp\\playwright_chromiumdev_profile-AbC123' },
	headed: { name: "chrome.exe", cmd: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --user-data-dir="C:\\Users\\x\\AppData\\Local\\playwright_chromiumdev_profile-chrome"' },
};

// 1. the one rule
for (const [k, p] of Object.entries(OWNER)) assert.equal(owners_own(p), true, `${k} is the owner's`);
for (const [k, p] of Object.entries(OURS)) assert.equal(owners_own(p), false, `${k} is ours`);
for (const n of ["node.exe", "cmd.exe", "bash.exe", "claude.exe"]) assert.equal(owners_own({ name: n, cmd: "x" }), false, `${n} is not an owner app`);
assert.equal(owners_own(undefined), false);
assert.ok(OUR_CHROME.test(OURS.playwright.cmd) && !OUR_CHROME.test(OWNER.chrome.cmd) && !OUR_CHROME.test(OWNER.chrome_child.cmd));
console.log("PASS  owners_own(): Chrome / Code / Figma are the owner's; Playwright, chrome-for-testing and our profiles are not");

// harmless long-lived processes to stand in for whatever the fake list names
const dummies = [];
const dummy = (extra = []) => { const c = spawn(process.execPath, ["-e", "setInterval(()=>{},1e3)", "--", ...extra], { windowsHide: true, stdio: "ignore" }); dummies.push(c); return c; };
const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
const wait = ms => new Promise(r => setTimeout(r, ms));
const gone = async (pid, ms = 8000) => { for (let t = 0; t < ms; t += 100) { if (!alive(pid)) return true; await wait(100); } return false; };
const proc = (pid, ppid, p, extra = {}) => ({ pid, ppid, name: p.name, cmd: p.cmd, born: 1000, ports: [], ...extra });

// 2. Lifecycle: which rows exist, and which get a reason to close
const lc = new Lifecycle({ servex: null });
lc.agents = async () => [];
const fake = new Map([
	[9001, proc(9001, 1, OWNER.chrome)], [9002, proc(9002, 9001, OWNER.chrome_child)], [9003, proc(9003, 1, OWNER.code)], [9004, proc(9004, 1, OWNER.figma)],
	[9010, proc(9010, 1, OURS.playwright)], [9011, proc(9011, 1, OURS.profile)],
]);
lc.processes_async = async () => fake;
const rows = (await lc.resources()).filter(r => r.kind === "browser");
assert.deepEqual(rows.map(r => r.pid).sort(), [9010, 9011], "only the two Playwright chromes are rows");
for (const r of rows) assert.ok(lc.why(r), `chrome ${r.pid} (its launcher is gone) is closable`);
assert.ok(!(await lc.resources()).some(r => [9001, 9002, 9003, 9004].includes(r.pid) || [9001, 9002, 9003, 9004].includes(r.child)), "no row names the owner's apps");
console.log("PASS  Lifecycle.resources(): the owner's Chrome, Code and Figma are never rows; both Playwright chromes are, and are closable");

// 2b. a logged browser pid that the owner's Chrome now holds (the number was reused) is not a row
await record({ kind: "browser", id: "browser:9001", pid: 9001, launcher: 1, path: "C:\\Code\\lew42\\worktrees\\x", event: "start" });
fs.writeFileSync(lifecycle_log, fs.readFileSync(lifecycle_log, "utf8").replace(/"at":"[^"]*"/, `"at":"${new Date(Date.now() - 3600e3).toISOString()}"`));
fake.set(9001, proc(9001, 1, OWNER.chrome, { born: Date.now() - 60e3 }));
assert.ok(!(await lc.resources()).some(r => r.pid === 9001), "a reused pid held by the owner's Chrome is no row");
console.log("PASS  Lifecycle.resources(): a logged browser pid that the owner's Chrome now holds is not chosen");

// 3. Lifecycle.kill(): handed the owner's pid by mistake it refuses; handed a Playwright one it ends it
for (const [k, p] of Object.entries(OWNER)) {
	const d = dummy(); await wait(400);
	lc.procs = new Map([[d.pid, proc(d.pid, 1, p)]]);
	lc.kill({ kind: "browser", id: `x:${d.pid}`, pid: d.pid });
	await wait(800);
	assert.ok(alive(d.pid), `kill() left ${k} alone`);
}
{
	const d = dummy(); await wait(400);
	lc.procs = new Map([[d.pid, proc(d.pid, 1, OURS.playwright)]]);
	lc.kill({ kind: "browser", id: `x:${d.pid}`, pid: d.pid });
	assert.ok(await gone(d.pid), "kill() ended the Playwright chrome");
}
console.log("PASS  Lifecycle.kill(): the owner's apps survive it, a Playwright chrome does not");

// 4. Processes.reap(): only waiters with our command line; never an app, even as an idle orphan
{
	const real_kill = process.kill, killed = [];
	process.kill = pid => { killed.push(pid); };
	try {
		const pm = new Processes({ reaping: false, servex: { agents: { live: new Map() } } });
		const t0 = Date.now() - 3600e3;
		pm.reaping = true; pm.reap_after_ms = 60000; pm.log = () => {};
		pm.procs = new Map([
			[7001, { ...proc(7001, 1, OWNER.chrome), idle_since: t0, mb: 10 }], [7002, { ...proc(7002, 1, OWNER.code), idle_since: t0, mb: 10 }], [7003, { ...proc(7003, 1, OWNER.figma), idle_since: t0, mb: 10 }],
			[7004, { ...proc(7004, 1, OURS.playwright), idle_since: t0, mb: 10 }],
			[7005, { pid: 7005, ppid: 1, name: "sleep.exe", cmd: "sleep 999 C:\\Code\\lew42\\x", idle_since: t0, mb: 1 }],
		]);
		pm.now = { orphans: [...pm.procs.values()].map(p => ({ pid: p.pid })) };
		pm.reap();
		assert.deepEqual(killed, [7005], "reap() chose the sleep.exe waiter only");
	} finally { process.kill = real_kill; }
	console.log("PASS  Processes.reap(): Chrome / Code / Figma / a Playwright chrome are never reaped, even listed as idle orphans (only waiters are)");
}

// 5. Relief.run(): it ends nothing itself; the owner's apps are only named in a note
{
	const real_kill = process.kill, killed = [];
	process.kill = pid => { killed.push(pid); return true; };
	try {
		const sv = { lifecycle: { sweep: async () => ({ close: [], gone: [], kept: [] }) }, worktrees: null, agents: { live: new Map() }, log: { append: async () => {} },
			procmon: { commit_mb: 90, commit_limit_mb: 100, reaped: [], now: { other_top: [{ name: "chrome.exe", mb: 900 }, { name: "Code.exe", mb: 700 }, { name: "Figma.exe", mb: 500 }] } } };
		const r = new Relief({ servex: sv, settle_ms: 1 });
		r.note = async () => {};
		await r.run(90);
		assert.deepEqual(killed, [], "Relief called no kill");
		const src = fs.readFileSync(path.join(here, "Relief.js"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
		assert.ok(!/process\.kill|taskkill|execFileSync|\.kill\(/.test(src), "Relief.js holds no process-ending call");
	} finally { process.kill = real_kill; }
	console.log("PASS  Relief: ends nothing itself (no kill call in the file, none made in a run)");
}

// 6. Pool.kill(expect): the pid is only ended while its command line still matches what the pool started
{
	const said = [];
	const pool = { cmdline: () => OWNER.chrome.cmd, say: m => said.push(m), servex: null };
	const d = dummy(); await wait(400);
	Pool.prototype.kill.call(pool, d.pid, /health-supervisor/i);
	await wait(800);
	assert.ok(alive(d.pid), "a pid that is now the owner's Chrome is not killed"); assert.match(said[0] ?? "", /no longer ours/);
	pool.cmdline = () => "node health-supervisor.mjs";
	Pool.prototype.kill.call(pool, d.pid, /health-supervisor/i);
	assert.ok(await gone(d.pid), "the pool's own supervisor is");
	console.log("PASS  Pool.kill(): refuses a pid whose command line is not the pool's; ends the pool's own");
}

// 7. a forced kill of a tree writes the end lines of the tracked processes that died in it
{
	const dir = path.join(tmp, "wt-slot"), outside = path.join(tmp, "elsewhere");
	const dead = 2_000_000_001, dead2 = 2_000_000_002, dead3 = 2_000_000_003, live = process.pid;
	const lcx = new Lifecycle({ servex: null });
	for (const [id, pid, p, kind] of [[`run.js:${dead}`, dead, dir, "server"], [`server.js:${dead2}`, dead2, path.join(dir, "sub"), "server"], [`run.js:${live}`, live, dir, "server"], [`run.js:${dead3}`, dead3, outside, "server"], [`wrapper:${dead}`, dead, dir, "server"]])
		await record({ kind, id, pid, path: p, event: "start" });
	const n = await lcx.end_killed(dir, "reaped: test", { skip_id: `wrapper:${dead}` });
	assert.equal(n, 2, "the two dead ones under the slot");
	assert.deepEqual(lcx.open().map(e => e.id).filter(id => /^(run|server|wrapper)\.?/.test(id)).sort(), [`run.js:${dead3}`, `run.js:${live}`, `wrapper:${dead}`].sort(), "the running one, the one elsewhere and the skipped row stay open");
	console.log("PASS  Lifecycle.end_killed(): ends dead tracked processes under the killed path; leaves live, foreign and the row being closed");

	let asked = 0;
	const pool = { cmdline: () => "node health-supervisor", say() {}, servex: { lifecycle: { end_killed: (p, why) => { asked++; assert.equal(p, dir); assert.match(why, /pool/); return Promise.resolve(1); } } } };
	Pool.prototype.kill.call(pool, 2_000_000_009, /health-supervisor/i, { path: dir });
	assert.equal(asked, 1, "Pool.kill() writes the end lines after a kill");
	console.log("PASS  Pool.kill(pid, expect, slot): asks the lifecycle to end what died in the slot");
}

// 8. the watchdog: kills only a command line that says Playwright / our profile, and writes the end line
{
	const dog = (launcher, chrome) => spawn(process.execPath, [path.join(here, "..", "Server", "browser-watchdog.mjs"), String(launcher), String(chrome)], { windowsHide: true, stdio: "ignore", env: { ...process.env } });
	const no_launcher = 2_000_000_050;
	const mine = dummy(["--user-data-dir=C:\\Users\\x\\AppData\\Local\\Temp\\playwright_chromiumdev_profile-ZzZ"]); await wait(400);
	await record({ kind: "browser", id: `browser:${mine.pid}`, pid: mine.pid, launcher: no_launcher, path: tmp, event: "start" });
	const innocent = dummy(); await wait(400);   // its command line carries no Playwright marker, as the owner's chrome.exe would not
	const d1 = dog(no_launcher, innocent.pid), d2 = dog(no_launcher, mine.pid);
	assert.ok(await gone(mine.pid, 15000), "the watchdog ended the Playwright browser whose launcher is gone");
	await wait(2500);
	assert.ok(alive(innocent.pid), "and left the process it could not prove ours");
	const end = log_lines().find(l => l.id === `browser:${mine.pid}` && l.event === "end");
	assert.ok(end && /watchdog/.test(end.why), "its end line is written by the watchdog");
	assert.ok(!log_lines().some(l => l.id === `browser:${innocent.pid}`));
	for (const d of [d1, d2]) try { d.kill(); } catch {}
	console.log("PASS  browser-watchdog: kills only a command line that says Playwright / our profile, and writes the end line");
}

// 9. Browser.mjs: a script that process.exit()s still ends its browser's lifecycle line (needs the global Playwright)
{
	let npm_root = ""; try { npm_root = execFileSync("npm", ["root", "-g"], { encoding: "utf8", windowsHide: true, shell: true }).trim(); } catch {}
	if (!npm_root || !fs.existsSync(path.join(npm_root, "playwright", "index.mjs"))) console.log("SKIP  Browser exit end line: no global Playwright");
	else {
		const script = path.join(tmp, "exit-script.mjs");
		fs.writeFileSync(script, `import Browser from ${JSON.stringify("file:///" + path.join(here, "..", "Server", "Browser.mjs").replace(/\\/g, "/"))};\nconst b = await Browser.browser();\nawait new Promise(r => setTimeout(r, 2500));\nprocess.exit(0);\n`);
		const home = path.join(tmp, "home2"); fs.mkdirSync(path.join(home, "logs"), { recursive: true });
		try { execFileSync(process.execPath, [script], { windowsHide: true, timeout: 90000, env: { ...process.env, SERVEX_HOME: home }, stdio: "ignore" }); } catch (e) { console.log("script:", String(e.message).slice(0, 160)); }
		const f = path.join(home, "logs", "lifecycle.jsonl");
		const lines = (fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : []).filter(l => l.kind === "browser");
		assert.deepEqual(lines.map(l => l.event), ["start", "end"], "one start and one end line, though the script called process.exit()");
		console.log("PASS  Browser.mjs: process.exit() still writes the browser's end line (" + lines[1].why + ")");
	}
}

for (const d of dummies) try { d.kill(); } catch {}
await wait(300);
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
console.log("chrome-pin.test: all checks pass");
process.exit(0);
