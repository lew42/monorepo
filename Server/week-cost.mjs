#!/usr/bin/env node
// Server/week-cost.mjs — this week's REAL Claude $ and OpenRouter $, against the $200/week Max
// plan, computed straight from the transcripts and the OpenRouter ledger (never a guess).
// Run by hand to (re)write public/framework/ai/sessions/week.json:
//
//     node Server/week-cost.mjs
//
// 2026-10-03 (sessions-tab-polish): the "this week" window and an ARBITRARY {from,to} window
// now go through the SAME function, `compute_window()` — the Sessions tab's own date-range
// filter used to sum a different, incomplete thing client-side (whatever rows the page already
// had, which never carry a real per-session OpenRouter $ at all — see ai/sessions/doc/asks/decisions.md,
// "Why OpenRouter read $0.00 in range"), so the week figure and the range figure could never
// agree. The exported functions below are the one place that question gets answered now; nothing
// that imports this file for them also re-runs the write-week.json side effect — that only
// happens when this script is run directly (`node Server/week-cost.mjs`), same `is_main` pattern
// public/framework/ai/AISession/AISessionAudit.mjs already uses.
//
// usage:
//   node Server/week-cost.mjs [--root <repo>]                 this week → writes week.json, once
//   node Server/week-cost.mjs --from <iso> --to <iso>          an arbitrary window → prints JSON, no write
//   node Server/week-cost.mjs --watch [<minutes>]              re-runs the "this week" write on an
//                                                               interval (default 10) until killed
//
// 2026-10-03 (review finding 1): a live HTTP route or a dev-server watcher hook both need files
// outside this task's fence (Server/run.js, Server/Server.js, Server/watch.js). `--watch` is the
// brief's own named fallback that DOESN'T: a plain standalone loop, started by hand (or by
// whoever runs the dev server's own process, e.g. a second `pm2`/background entry — nothing here
// auto-starts it, since this fence has no process supervisor to add one to). Run it once,
// anywhere, and week.json stops being a one-shot snapshot and starts refreshing itself; the page
// still says "as of <time>" either way, so a reader can always tell how fresh it is.
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { OR_LOG_PATH } from "../Servex/ext/openrouter/reconcile.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = join(here, "..");

export const r2 = n => Math.round(n * 100) / 100;

const lines_of = file => existsSync(file)
	? readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim())
		.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)
	: [];

// ---- the window: this week, per the plan's own reset clock ----
// usage.json's seven_day.resets_at is the NEXT reset, seven days after the window started.
// Fall back to the last Monday 00:00 (local) if usage.json is missing.
export function this_week_window(root = DEFAULT_ROOT){
	const ai = join(root, "public", "framework", "ai");
	const usage_path = join(ai, "usage.json");
	let plan_pct_used = null;
	if (existsSync(usage_path)){
		try {
			const usage = JSON.parse(readFileSync(usage_path, "utf8"));
			const sd = usage?.utilization?.seven_day;
			if (sd?.resets_at){
				plan_pct_used = typeof sd.utilization === "number" ? sd.utilization : null;
				const resets_at = Date.parse(sd.resets_at);
				return { from: resets_at - 7 * 864e5, to: resets_at, plan_pct_used };
			}
		} catch { /* fall through to the Monday fallback below */ }
	}
	const now = new Date();
	const day = now.getDay();                      // 0 = Sunday
	const since_monday = (day + 6) % 7;             // days since the last Monday
	const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - since_monday, 0, 0, 0, 0);
	return { from: monday.getTime(), to: monday.getTime() + 7 * 864e5, plan_pct_used };
}

