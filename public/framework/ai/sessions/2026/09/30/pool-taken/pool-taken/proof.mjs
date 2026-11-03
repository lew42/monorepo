// pool-taken proof: a real worktree, the real Pool.reclaim() and Server/worktree-prune.mjs, a scratch pool file.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const WT = "C:/Code/lew42/worktrees/pool-taken";
const MAIN = "C:/Code/lew42/monorepo";
const DIR = "C:/Code/lew42/worktrees/pp-proof";
process.env.SERVEX_POOL_FILE = path.join(process.env.TEMP, "pp-proof-pool.json");
process.env.SERVEX_HOME = path.join(process.env.TEMP, "pp-proof-home"); fs.mkdirSync(process.env.SERVEX_HOME, { recursive: true });
const { default: Pool } = await import("file:///" + WT + "/Servex/Pool.js");
const git = (...a) => spawnSync("git", ["-C", DIR, ...a], { encoding: "utf8", windowsHide: true });
if (!fs.existsSync(DIR)) execFileSync("git", ["-C", MAIN, "worktree", "add", "-b", "worktree/pp-proof", DIR, "michael/dev"], { windowsHide: true, stdio: "ignore" });
for (const k of ["user.name", "user.email"]) git("config", k, execFileSync("git", ["-C", MAIN, "config", k], { encoding: "utf8" }).trim());
let rows = [];
const pool = new Pool({ servex: { say: m => console.log("   servex says:", m), agents: { registry_list: () => rows } } });
pool.slots = [{ id: "pp-proof", path: DIR, branch: "worktree/pp-proof", url: null, port: null, state: "taken", taken_by: "minion-proof", taken_at: "2026-09-30T14:00:00-05:00", baseline: {} }];
pool.save = () => {};   // never write the real pool file
pool.top_up = () => {};  // never make a real slot (the first run did: qf-7, torn down by hand)
const step = async (title, r) => { rows = r; console.log(`\n## ${title}`); const out = await pool.reclaim(); console.log("   reclaim ->", JSON.stringify(out)); console.log("   still on disk:", fs.existsSync(DIR), "| still in the pool:", pool.slots.some(s => s.id === "pp-proof")); };
const prune = () => { const r = spawnSync(process.execPath, [WT + "/Server/worktree-prune.mjs", "--only", "pp-proof"], { encoding: "utf8", windowsHide: true, env: { ...process.env, SERVEX_HOME: "" } }); console.log("   prune ->", (r.stdout + r.stderr).trim().split("\n").join(" | ")); console.log("   still on disk:", fs.existsSync(DIR)); };

fs.writeFileSync(path.join(DIR, "work-in-progress.txt"), "a minion's unsaved work\n");
console.log("# pool-taken proof", new Date().toISOString());
console.log("git status --short:", git("status", "--short").stdout.trim());
await step("1. holder working, uncommitted file", [{ id: "minion-proof", state: "working", cwd: DIR }]);
prune();
await step("2. holder stopped, but its child minion is working in the slot (the qf-9 case)", [{ id: "minion-proof", state: "stopped", cwd: MAIN }, { id: "minion-child", parent: "minion-proof", state: "working", cwd: DIR }]);
await step("3. holder stopped, its child working elsewhere (writes by absolute path)", [{ id: "minion-proof", state: "stopped", cwd: MAIN }, { id: "minion-child", parent: "minion-proof", state: "working", cwd: MAIN }]);
await step("4. holder stopped, nobody live, uncommitted file, nothing committed", [{ id: "minion-proof", state: "stopped", cwd: DIR }]);
prune();
git("add", "-A"); git("commit", "-qm", "proof: committed but unmerged");
console.log("\n(committed the file: git status --short is now empty; one commit not in michael/dev)");
await step("5. holder gone, clean, but an unmerged commit", [{ id: "minion-proof", state: "gone", cwd: DIR }]);
prune();
console.log("\nbranches:", execFileSync("git", ["-C", MAIN, "branch", "--list", "salvage/pp-proof*", "worktree/pp-proof"], { encoding: "utf8" }).trim().split("\n").map(s => s.trim()).join(", "));

git("reset", "-q", "--hard", "michael/dev"); fs.rmSync(path.join(DIR, "work-in-progress.txt"), { force: true });
console.log("\n(moved the proof branch back to michael/dev: clean, nothing unmerged)");
await step("6. holder stopped, nobody live, clean and merged: the one case that is reclaimed", [{ id: "minion-proof", state: "stopped", cwd: MAIN }]);
await pool.chain; console.log("   after removal, on disk:", fs.existsSync(DIR));
