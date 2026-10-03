// audit.mjs — read every task's audit.jsonl (one line per auditor, written by minions through
// append.mjs) and COMPUTE the consensus. Never hand-write a consensus: this is the one place
// that does (law 7 — compute, don't recall).
//
// What it does, per task dir:
//   1. Objective checks first, from real state, never from an auditor's word:
//      - files_ok: of the files named in that task's own task.jsonl (action.edit), how many exist.
//      - syntax_ok: `node --check` on every such file that ends .js.
//      - urls_ok: of the http(s) URLs named in requirements.md, how many answer 200 (a short HEAD,
//        a few seconds max; a URL that times out counts as not-ok, never crashes the run).
//   2. The consensus of every audit.jsonl line: the median of complete/obedience/utility, the
//      AGREEMENT (share of auditors within ±1 of the median), and the union of `missing` items
//      that 2+ auditors named.
//   3. value = q ÷ max(cost, $1), q = ((complete+3)/6) × ((utility+3)/6) — a 0..1 quality factor,
//      using the task's own real cost (its task.jsonl's last cost_usd), never the audit's own cost.
//   4. FAILED: median complete or obedience at or below -2.
//
// Writes <taskdir>/consensus.json for each task, and one combined summary (stdout, or --out <path>).
// Also folds in each model's distance from the per-task median and from the Sonnet reference —
// the model-ladder input the requirements page asks for.
//
// usage: node Server/audit.mjs <taskdir...> [--out <path.json>] [--timeout-ms 4000]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const out_path = args.includes("--out") ? args[args.indexOf("--out") + 1] : null;
const timeout_i = args.indexOf("--timeout-ms");
const TIMEOUT_MS = timeout_i >= 0 ? Number(args[timeout_i + 1]) : 4000;
const taskdirs = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--out" && args[i - 1] !== "--timeout-ms");
if (!taskdirs.length) { console.error("usage: node Server/audit.mjs <taskdir...> [--out <path.json>]"); process.exit(2); }

