import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { modules_complete } from "./ensure-modules.mjs";

const d = fs.mkdtempSync(path.join(os.tmpdir(), "em-"));
fs.writeFileSync(path.join(d, "package.json"), JSON.stringify({ dependencies: { a: "1" } }));
assert.equal(modules_complete(d), false, "no node_modules");
fs.mkdirSync(path.join(d, "node_modules/a"), { recursive: true });
fs.writeFileSync(path.join(d, "node_modules/a/package.json"), "{}");
assert.equal(modules_complete(d), false, "half done: packages but no marker");
fs.writeFileSync(path.join(d, "node_modules/.package-lock.json"), "{}");
assert.equal(modules_complete(d), true, "marker + dependency");
fs.rmSync(path.join(d, "node_modules/a"), { recursive: true });
assert.equal(modules_complete(d), false, "marker but dependency gone");
fs.rmSync(d, { recursive: true, force: true });
console.log("ensure-modules: ok");
