// node Server/LandingCheck.test.mjs — stub repo: ahead-but-landed passes, missing file flags.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert";
import { execFileSync } from "node:child_process";
import LandingCheck from "./LandingCheck.mjs";
const d = fs.mkdtempSync(path.join(os.tmpdir(), "lc-")), g = (...a) => execFileSync("git", a, { cwd: d, windowsHide: true, stdio: "pipe" }).toString();
const w = (f, t) => fs.writeFileSync(path.join(d, f), t);
g("init", "-b", "michael/dev"); g("config", "user.email", "t@t"); g("config", "user.name", "t");
w("a.txt", "1"); g("add", "."); g("commit", "-m", "base");
g("checkout", "-b", "landed"); w("b.txt", "B"); w("a.txt", "2"); g("add", "."); g("commit", "-m", "work");
g("checkout", "-b", "missing", "michael/dev"); w("c.txt", "C"); w("d.txt", "D"); g("add", "."); g("commit", "-m", "work");
g("checkout", "michael/dev"); w("b.txt", "B"); w("a.txt", "2"); g("add", "."); g("commit", "-m", "applied by diff, not a merge");
LandingCheck.REPO = d;
const ok = LandingCheck.verify("landed"), bad = LandingCheck.verify("missing");
assert.equal(ok.landed, true); assert.equal(ok.ahead, 1); assert.equal(ok.checked, ok.changed);
assert.equal(bad.landed, false); assert.deepEqual(bad.missing.sort(), ["c.txt", "d.txt"]); assert.equal(bad.checked, bad.changed);
console.log("ok", JSON.stringify(ok), JSON.stringify(bad)); fs.rmSync(d, { recursive: true, force: true });
