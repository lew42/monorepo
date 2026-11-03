// node Server/Unreferenced.test.mjs : fixture folder in a temp dir; nothing in the repo is touched.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Unreferenced from "./Unreferenced.mjs";

const d = fs.mkdtempSync(path.join(os.tmpdir(), "unref-"));
const w = (n, t = "x") => fs.writeFileSync(path.join(d, n), t);
for (const n of ["card.css", "a.js", "b.md", "c.md", "dead.md"]) w(n);
w("page.js", `View.stylesheet(import.meta, "card.css"); import "./a.js";`);
w("page.jsonl", `{"place":"b.md"}\n`);
w("files.jsonl", `{"file":"c.md"}\n`);
const u = new Unreferenced();
for (const n of ["card.css", "a.js", "b.md", "c.md"]) assert.ok(u.sibling_ref(path.join(d, n)), n);
assert.ok(!u.sibling_ref(path.join(d, "dead.md")));
console.log("Unreferenced.test ok");
