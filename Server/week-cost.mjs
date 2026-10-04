#!/usr/bin/env node
// Server/week-cost.mjs — a run-by-hand snapshot of this week's Claude $ and OpenRouter $,
// against the $200/week Max plan. Writes public/framework/ai/sessions/week.json.
//
// This is a POINT-IN-TIME SNAPSHOT from a manual run, not live — nothing schedules it yet
// (ai/sessions/doc/decisions.md notes this as an open gap). Re-run it by hand to refresh:
//
//     node Server/week-cost.mjs
//
// usage: node Server/week-cost.mjs [--root <repo>]
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { OR_LOG_PATH } from "../Servex/ext/openrouter/reconcile.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); if (i < 0) return null; return args[i + 1]; };
const ROOT = flag("--root") ? flag("--root") : join(here, "..");
const AI = join(ROOT, "public", "framework", "ai");

const r2 = n => Math.round(n * 100) / 100;

const lines_of = file => existsSync(file)
	? readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim())
		.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)
	: [];

// ---- the window: this week, per the plan's own reset clock ----
// usage.json's seven_day.resets_at is the NEXT reset, seven days after the window started.
// Fall back to the last Monday 00:00 (local) if usage.json is missing.
function this_week_window(){
	const usage_path = join(AI, "usage.json");
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
function claude_spend(from, to){
	const top = [];
	let years;
	try { years = readdirSync(AI, { withFileTypes: true }); } catch { return { total: 0, sessions: [] }; }
	for (const y of years){
		if (!y.isDirectory() || !/^\d{4}$/.test(y.name)) continue;
		let months;
		try { months = readdirSync(join(AI, y.name), { withFileTypes: true }); } catch { continue; }
		for (const m of months){
			if (!m.isDirectory() || !/^\d{2}$/.test(m.name)) continue;
			let days;
			try { days = readdirSync(join(AI, y.name, m.name), { withFileTypes: true }); } catch { continue; }
			for (const d of days){
				if (!d.isDirectory() || !/^\d{2}$/.test(d.name)) continue;
				const day_ms = new Date(`${y.name}-${m.name}-${d.name}T00:00:00`).getTime();
				if (day_ms < from - 864e5 || day_ms > to) continue;   // a day that can't possibly overlap the window
				const day_dir = join(AI, y.name, m.name, d.name);
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
					top.push({ session: s.name, usd: last.total_usd });
				}
			}
		}
	}
	const total = top.reduce((n, x) => n + x.usd, 0);
	return { total, sessions: top };
}

// ---- OpenRouter $: real money already billed, summed from the run ledger ----
function openrouter_spend(from, to){
	let total = 0;
	for (const o of lines_of(OR_LOG_PATH)){
		if (!o?.at) continue;
		const at = Date.parse(o.at);
		if (at < from || at > to) continue;
		total += Number(o.cost_usd) || 0;
	}
	return total;
}

const { from, to, plan_pct_used } = this_week_window();
const claude = claude_spend(from, to);
const openrouter_usd = r2(openrouter_spend(from, to));
const claude_usd = r2(claude.total);

const top = [...claude.sessions].sort((a, b) => b.usd - a.usd);
const top10 = top.slice(0, 10).map(x => ({ session: x.session, usd: r2(x.usd) }));
const small_usd = r2(top.slice(10).reduce((n, x) => n + x.usd, 0));

const plan_usd = 200;
const usd_per_pct = plan_pct_used ? r2(claude_usd / plan_pct_used) : null;

const week = {
	claude_usd, openrouter_usd, plan_usd,
	plan_pct_used,
	usd_per_pct,
	top: top10,
	small_usd,
	as_of: new Date().toISOString(),
	// A point-in-time SNAPSHOT from a manual run of this script — nothing schedules it yet
	// (see ai/sessions/doc/decisions.md). The page that shows this number says so too.
	note: "manual snapshot, not live — re-run node Server/week-cost.mjs to refresh",
};

const out_dir = join(AI, "sessions");
writeFileSync(join(out_dir, "week.json"), JSON.stringify(week, null, 2));
console.log(JSON.stringify(week, null, 2));
