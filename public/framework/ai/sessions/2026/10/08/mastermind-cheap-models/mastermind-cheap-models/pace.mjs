/* pace.mjs — the dollar-allowance calibration + admission function the owner asked for
 * (2026-10-08, mid-task add-on to mastermind-cheap-models).
 *
 * WHAT: joins public/framework/ai/usage.jsonl (session snapshots of `weekly_all`, the % of the
 * weekly usage window used, taken every few minutes) with the per-day Claude $ totals in
 * public/framework/ai/2026-10-07/token-accounting/post-analysis.json (spend-tree based,
 * API-equivalent dollars) to answer: how many real dollars does one point of the weekly window
 * cost, and — given that rate, today's `weekly_all`% and the time left before the next reset —
 * is there $ room to start a new task right now, or should it queue?
 *
 * CAVEAT (read before trusting a number this prints): post-analysis.json's own findings.md
 * documents a reconcile gap between its spend-tree dollars and Anthropic's real billing; this
 * script's $/percent rate inherits that uncertainty, which is why it reports a SPREAD across
 * windows, not one confident number, and the admission check treats $ as advisory, never a hard
 * wall (see rules.md's decision record: PRIMARY gate stays %-of-window, exactly like the
 * existing usage guardrail — this just lets a spawn's expected_cost_usd translate into an
 * expected %, with a dollar line for the owner to read).
 *
 * WINDOW DETECTION: usage.jsonl's own `resets_at` field is NOT a stable weekly anchor — it is
 * recomputed at every snapshot as "now + however long is left", so its calendar date drifts
 * daily and can't be used as a grouping key (checked by hand, 2026-10-08: 30+ distinct
 * reset-days across 10 real weeks). What IS a reliable signal: `weekly_all` ITSELF drops sharply
 * (we use >15 points) exactly when a real weekly reset happens. So this script segments the
 * chronological `weekly_all` series into windows at every such drop — simple, needs no clock math.
 *
 * usage:
 *   node pace.mjs                           -- prints the calibration table + today's line
 *   node pace.mjs --admit <expected_usd>     -- prints admit/queue for one spawn of that size
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../.."); // .../ai/2026-10-08/mastermind-cheap-models -> repo root
const USAGE_PATH = path.join(ROOT, "public/framework/ai/usage.jsonl");
const SPEND_PATH = path.join(ROOT, "public/framework/ai/2026-10-07/token-accounting/post-analysis.json");

function readJsonl(file){
	try { return fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }
	catch { return []; }
}

/* ── windows: segment usage.jsonl's weekly_all series at every sharp drop ── */
export function loadWindows(){
	const rows = readJsonl(USAGE_PATH).map(l => l.log).filter(l => l?.at && typeof l.weekly_all === "number");
	rows.sort((a, b) => new Date(a.at) - new Date(b.at));
	const windows = [];
	let cur = null;
	for (const r of rows){
		if (!cur || r.weekly_all < cur.rows[cur.rows.length - 1].weekly_all - 15){
			cur = { start: r.at, start_pct: r.weekly_all, rows: [] };
			windows.push(cur);
		}
		cur.rows.push(r);
	}
	for (const w of windows){
		w.end = w.rows[w.rows.length - 1].at;
		w.end_pct = w.rows[w.rows.length - 1].weekly_all;
		w.pct_consumed = Math.max(1, w.end_pct - w.start_pct); // floor 1: never divide by 0
	}
	return windows;
}

/* ── $/day, from the one spend-tree snapshot we have (2026-10-07's token-accounting task).
 * This is a SNAPSHOT, not a live feed — a future run should regenerate post-analysis.json
 * first (its own script, token-accounting/post-analysis.mjs) rather than trusting a stale one. */
export function loadSpendByDay(){
	try {
		const j = JSON.parse(fs.readFileSync(SPEND_PATH, "utf8"));
		const map = new Map();
		for (const d of j.by_day || []) if (d.day !== "unknown") map.set(d.day, d.usd);
		return { map, generated_at: j.generated_at, total: j.totals?.claude_usd ?? null };
	} catch { return { map: new Map(), generated_at: null, total: null }; }
}

