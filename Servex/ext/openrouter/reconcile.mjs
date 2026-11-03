/* `node Servex/ext/openrouter/reconcile.mjs [--json]`
 * Does our ledger agree with OpenRouter's own bill?
 *
 * It reads OpenRouter's spend for TODAY (GET /api/v1/key, `usage_daily`; the day is UTC)
 * and sums today's lines in the run ledger (%LOCALAPPDATA%\lew42\servex\logs\openrouter.jsonl,
 * one line per settled agent turn). The difference is spend that no agent row shows.
 * Over 5% (and over a cent) it exits 1, so a caller can raise an Inbox item.
 *
 * Why (2026-10-01): a GPT-6.1 Sol mastermind ran one long turn, was stopped mid-turn,
 * and showed $0 while OpenRouter charged about $3. The owner's fear: "we think $20 and
 * it's $2,000". This is the check that catches it, computed, never recalled.
 * The key is read from its file and sent only in a header, never printed. */
import fs from "node:fs";
import path from "node:path";
import { read_key, KEY_PATH } from "./provider.js";

// The ledger sits in Servex's logs folder, beside the key's own folder.
export const OR_LOG_PATH = path.join(path.dirname(KEY_PATH), "logs", "openrouter.jsonl");

const DRIFT = 0.05;

export async function reconcile(){
	const res = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${read_key()}` } });
	if (!res.ok) throw new Error(`OpenRouter /key returned ${res.status}`);
	const billed = Number((await res.json())?.data?.usage_daily) || 0;
	const day = new Date().toISOString().slice(0, 10);                       // UTC, like usage_daily
	const lines = fs.existsSync(OR_LOG_PATH) ? fs.readFileSync(OR_LOG_PATH, "utf8").split("\n") : [];
	const by_agent = {};
	let ledger = 0;
	for (const l of lines){
		let j; try { j = JSON.parse(l); } catch { continue; }
		if (!j?.at || new Date(j.at).toISOString().slice(0, 10) !== day) continue;
		const usd = Number(j.cost_usd) || 0;
		ledger += usd;
		by_agent[j.agent] = +((by_agent[j.agent] || 0) + usd).toFixed(6);
	}
	const missing = +(billed - ledger).toFixed(6);
	const drift = billed > 0 ? Math.abs(missing) / billed : 0;
	return { day, billed: +billed.toFixed(6), ledger: +ledger.toFixed(6), missing, drift: +drift.toFixed(4), ok: drift <= DRIFT || Math.abs(missing) < 0.01, by_agent };
}

if (import.meta.url === `file:///${process.argv[1].replaceAll("\\", "/").replace(/^\//, "")}`){
	const r = await reconcile();
	if (process.argv.includes("--json")) console.log(JSON.stringify(r));
	else {
		console.log(`${r.day} (UTC): OpenRouter billed $${r.billed.toFixed(2)}, the ledger shows $${r.ledger.toFixed(2)}, missing $${r.missing.toFixed(2)} (${(r.drift * 100).toFixed(1)}%) — ${r.ok ? "OK" : "DRIFT over 5%"}`);
		for (const [a, usd] of Object.entries(r.by_agent).sort((x, y) => y[1] - x[1])) if (usd) console.log(`  ${usd.toFixed(4).padStart(9)}  ${a}`);
	}
	process.exitCode = r.ok ? 0 : 1;
}
