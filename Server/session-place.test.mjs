// The day layout: a flat session folder is moved into its first_at day by the first writer, and the record survives the move.
//   node Server/session-place.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "sess-place-"));
process.env.SESSIONS_ROOT = root;
const { default: Session } = await import("../public/framework/ai/sessions/Session.js");
let fails = 0;
const check = (ok, what) => { console.log((ok ? "PASS " : "FAIL ") + what); if (!ok) fails++; };

const id = "11111111-2222-4333-8444-555555555555", id2 = "66666666-7777-4888-8999-aaaaaaaaaaaa";
fs.mkdirSync(path.join(root, id));
fs.writeFileSync(path.join(root, id, "cache.jsonl"), JSON.stringify({ summary: { first_at: "2026-10-03T23:30:00.000Z" } }) + "\n");
fs.writeFileSync(path.join(root, id, "files.jsonl"), "{}\n");
fs.mkdirSync(path.join(root, id2));                          // no first_at anywhere: stays flat
execFileSync("node", [path.join(path.dirname(fileURLToPath(import.meta.url)), "session-place.mjs")], { env: process.env });
const dated = path.join(root, "2026", "10", "03", id);
check(fs.existsSync(path.join(dated, "cache.jsonl")), "the folder moved to its first_at day (UTC)");
check(!fs.existsSync(path.join(root, id)), "the flat folder is gone");
check(!fs.existsSync(path.join(dated, "files.jsonl")), "the stray files.jsonl listing was dropped");
check(fs.existsSync(path.join(root, id2)), "a folder with no first_at stays flat");

await Session.log(id, { tag: "x" }, "test");
check(fs.readFileSync(path.join(dated, "session.jsonl"), "utf8").includes('"tag":"x"'), "the record is written into the dated folder");
check(!fs.existsSync(path.join(root, id)), "the writer did not recreate a flat folder");
check((await Session.read_text(id, "cache.jsonl")).includes("first_at"), "the reader finds the dated cache");

const id3 = "99999999-aaaa-4bbb-8ccc-dddddddddddd";           // old flat folder, moved lazily by a writer
fs.mkdirSync(path.join(root, id3));
fs.writeFileSync(path.join(root, id3, "session.jsonl"), "{}\n");
fs.writeFileSync(path.join(root, id3, "cache.jsonl"), JSON.stringify({ summary: { first_at: "2026-09-01T10:00:00.000Z" } }) + "\n");
Session.days.clear();
await Session.close(id3, "test");
const lazy = path.join(root, "2026", "09", "01", id3);
check(fs.existsSync(path.join(lazy, "session.jsonl")) && !fs.existsSync(path.join(root, id3)), "a flat folder is moved by the first writer that touches it");

fs.rmSync(root, { recursive: true, force: true });
console.log(fails ? `${fails} failed` : "all passed");
process.exit(fails ? 1 : 0);
