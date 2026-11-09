// FoldAccounting on a scratch tree: a kept cost matches, a lower merged cost is flagged (reader vs lost). `node Server/FoldAccounting.test.mjs`
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import FoldAccounting from "./FoldAccounting.mjs";

const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "foldacc-")), ASIDE = path.join(ROOT, "aside");
const cache = (rel, base, usd, v = 1) => { const d = path.join(base, rel); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, "cache.jsonl"), JSON.stringify({ summary: { v, usd } }) + "\n"); };
try {
	cache("s/ok", ROOT, 5); cache("s/session-ok", ASIDE, 5);
	cache("s/recost", ROOT, 1, 2); cache("s/session-recost", ASIDE, 4, 1);
	cache("s/lost", ROOT, 1); cache("s/session-lost", ASIDE, 4);
	const group = n => ({ session: n, home: `s/${n}`, duplicates: [`s/session-${n}`], moved_aside: ASIDE });
	fs.writeFileSync(path.join(ROOT, "m.json"), JSON.stringify({ run: "t", groups: { 0: group("ok"), 1: group("recost"), 2: group("lost") } }));
	const r = (await FoldAccounting.at({ root: ROOT, manifest: path.join(ROOT, "m.json") })).run();
	assert.equal(r.totals.sessions, 3);
	assert.equal(r.totals.matching, 1);
	assert.equal(r.totals.mismatched, 2);
	assert.equal(r.totals.lost, 1, "only the same-version drop counts as lost");
	assert.equal(r.totals.cost_before, 13);
	assert.match(r.mismatches[0].diffs[0].cause, /^reader/);
	console.log("FoldAccounting.test: ok");
} finally { fs.rmSync(ROOT, { recursive: true, force: true }); }
