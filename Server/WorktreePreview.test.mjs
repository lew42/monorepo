/* node Server/WorktreePreview.test.mjs — a worktree waiting for review stays, and opens on the phone (build F, 2026-10-28).
 * A scratch repo in the OS temp folder, never the real worktrees; SERVEX_HOME and SERVEX_PORT point at nothing real.
 *   A  landed, unmerged, asked for a preview   -> held (Servex judge + the CLI clean-up + on-landing), on the LAN, not stopped idle
 *   D  landed, unmerged, no preview            -> held, but stays loopback and its idle server may stop (the proxy restarts it)
 *   B  landed, merged                          -> still cleaned
 *   qf-1  a pool slot                          -> left to Pool.js everywhere, so it still recycles
 * Plus the 48-hour backstop, the link the ready-to-merge card shows, and the reaper's keep rule. Doc: Servex/doc/worktree-preview.md */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "worktree-preview-"));
process.env.SERVEX_HOME = path.join(root, "home");
process.env.SERVEX_PORT = "9";   // nothing answers: no call can reach the real Servex
fs.mkdirSync(process.env.SERVEX_HOME, { recursive: true });
fs.writeFileSync(path.join(process.env.SERVEX_HOME, "ports.json"), JSON.stringify({ A: 3901, D: 3904 }));

const { default: WorktreePreview } = await import("./WorktreePreview.mjs");
const { default: CliWorktrees } = await import("./Worktrees.mjs");
const { default: Worktrees } = await import("../Servex/Worktrees.js");
const { default: Servex } = await import("../Servex/Servex.js");

const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", windowsHide: true }).trim();
const write = (dir, file, text) => { fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true }); fs.writeFileSync(path.join(dir, file), text); };
let checks = 0;
const ok = (v, msg) => { assert.ok(v, msg); checks++; };
const eq = (a, b, msg) => { assert.equal(a, b, msg); checks++; };

// the scratch repo: main on michael/dev, four worktrees beside it
const main = path.join(root, "main"); fs.mkdirSync(main);
git(main, "init", "-q", "-b", "michael/dev"); git(main, "config", "user.email", "t@t"); git(main, "config", "user.name", "t");
write(main, "a.txt", "a"); git(main, "add", "."); git(main, "commit", "-qm", "init");
const wts = path.join(root, "worktrees"); fs.mkdirSync(wts);
const wt = n => path.join(wts, n).split(path.sep).join("/");
for (const n of ["A", "B", "D", "qf-1"]){
	git(main, "worktree", "add", "-q", "-b", `worktree/${n}`, wt(n));
	git(wt(n), "config", "user.email", "t@t"); git(wt(n), "config", "user.name", "t");
	write(wt(n), "package.json", "{}\n");
}
for (const n of ["A", "D", "qf-1"]){ write(wt(n), `${n}.txt`, n); git(wt(n), "add", "."); git(wt(n), "commit", "-qm", `${n}: work not on the base`); }
git(wt("B"), "add", "."); git(wt("B"), "commit", "-qm", "B: work"); git(main, "merge", "-q", "--ff-only", "worktree/B");   // B is merged

// the task records, where the reaper's lookup reads them (public/framework/ai/ under main)
const task = n => path.join(main, "public", "framework", "ai", "sessions", "2026", "10", "28", `task-${n}`);
const record = (n, extra) => write(task(n), "task.jsonl", [
	{ assign: { worktree: wt(n), agent: `mastermind-${n}`, ...extra } },
	{ assign: { landed_at: "2026-10-28T18:00:00-05:00", outcome: "done" } }
].map(l => JSON.stringify(l)).join("\n") + "\n");
record("A", { preview: true }); record("B", { preview: true }); record("D", {}); record("qf-1", { preview: true });
git(main, "add", "."); git(main, "commit", "-qm", "task records");

