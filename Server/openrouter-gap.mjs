#!/usr/bin/env node
// Server/openrouter-gap.mjs — where does the OpenRouter ledger disagree with the account?
//   node Server/openrouter-gap.mjs [--json]
// Reads Servex's ledger (%LOCALAPPDATA%/lew42/servex/logs/openrouter.jsonl) and the account's lifetime
// total (GET /api/v1/key, free). Prints dollars by day and by model, split by how each line was priced
// (`generation` = OpenRouter's own per-call cost, exact; `key_diff` = the key's total before and after an
// agent's turn, so two agents running at once each get the SAME delta). No model call is made.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const HOME = process.env.SERVEX_HOME || path.join(process.env.LOCALAPPDATA || os.homedir(), "lew42", "servex");
const rows = fs.readFileSync(path.join(HOME, "logs", "openrouter.jsonl"), "utf8").split("\n").filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });
const key = fs.readFileSync(path.join(HOME, "openrouter.key"), "utf8").trim();
const account = (await (await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${key}` } })).json()).data.usage;

const r2 = n => Math.round(n * 100) / 100;
const sum = a => a.reduce((s, r) => s + (+r.cost_usd || 0), 0);
const group = (a, f) => Object.entries(a.reduce((o, r) => ((o[f(r)] ??= []).push(r), o), {})).map(([k, v]) => ({ k, usd: r2(sum(v)), n: v.length }));

const exact = rows.filter(r => r.source === "generation"), diff = rows.filter(r => r.source === "key_diff" && r.cost_usd > 0);
// the same key_diff amount on several lines = concurrent agents each charged the whole delta
const seen = new Map(); let doubled = 0;
for (const r of diff){ const k = r.cost_usd.toFixed(6); if (seen.has(k)) doubled += r.cost_usd; else seen.set(k, 1); }

const out = {
	account_usd: r2(account), ledger_usd: r2(sum(rows)), ledger_minus_account: r2(sum(rows) - account),
	exact_usd: r2(sum(exact)), key_diff_usd: r2(sum(diff)), key_diff_identical_repeat_usd: r2(doubled),
	by_day: group(rows, r => r.at.slice(0, 10)).sort((a, b) => a.k < b.k ? -1 : 1),
	by_model: group(rows, r => r.model).sort((a, b) => b.usd - a.usd).slice(0, 8),
	by_agent_kind: group(diff, r => r.agent.replace(/-[0-9a-f]{8}$/, "-*")).sort((a, b) => b.usd - a.usd).slice(0, 6),
};
if (process.argv.includes("--json")) console.log(JSON.stringify(out, null, 1));
else { console.log(`account $${out.account_usd} · ledger $${out.ledger_usd} · ledger above account by $${out.ledger_minus_account}`); console.log(`exact lines $${out.exact_usd} · key_diff lines $${out.key_diff_usd} (of which identical repeats $${out.key_diff_identical_repeat_usd})`); console.table(out.by_day); console.table(out.by_model); console.table(out.by_agent_kind); }

// --publish: put the two numbers where the Models tab reads them
if (process.argv.includes("--publish")){
	const f = path.resolve(import.meta.dirname, "../public/framework/ai/system/models/models.json");
	const d = JSON.parse(fs.readFileSync(f, "utf8"));
	d.accounting = { at: new Date().toISOString(), account_usd: out.account_usd, ledger_usd: out.ledger_usd, difference_usd: out.ledger_minus_account, key_diff_repeat_usd: out.key_diff_identical_repeat_usd };
	fs.writeFileSync(f, JSON.stringify(d, null, 2) + "\n");
}
