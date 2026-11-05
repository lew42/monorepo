/* The crumb wrappers must keep child_process's promisify hook: promisify(execFile) has to resolve {stdout, stderr}. Run: node Servex/Crumbs.test.mjs */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
const crumbs = new URL("./Crumbs.js", import.meta.url).href;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "crumbs-test-")), probe = path.join(dir, "probe.mjs");
fs.writeFileSync(probe, `import {execFile} from "node:child_process"; import {promisify} from "node:util";
const r = await promisify(execFile)(process.execPath, ["-p", "40+2"]); console.log(typeof r === "object" ? r.stdout.trim() : "bare string");`);
const r = spawnSync(process.execPath, ["--import", crumbs, probe], { encoding: "utf8", windowsHide: true, env: { ...process.env, SERVEX_HOME: path.join(dir, "home") } });
fs.rmSync(dir, { recursive: true, force: true });
assert.equal(r.stdout.trim(), "42", `promisify(execFile) under Crumbs: ${r.stdout} ${r.stderr}`);
console.log("PASS  promisify(execFile) still resolves {stdout, stderr} with Crumbs installed");