// ── the link ──
eq(WorktreePreview.page({ preview: true }), "/", "preview: true opens the root");
eq(WorktreePreview.page({ preview: "/framework/x/" }), "/framework/x/", "a path opens that page");
eq(WorktreePreview.page({}), null, "no preview asked, no page");
eq(WorktreePreview.lan_ip({ lo: [{ family: "IPv4", internal: true, address: "127.0.0.1" }], wifi: [{ family: "IPv4", internal: false, address: "10.0.0.135" }] }), "10.0.0.135", "the LAN IP is the private one");
eq(WorktreePreview.lan_ip({ x: [{ family: "IPv4", internal: false, address: "8.8.8.8" }] }), null, "a public address is never offered");
eq(WorktreePreview.link(task("A"), wt("A"), { ip: "10.0.0.9" }), "http://10.0.0.9:3901/", "the ready-to-merge row's link is computed from ports.json");
eq(WorktreePreview.link(task("D"), wt("D"), { ip: "10.0.0.9" }), null, "no preview asked, no link on the card");
eq(WorktreePreview.merged(wt("A")), false, "A is not merged");
eq(WorktreePreview.merged(wt("B")), true, "B is merged");
const pv = WorktreePreview.of_task(task("A"), { ip: "10.0.0.9" });
ok(pv.url === "http://10.0.0.9:3901/" && pv.merged === false, "on-landing's preview line: the link, and not merged");

// ── on-landing: an unmerged branch skips --archive --now; a merged one is closed; a pool slot is left to Pool.js ──
eq(CliWorktrees.on_landing({ name: "A", path: wt("A"), branch: "worktree/A" }).act, "keep", "on-landing keeps a landed, unmerged worktree");
eq(CliWorktrees.on_landing({ name: "B", path: wt("B"), branch: "worktree/B" }).act, "close", "on-landing still closes a merged one");
eq(CliWorktrees.on_landing({ name: "qf-1", path: wt("qf-1"), branch: "worktree/qf-1" }).act, "pool", "on-landing leaves a pool slot to Pool.js");

// ── the CLI clean-up (Server/Worktrees.mjs --archive --now): unmerged waits for the 48-hour backstop ──
const cli = new CliWorktrees({ main, agents: [], here: main, archive: true, quiet_hours: 0 });
const rows = await cli.plan(), row = n => rows.find(r => path.basename(r.path) === n);
eq(row("A").verdict, "KEEP", "--archive --now keeps an unmerged branch");
ok(/held until it merges/.test(row("A").why), "and says why");
eq(row("B").verdict, "REMOVE", "a merged one is still removed");
eq(row("qf-1"), undefined, "a pool slot is never in the CLI's plan");
const cli0 = new CliWorktrees({ main, agents: [], here: main, archive: true, quiet_hours: 0, close_hours: 0 });
eq((await cli0.plan()).find(r => path.basename(r.path) === "A").verdict, "ARCHIVE", "past the backstop, an unmerged one is archived (branch kept)");

// ── Servex's clean-up pass (Servex/Worktrees.js): judge, the LAN bind, stop_idle ──
const runners = {}, stopped = [];
const runner = name => runners[name] ??= { env: { HOST: "127.0.0.1" }, status: "stopped", starts: 0, restarts: 0,
	async start(){ this.status = "running"; this.starts++; }, async restart(){ this.restarts++; }, async terminate(){ this.status = "stopped"; } };
const servex = { agents: { live: new Map() }, log: { append: async () => {} }, processes: new Map(), runner,
	async command(name, verb){ if (verb === "stop"){ stopped.push(name); runners[name].status = "stopped"; } } };