function daysBetween(startIso, endIso){
	const out = [];
	let d = new Date(startIso.slice(0, 10) + "T00:00:00Z");
	const end = new Date(endIso.slice(0, 10) + "T00:00:00Z");
	while (d <= end){ out.push(d.toISOString().slice(0, 10)); d = new Date(d.getTime() + 86400000); }
	return out;
}

/* ── calibration: for every window that overlaps the spend snapshot's date range, $ spent / points consumed. ── */
export function calibrate(){
	const windows = loadWindows();
	const { map: spendByDay, generated_at } = loadSpendByDay();
	const rates = [], discarded = [];
	for (const w of windows){
		const allDays = daysBetween(w.start, w.end);
		const days = allDays.filter(d => spendByDay.has(d));
		if (!days.length) continue; // no $ data for this window at all — skip, don't guess
		const usd = days.reduce((s, d) => s + spendByDay.get(d), 0);
		const row = { start: w.start.slice(0, 10), end: w.end.slice(0, 10), pct_consumed: w.pct_consumed, usd: +usd.toFixed(2), usd_per_pct: +(usd / w.pct_consumed).toFixed(2), days_with_data: days.length, days_in_window: allDays.length };
		// A window where the spend snapshot only overlaps a sliver of it (<50% of its days) gives
		// a rate that is really "$ in the days we happen to have / % the WHOLE window consumed" —
		// not a real $/pct, just noise (found the hard way: two 1-2-day slivers came out at
		// $0.20-$0.25/pct, two orders of magnitude off the one well-covered window's $124/pct).
		// Kept, but reported separately, never folded into the mean.
		if (days.length / allDays.length < 0.5) discarded.push(row); else rates.push(row);
	}
	const values = rates.map(r => r.usd_per_pct);
	const mean = values.length ? values.reduce((s, v) => s + v, 0) / values.length : null;
	const min = values.length ? Math.min(...values) : null, max = values.length ? Math.max(...values) : null;
	const stdev = mean != null && values.length > 1 ? Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length) : null;
	return { windows: rates, discarded, usd_per_pct_mean: mean != null ? +mean.toFixed(2) : null, usd_per_pct_min: min, usd_per_pct_max: max, usd_per_pct_stdev: stdev != null ? +stdev.toFixed(2) : null, spend_snapshot_generated_at: generated_at };
}

/* ── today's line: most recent usage.jsonl row (current %, time to reset) × the calibrated rate. ── */
export function today(cal){
	const rows = readJsonl(USAGE_PATH).map(l => l.log).filter(l => l?.at && typeof l.weekly_all === "number");
	rows.sort((a, b) => new Date(a.at) - new Date(b.at));
	const latest = rows[rows.length - 1];
	if (!latest || cal.usd_per_pct_mean == null) return null;
	const windows = loadWindows();
	const w = windows[windows.length - 1];
	const burned_pct = Math.max(0, latest.weekly_all - w.start_pct);
	const allowance_usd = +(100 * cal.usd_per_pct_mean).toFixed(2); // a full window, calibrated
	const burned_usd_est = +(burned_pct * cal.usd_per_pct_mean).toFixed(2);
	const resetMs = Date.parse(latest.resets_at);
	const hours_to_reset = Number.isFinite(resetMs) ? +((resetMs - Date.now()) / 3600000).toFixed(1) : null;
	return { at: latest.at, weekly_all_pct: latest.weekly_all, burned_pct, burned_usd_est, allowance_usd, hours_to_reset };
}

/* ── admit(expected_cost_usd): the SMALL version of the admission rule (rules.md's decision
 * record d-pace-admission picks this over a %-only gate, with a stated alternative). Converts
 * the dollar estimate into an expected % (using the calibrated, noisy rate) and compares against
 * how much % the elapsed share of the week SHOULD have used plus a small margin — the same shape
 * as the existing "pace = used% <= elapsed%" guardrail, just in dollar-translated terms so a
 * spawn-decision log entry can carry a real $ figure. Cheap/free/local work is always admitted
 * (never pay % budget for a script or a Haiku-cents call — the margin already covers those in
 * practice, but this is the explicit, honest floor). */
