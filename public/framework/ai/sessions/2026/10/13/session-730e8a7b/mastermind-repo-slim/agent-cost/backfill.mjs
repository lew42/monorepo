// Read-only: cost per task mastermind started today, from the SDK session files (cost_of_session), by model.
// node backfill.mjs [YYYY-MM-DD]  ->  writes backfill.md beside this file
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cost_of_session, find_transcript, cost_of_transcript } from "../../../../../../../AISession/AISessionAudit.mjs";
const day = process.argv[2] ?? new Date().toLocaleDateString("sv");
const rows = await (await fetch("http://localhost:8090/agents")).json();
const today = rows.filter(r => /task-mastermind/.test(r.role ?? "") && r.session_id && (r.started_at ?? "").startsWith(day) || (r.started_at && new Date(r.started_at).toLocaleDateString("sv") === day && /task-mastermind/.test(r.role ?? "") && r.session_id));
const seen = new Set(), out = [];
for (const r of today){
	if (seen.has(r.id)) continue; seen.add(r.id);
	const c = cost_of_session(r.session_id);
	let model = r.model;
	const t = find_transcript(r.session_id);
	if (t){ const bp = cost_of_transcript(t).by_prompt; model = bp.at(-1)?.model ?? model; }
	out.push({ id: r.id, model: model ?? "?", usd: c?.total_usd ?? null, turns: r.turns ?? null, subs: c?.subagents ?? 0, state: r.state });
}
out.sort((a, b) => (b.usd ?? -1) - (a.usd ?? -1));
const sum = a => a.reduce((n, x) => n + (x.usd ?? 0), 0);
const by = {}; for (const x of out) (by[x.model] ??= []).push(x);
const f = n => n == null ? "—" : "$" + n.toFixed(2);
const md = [`# Cost per task mastermind, ${day}`, "", `Computed by \`backfill.mjs\` from the SDK session files (priced per message, each message once, subagent files included). ${out.length} task masterminds, **${f(sum(out))}** in all.`, "",
	"## By model", "", "| model | agents | cost |", "|---|---|---|", ...Object.entries(by).map(([m, a]) => `| ${m} | ${a.length} | ${f(sum(a))} |`), "",
	"## Per agent", "", "| agent | model | cost | state |", "|---|---|---|---|", ...out.map(x => `| ${x.id} | ${x.model} | ${f(x.usd)} | ${x.state} |`), ""].join("\n");
writeFileSync(join(dirname(fileURLToPath(import.meta.url)), "backfill.md"), md);
console.log(md.split("\n").slice(0, 14).join("\n")); console.log("agents:", out.length);