const pass = new Worktrees({ servex, main, dir: wts, quiet_hours: 0 });
pass.common = path.join(main, ".git");
const key = p => path.resolve(p).replace(/\\/g, "/").toLowerCase();
const tasks = new Map([["A", "/"], ["B", "/"], ["D", null], ["qf-1", "/"]].map(([n, preview]) => [key(wt(n)), { key: `task-${n}`, landed: true, agent: `mastermind-${n}`, preview }]));
const list = await pass.list(), at = n => list.find(w => w.name === n);
const jA = await pass.judge(at("A"), tasks);
ok(jA.state === "open" && jA.waiting && jA.preview === "/", `judge holds A for review (${jA.state}: ${jA.why})`);
const jD = await pass.judge(at("D"), tasks);
ok(jD.state === "open" && jD.waiting && !jD.preview, "judge holds D too: every landed, unmerged branch waits for its merge");
eq((await pass.judge(at("B"), tasks)).state, "finished", "judge still finishes a merged one");
eq((await pass.judge(at("qf-1"), tasks)).state, "pool", "judge leaves a pool slot to Pool.js");
pass.close_hours = 0;
const jA0 = await pass.judge(at("A"), tasks);
ok(jA0.state === "finished" && jA0.commit, "past the 48-hour backstop A is closed (leftovers committed, branch kept)");
pass.close_hours = 48;

// the whole pass: B removed, A and D kept, A on the LAN, D's idle server stopped, the pool slot untouched
pass.tasks = () => tasks;
pass.junctions = async () => ({ ok: true });
for (const n of ["A", "D", "qf-1"]){ runner(n).status = "running"; servex.processes.set(n, runners[n]); }
await pass.tick();
ok(!fs.existsSync(wt("B")) && fs.existsSync(wt("A")) && fs.existsSync(wt("D")) && fs.existsSync(wt("qf-1")), "after a pass: merged B removed; A, D and the pool slot stay");
ok(pass.lan.has("A") && !pass.lan.has("D"), "only the preview (A) is on the LAN list");
ok(runners.A.env.HOST === "0.0.0.0" && runners.A.restarts === 1, "A's running server was restarted on 0.0.0.0");
ok(!stopped.includes("A"), "stop_idle exempts the preview: the phone hits its port directly, the proxy cannot restart it");
ok(stopped.includes("D"), "D's idle server still stops (loopback; the proxy restarts it on a visit)");
ok(!stopped.includes("qf-1") && runners["qf-1"].env.HOST === "127.0.0.1", "the pool slot's server is never stopped or rebound here");
eq(pass.summary().waiting, 2, "the summary counts both waiting worktrees");
eq(Servex.prototype.host.call({ worktrees: pass }, "A"), "0.0.0.0", "Servex.host(): the preview binds the LAN");
eq(Servex.prototype.host.call({ worktrees: pass }, "D"), "127.0.0.1", "Servex.host(): any other worktree stays loopback");
eq(Servex.prototype.host.call({ worktrees: pass }, "monorepo"), "0.0.0.0", "Servex.host(): the main site is unchanged");

// a server that was stopped gets started on the LAN; once merged, the server goes back to loopback
runners.A.status = "stopped"; pass.lan = new Set(); runners.A.env.HOST = "127.0.0.1";
await pass.tick();
ok(runners.A.status === "running" && runners.A.starts === 1 && runners.A.env.HOST === "0.0.0.0", "a stopped preview server is started on the LAN");
git(main, "merge", "-q", "--no-edit", "worktree/A");
pass.quiet_hours = 9999;   // A is merged but was just touched: it stays a moment, and must leave the LAN
await pass.tick();
ok(!pass.lan.has("A") && runners.A.env.HOST === "127.0.0.1" && runners.A.restarts === 2, "merged: A leaves the LAN list and its server goes back to loopback");

// ── the reaper's keep rule (Servex/Lifecycle.js kept()) ──
git(main, "reset", "-q", "--hard", "HEAD~1");   // un-merge A again
ok(/waits for its merge/.test(WorktreePreview.held(path.join(wt("A"), "Server"), main) ?? ""), "the reaper keeps A's server");
eq(WorktreePreview.held(wt("D"), main), null, "no preview asked: the reaper's normal rules apply");
eq(WorktreePreview.held(wt("qf-1"), main), null, "a pool slot: Pool.js's rule, not this one");

fs.rmSync(root, { recursive: true, force: true });
console.log(`WorktreePreview.test: ${checks} checks pass`);
