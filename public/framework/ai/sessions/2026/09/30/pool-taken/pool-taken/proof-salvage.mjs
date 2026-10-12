// pool-taken proof 2: salvage (by hand only now) leaves the live *.jsonl logs out of its commit.
// A scratch worktree off michael/dev, the branch's real Pool.salvage(); the test salvage branch is deleted after.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const WT = "C:/Code/lew42/worktrees/pool-taken", MAIN = "C:/Code/lew42/monorepo", DIR = "C:/Code/lew42/worktrees/pp-salv";
process.env.SERVEX_POOL_FILE = path.join(process.env.TEMP, "pp-salv-pool.json");
const { default: Pool } = await import("file:///" + WT + "/Servex/Pool.js");
const git = (...a) => spawnSync("git", ["-C", DIR, ...a], { encoding: "utf8", windowsHide: true }).stdout.trim();
execFileSync("git", ["-C", MAIN, "worktree", "add", "-q", "-b", "worktree/pp-salv", DIR, "michael/dev"], { windowsHide: true, stdio: "ignore" });
for (const k of ["user.name", "user.email"]) git("config", k, execFileSync("git", ["-C", MAIN, "config", k], { encoding: "utf8" }).trim());
fs.appendFileSync(path.join(DIR, "public/framework/ai/board.jsonl"), JSON.stringify({ churn: "another agent's board line" }) + "\n");
fs.appendFileSync(path.join(DIR, "Servex/doc/pool.md"), "\nthe task's own edit\n");
fs.mkdirSync(path.join(DIR, "public/framework/ai/pp-salv"), { recursive: true });
fs.writeFileSync(path.join(DIR, "public/framework/ai/pp-salv/task.jsonl"), "{\"new\":\"the task's own new log\"}\n");
console.log("# salvage proof", new Date().toISOString());
console.log("before, git status --short:\n  " + git("status", "--short", "--untracked-files=all").split("\n").join("\n  "));
const pool = new Pool({ servex: { say: () => {} } });
pool.save = () => {}; pool.kill = () => {};
const slot = { id: "pp-salv", path: DIR, branch: "worktree/pp-salv", state: "taken", taken_by: "minion-proof" };
const s = await pool.salvage(slot, "minion-proof");
console.log("\nsalvage says:", s.what);
console.log("\nfiles in the salvage commit:\n  " + execFileSync("git", ["-C", MAIN, "show", "--name-only", "--format=", s.branch], { encoding: "utf8" }).trim().split("\n").join("\n  "));
console.log("\nboard.jsonl in the commit:", execFileSync("git", ["-C", MAIN, "show", "--name-only", "--format=", s.branch], { encoding: "utf8" }).includes("board.jsonl") ? "YES (fail)" : "no (pass)");
console.log("patch kept aside holds the board line:", fs.readFileSync(s.aside, "utf8").includes("another agent's board line") ? "yes (pass)" : "no (fail)");
// clean up the test: worktree, test branches, patch
execFileSync("git", ["-C", MAIN, "worktree", "remove", "--force", DIR], { windowsHide: true });
execFileSync("git", ["-C", MAIN, "branch", "-D", s.branch, "worktree/pp-salv"], { windowsHide: true, stdio: "ignore" });
fs.rmSync(s.aside, { force: true });
console.log("\n(test worktree, its salvage branch and patch removed)");
