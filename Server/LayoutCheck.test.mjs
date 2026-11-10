// node Server/LayoutCheck.test.mjs — LayoutCheck's pure logic on a stubbed page result: no browser,
// no dev server. classify() (BROKEN/OFF split + finding keys), new_broken() against a baseline,
// format_line() and summary_line() (what merge.mjs prints).
import assert from "node:assert/strict";
import LayoutCheck from "./LayoutCheck.mjs";

// 1. classify(): one high (DesignTool) + one padding-contract misuse = 2 BROKEN; one med + one low = 2 OFF.
const raw = {
	issues: [
		{ sev: "high", title: "overflow", detail: "text overflows its card", sel: ".live-card > p" },
		{ sev: "med", title: "gap", detail: "uneven gap", sel: ".row" },
		{ sev: "low", title: "measure", detail: "a bit wide", sel: "p" },
	],
	pad: [{ sev: "high", title: "padding contract", detail: "needs_parent_padding inside an unpadded box", sel: ".thing" }],
};
const c = LayoutCheck.classify(raw);
assert.equal(c.broken, 2, "the DesignTool high + the padding misuse are both BROKEN");
assert.equal(c.off, 2, "med + low are OFF");
assert.equal(c.findings[0].sev, "high", "worst finding first");
assert.equal(c.findings.length, 3, "slice(0,3): never more than the top 3");
assert.equal(c.keys.broken.length, 2);
assert.equal(c.keys.off.length, 2);

// 2. new_broken(): a key already in the baseline doesn't count; one not there does.
const known = LayoutCheck.key(raw.issues[0]);
assert.equal(LayoutCheck.new_broken(c.keys, { broken: [known] }), 1, "one of the two BROKEN keys was already known");
assert.equal(LayoutCheck.new_broken(c.keys, null), 2, "no baseline entry: every BROKEN key is new");

// 3. format_line(): GOOD, a broken/off line with its top finding, and a load failure.
assert.equal(LayoutCheck.format_line({ url: "/x/", width: 1200, ok: true, broken: 0, off: 0 }), "  /x/                           1200   GOOD");
const line = LayoutCheck.format_line({ url: "/x/", width: 400, ok: true, broken: 2, off: 2, findings: c.findings, newBroken: 1 });
assert.match(line, /BROKEN 2  OFF 2/);
assert.match(line, /new BROKEN: 1/);
assert.match(line, /needs_parent_padding inside an unpadded box \(\.thing\)/, "the top finding (first of the two tied-severity BROKEN findings) is shown");
assert.equal(LayoutCheck.format_line({ url: "/y/", width: 400, ok: false, error: "no response" }), "FAIL /y/  400  no response");

// 4. summary_line(): what merge.mjs echoes — total checks, new BROKEN summed, a FAIL counted as checked not broken.
const summary = LayoutCheck.summary_line([
	{ ok: true, newBroken: 1 }, { ok: true, newBroken: 0 }, { ok: false, error: "load failed" },
]);
assert.equal(summary, "layout check: 3 pages, 1 new BROKEN (report only)");

console.log("LayoutCheck: ok");
