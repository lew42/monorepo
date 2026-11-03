// The delta path, both ways, as a test: seat (g)'s runnable demo (a change at any depth reaches the file once, every other tab
// applies it, the writer skips its own echo, a fresh replay rebuilds the same tree), run as it is, plus the breaks it found that
// the data backbone fixed (data-shapes plan step 1). One copy of the demo: it stays beside its write-up.
//   node public/framework/core/Item/delta-flow.test.mjs
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const { default: Test } = await import("../Test/Test.js");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEMO = path.join(HERE, "../Session/tasks/data-shapes/seats/delta-flow/demo-delta-flow.mjs");

const t = new Test("core/Item: the delta path round-trips (seat g's demo), and the breaks it found stay fixed");
let out = "";
try { out = execFileSync(process.execPath, [DEMO], { encoding: "utf8", timeout: 30000 }); }
catch (e){ out = String(e.stdout ?? "") + String(e.stderr ?? ""); }

t.ok(out.includes("PASS — the delta path, both ways (0 failed checks)"), "every hop of part 1 holds: UI change, list verbs two levels down, a move across lists, an agent's line, a hook's half line, a fresh load");
t.ok(/PASS — the delta path round-trips/.test(out), "the demo ends in PASS");
// Fixed by the backbone (each line of the demo prints STALE once its break no longer happens).
for (const [b, what] of [["B2", "a member's line names its list"], ["B3", "set(prop, item) adopts"], ["B4", "a property-held child writes under the property"],
	["B5", "by/ts are not data"], ["B6", "page.set(x, v) works"], ["B7", "a page.pages line replays into page.pages"], ["B9", "a page's act() writes its verb once"], ["B10", "a Panel's per-cell word lands on the panel"]])
	t.ok(new RegExp(`^STALE\\s+${b}\\b`, "m").test(out), `${b} fixed: ${what}`);
t.done();
