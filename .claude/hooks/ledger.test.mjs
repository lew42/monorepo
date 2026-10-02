// ledger.test.mjs — proves append_checked() (ledger.mjs's one write path) writes in all three
// cases: a line check() accepts, a line check() names a reason for (written anyway, with
// "unchecked" added), and a case where check() itself throws (written unchanged, as if the
// guard weren't there). "A guard must never stop logging itself" is the one rule this exists
// to prove — the owner's rule that outranks every other rule in ledger.mjs.
// usage: node .claude/hooks/ledger.test.mjs        (exit 0 = all pass)
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { append_checked } from "./ledger.mjs";
import { schemas } from "./jsonl-schema.mjs";

let failed = 0, passed = 0;
const ok = (cond, what) => { cond ? passed++ : failed++; console.log(`${cond ? "pass" : "FAIL"}  ${what}`); };
const read = file => readFileSync(file, "utf8").trim().split("\n").map(l => JSON.parse(l));

const dir = mkdtempSync(join(tmpdir(), "ledger-test-"));

console.log("— 1. check() accepts the line —");
{
	const file = join(dir, "task.jsonl"); // the schema is keyed by basename, so this name is real
	append_checked(file, { log: { at: "t", msg: "fine" } });
	const [line] = read(file);
	ok(JSON.stringify(line) === JSON.stringify({ log: { at: "t", msg: "fine" } }), "written exactly as given, no \"unchecked\" added: " + JSON.stringify(line));
}

console.log("— 2. check() names a reason: still written, with the reason attached —");
{
	const sub = join(dir, "sub1"); mkdirSync(sub, { recursive: true });
	const file = join(sub, "task.jsonl");
	append_checked(file, { log: { at: "t" } }); // missing "msg" — task.jsonl's schema requires it
	const [line] = read(file);
	ok(line.log && line.log.at === "t", "the original line survives untouched");
	ok(typeof line.unchecked === "string" && /missing "msg"/.test(line.unchecked), "\"unchecked\" names the exact reason: " + JSON.stringify(line));
}

console.log("— 3. check() itself throws (its own bug): written unchanged —");
{
	// Simulate a real bug IN jsonl-schema.mjs — never a weird entry — by giving one basename a
	// broken schema (verbs: null breaks the very first lookup check() does on it). The entry
	// itself is a plain, ordinary object; only the schema it hits is broken.
	schemas["broken-for-test.jsonl"] = { what: "a deliberately broken schema, for this test only", verbs: null };
	const sub = join(dir, "sub2"); mkdirSync(sub, { recursive: true });
	const file = join(sub, "broken-for-test.jsonl");
	append_checked(file, { ordinary: { a: 1 } });
	const [line] = read(file);
	ok(JSON.stringify(line) === JSON.stringify({ ordinary: { a: 1 } }), "the line still landed, exactly as given");
	ok(line.unchecked === undefined, "…and with no \"unchecked\" field — check()'s own crash never leaks into the data");
	delete schemas["broken-for-test.jsonl"];
}

rmSync(dir, { recursive: true, force: true });
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
