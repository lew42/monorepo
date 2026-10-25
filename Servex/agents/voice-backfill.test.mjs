// node Servex/agents/voice-backfill.test.mjs — old v-<id>.jsonl records move into the dated store; nothing is overwritten or lost.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "vbf-"));
process.env.BACKFILL_REPO = repo;
const { find_records, plan, apply } = await import("./voice-backfill.mjs");

const put = (rel, text) => { const f = path.join(repo, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const line1 = (id, at) => JSON.stringify({ session: { id, home: "/framework/ext/drawer/", at } }) + "\n";
const old = Date.now() - 3600000, iso = new Date(Date.parse("2026-10-17T13:25:37-05:00")).toISOString();

put("public/framework/ext/drawer/ai/v-aaa1111.jsonl", line1("v-aaa1111", iso) + '{"chat":{"text":"hello"}}\n');
put("public/framework/ext/drawer/ai/v-aaa1111.summary.json", '{"title":"t"}');
put("public/ai/v-bbb2222.jsonl", line1("v-bbb2222", iso));
put("public/ai/v-wrongid.jsonl", line1("v-other", iso));                       // first line names another id: not a record
put("public/x/fixture/v-fix0000.jsonl", line1("v-fix0000", iso));              // a fixture folder is never touched
put("public/framework/ai/sessions/2026/10/17/v-ccc3333/session.jsonl", line1("v-ccc3333", iso));   // already in the store
put("public/framework/ai/v-ccc3333.jsonl", line1("v-ccc3333", iso));           // same id twice: a conflict, left alone
for (const f of ["public/framework/ext/drawer/ai/v-aaa1111.jsonl", "public/ai/v-bbb2222.jsonl", "public/framework/ai/v-ccc3333.jsonl"]) fs.utimesSync(path.join(repo, f), old / 1000, old / 1000);

const records = find_records(path.join(repo, "public"));
assert.deepEqual(records.map(r => r.id).sort(), ["v-aaa1111", "v-bbb2222", "v-ccc3333"]);

const rows = plan(records);
const by = Object.fromEntries(rows.map(r => [r.id, r]));
assert.equal(by["v-aaa1111"].status, "move"); assert.ok(by["v-aaa1111"].summary);
assert.match(by["v-aaa1111"].to, /^public\/framework\/ai\/sessions\/2026\/10\/17\/v-aaa1111\/session\.jsonl$/);
assert.match(by["v-ccc3333"].status, /^conflict/);
assert.ok(fs.existsSync(path.join(repo, by["v-aaa1111"].from)), "a dry run moves nothing");

assert.equal(apply(rows), 2);
const store = id => path.join(repo, "public/framework/ai/sessions/2026/10/17", id);
assert.equal(fs.readFileSync(path.join(store("v-aaa1111"), "session.jsonl"), "utf8").split("\n").length, 3, "the bytes moved whole");
assert.equal(fs.readFileSync(path.join(store("v-aaa1111"), "session.summary.json"), "utf8"), '{"title":"t"}');
assert.ok(fs.existsSync(path.join(store("v-bbb2222"), "session.jsonl")));
assert.equal(fs.existsSync(path.join(repo, "public/framework/ext/drawer/ai/v-aaa1111.jsonl")), false);
assert.ok(fs.existsSync(path.join(repo, "public/framework/ai/v-ccc3333.jsonl")), "a conflict is left where it was");
assert.ok(fs.existsSync(path.join(repo, "public/x/fixture/v-fix0000.jsonl")));
assert.equal(plan(find_records(path.join(repo, "public"))).filter(r => r.status === "move").length, 0, "a second run has nothing to move");

console.log("voice-backfill.test.mjs: ok");