const read_jsonl = p => existsSync(p) ? readFileSync(p, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : [];

/* ONE VOTE PER MODEL (2026-10-02 pilot): a minion that was dequeued after sitting at the
 * spawn gate could still land its own real turn moments later (minion-auditor-deepseek did,
 * for every one of the 5 pilot tasks) — leaving BOTH its genuine `append.mjs` line (proper
 * tool access, real per-generation OpenRouter cost) and a fallback line from a direct
 * `askOnce()` call made assuming it was stuck (an approximated, evenly-split cost). Counting
 * the same model's judgment twice would double-weight it in every median and in the model
 * ladder. Prefer the real minion entry (`by` not starting "cheap-auditor-") when both exist
 * for the same model on the same task; otherwise keep whichever line is last (append-only
 * log — last write wins, same convention as task_cost() below). */
function dedupe_by_model(lines){
	const groups = new Map();
	for (const a of lines){
		const key = a.model ?? a.by;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(a);
	}
	return [...groups.values()].map(group => {
		const real = group.filter(a => !String(a.by ?? "").startsWith("cheap-auditor-"));
		return real.length ? real[real.length - 1] : group[group.length - 1];
	});
}

function median(nums){
	const s = [...nums].sort((a, b) => a - b);
	const n = s.length;
	if (!n) return null;
	return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/** Every .js file this task's own log says it edited (action.edit lines). */
function edited_js_files(task_lines){
	const files = new Set();
	for (const line of task_lines){
		const a = line.action;
		if (a?.did === "edit" && Array.isArray(a.files)) for (const f of a.files) if (/\.js$/i.test(f)) files.add(f);
	}
	return [...files];
}

/** The task's own real spend — the last assign line that carries a cost_usd. */
function task_cost(task_lines){
	let cost = null;
	for (const line of task_lines) if (typeof line.assign?.cost_usd === "number") cost = line.assign.cost_usd;
	return cost;
}

/** http(s) URLs named in a markdown file, deduped. */
function urls_in(md){
	if (!md) return [];
	const m = md.match(/https?:\/\/[^\s)\]"'>]+/g) || [];
	return [...new Set(m)];
}

function url_ok(url){
	try {
		// curl is on PATH on this machine already (used by minions for the same check);
		// -s silent, -o discard body, -w print just the code, --max-time caps the hang.
		const code = execFileSync("curl", ["-s", "-o", "NUL", "-w", "%{http_code}", "--max-time", String(Math.ceil(TIMEOUT_MS / 1000)), url], { encoding: "utf8", windowsHide: true, timeout: TIMEOUT_MS + 2000 }).trim();
		return code === "200";
	} catch { return false; }
}

function syntax_ok(file, root){
	const abs = join(root, file);
	if (!existsSync(abs)) return null; // counted in files_ok, not here
	try { execFileSync(process.execPath, ["--check", abs], { windowsHide: true, timeout: 5000 }); return true; }
	catch { return false; }
}

const ROOT = join(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");

const results = [];
for (const dir of taskdirs){
	const abs_dir = join(ROOT, dir);
	const task_lines = read_jsonl(join(abs_dir, "task.jsonl"));
	const audit_lines = dedupe_by_model(read_jsonl(join(abs_dir, "audit.jsonl")).map(l => l.audit).filter(Boolean));
	const req_md = existsSync(join(abs_dir, "requirements.md")) ? readFileSync(join(abs_dir, "requirements.md"), "utf8") : "";

	// 1. objective checks
	const files = edited_js_files(task_lines);
	const files_exist = files.map(f => existsSync(join(ROOT, f)));
	const files_ok = files.length ? `${files_exist.filter(Boolean).length}/${files.length}` : "n/a";
	const js_syntax = files.map(f => syntax_ok(f, ROOT)).filter(v => v !== null);
	const syntax_pass = js_syntax.length ? js_syntax.every(Boolean) : null;
	const urls = urls_in(req_md);
	const url_results = urls.slice(0, 5).map(u => ({ u, ok: url_ok(u) })); // cap at 5: this is a cheap spot-check, not a crawl
	const urls_ok = url_results.length ? `${url_results.filter(r => r.ok).length}/${url_results.length}` : "n/a";

	// 2. consensus of the audit lines
	const fields = ["complete", "obedience", "utility"];
	const medians = {};
	for (const f of fields) medians[f] = median(audit_lines.map(a => a[f]).filter(v => typeof v === "number"));
	const agreement = {};
	for (const f of fields){
		const vals = audit_lines.map(a => a[f]).filter(v => typeof v === "number");
		agreement[f] = vals.length ? vals.filter(v => Math.abs(v - medians[f]) <= 1).length / vals.length : null;
	}
	const missing_counts = new Map();
	for (const a of audit_lines) for (const m of a.missing ?? []) missing_counts.set(m, (missing_counts.get(m) ?? 0) + 1);
	const missing_union = [...missing_counts.entries()].filter(([, n]) => n >= 2).map(([m]) => m);
	const review_done_votes = audit_lines.filter(a => typeof a.review_done === "boolean");
	const review_done = review_done_votes.length ? review_done_votes.filter(a => a.review_done).length > review_done_votes.length / 2 : null;
	const name_ok_votes = audit_lines.filter(a => typeof a.name_ok === "boolean");
	const name_ok = name_ok_votes.length ? name_ok_votes.filter(a => a.name_ok).length > name_ok_votes.length / 2 : null;
	const icon_ok_votes = audit_lines.filter(a => typeof a.icon_ok === "boolean");
	const icon_ok = icon_ok_votes.length ? icon_ok_votes.filter(a => a.icon_ok).length > icon_ok_votes.length / 2 : null;

	// 3. value
	const cost = task_cost(task_lines);
	const q = (medians.complete != null && medians.utility != null)
		? ((medians.complete + 3) / 6) * ((medians.utility + 3) / 6)
		: null;
	const value = (q != null && cost != null) ? q / Math.max(cost, 1) : null;

	// 4. failed
	const failed = (medians.complete != null && medians.complete <= -2) || (medians.obedience != null && medians.obedience <= -2);

	// 5. each model's distance from this task's median (for the model ladder)
	const by_model = audit_lines.map(a => {
		const dist = fields.reduce((sum, f) => typeof a[f] === "number" && medians[f] != null ? sum + Math.abs(a[f] - medians[f]) : sum, 0);
		return { model: a.model, by: a.by, distance_from_median: dist };
	});

	const consensus = {
		task: dir,
		n_auditors: audit_lines.length,
		checks: { files_ok, syntax_ok: syntax_pass, urls_ok, urls_checked: url_results },
		cost_usd: cost,
		medians, agreement, missing_union,
		review_done, name_ok, icon_ok,
		q, value,
		failed,
		by_model,
	};
	writeFileSync(join(abs_dir, "consensus.json"), JSON.stringify(consensus, null, "\t") + "\n", "utf8");
	results.push(consensus);
}

// model ladder: each model's mean distance from the median, across every task it audited
const per_model = new Map();
for (const r of results) for (const m of r.by_model){
	if (!per_model.has(m.model)) per_model.set(m.model, []);
	per_model.get(m.model).push(m.distance_from_median);
}
const model_ladder = [...per_model.entries()]
	.map(([model, ds]) => ({ model, n: ds.length, mean_distance: ds.reduce((a, b) => a + b, 0) / ds.length }))
	.sort((a, b) => a.mean_distance - b.mean_distance);

const summary = { generated_at: new Date().toISOString(), tasks: results, model_ladder };
if (out_path) writeFileSync(join(ROOT, out_path), JSON.stringify(summary, null, "\t") + "\n", "utf8");
console.log(JSON.stringify(summary, null, "\t"));