// ---- Claude $: sum every session page.jsonl's LAST cost line, for a day inside the window ----
// Dated folders: public/framework/ai/<Y>/<M>/<D>/*/page.jsonl (numeric date tree — NOT the
// dashed task dirs like ai/2026-10-02/<slug>, which are a different, older convention).
//
// ⚠ DEDUPED BY SESSION (vscode-session-cost, 2026-10-04 — the owner's own ask: "the week total
// counts each API call once"). A session that is still open past midnight has its ONE page
// folder under an EARLIER day (the day it first wrote), but `session-cost.mjs`'s own
// `find_page_jsonl()` used to only look under TODAY's folder — fixed there, same task — so this
// walk would otherwise have been the only place still reading a session by its FOLDER rather
// than its real id, with no protection if two folders ever existed for the same session (the
// hook's own tmp marker file lost, a second folder created for the same id). Each folder's own
// `total_usd` is already a cumulative, whole-transcript number (never a per-day slice), so two
// folders for the same session would each report (most of) the SAME dollars — summing both
// would double it. Grouped by the session's own id8 (the folder name's own `-<id8>` suffix,
// the one stable fact every page folder carries) and only the folder with the LARGEST
// `total_usd` is kept per id8 — the most complete read of that one transcript, never two reads
// of it added together.
export function claude_spend(from, to, root = DEFAULT_ROOT){
	const ai = join(root, "public", "framework", "ai");
	const by_id8 = new Map();   // id8 -> { session, usd, at }
	let years;
	try { years = readdirSync(ai, { withFileTypes: true }); } catch { return { total: 0, sessions: [] }; }
	for (const y of years){
		if (!y.isDirectory() || !/^\d{4}$/.test(y.name)) continue;
		let months;
		try { months = readdirSync(join(ai, y.name), { withFileTypes: true }); } catch { continue; }
		for (const m of months){
			if (!m.isDirectory() || !/^\d{2}$/.test(m.name)) continue;
			let days;
			try { days = readdirSync(join(ai, y.name, m.name), { withFileTypes: true }); } catch { continue; }
			for (const d of days){
				if (!d.isDirectory() || !/^\d{2}$/.test(d.name)) continue;
				const day_ms = new Date(`${y.name}-${m.name}-${d.name}T00:00:00`).getTime();
				if (day_ms < from - 864e5 || day_ms > to) continue;   // a day that can't possibly overlap the window
				const day_dir = join(ai, y.name, m.name, d.name);
				let sessions;
				try { sessions = readdirSync(day_dir, { withFileTypes: true }); } catch { continue; }
				for (const s of sessions){
					if (!s.isDirectory()) continue;
					const f = join(day_dir, s.name, "page.jsonl");
					if (!existsSync(f)) continue;
					let last = null;
					for (const o of lines_of(f)) if (o.cost) last = o.cost;   // the running total — take the LAST one
					if (!last || typeof last.total_usd !== "number") continue;
					const at = last.at ? Date.parse(last.at) : day_ms;
					if (at < from || at > to) continue;
					const id8 = /-([0-9a-f]{8})$/.exec(s.name)?.[1] ?? s.name;   // the stable session key
					const prev = by_id8.get(id8);
					if (!prev || last.total_usd > prev.usd) by_id8.set(id8, { session: s.name, usd: last.total_usd, at });
				}
			}
		}
	}
	const top = [...by_id8.values()];
	const total = top.reduce((n, x) => n + x.usd, 0);
	return { total, sessions: top };
}

// ---- OpenRouter $: real money already billed, summed from the run ledger ----
export function openrouter_spend(from, to){
	let total = 0;
	for (const o of lines_of(OR_LOG_PATH)){
		if (!o?.at) continue;
		const at = Date.parse(o.at);
		if (at < from || at > to) continue;
		total += Number(o.cost_usd) || 0;
	}
	return total;
}

