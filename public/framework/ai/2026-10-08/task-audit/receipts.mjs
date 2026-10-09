// The only writer of verified.jsonl. A Haiku verifier writes one small .json receipt file, then runs:
//   node receipts.mjs add <receipt.json>     validates it, checks every cited path/commit really exists, appends one line
//   node receipts.mjs check                   re-checks every line already in verified.jsonl
// Receipt fields: row (number, line index in loose-ends.jsonl), searched[] (patterns/commands run), found[] (paths, commits),
// missing[] (what you looked for and could not find), verdict, confidence, next_step, agrees (bool), why (string).
import fs from "fs"; import path from "path"; import { execFileSync } from "child_process";
const here = import.meta.dirname, repo = path.resolve(here, "../../../../..");
const OUT = path.join(here, "verified.jsonl");
const VERDICTS = ["done", "partial", "not-started", "superseded", "unclear"], CONF = ["high", "medium", "low"];
const arr = v => Array.isArray(v) && v.every(s => typeof s === "string");
const exists = p => [repo, path.join(repo, "public"), path.join(repo, "public/framework/ai")].some(b => fs.existsSync(path.join(b, p.replace(/^\/+/, ""))));
const commitOk = h => { try { execFileSync("git", ["cat-file", "-e", h + "^{commit}"], { cwd: repo, stdio: "ignore", windowsHide: true }); return true } catch { return false } };
function validate(r) {
	const e = [];
	if (!Number.isInteger(r.row)) e.push("row must be a number");
	for (const k of ["searched", "found", "missing"]) if (!arr(r[k])) e.push(`${k} must be a list of strings`);
	if (arr(r.searched) && !r.searched.length) e.push("searched is empty: say what you looked for");
	if (!VERDICTS.includes(r.verdict)) e.push("verdict must be one of " + VERDICTS.join("/"));
	if (!CONF.includes(r.confidence)) e.push("confidence must be one of " + CONF.join("/"));
	if (typeof r.next_step !== "string" || !r.next_step.trim()) e.push("next_step is required");
	if (typeof r.agrees !== "boolean") e.push("agrees must be true or false");
	if (r.agrees === false && !String(r.why || "").trim()) e.push("why is required when agrees is false");
	return e;
}
function audit(r) { // cited things that do not exist are flagged, not silently trusted
	const bad = [];
	for (const f of r.found || []) {
		for (const h of f.match(/\b[0-9a-f]{7,40}\b/g) || []) if (/[a-f]/.test(h) && /\d/.test(h) && !commitOk(h)) bad.push("commit " + h);
		for (const p of f.match(/[\w.\-/]+\.(?:md|mjs|js|css|json|jsonl|png|txt)\b/g) || []) if (p.includes("/") && !exists(p)) bad.push("path " + p);
	}
	return [...new Set(bad)];
}
const [cmd, file] = process.argv.slice(2);
if (cmd === "add") {
	let r; try { r = JSON.parse(fs.readFileSync(file, "utf8")) } catch (e) { console.error("receipt is not valid JSON: " + e.message); process.exit(1) }
	const errs = validate(r); if (errs.length) { console.error("REJECTED:\n- " + errs.join("\n- ")); process.exit(1) }
	const line = { row: r.row, at: new Date().toISOString(), searched: r.searched, found: r.found, missing: r.missing, verdict: r.verdict, confidence: r.confidence, next_step: r.next_step, agrees: r.agrees, why: r.why || "", unverified: audit(r) };
	fs.appendFileSync(OUT, JSON.stringify(line) + "\n");
	console.log(`recorded row ${r.row}: ${r.verdict} (${r.confidence})` + (line.unverified.length ? `; WARNING cited but not found: ${line.unverified.join(", ")}` : ""));
} else if (cmd === "check") {
	const rows = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").trim().split("\n").filter(Boolean).map(JSON.parse) : [];
	console.log(rows.length, "receipts;", rows.filter(r => r.unverified?.length).length, "cite something that does not exist");
} else { console.error("usage: node receipts.mjs add <receipt.json> | check"); process.exit(1) }
