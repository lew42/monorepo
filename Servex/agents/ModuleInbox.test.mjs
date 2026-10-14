import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ModuleInbox from "./ModuleInbox.js";

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "mi-"));
fs.mkdirSync(path.join(repo, "public/framework/ux/Dictate"), { recursive: true });
const box = new ModuleInbox("ux/Dictate", { repo });
const a = box.add("one dictation system for phone and desktop", "/x/requirements-5.md");
box.add("mobile sheet is a button plus a text area", "/x/requirements-2.md", { size: "small" });
assert.equal(box.unread().length, 2);
box.outcome(a.id, { state: "decided", note: "added a line to doc/architecture.md" });
assert.equal(box.unread().length, 1);
assert.deepEqual(ModuleInbox.modules(repo), ["public/framework/ux/Dictate"]);
assert.throws(() => box.add("", "x"));
assert.throws(() => box.add("e", ""));
assert.throws(() => new ModuleInbox("../etc", { repo }));
assert.throws(() => new ModuleInbox("nope/none", { repo }));
const listed = JSON.parse(ModuleInbox.tools()[0].handler.call(null, { module: "ux/Dictate" }));
assert.equal(listed.ok, true); assert.ok(Array.isArray(listed.unread));   // lists only; writes nothing
console.log("ModuleInbox ok");
