// node Server/PromptAudit-stream.test.mjs — PromptAudit.each_line reads a file in chunks and yields exactly what split("\n") does, even when a chunk cuts a multi-byte character.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert";
import PromptAudit from "./PromptAudit.mjs";
const f = path.join(os.tmpdir(), `pa-each-${process.pid}.txt`);
const text = ["a", "héllo wörld 🙂", "", "x".repeat(50), "last"].join("\n");
fs.writeFileSync(f, text);
for (const chunk of [1, 3, 7, 1000]){
	const got = []; PromptAudit.each_line(f, (l, i) => got.push([i, l]), chunk);
	assert.deepEqual(got.map(g => g[1]), text.split("\n"), `chunk ${chunk}`);
	assert.deepEqual(got.map(g => g[0]), got.map((_, i) => i));
}
fs.writeFileSync(f, ""); const none = []; PromptAudit.each_line(f, l => none.push(l)); assert.deepEqual(none, []);
fs.rmSync(f);
console.log("ok");