// THE reusable windowed computation (sessions-tab-polish, 2026-10-03) — takes any `{from,to}`
// in ms-epoch and returns the real Claude $ + OpenRouter $ for exactly that span, built from
// `claude_spend()`/`openrouter_spend()` above. `this_week_window()`'s own from/to is just ONE
// caller of this; a future date-range script (or this same CLI, `--from`/`--to` below) is
// another — both go through the same two real computations, so they can never disagree.
export function compute_window(from, to, root = DEFAULT_ROOT){
	const claude = claude_spend(from, to, root);
	const openrouter_usd = r2(openrouter_spend(from, to));
	const claude_usd = r2(claude.total);
	const top = [...claude.sessions].sort((a, b) => b.usd - a.usd);
	const top10 = top.slice(0, 10).map(x => ({ session: x.session, usd: r2(x.usd) }));
	const small_usd = r2(top.slice(10).reduce((n, x) => n + x.usd, 0));
	return {
		claude_usd, openrouter_usd,
		from: new Date(from).toISOString(), to: new Date(to).toISOString(),
		top: top10, small_usd,
	};
}

// Writes this week's real window to week.json, once — the body `is_main` below calls directly
// for a plain one-shot run, and that `--watch` loop calls on an interval (same function, same
// `note`/`as_of` shape either way; only the note text differs so a reader can tell which mode
// actually produced the file on disk).
export function write_week(root = DEFAULT_ROOT, { watching = false } = {}){
	const { from, to, plan_pct_used } = this_week_window(root);
	const result = compute_window(from, to, root);
	const plan_usd = 200;
	const usd_per_pct = plan_pct_used ? r2(result.claude_usd / plan_pct_used) : null;

	const week = {
		claude_usd: result.claude_usd, openrouter_usd: result.openrouter_usd, plan_usd,
		plan_pct_used, usd_per_pct,
		from: result.from, to: result.to,
		top: result.top, small_usd: result.small_usd,
		as_of: new Date().toISOString(),
		// Two honest notes, not one (review finding 1, 2026-10-03): a plain run is a point-in-time
		// SNAPSHOT (re-run it by hand to refresh); `--watch` keeps re-running this same function on
		// an interval, so the file IS live for as long as that process keeps running — still named
		// here rather than claimed silently, since nothing auto-starts or supervises that process.
		note: watching
			? "refreshed automatically every few minutes by a running `node Server/week-cost.mjs --watch` — as_of is the last refresh"
			: "manual snapshot, not live — re-run node Server/week-cost.mjs to refresh",
	};

	const out_dir = join(root, "public", "framework", "ai", "sessions");
	writeFileSync(join(out_dir, "week.json"), JSON.stringify(week, null, 2));
	return week;
}

// ---- CLI ----
const is_main = (() => {
	try { return import.meta.url === `file:///${process.argv[1].replaceAll("\\", "/").replace(/^\//, "")}`; } catch { return false; }
})();

if (is_main){
	const args = process.argv.slice(2);
	const flag = name => { const i = args.indexOf(name); return i < 0 ? null : args[i + 1]; };
	const root = flag("--root") || DEFAULT_ROOT;
	const from_arg = flag("--from"), to_arg = flag("--to");
	const has_watch = args.includes("--watch");

	if (from_arg || to_arg){
		// An arbitrary window, printed only — this is the SAME function the "this week" path
		// below calls; it is what a future live date-range feature would call too, instead of
		// ever summing an incomplete client-side row list again (doc/decisions.md).
		if (!from_arg || !to_arg) { console.error("usage: node Server/week-cost.mjs --from <iso> --to <iso>"); process.exit(2); }
		const result = compute_window(Date.parse(from_arg), Date.parse(to_arg), root);
		console.log(JSON.stringify(result, null, 2));
	} else if (has_watch){
		const minutes = Number(flag("--watch")) || 10;
		const run = () => { const week = write_week(root, { watching: true }); console.log(`[${week.as_of}] week.json refreshed — claude $${week.claude_usd}, openrouter $${week.openrouter_usd}`); };
		run();
		console.log(`watching — refreshing every ${minutes} minute(s), Ctrl-C to stop`);
		setInterval(run, minutes * 60 * 1000);
	} else {
		const week = write_week(root);
		console.log(JSON.stringify(week, null, 2));
	}
}