export function admit(expected_cost_usd, { marginPct = 5, cheapFloorUsd = 0.05 } = {}){
	if (expected_cost_usd == null || expected_cost_usd <= cheapFloorUsd)
		return { admit: true, why: `cheap (<= $${cheapFloorUsd}) — always admitted`, earliest_start: null };
	const cal = calibrate();
	const t = today(cal);
	if (!t || cal.usd_per_pct_mean == null)
		return { admit: true, why: "no calibration data yet — admitting by default (fail open, not closed)", earliest_start: null };
	const windows = loadWindows();
	const w = windows[windows.length - 1];
	const elapsed_share = t.hours_to_reset != null && t.hours_to_reset > 0
		? Math.max(0, 1 - t.hours_to_reset / (7 * 24)) : 1;
	const allowance_pct_now = elapsed_share * 100 + marginPct;
	const expected_pct = expected_cost_usd / cal.usd_per_pct_mean;
	const projected_pct = (t.weekly_all_pct - w.start_pct) + expected_pct;
	const ok = projected_pct <= allowance_pct_now;
	return {
		admit: ok,
		why: ok
			? `projected ${projected_pct.toFixed(1)}% <= pace allowance ${allowance_pct_now.toFixed(1)}% (elapsed ${(elapsed_share * 100).toFixed(0)}% of week + ${marginPct}% margin)`
			: `projected ${projected_pct.toFixed(1)}% would exceed pace allowance ${allowance_pct_now.toFixed(1)}% — queue it`,
		expected_cost_usd, expected_pct: +expected_pct.toFixed(2), projected_pct: +projected_pct.toFixed(2), allowance_pct_now: +allowance_pct_now.toFixed(1),
		earliest_start: ok ? null : "when weekly_all% next drops (a reset) or elapsed_share catches up — no fixed ETA with the data this script has",
	};
}

function main(){
	const argv = process.argv.slice(2);
	const admitIdx = argv.indexOf("--admit");
	const cal = calibrate();
	if (admitIdx >= 0){
		const usd = Number(argv[admitIdx + 1]);
		console.log(JSON.stringify(admit(usd), null, "\t"));
		return;
	}
	console.log("Calibration — $ per point of the weekly window, one row per detected reset window with $ data available:\n");
	console.log("window                    pct    $ spent    $/pct   days w/ $ data");
	for (const w of cal.windows) console.log(`${w.start} -> ${w.end}  ${String(w.pct_consumed).padEnd(5)} ${String(w.usd).padEnd(10)} ${String(w.usd_per_pct).padEnd(7)} ${w.days_with_data}/${w.days_in_window}`);
	if (cal.discarded.length){
		console.log("\ndiscarded (less than half the window has $ data — not trusted):");
		for (const w of cal.discarded) console.log(`${w.start} -> ${w.end}  ${String(w.usd_per_pct).padEnd(7)}$/pct on ${w.days_with_data}/${w.days_in_window} days`);
	}
	console.log(`\nmean $/pct: ${cal.usd_per_pct_mean}  (spread: min ${cal.usd_per_pct_min}, max ${cal.usd_per_pct_max}, stdev ${cal.usd_per_pct_stdev})`);
	console.log(`spend snapshot generated_at: ${cal.spend_snapshot_generated_at} — regenerate token-accounting/post-analysis.mjs for a fresher number.`);
	const t = today(cal);
	if (t) console.log(`\nToday: burned $${t.burned_usd_est} of $${t.allowance_usd} allowance (${t.weekly_all_pct}% of window, ${t.hours_to_reset}h to reset).`);
	console.log(`\nCaveat: only ${cal.windows.length} window(s) have $ data at all (post-analysis.json covers 2026-09-22..2026-10-05 only), and findings.md flags a reconcile gap in the $ totals themselves — treat this rate as a rough multiplier, not a bill.`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
