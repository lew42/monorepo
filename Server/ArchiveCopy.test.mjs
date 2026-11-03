// node Server/ArchiveCopy.test.mjs: plan + apply + cap against an in-memory R2 (no network)
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import ArchiveCopy from "./ArchiveCopy.mjs";

const src = fs.mkdtempSync(path.join(os.tmpdir(), "ac-")), mdir = path.join(src, "sessions/2026/09/01/t");
fs.mkdirSync(mdir, { recursive: true });
const lines = ["a.png", "b.jpg", "c.png"].map((n) => { const b = Buffer.from(n); fs.writeFileSync(path.join(mdir, n), b); return { path: `01/t/${n}`, bytes: b.length, sha1: createHash("sha1").update(b).digest("hex") }; });
fs.writeFileSync(path.join(src, "sessions/2026/09/archive.jsonl"), lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
const store = new Map(), writes = [];
const r2 = { list: async (b, p) => [...store].filter(([k]) => k.startsWith(p)).map(([key, o]) => ({ key, size: o.size })), head: async (b, k) => store.get(k) || null, put: async (b, k, buf, t, meta) => { writes.push(k); store.set(k, { size: buf.length, meta }); } };
const mk = () => new ArchiveCopy({ r2, src, months: ["09"] });
let p = await mk().plan();
assert.equal(p.todo.length, 3);
await assert.rejects(mk().apply(p, 2), /over the cap/);
assert.equal(writes.length, 0);
await mk().apply(p, 10);
assert.equal(fs.readFileSync(path.join(src, "sessions/2026/09/archive-r2.jsonl"), "utf8").trim().split("\n").length, 3);
p = await mk().plan();
assert.equal(p.todo.length, 0); assert.equal(p.have.length, 3);
console.log("ArchiveCopy.test: ok");
