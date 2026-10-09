#!/usr/bin/env node
// Server/openrouter-reconcile.mjs — does the OpenRouter dollar total the Sessions page shows match what OpenRouter says the account spent?
//
//   node Server/openrouter-reconcile.mjs [--repo <checkout>] [--write]
//
// Recorded = the sum of `usd` over every session snapshot whose provider is "openrouter", split by `usd_source`:
//   openrouter  OpenRouter's own per-call cost, summed by Servex (the only number that is real money)
//   unrecorded  no cost was recorded; the snapshot carries usd 0 (its Claude-rate guess is `usd_estimate`, never added)
//   unverified  (or missing) a snapshot written before usd_source existed: its number may be a Claude-rate guess, so it is counted as "unverified"
// Account = ai/openrouter-usage.json (Servex writes it from the key): balance.used_total is every dollar the key has spent, and
// utilization.limits[openrouter_weekly].usage_weekly is this week's. The gap is account minus the verified total; it is stated, not hidden.
// --write saves the result to ai/sessions/openrouter-reconcile.json, which the Sessions page reads (machine state, gitignored).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2), val = n => argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined;
const REPO = path.resolve(val("--repo") ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const AI = path.join(REPO, "public", "framework", "ai"), SESS = path.join(AI, "sessions");
const r2 = n => Math.round(n * 100) / 100;
const numbered = (p, w) => { try { return fs.readdirSync(p).filter(n => new RegExp(`^\\d{${w}}$`).test(n)).sort(); } catch { return []; } };

export function reconcile(){
	let usage = {}; try { usage = JSON.parse(fs.readFileSync(path.join(AI, "openrouter-usage.json"), "utf8")); } catch {}
	const lim = (usage.utilization?.limits ?? []).find(l => l.kind === "openrouter_weekly");
	const week_start = lim?.resets_at ? Date.parse(lim.resets_at) - 7 * 864e5 : null;
	const acc = { key_diff: 0, verified: 0, unrecorded: 0, unverified: 0, n_verified: 0, n_unrecorded: 0, n_unverified: 0, estimate_unrecorded: 0 };
	const wk = { verified: 0, unverified: 0 };
	for (const y of numbered(SESS, 4)) for (const m of numbered(path.join(SESS, y), 2)) for (const d of numbered(path.join(SESS, y, m), 2)){
		let day; try { day = JSON.parse(fs.readFileSync(path.join(SESS, y, m, d, "index.json"), "utf8")); } catch { continue; }
		for (const s of Object.values(day.snapshots ?? {})){
			if (s.provider !== "openrouter") continue;
			const in_week = week_start != null && Date.parse(s.last_activity) >= week_start;
			if (s.usd_source === "openrouter"){ acc.verified += s.usd; acc.key_diff += s.usd_key_diff ?? 0; acc.n_verified++; if (in_week) wk.verified += s.usd; }
			else if (s.usd_source === "unrecorded"){ acc.n_unrecorded++; acc.estimate_unrecorded += s.usd_estimate ?? 0; }
			else { acc.unverified += s.usd ?? 0; acc.n_unverified++; if (in_week) wk.unverified += s.usd ?? 0; }
		}
	}
	const account_total = usage.balance?.used_total ?? null, account_week = lim?.usage_weekly ?? null;
	return {
		at: new Date().toISOString(), account_at: usage.balance?.at ?? null,
		account_total_usd: account_total == null ? null : r2(account_total), account_week_usd: account_week == null ? null : r2(account_week),
		recorded_verified_usd: r2(acc.verified), recorded_key_diff_usd: r2(acc.key_diff), recorded_unverified_usd: r2(acc.unverified),
		sessions: { verified: acc.n_verified, unrecorded: acc.n_unrecorded, unverified: acc.n_unverified },
		week: { verified_usd: r2(wk.verified), unverified_usd: r2(wk.unverified) },
		gap_total_usd: account_total == null ? null : r2(account_total - acc.verified), // negative: the log says more than the account, because key_diff rows can contain other agents' spend
		
		gap_week_usd: account_week == null ? null : r2(account_week - wk.verified),
	};
}

export function line(r){
	if (r.account_total_usd == null) return "OpenRouter: no account figure yet (ai/openrouter-usage.json is missing).";
	return `OpenRouter real $${r.recorded_verified_usd.toFixed(2)} recorded across ${r.sessions.verified} sessions · account says $${r.account_total_usd.toFixed(2)} · ${r.gap_total_usd < 0 ? `the log says $${(-r.gap_total_usd).toFixed(2)} MORE than the account` : `gap $${r.gap_total_usd.toFixed(2)}`}`
		+ ` ($${r.recorded_key_diff_usd.toFixed(2)} of it is key_diff, which can include other agents running at once; ${r.sessions.unverified} older sessions carry $${r.recorded_unverified_usd.toFixed(2)} of unverified numbers, ${r.sessions.unrecorded} have none). This week: account $${r.account_week_usd?.toFixed(2)}, recorded $${r.week.verified_usd.toFixed(2)}.`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const r = reconcile();
	console.log(line(r));
	if (argv.includes("--write")){ fs.writeFileSync(path.join(SESS, "openrouter-reconcile.json"), JSON.stringify(r, null, 1)); console.log("wrote ai/sessions/openrouter-reconcile.json"); }
}
